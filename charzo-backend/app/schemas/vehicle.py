from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, field_validator

VALID_CONNECTOR_TYPES = {"Type1", "Type2", "CCS", "CHAdeMO", "GBT"}


class CreateVehicleRequest(BaseModel):
    make: str
    model: str
    year: int
    connector_type: str

    @field_validator("connector_type")
    @classmethod
    def validate_connector(cls, v: str) -> str:
        if v not in VALID_CONNECTOR_TYPES:
            raise ValueError(f"connector_type must be one of {VALID_CONNECTOR_TYPES}")
        return v

    @field_validator("year")
    @classmethod
    def validate_year(cls, v: int) -> int:
        from datetime import datetime
        current_year = datetime.now().year
        if v < 1990 or v > current_year:
            raise ValueError(f"year must be between 1990 and {current_year}")
        return v

    @field_validator("make", "model")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class UpdateVehicleRequest(BaseModel):
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    connector_type: Optional[str] = None

    @field_validator("connector_type")
    @classmethod
    def validate_connector(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_CONNECTOR_TYPES:
            raise ValueError(f"connector_type must be one of {VALID_CONNECTOR_TYPES}")
        return v

    @field_validator("year")
    @classmethod
    def validate_year(cls, v: Optional[int]) -> Optional[int]:
        if v is not None:
            from datetime import datetime
            current_year = datetime.now().year
            if v < 1990 or v > current_year:
                raise ValueError(f"year must be between 1990 and {current_year}")
        return v


class VehicleResponse(BaseModel):
    id: UUID
    user_id: UUID
    make: str
    model: str
    year: int
    connector_type: str
    created_at: datetime

    model_config = {"from_attributes": True}
