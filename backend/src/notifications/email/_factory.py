import logging

from src.core.config import settings
from src.notifications.email._protocol import EmailProvider

logger = logging.getLogger(__name__)


def get_email_provider() -> EmailProvider:
    if settings.EMAIL_PROVIDER == "resend":
        from src.notifications.email._resend import ResendEmailProvider

        return ResendEmailProvider()
    if settings.EMAIL_PROVIDER == "mailpit":
        from src.notifications.email._mailpit import MailpitEmailProvider

        return MailpitEmailProvider()
    if settings.EMAIL_PROVIDER != "console":
        logger.warning(
            "Unknown EMAIL_PROVIDER '%s', falling back to console",
            settings.EMAIL_PROVIDER,
        )
    from src.notifications.email._console import ConsoleEmailProvider

    return ConsoleEmailProvider()
