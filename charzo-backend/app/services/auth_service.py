from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
    verify_password,
)
from app.repositories.login_attempt_repository import LoginAttemptRepository
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, TokenResponse

MAX_FAILURES = 5
LOCKOUT_WINDOW_MINUTES = 10


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.rt_repo = RefreshTokenRepository(db)
        self.attempt_repo = LoginAttemptRepository(db)

    async def login(
        self,
        data: LoginRequest,
        ip_address: str | None = None,
    ) -> TokenResponse:
        email = data.email.lower().strip()

        # ── Brute force check BEFORE verifying credentials ──────────────────
        recent_failures = await self.attempt_repo.count_recent_failures(
            email, LOCKOUT_WINDOW_MINUTES
        )
        if recent_failures >= MAX_FAILURES:
            raise HTTPException(
                status_code=429,
                detail=f"Too many failed attempts. Try again in {LOCKOUT_WINDOW_MINUTES} minutes.",
            )

        # ── Credential verification ──────────────────────────────────────────
        user = await self.user_repo.get_by_email(email)
        credentials_valid = user is not None and verify_password(
            data.password, user.password_hash
        )

        if not credentials_valid:
            # Record failure — generic 401 (no enumeration)
            await self.attempt_repo.record_attempt(
                email=email, success=False, ip_address=ip_address
            )
            raise HTTPException(status_code=401, detail="Invalid credentials")

        if user.status != "active":
            raise HTTPException(status_code=403, detail="Account is inactive")

        # ── Record success ───────────────────────────────────────────────────
        await self.attempt_repo.record_attempt(
            email=email, success=True, ip_address=ip_address
        )

        # ── Issue tokens ─────────────────────────────────────────────────────
        access_token = create_access_token(user_id=str(user.id), role=user.role)
        raw_rt, rt_hash = create_refresh_token()
        expires_at = datetime.now(tz=timezone.utc) + timedelta(days=30)
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

        expires_at = rt.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(tz=timezone.utc):
            raise HTTPException(status_code=401, detail="Refresh token expired")

        await self.rt_repo.revoke(rt)

        user = await self.user_repo.get_by_id(rt.user_id)
        if not user or user.status != "active":
            raise HTTPException(status_code=401, detail="User not found or inactive")

        access_token = create_access_token(user_id=str(user.id), role=user.role)
        raw_new_rt, new_rt_hash = create_refresh_token()
        await self.rt_repo.create(
            user_id=user.id,
            token_hash=new_rt_hash,
            expires_at=datetime.now(tz=timezone.utc) + timedelta(days=30),
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_new_rt,
            token_type="bearer",
        )

    async def logout(self, user_id, raw_token: str) -> None:
        try:
            token_hash = hash_refresh_token(raw_token)
            rt = await self.rt_repo.get_by_hash(token_hash)
            if rt and not rt.revoked:
                await self.rt_repo.revoke(rt)
        except Exception:
            pass
