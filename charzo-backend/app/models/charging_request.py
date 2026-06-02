from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class ChargingRequest(SQLModel, table=True):
    __tablename__ = "charging_requests"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    vehicle_id: UUID = Field(foreign_key="vehicles.id", nullable=False)
    latitude: float = Field(nullable=False)
    longitude: float = Field(nullable=False)
    address: str = Field(nullable=False)
    status: str = Field(default="pending", nullable=False, index=True)
    notes: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
