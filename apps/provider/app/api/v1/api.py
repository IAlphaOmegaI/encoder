from fastapi import APIRouter
from app.api.v1.endpoints import health, recordings

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(recordings.router, prefix="/recordings", tags=["recordings"])