from collections.abc import Callable

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db=Depends(get_db),
):
    """
    Decode JWT, fetch user from DB, verify active status.
    Raises 401 if token is invalid/expired.
    Implemented fully in Task 7.
    """
    # Full implementation in Task 7
    raise NotImplementedError("Implemented in Task 7")


def require_role(*roles: str) -> Callable:
    """
    RBAC dependency factory.
    Usage: Depends(require_role("admin"))
    Raises 403 if user role not in allowed roles.
    Implemented fully in Task 7.
    """
    async def checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return checker
