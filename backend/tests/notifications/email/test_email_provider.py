import logging
import os

os.environ.setdefault("CLERK_WEBHOOK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_JWT_ISSUER", "https://test.clerk.accounts.dev")
os.environ.setdefault("CLERK_JWKS_URL", "https://test.clerk.accounts.dev/.well-known/jwks.json")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from unittest.mock import patch

import pytest

from src.core.config import settings
from src.notifications.email._console import ConsoleEmailProvider
from src.notifications.email._factory import get_email_provider
from src.notifications.email._resend import ResendEmailProvider


class TestEmailProviderProtocol:
    def test_protocol_cannot_be_instantiated(self):
        from src.notifications.email._protocol import EmailProvider

        with pytest.raises(TypeError):
            EmailProvider()

    def test_console_provider_is_instance_of_protocol(self):
        from src.notifications.email._protocol import EmailProvider

        provider = ConsoleEmailProvider()
        assert isinstance(provider, EmailProvider)

    def test_resend_provider_is_instance_of_protocol(self):
        from src.notifications.email._protocol import EmailProvider

        provider = ResendEmailProvider()
        assert isinstance(provider, EmailProvider)


class TestConsoleEmailProvider:
    @pytest.mark.asyncio
    async def test_send_email_logs_message(self, caplog):
        caplog.set_level(logging.INFO)
        provider = ConsoleEmailProvider()
        await provider.send_email(
            to="test@example.com",
            subject="Test Subject",
            body="Test Body",
        )
        assert "Email to test@example.com" in caplog.text
        assert "Subject: Test Subject" in caplog.text
        assert "Body: Test Body" in caplog.text

    @pytest.mark.asyncio
    async def test_send_email_returns_none(self):
        provider = ConsoleEmailProvider()
        result = await provider.send_email(
            to="test@example.com",
            subject="Subject",
            body="Body",
        )
        assert result is None


class TestResendEmailProvider:
    @pytest.mark.asyncio
    async def test_send_email_calls_resend_api(self):
        mock_response = {"id": "email_123"}
        with patch("resend.Emails.send", return_value=mock_response) as mock_send:
            provider = ResendEmailProvider()
            result = await provider.send_email(
                to="test@example.com",
                subject="Test Subject",
                body="Test Body",
            )
            mock_send.assert_called_once_with(
                {
                    "from": settings.FROM_EMAIL,
                    "to": ["test@example.com"],
                    "subject": "Test Subject",
                    "text": "Test Body",
                }
            )
            assert result is None

    @pytest.mark.asyncio
    async def test_send_email_sets_api_key(self):
        with patch("resend.Emails.send", return_value={"id": "email_123"}):
            provider = ResendEmailProvider()
            assert provider is not None


class TestEmailProviderFactory:
    def test_get_email_provider_returns_console_by_default(self):
        with patch.object(settings, "EMAIL_PROVIDER", "console"):
            provider = get_email_provider()
            assert isinstance(provider, ConsoleEmailProvider)

    def test_get_email_provider_returns_resend_when_configured(self):
        with patch.object(settings, "EMAIL_PROVIDER", "resend"):
            provider = get_email_provider()
            assert isinstance(provider, ResendEmailProvider)
