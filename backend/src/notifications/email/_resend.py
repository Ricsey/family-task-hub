import logging

import resend

from src.core.config import settings
from src.notifications.email._protocol import EmailProvider

logger = logging.getLogger(__name__)


class ResendEmailProvider(EmailProvider):
    def __init__(self) -> None:
        resend.api_key = settings.RESEND_API_KEY

    def send_email(self, to: str, subject: str, body: str) -> None:
        params: resend.Emails.SendParams = {
            "from": settings.FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": body,
        }
        email = resend.Emails.send(params)
        logger.info("Email sent to %s (id=%s)", to, email["id"])
