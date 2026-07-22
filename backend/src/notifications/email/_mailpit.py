import logging
import smtplib
from email.message import EmailMessage

from src.core.config import settings
from src.notifications.email._protocol import EmailProvider

logger = logging.getLogger(__name__)


class MailpitEmailProvider(EmailProvider):
    def send_email(self, to: str, subject: str, body: str) -> None:
        msg = EmailMessage()
        msg["From"] = settings.FROM_EMAIL
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body, subtype="html")

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.send_message(msg)

        logger.info("Email sent to %s via mailpit (%s:%s)", to, settings.SMTP_HOST, settings.SMTP_PORT)
