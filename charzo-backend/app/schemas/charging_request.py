from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator


class CreateRequestSchema(BaseModel):
    vehicle_id: UUID
    latitude: float
    longitude: float
    address: str
    notes: Optional[str] = None

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not (-90.0 <= v <= 90.0):
            raise ValueError("latitude must be between -90 and 90")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not (-180.0 <= v <= 180.0):
            raise ValueError("longitude must be between -180 and 180")
        return v

    @field_validator("address")
    @classmethod
    def address_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("address cannot be empty")
        return v.strip()


class UpdateStatusSchema(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        valid = {"pending", "confirmed", "in_progress", "completed", "cancelled"}
        if v not in valid:
            raise ValueError(f"status must be one of {valid}")
        return v


class RequestResponse(BaseModel):
    id: UUID
    user_id: UUID
    vehicle_id: UUID
    latitude: float
    longitude: float
    address: str
    status: str
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
