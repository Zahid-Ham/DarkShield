from fastapi import APIRouter
from app.api.routes import health, logs, github

api_router = APIRouter()

api_router.include_router(health.router, prefix="/api")
api_router.include_router(logs.router, prefix="/api")
api_router.include_router(github.router, prefix="/api")
