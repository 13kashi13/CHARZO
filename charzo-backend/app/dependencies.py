from collections.abc import Callable
from uuid import UUID

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db=Depends(get_db),
) -> User:
    """Decode JWT, fetch user, verify active. Raises 401 on failure."""
    try:
        payload = decode_access_token(token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    repo = UserRepository(db)
    user = await repo.get_by_id(UUID(user_id))
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.status != "active":
        raise HTTPException(status_code=401, detail="Account is inactive")

    return user


def require_role(*roles: str) -> Callable:
    """
    RBAC dependency factory.
    Usage: Depends(require_role("admin"))
    Raises 403 if user role not in allowed roles.
    """
    async def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user
    return checker
