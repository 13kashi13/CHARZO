from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.charging_request import ChargingRequest
from app.repositories.request_repository import RequestRepository
from app.repositories.vehicle_repository import VehicleRepository
from app.schemas.charging_request import CreateRequestSchema, RequestResponse

# ── State machine ─────────────────────────────────────────────────────────────
VALID_TRANSITIONS: dict[str, set[str]] = {
    "pending":     {"confirmed", "cancelled"},
    "confirmed":   {"in_progress", "cancelled"},
    "in_progress": {"completed", "cancelled"},
    "completed":   set(),
    "cancelled":   set(),
}

CUSTOMER_CANCELLABLE = {"pending", "confirmed"}


class RequestService:
    def __init__(self, db: AsyncSession):
        self.repo = RequestRepository(db)
        self.vehicle_repo = VehicleRepository(db)

    def _validate_transition(self, current: str, next_status: str) -> None:
        allowed = VALID_TRANSITIONS.get(current, set())
        if next_status not in allowed:
            raise HTTPException(
                status_code=422,
                detail=f"Invalid transition: {current} → {next_status}. Allowed: {allowed or 'none'}",
            )

    async def create_request(
        self, user_id: UUID, data: CreateRequestSchema
    ) -> RequestResponse:
        # Check vehicle exists
        vehicle = await self.vehicle_repo.get_by_id(data.vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Check vehicle ownership
        if vehicle.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your vehicle")

        # Check vehicle not soft-deleted
        if vehicle.is_deleted:
            raise HTTPException(status_code=422, detail="Vehicle is no longer available")

        # Check no active request exists
        active = await self.repo.get_active_for_user(user_id)
        if active:
            raise HTTPException(
                status_code=409, detail="You already have an active charging request"
            )

        req = ChargingRequest(
            user_id=user_id,
            vehicle_id=data.vehicle_id,
            latitude=data.latitude,
            longitude=data.longitude,
            address=data.address,
            notes=data.notes,
            status="pending",
            created_at=datetime.now(tz=timezone.utc),
            updated_at=datetime.now(tz=timezone.utc),
        )
        created = await self.repo.create(req)
        return RequestResponse.model_validate(created)

    async def get_request(self, user_id: UUID, request_id: UUID) -> RequestResponse:
        req = await self.repo.get_by_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        if req.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your request")
        return RequestResponse.model_validate(req)

    async def list_requests(
        self, user_id: UUID, page: int = 1, size: int = 20
    ) -> list[RequestResponse]:
        reqs = await self.repo.get_by_user(user_id, page=page, size=size)
        return [RequestResponse.model_validate(r) for r in reqs]

    async def admin_update_status(
        self, request_id: UUID, new_status: str
    ) -> RequestResponse:
        req = await self.repo.get_by_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        self._validate_transition(req.status, new_status)
        updated = await self.repo.update_status(req, new_status)
        return RequestResponse.model_validate(updated)

    async def customer_cancel(
        self, user_id: UUID, request_id: UUID
    ) -> RequestResponse:
        req = await self.repo.get_by_id(request_id)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        if req.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not your request")
        if req.status not in CUSTOMER_CANCELLABLE:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot cancel a request with status '{req.status}'",
            )
        updated = await self.repo.update_status(req, "cancelled")
        return RequestResponse.model_validate(updated)
