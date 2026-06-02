from fastapi import APIRouter, Depends, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.rate_limiter import limiter
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
@limiter.limit("300/minute")
async def get_me(request: Request, current_user: User = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return UserResponse.model_validate(current_user)

# PATCH /me and POST /me/change-password implemented in Task 9
