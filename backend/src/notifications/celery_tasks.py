import asyncio
import logging

from src.core.celery import celery
from src.notifications.email._factory import get_email_provider

logger = logging.getLogger(__name__)


@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def send_notification_email(self, to_email: str, subject: str, html_body: str):
    try:
        provider = get_email_provider()
        asyncio.run(provider.send_email(to=to_email, subject=subject, body=html_body))
    except Exception as e:
        logger.error("Failed to send notification email to %s: %s", to_email, e)
        raise self.retry(exc=e)
