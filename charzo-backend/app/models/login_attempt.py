from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class LoginAttempt(SQLModel, table=True):
    __tablename__ = "login_attempts"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(nullable=False, index=True)
    ip_address: Optional[str] = Field(default=None)
    success: bool = Field(nullable=False)
    attempted_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
