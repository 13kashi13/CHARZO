from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.rate_limiter import limiter
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User
from app.schemas.charging_request import CreateRequestSchema, RequestResponse, UpdateStatusSchema
from app.services.request_service import RequestService

router = APIRouter(prefix="/requests", tags=["requests"])


@router.post("", response_model=RequestResponse, status_code=201)
@limiter.limit("300/minute")
async def create_request(
    request: Request,
    data: CreateRequestSchema,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RequestService(db)
    return await service.create_request(user_id=current_user.id, data=data)


@router.get("", response_model=list[RequestResponse])
@limiter.limit("300/minute")
async def list_requests(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RequestService(db)
    return await service.list_requests(user_id=current_user.id, page=page, size=size)


@router.get("/{request_id}", response_model=RequestResponse)
@limiter.limit("300/minute")
async def get_request(
    request: Request,
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RequestService(db)
    return await service.get_request(user_id=current_user.id, request_id=request_id)


@router.patch("/{request_id}/cancel", response_model=RequestResponse)
@limiter.limit("300/minute")
async def cancel_request(
    request: Request,
    request_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = RequestService(db)
    return await service.customer_cancel(user_id=current_user.id, request_id=request_id)


@router.patch("/{request_id}/status", response_model=RequestResponse)
@limiter.limit("300/minute")
async def update_status(
    request: Request,
    request_id: UUID,
    data: UpdateStatusSchema,
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_role("admin")),
):
    service = RequestService(db)
    return await service.admin_update_status(request_id=request_id, new_status=data.status)
