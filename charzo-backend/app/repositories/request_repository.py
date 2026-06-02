from typing import List, Optional
from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.charging_request import ChargingRequest

ACTIVE_STATUSES = {"pending", "confirmed", "in_progress"}


class RequestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, req: ChargingRequest) -> ChargingRequest:
        self.db.add(req)
        await self.db.commit()
        await self.db.refresh(req)
        return req

    async def get_by_id(self, request_id: UUID) -> Optional[ChargingRequest]:
        result = await self.db.exec(
            select(ChargingRequest).where(ChargingRequest.id == request_id)
        )
        return result.first()

    async def get_by_user(
        self, user_id: UUID, page: int = 1, size: int = 20
    ) -> List[ChargingRequest]:
        offset = (page - 1) * size
        result = await self.db.exec(
            select(ChargingRequest)
            .where(ChargingRequest.user_id == user_id)
            .order_by(ChargingRequest.created_at.desc())
            .offset(offset)
            .limit(size)
        )
        return list(result.all())

    async def get_active_for_user(self, user_id: UUID) -> Optional[ChargingRequest]:
        """Return any active (pending/confirmed/in_progress) request for the user."""
        result = await self.db.exec(
            select(ChargingRequest).where(
                ChargingRequest.user_id == user_id,
                ChargingRequest.status.in_(list(ACTIVE_STATUSES)),
            )
        )
        return result.first()

    async def update_status(self, req: ChargingRequest, new_status: str) -> ChargingRequest:
        from datetime import datetime, timezone
        req.status = new_status
        req.updated_at = datetime.now(tz=timezone.utc)
        self.db.add(req)
        await self.db.commit()
        await self.db.refresh(req)
        return req
