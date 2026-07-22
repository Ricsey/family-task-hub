from src.core.config import settings
from src.notifications.email._protocol import EmailProvider


def get_email_provider() -> EmailProvider:
    if settings.EMAIL_PROVIDER == "resend":
        from src.notifications.email._resend import ResendEmailProvider

        return ResendEmailProvider()
    from src.notifications.email._console import ConsoleEmailProvider

    return ConsoleEmailProvider()
