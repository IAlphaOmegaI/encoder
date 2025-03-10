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
import gc

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
        
        print(f"Encoded data shape: {encoded_data.shape}")
        print(f"Encoded data type: {encoded_data.dtype}")
        print(f"Encoded data range: {encoded_data.min()} to {encoded_data.max()}")
        
        # Calculate expected audio length (5 seconds at 24kHz = 120,000 samples)
        expected_samples = 5 * sample_rate
        
        # Process in batches
        BATCH_SIZE = 500  # Process 500 frames at a time
        total_frames = encoded_data.shape[0] // 8
        samples_per_frame = expected_samples // total_frames
        
        print(f"Total frames: {total_frames}")
        print(f"Samples per frame: {samples_per_frame}")
        
        # Create output buffer
        output_buffer = io.BytesIO()
        with sf.SoundFile(
            output_buffer,
            mode='w',
            samplerate=sample_rate,
            channels=1,
            format='WAV',
            subtype='PCM_16'
        ) as sf_file:
            # Process in batches
            for start_frame in range(0, total_frames, BATCH_SIZE):
                end_frame = min(start_frame + BATCH_SIZE, total_frames)
                batch_size = end_frame - start_frame
                
                # Extract batch data
                start_idx = start_frame * 8
                end_idx = end_frame * 8
                batch_data = encoded_data[start_idx:end_idx]
                
                # Reshape and convert to tensor
                codes = batch_data.reshape(1, 8, batch_size)
                codes = torch.from_numpy(codes).to(torch.long)  # Convert directly to long without normalization
                scale = torch.ones(1, batch_size)
                
                print(f"Processing batch {start_frame//BATCH_SIZE + 1}, frames {start_frame} to {end_frame}")
                print(f"Batch codes shape: {codes.shape}")
                print(f"Batch codes range: {codes.min().item()} to {codes.max().item()}")
                
                # Decode batch
                with torch.no_grad():
                    decoded_audio = model._decode_frame((codes, scale))
                    audio_data = decoded_audio.squeeze().cpu().numpy()
                    
                    print(f"Decoded audio shape before processing: {audio_data.shape}")
                    
                    # Take only the first samples_per_frame samples from each frame
                    if len(audio_data.shape) == 2:
                        audio_data = audio_data[:, :samples_per_frame].reshape(-1)
                    
                    print(f"Decoded audio shape after processing: {audio_data.shape}")
                    print(f"Audio range: {audio_data.min()} to {audio_data.max()}")
                    
                    # Normalize if needed
                    max_val = np.max(np.abs(audio_data))
                    if max_val > 1.0:
                        audio_data = audio_data / max_val * 0.95
                    
                    # Write batch
                    sf_file.write(audio_data)
                
                # Clear memory
                del batch_data
                del codes
                del scale
                del decoded_audio
                del audio_data
              if torch.cuda.is_available():
                    torch.cuda.empty_cache()
                gc.collect()
        
        # Get buffer size and reset position
        buffer_size = output_buffer.tell()
        output_buffer.seek(0)
        
        # Get duration
        duration = buffer_size / (sample_rate * 2)  # 2 bytes per sample for PCM_16
        print(f"Original duration: {duration} seconds")
        
        # Resample if needed
        if sample_rate != 22050:
            print(f"Resampling from {sample_rate} to 22050 Hz")
            with sf.SoundFile(output_buffer) as sf_file:
                audio_data = sf_file.read()
            
            resampled_data = resampy.resample(
                audio_data,
                sample_rate,
                22050,
                filter='kaiser_fast'
            )
            
            # Write resampled data
            output_buffer = io.BytesIO()
            with sf.SoundFile(
                output_buffer,
                mode='w',
                samplerate=22050,
                channels=1,
                format='WAV',
                subtype='PCM_16'
            ) as sf_file:
                sf_file.write(resampled_data)
            
            buffer_size = output_buffer.tell()
            output_buffer.seek(0)
            sample_rate = 22050
        
        # Save to MinIO
        unique_filename = f"{uuid.uuid4()}.wav"
        
        minio_client.put_object(
            bucket_name=settings.MINIO_BUCKET_NAME,
            object_name=unique_filename,
            data=output_buffer,
            length=buffer_size,
            content_type='audio/wav'
        )
        
        # Create database record
        db_recording = Recording(
            filename=original_filename or file.filename,
            original_path=f"{settings.MINIO_BUCKET_NAME}/{unique_filename}",
            duration=duration,
            sample_rate=sample_rate
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
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
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