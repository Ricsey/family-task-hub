import os

os.environ.setdefault("CLERK_WEBHOOK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_JWT_ISSUER", "https://test.clerk.accounts.dev")
os.environ.setdefault("CLERK_JWKS_URL", "https://test.clerk.accounts.dev/.well-known/jwks.json")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from unittest.mock import Mock, patch

from src.notifications.celery_tasks import send_notification_email


class TestSendNotificationEmail:
    @patch("src.notifications.celery_tasks.get_email_provider")
    def test_sends_email_via_provider(self, mock_get_provider):
        mock_provider = mock_get_provider.return_value
        mock_provider.send_email = Mock()

        send_notification_email("test@example.com", "Subject", "<p>Body</p>")

        mock_provider.send_email.assert_called_once_with(
            to="test@example.com",
            subject="Subject",
            body="<p>Body</p>",
        )
