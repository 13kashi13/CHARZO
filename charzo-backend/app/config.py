from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    database_url: str

    # JWT
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 30

    # CORS
    frontend_origin: str = "https://charzo.vercel.app"

    # App
    environment: str = "development"

    # Optional health check API key
    health_api_key: str = ""

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


settings = Settings()
