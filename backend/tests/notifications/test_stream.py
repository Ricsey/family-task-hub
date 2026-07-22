import os

os.environ.setdefault("CLERK_WEBHOOK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_JWT_ISSUER", "https://test.clerk.accounts.dev")
os.environ.setdefault("CLERK_JWKS_URL", "https://test.clerk.accounts.dev/.well-known/jwks.json")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from unittest.mock import patch

from src.notifications.events import TaskAssigneeChangedEvent


def test_task_assignee_changed_event_has_required_fields():
    event = TaskAssigneeChangedEvent(
        task_id=1,
        task_title="Test Task",
        task_category="Chore",
        task_due_date="2026-07-22",
        previous_assignee_id=None,
        previous_assignee_email=None,
        new_assignee_id="550e8400-e29b-41d4-a716-446655440000",
        new_assignee_email="user@example.com",
        new_assignee_name="John",
        actor_name="Alice",
    )
    assert event.task_id == 1
    assert event.new_assignee_email == "user@example.com"


@patch("src.notifications.stream.redis_client")
def test_publish_event_calls_xadd(mock_redis):
    from src.notifications.stream import publish_event

    publish_event("task.assignee_changed", {"task_id": 1})
    mock_redis.xadd.assert_called_once()
