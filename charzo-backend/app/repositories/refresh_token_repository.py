from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user_id: UUID, token_hash: str, expires_at: datetime) -> RefreshToken:
        rt = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            revoked=False,
        )
        self.db.add(rt)
        await self.db.commit()
        await self.db.refresh(rt)
        return rt

    async def get_by_hash(self, token_hash: str) -> Optional[RefreshToken]:
        result = await self.db.exec(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        return result.first()

    async def revoke(self, rt: RefreshToken) -> None:
        rt.revoked = True
        self.db.add(rt)
        await self.db.commit()

    async def revoke_all_for_user(self, user_id: UUID) -> None:
        result = await self.db.exec(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked == False,  # noqa: E712
            )
        )
        tokens = result.all()
        for rt in tokens:
            rt.revoked = True
            self.db.add(rt)
        await self.db.commit()
