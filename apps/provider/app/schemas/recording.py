from datetime import datetime
from pydantic import BaseModel

class RecordingBase(BaseModel):
    filename: str
    duration: float | None = None
    sample_rate: int = 22050

class RecordingCreate(RecordingBase):
    pass

class Recording(RecordingBase):
    id: int
    original_path: str
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True 