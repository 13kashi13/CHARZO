from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_password,
)
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.rt_repo = RefreshTokenRepository(db)

    async def login(self, data: LoginRequest) -> TokenResponse:
        # Fetch user — generic 401 on any mismatch (no enumeration)
        user = await self.user_repo.get_by_email(data.email.lower().strip())
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid credentials",
            )

        if user.status != "active":
            raise HTTPException(status_code=403, detail="Account is inactive")

        # Issue tokens
        access_token = create_access_token(user_id=str(user.id), role=user.role)
        raw_rt, rt_hash = create_refresh_token()

        expires_at = datetime.now(tz=timezone.utc) + timedelta(
            days=30  # matches REFRESH_TOKEN_EXPIRE_DAYS default
        )
        await self.rt_repo.create(
            user_id=user.id,
            token_hash=rt_hash,
            expires_at=expires_at,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_rt,
            token_type="bearer",
        )

    async def refresh(self, raw_token: str) -> TokenResponse:
        token_hash = hash_refresh_token(raw_token)
        rt = await self.rt_repo.get_by_hash(token_hash)

        if not rt or rt.revoked:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        now = datetime.now(tz=timezone.utc)
        # Make expires_at timezone-aware for comparison
        expires_at = rt.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < now:
            raise HTTPException(status_code=401, detail="Refresh token expired")

        # Revoke old token
        await self.rt_repo.revoke(rt)

        # Fetch user
        user = await self.user_repo.get_by_id(rt.user_id)
        if not user or user.status != "active":
            raise HTTPException(status_code=401, detail="User not found or inactive")

        # Issue new token pair
        access_token = create_access_token(user_id=str(user.id), role=user.role)
        raw_new_rt, new_rt_hash = create_refresh_token()
        new_expires_at = datetime.now(tz=timezone.utc) + timedelta(days=30)
        await self.rt_repo.create(
            user_id=user.id,
            token_hash=new_rt_hash,
            expires_at=new_expires_at,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_new_rt,
            token_type="bearer",
        )

    async def logout(self, user_id, raw_token: str) -> None:
        """Revoke refresh token on logout. Always returns success."""
        try:
            token_hash = hash_refresh_token(raw_token)
            rt = await self.rt_repo.get_by_hash(token_hash)
            if rt and not rt.revoked:
                await self.rt_repo.revoke(rt)
        except Exception:
            pass  # Logout always succeeds per spec
