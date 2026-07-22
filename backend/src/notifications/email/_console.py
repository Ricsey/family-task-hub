import logging

from src.notifications.email._protocol import EmailProvider

logger = logging.getLogger(__name__)


class ConsoleEmailProvider(EmailProvider):
    async def send_email(self, to: str, subject: str, body: str) -> None:
        logger.info(
            "Email to %s | Subject: %s | Body: %s",
            to,
            subject,
            body,
        )
