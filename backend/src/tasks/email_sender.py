import logging

from src.notifications.celery_tasks import send_notification_email as send_email_task

logger = logging.getLogger(__name__)
