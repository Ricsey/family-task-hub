import logging

from sqlmodel import Session, select

from src.core.db import engine
from src.models.users import User
from src.notifications.celery_tasks import send_notification_email
from src.notifications.templates import (
    render_assigned_email,
    render_unassigned_email,
)

logger = logging.getLogger(__name__)


def _user_has_email_enabled(user_id: str) -> bool:
    with Session(engine) as session:
        user = session.exec(
            select(User).where(User.id == user_id)
        ).first()
        if user is None:
            return False
        return user.email_notifications_enabled


def handle_task_assignee_changed(payload: dict) -> None:
    task_id = payload["task_id"]
    task_title = payload["task_title"]
    task_category = payload["task_category"]
    task_due_date = payload["task_due_date"]
    actor_name = payload["actor_name"]

    new_assignee_id = payload.get("new_assignee_id")
    new_assignee_email = payload.get("new_assignee_email")
    previous_assignee_id = payload.get("previous_assignee_id")
    previous_assignee_email = payload.get("previous_assignee_email")

    if new_assignee_id and new_assignee_id != previous_assignee_id:
        if _user_has_email_enabled(new_assignee_id):
            html = render_assigned_email(
                task_title=task_title,
                task_category=task_category,
                due_date=task_due_date,
                actor_name=actor_name,
            )
            send_notification_email.delay(
                to_email=new_assignee_email,
                subject=f"Task Assigned: {task_title}",
                html_body=html,
            )

    if previous_assignee_id and previous_assignee_id != new_assignee_id:
        if _user_has_email_enabled(previous_assignee_id):
            html = render_unassigned_email(
                task_title=task_title,
                task_category=task_category,
                due_date=task_due_date,
                actor_name=actor_name,
            )
            send_notification_email.delay(
                to_email=previous_assignee_email,
                subject=f"Task Unassigned: {task_title}",
                html_body=html,
            )
