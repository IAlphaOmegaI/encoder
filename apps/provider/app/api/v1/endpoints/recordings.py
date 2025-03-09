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

        # Read the encoded data and make it writable
        encoded_data = np.frombuffer(file_content, dtype=np.float32).copy()
        
        # Print debug info
        print(f"Encoded data shape: {encoded_data.shape}")
        print(f"Encoded data type: {encoded_data.dtype}")
        
        # Calculate frames based on the actual data shape
        total_samples = encoded_data.shape[0]
        CHUNK_SIZE = 3000  # Increased chunk size since we're dealing with raw samples
        
        def process_chunks():
            for i in range(0, total_samples, CHUNK_SIZE * 8):
                chunk_end = min(i + (CHUNK_SIZE * 8), total_samples)
                chunk_size = (chunk_end - i) // 8  # Divide by 8 for proper reshaping
                
                # Process chunk
                chunk_data = encoded_data[i:chunk_end]
                codes_chunk = torch.from_numpy(chunk_data).reshape(1, 8, chunk_size).long()
                scale_chunk = torch.ones(1, chunk_size)
                
                print(f"Processing chunk {i//(CHUNK_SIZE*8) + 1}")
                print(f"Chunk shape: {codes_chunk.shape}")
                
                # Decode chunk
                with torch.no_grad():
                    decoded_chunk = model._decode_frame((codes_chunk, scale_chunk))
                    result = decoded_chunk.squeeze().cpu().numpy()
                    
                # Clear memory
                del codes_chunk
                del scale_chunk
                del decoded_chunk
                if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                
                yield result

        # Process chunks and write directly to file
        with io.BytesIO() as temp_buffer:
            # Create SoundFile object
            sf_file = sf.SoundFile(
                temp_buffer,
                mode='w',
                samplerate=sample_rate,
                channels=1,
                format='WAV',
                subtype='PCM_16'
            )
            
            try:
                # Process and write chunks
                for chunk in process_chunks():
                    print(f"Processing decoded chunk shape: {chunk.shape}")
                    # Resample chunk
                    resampled_chunk = resampy.resample(
                        chunk,
                        sample_rate,
                        22050
                    )
                    sf_file.write(resampled_chunk)
            finally:
                sf_file.close()

            # Get final audio length
            temp_buffer.seek(0)
            with sf.SoundFile(temp_buffer) as sf_file:
                duration = len(sf_file) / sf_file.samplerate
                print(f"Final audio duration: {duration} seconds")

            # Save to MinIO
            temp_buffer.seek(0)
            unique_filename = f"{uuid.uuid4()}.wav"
            
            minio_client.put_object(
                bucket_name=settings.MINIO_BUCKET_NAME,
                object_name=unique_filename,
                data=temp_buffer,
                length=temp_buffer.tell(),
                content_type='audio/wav'
            )
        
        # Create database record
        db_recording = Recording(
            filename=original_filename or file.filename,
            original_path=f"{settings.MINIO_BUCKET_NAME}/{unique_filename}",
            duration=duration,
            sample_rate=22050
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
    finally:
        # Aggressive cleanup
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        import gc
        gc.collect()

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