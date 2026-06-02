from fastapi import APIRouter, Depends, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.rate_limiter import limiter
from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth_service import AuthService
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("100/minute")
async def register(request: Request, data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """Register a new customer account."""
    service = UserService(db)
    return await service.register_user(data)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("100/minute")
async def login(request: Request, data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email and password. Returns access + refresh tokens."""
    ip = request.client.host if request.client else None
    service = AuthService(db)
    return await service.login(data, ip_address=ip)


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit("100/minute")
async def refresh(request: Request, data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Rotate refresh token. Old token is revoked, new pair issued."""
    service = AuthService(db)
    return await service.refresh(data.refresh_token)


@router.post("/logout", status_code=200)
@limiter.limit("300/minute")
async def logout(
    request: Request,
    data: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Logout — revokes the provided refresh token."""
    service = AuthService(db)
    await service.logout(user_id=current_user.id, raw_token=data.refresh_token)
    return {"message": "Logged out successfully"}
