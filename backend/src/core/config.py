from urllib.parse import quote_plus

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "My FastAPI Application"
    admin_email: str = "noreply@company.com"

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )
    CLERK_WEBHOOK_SECRET_KEY: str = Field(init=False, min_length=1)
    CLERK_JWT_ISSUER: str = Field(
        init=False, min_length=1
    )  # e.g., "https://your-clerk-instance.clerk.accounts.dev"
    CLERK_JWKS_URL: str = Field(
        init=False, min_length=1
    )  # e.g., "https://your-clerk-instance.clerk.accounts.dev/.well-known/jwks.json"

    POSTGRES_DB: str = Field(init=False, min_length=1)
    POSTGRES_USER: str = Field(init=False, min_length=1)
    POSTGRES_PASSWORD: str = Field(init=False, min_length=1)
    POSTGRES_SERVER: str = Field("db", init=False)  # Default value for Docker setup
    POSTGRES_PORT: str = Field("5432", init=False)

    @property
    def database_url(self) -> str:
        password_encoded = quote_plus(self.POSTGRES_PASSWORD)
        return (
            f"postgresql+psycopg2://{self.POSTGRES_USER}:{password_encoded}@"
            f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
