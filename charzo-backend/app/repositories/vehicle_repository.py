from typing import List, Optional
from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.vehicle import Vehicle


class VehicleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, vehicle: Vehicle) -> Vehicle:
        self.db.add(vehicle)
        await self.db.commit()
        await self.db.refresh(vehicle)
        return vehicle

    async def get_by_id(self, vehicle_id: UUID) -> Optional[Vehicle]:
        result = await self.db.exec(
            select(Vehicle).where(Vehicle.id == vehicle_id, Vehicle.is_deleted == False)  # noqa
        )
        return result.first()

    async def get_by_user(self, user_id: UUID) -> List[Vehicle]:
        result = await self.db.exec(
            select(Vehicle).where(Vehicle.user_id == user_id, Vehicle.is_deleted == False)  # noqa
        )
        return list(result.all())

    async def update(self, vehicle: Vehicle) -> Vehicle:
        self.db.add(vehicle)
        await self.db.commit()
        await self.db.refresh(vehicle)
        return vehicle

    async def soft_delete(self, vehicle: Vehicle) -> None:
        vehicle.is_deleted = True
        self.db.add(vehicle)
        await self.db.commit()
