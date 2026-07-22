import os

os.environ["CLERK_WEBHOOK_SECRET_KEY"] = "test"
os.environ["CLERK_JWT_ISSUER"] = "https://test.clerk.accounts.dev"
os.environ["CLERK_JWKS_URL"] = "https://test.clerk.accounts.dev/.well-known/jwks.json"
os.environ["POSTGRES_DB"] = "test"
os.environ["POSTGRES_USER"] = "test"
os.environ["POSTGRES_PASSWORD"] = "test"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"

from src.core.config import settings


def test_notification_config_vars_have_defaults():
    assert hasattr(settings, "RESEND_API_KEY")
    assert hasattr(settings, "FROM_EMAIL")
    assert hasattr(settings, "EMAIL_PROVIDER")
    assert settings.FROM_EMAIL == "noreply@familytaskhub.com"
    assert settings.EMAIL_PROVIDER == "console"
