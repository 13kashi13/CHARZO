from fastapi import APIRouter, Depends
from sqlmodel.ext.asyncio.session import AsyncSession

from app.database import get_db
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new customer account. Returns 201 with user id and email."""
    service = UserService(db)
    return await service.register_user(data)

# Login, refresh, logout — implemented in Task 5
