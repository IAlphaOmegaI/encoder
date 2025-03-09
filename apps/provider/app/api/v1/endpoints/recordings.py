import numpy as np
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import List
import io
import soundfile as sf
import torch
from encodec import EncodecModel
import uuid
import math
from pydantic import BaseModel
from app.db.base import get_db
from app.models.recording import Recording
from app.schemas.recording import RecordingCreate, Recording as RecordingSchema
from app.core.minio_client import minio_client, ensure_bucket_exists
from app.models.pagination_metadata import PaginationMetadata
from app.core.config import settings
import resampy

router = APIRouter()

# Initialize Encodec model
model = EncodecModel.encodec_model_24khz()
model.set_target_bandwidth(6.0)
model.eval()

class PaginatedRecordings(BaseModel):
    items: List[RecordingSchema]
    metadata: PaginationMetadata

@router.post("/", response_model=RecordingSchema)
async def create_recording(
    file: UploadFile = File(...),
    format: str = Form(...),
    sample_rate: int = Form(24000),
    original_filename: str = Form(None),
    db: Session = Depends(get_db)
):
    ensure_bucket_exists()
    
    try:
        file_content = await file.read()
        
        if format != 'encodec':
            raise HTTPException(status_code=400, detail="Only encodec format is supported")

        # Read the encoded data
        encoded_data = np.frombuffer(file_content, dtype=np.float32).copy()
        
        # Print debug info
        print(f"Encoded data shape: {encoded_data.shape}")
        
        # Convert to integer type and reshape
        n_frames = encoded_data.shape[0] // 8
        codes = torch.from_numpy(encoded_data).reshape(1, 8, n_frames).long()  # Convert to Long tensor
        
        # Create a default scale tensor
        scale = torch.ones(1, n_frames, device=codes.device)
        
        print(f"Codes shape: {codes.shape}, dtype: {codes.dtype}")
        print(f"Scale shape: {scale.shape}")

        # Decode using EnCodec with both codes and scale
        with torch.no_grad():
            decoded_audio = model._decode_frame((codes, scale))
            audio_data = decoded_audio.squeeze().cpu().numpy()

        print(f"Decoded audio shape: {audio_data.shape}")

        # Resample to 22.05kHz
        target_sample_rate = 22050
        resampled_audio = resampy.resample(
            audio_data,
            sample_rate,
            target_sample_rate
        )

        # Save as WAV
        output_buffer = io.BytesIO()
        sf.write(
            output_buffer, 
            resampled_audio, 
            target_sample_rate, 
            format='WAV'
        )
        output_buffer.seek(0)
        
        # Save to MinIO and database
        unique_filename = f"{uuid.uuid4()}.wav"
        
        minio_client.put_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=unique_filename,
            data=output_buffer,
            length=output_buffer.getbuffer().nbytes,
            content_type='audio/wav'
        )
        
        db_recording = Recording(
            filename=original_filename or file.filename,
            original_path=f"{settings.MINIO_BUCKET_NAME}/{unique_filename}",
            duration=len(resampled_audio) / target_sample_rate,
            sample_rate=target_sample_rate
        )
        
        db.add(db_recording)
        db.commit()
        db.refresh(db_recording)
        
        return db_recording
        
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {str(e)}")

@router.get("/", response_model=PaginatedRecordings)
def list_recordings(
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):

    skip = (page - 1) * limit
    recordings = db.query(Recording).offset(skip).limit(limit).all()

    total_items = db.query(Recording).count()
    total_pages = math.ceil(total_items / limit)

    return PaginatedRecordings(
        items=recordings,
        metadata=PaginationMetadata(
            page=page,
            limit=limit,
            itemCount=total_items,
            pageCount=total_pages
        )
    )

@router.get("/{recording_id}", response_model=RecordingSchema)
def get_recording(
    recording_id: int,
    db: Session = Depends(get_db)
):
    recording = db.query(Recording).filter(Recording.id == recording_id).first()
    if not recording:
        raise HTTPException(status_code=404, detail="Recording not found")
    return recording 