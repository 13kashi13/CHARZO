from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.rate_limiter import limiter
from app.core.security import hash_password, verify_password
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import ChangePasswordRequest, UpdateProfileRequest, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserResponse)
@limiter.limit("300/minute")
async def get_me(request: Request, current_user: User = Depends(get_current_user)):
    """Get the authenticated user's profile."""
    return UserResponse.model_validate(current_user)


@router.patch("/me", response_model=UserResponse)
@limiter.limit("300/minute")
async def update_me(
    request: Request,
    data: UpdateProfileRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update own profile (full_name, phone only)."""
    repo = UserRepository(db)
    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        current_user.phone = data.phone
    current_user.updated_at = datetime.now(tz=timezone.utc)
    updated = await repo.update(current_user)
    return UserResponse.model_validate(updated)


@router.post("/me/change-password", status_code=200)
@limiter.limit("300/minute")
async def change_password(
    request: Request,
    data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change password — invalidates all refresh tokens."""
    if not verify_password(data.current_password, current_user.password_hash):
        raise_401 = __import__("fastapi").HTTPException(
            status_code=401, detail="Current password is incorrect"
        )
        raise raise_401

    repo = UserRepository(db)
    rt_repo = RefreshTokenRepository(db)

    current_user.password_hash = hash_password(data.new_password)
    current_user.updated_at = datetime.now(tz=timezone.utc)
    await repo.update(current_user)
    await rt_repo.revoke_all_for_user(current_user.id)

    return {"message": "Password updated successfully"}
