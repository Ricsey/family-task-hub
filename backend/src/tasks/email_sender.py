import logging

from src.core.celery import celery

logger = logging.getLogger(__name__)


@celery.task(bind=True, max_retries=3)
def send_email_task(self, to_email: str, subject: str, body: str):
    """
    Celery task to send an email. This is a placeholder implementation.
    In a real application, you would integrate with an email service provider.
    """
    logger.info(f"Sending email to {to_email} with subject '{subject}'")

    try:
        # Simulate email sending (replace with actual email sending logic)
        print(f"Email sent to {to_email} with subject '{subject}' and body:\n{body}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        raise self.retry(exc=e)
