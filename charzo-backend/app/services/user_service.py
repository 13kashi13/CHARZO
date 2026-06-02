from datetime import datetime

from fastapi import HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserResponse


class UserService:
    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register_user(self, data: RegisterRequest) -> UserResponse:
        # Check for duplicate email — 409 Conflict
        existing = await self.repo.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        # Hash password — never store plaintext
        password_hash = hash_password(data.password)

        user = User(
            email=data.email.lower().strip(),
            full_name=data.full_name,
            phone=data.phone,
            password_hash=password_hash,
            role="customer",
            status="active",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        created = await self.repo.create(user)
        return UserResponse.model_validate(created)
