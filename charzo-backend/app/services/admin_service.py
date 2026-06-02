from datetime import datetime, timedelta, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import HTTPException
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.charging_request import ChargingRequest
from app.models.user import User
from app.models.vehicle import Vehicle
from app.repositories.user_repository import UserRepository


class AdminService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)

    async def get_dashboard_stats(self) -> dict:
        now = datetime.now(tz=timezone.utc)
        last_7 = now - timedelta(days=7)
        last_30 = now - timedelta(days=30)

        total_users = (await self.db.exec(select(func.count(User.id)))).one()
        total_vehicles = (await self.db.exec(
            select(func.count(Vehicle.id)).where(Vehicle.is_deleted == False)  # noqa
        )).one()

        # Requests by status
        statuses = ["pending", "confirmed", "in_progress", "completed", "cancelled"]
        by_status = {}
        for s in statuses:
            count = (await self.db.exec(
                select(func.count(ChargingRequest.id)).where(ChargingRequest.status == s)
            )).one()
            by_status[s] = count

        requests_7d = (await self.db.exec(
            select(func.count(ChargingRequest.id)).where(ChargingRequest.created_at >= last_7)
        )).one()
        requests_30d = (await self.db.exec(
            select(func.count(ChargingRequest.id)).where(ChargingRequest.created_at >= last_30)
        )).one()

        return {
            "total_users": total_users,
            "total_vehicles": total_vehicles,
            "requests_by_status": by_status,
            "requests_last_7_days": requests_7d,
            "requests_last_30_days": requests_30d,
        }

    async def list_users(
        self, page: int = 1, size: int = 50, search: Optional[str] = None
    ) -> List[dict]:
        query = select(User)
        if search:
            term = f"%{search}%"
            query = query.where(
                (User.full_name.ilike(term)) | (User.email.ilike(term))
            )
        query = query.offset((page - 1) * size).limit(size)
        result = await self.db.exec(query)
        users = result.all()
        return [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "phone": u.phone,
                "role": u.role,
                "status": u.status,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ]

    async def update_user_status(self, user_id: UUID, status: str) -> dict:
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if status not in {"active", "inactive"}:
            raise HTTPException(status_code=422, detail="status must be 'active' or 'inactive'")
        user.status = status
        updated = await self.user_repo.update(user)
        return {"id": str(updated.id), "status": updated.status}

    async def list_requests(
        self, page: int = 1, size: int = 50, status: Optional[str] = None
    ) -> List[dict]:
        query = select(ChargingRequest)
        if status:
            query = query.where(ChargingRequest.status == status)
        query = query.order_by(ChargingRequest.created_at.desc()).offset((page - 1) * size).limit(size)
        result = await self.db.exec(query)
        reqs = result.all()
        return [
            {
                "id": str(r.id),
                "user_id": str(r.user_id),
                "vehicle_id": str(r.vehicle_id),
                "latitude": r.latitude,
                "longitude": r.longitude,
                "address": r.address,
                "status": r.status,
                "notes": r.notes,
                "created_at": r.created_at.isoformat(),
                "updated_at": r.updated_at.isoformat(),
            }
            for r in reqs
        ]
