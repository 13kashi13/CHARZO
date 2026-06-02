from fastapi import APIRouter, Depends, Request

from app.core.rate_limiter import limiter
from app.dependencies import require_role

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/dashboard")
@limiter.limit("300/minute")
async def dashboard(request: Request, admin=Depends(require_role("admin"))):
    """Admin dashboard stats — fully implemented in Task 13."""
    return {"message": "Admin dashboard — Task 13"}

# All other admin routes implemented in Task 13
