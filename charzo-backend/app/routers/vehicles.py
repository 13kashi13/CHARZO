from uuid import UUID

from fastapi import APIRouter, Depends, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.rate_limiter import limiter
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.vehicle import CreateVehicleRequest, UpdateVehicleRequest, VehicleResponse
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles", tags=["vehicles"])


@router.post("", response_model=VehicleResponse, status_code=201)
@limiter.limit("300/minute")
async def create_vehicle(
    request: Request,
    data: CreateVehicleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VehicleService(db)
    return await service.create_vehicle(user_id=current_user.id, data=data)


@router.get("", response_model=list[VehicleResponse])
@limiter.limit("300/minute")
async def list_vehicles(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VehicleService(db)
    return await service.list_vehicles(user_id=current_user.id)


@router.patch("/{vehicle_id}", response_model=VehicleResponse)
@limiter.limit("300/minute")
async def update_vehicle(
    request: Request,
    vehicle_id: UUID,
    data: UpdateVehicleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VehicleService(db)
    return await service.update_vehicle(
        user_id=current_user.id, vehicle_id=vehicle_id, data=data
    )


@router.delete("/{vehicle_id}", status_code=200)
@limiter.limit("300/minute")
async def delete_vehicle(
    request: Request,
    vehicle_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = VehicleService(db)
    await service.delete_vehicle(user_id=current_user.id, vehicle_id=vehicle_id)
    return {"message": "Vehicle deleted"}
