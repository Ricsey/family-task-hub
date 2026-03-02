from urllib.parse import quote_plus

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "My FastAPI Application"
    admin_email: str = "noreply@company.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )

    # Clerk configuration
    CLERK_WEBHOOK_SECRET_KEY: str = Field(init=False, min_length=1)
    CLERK_JWT_ISSUER: str = Field(
        init=False, min_length=1
    )  # e.g., "https://your-clerk-instance.clerk.accounts.dev"
    CLERK_JWKS_URL: str = Field(
        init=False, min_length=1
    )  # e.g., "https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json"

    # Database configuration
    POSTGRES_DB: str = Field(init=False, min_length=1)
    POSTGRES_USER: str = Field(init=False, min_length=1)
    POSTGRES_PASSWORD: str = Field(init=False, min_length=1)
    POSTGRES_SERVER: str = Field("db", init=False)  # Default value for Docker setup
    POSTGRES_PORT: str = Field("5432", init=False)

    # Celery configuration
    REDIS_URL: str = Field(init=False, min_length=1)

    @computed_field
    @property
    def CELERY_BROKER_URL(self) -> str:
        return self.REDIS_URL

    @computed_field
    @property
    def CELERY_RESULT_BACKEND(self) -> str:
        return self.REDIS_URL

    CELERY_TASK_SERIALIZER: str = "json"
    CELERY_ACCEPT_CONTENT: list[str] = ["json"]
    CELERY_RESULT_SERIALIZER: str = "json"
    CELERY_TASK_TRACK_STARTED: bool = True
    CELERY_TASK_TIME_LIMIT: int = 300
    CELERY_TASK_SOFT_TIME_LIMIT: int = 250

    @property
    def database_url(self) -> str:
        password_encoded = quote_plus(self.POSTGRES_PASSWORD)
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{password_encoded}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
