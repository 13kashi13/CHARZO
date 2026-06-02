from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.login_attempt import LoginAttempt


class LoginAttemptRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def record_attempt(
        self,
        email: str,
        success: bool,
        ip_address: Optional[str] = None,
    ) -> None:
        attempt = LoginAttempt(
            email=email.lower().strip(),
            success=success,
            ip_address=ip_address,
            attempted_at=datetime.now(tz=timezone.utc),
        )
        self.db.add(attempt)
        await self.db.commit()

    async def count_recent_failures(self, email: str, window_minutes: int = 10) -> int:
        """Count failed login attempts within the last `window_minutes` minutes."""
        cutoff = datetime.now(tz=timezone.utc) - timedelta(minutes=window_minutes)
        result = await self.db.exec(
            select(func.count(LoginAttempt.id)).where(
                LoginAttempt.email == email.lower().strip(),
                LoginAttempt.success == False,  # noqa: E712
                LoginAttempt.attempted_at >= cutoff,
            )
        )
        return result.one()
