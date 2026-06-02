from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.rate_limiter import limiter
from app.database import get_db
from app.dependencies import require_role
from app.services.admin_service import AdminService

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
@limiter.limit("300/minute")
async def dashboard(
    request: Request,
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_role("admin")),
):
    service = AdminService(db)
    return await service.get_dashboard_stats()


@router.get("/users")
@limiter.limit("300/minute")
async def list_users(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_role("admin")),
):
    service = AdminService(db)
    return await service.list_users(page=page, size=size, search=search)


@router.patch("/users/{user_id}/status")
@limiter.limit("300/minute")
async def update_user_status(
    request: Request,
    user_id: UUID,
    status: str = Query(..., description="active or inactive"),
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_role("admin")),
):
    service = AdminService(db)
    return await service.update_user_status(user_id=user_id, status=status)


@router.get("/requests")
@limiter.limit("300/minute")
async def list_requests(
    request: Request,
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    status: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    admin=Depends(require_role("admin")),
):
    service = AdminService(db)
    return await service.list_requests(page=page, size=size, status=status)
