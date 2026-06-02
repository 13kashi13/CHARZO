from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.vehicle import Vehicle
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.vehicle import CreateVehicleRequest, UpdateVehicleRequest, VehicleResponse


class VehicleService:
    def __init__(self, db: AsyncSession):
        self.repo = VehicleRepository(db)

    async def create_vehicle(self, user_id: UUID, data: CreateVehicleRequest) -> VehicleResponse:
        vehicle = Vehicle(
            user_id=user_id,
            make=data.make,
            model=data.model,
            year=data.year,
            connector_type=data.connector_type,
            created_at=datetime.now(tz=timezone.utc),
            updated_at=datetime.now(tz=timezone.utc),
        )
        created = await self.repo.create(vehicle)
        return VehicleResponse.model_validate(created)

    async def list_vehicles(self, user_id: UUID) -> list[VehicleResponse]:
        vehicles = await self.repo.get_by_user(user_id)
        return [VehicleResponse.model_validate(v) for v in vehicles]

    async def update_vehicle(
        self, user_id: UUID, vehicle_id: UUID, data: UpdateVehicleRequest
    ) -> VehicleResponse:
        vehicle = await self.repo.get_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if vehicle.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your vehicle")

        if data.make is not None:
            vehicle.make = data.make
        if data.model is not None:
            vehicle.model = data.model
        if data.year is not None:
            vehicle.year = data.year
        if data.connector_type is not None:
            vehicle.connector_type = data.connector_type
        vehicle.updated_at = datetime.now(tz=timezone.utc)

        updated = await self.repo.update(vehicle)
        return VehicleResponse.model_validate(updated)

    async def delete_vehicle(self, user_id: UUID, vehicle_id: UUID) -> None:
        vehicle = await self.repo.get_by_id(vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        if vehicle.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your vehicle")
        await self.repo.soft_delete(vehicle)
