from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Vehicle(SQLModel, table=True):
    __tablename__ = "vehicles"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    make: str = Field(nullable=False)
    model: str = Field(nullable=False)
    year: int = Field(nullable=False)
    connector_type: str = Field(nullable=False)  # Type1|Type2|CCS|CHAdeMO|GBT
    is_deleted: bool = Field(default=False, nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
