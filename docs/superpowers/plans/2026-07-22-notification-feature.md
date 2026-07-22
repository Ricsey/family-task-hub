# Notification Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an event-driven notification system using Redis Streams, Celery, and a pluggable email provider.

**Architecture:** Route handlers publish `TaskAssigneeChanged` events to a Redis Stream via `XADD`. A dedicated event-consumer service reads the stream via `XREADGROUP` and dispatches to handlers. Handlers check the recipient's notification preference, then enqueue a Celery task for email delivery.

**Tech Stack:** Python 3.12, FastAPI, Redis Streams, Celery, SQLModel, Resend SDK, pytest

## Global Constraints

- All new notification code goes in `backend/src/notifications/` package
- Reuse existing `src/core/celery.py` Celery app instance — do NOT create a new one
- Refactor `src/tasks/email_sender.py` into the notifications package, do NOT leave both
- Route handlers publish events via `redis.xadd()` — no direct `.delay()` calls
- Domain terminology per `CONTEXT.md`: Assignee, Actor, TaskAssigneeChanged, Self-assignment, Unassignment, Notification Preference
- Self-assignments (Actor == Assignee) never produce events or notifications
- Actor is never notified (they performed the action)
- Test-first for every code change
- All tests run from `backend/` directory via `uv run pytest`

---

## File Structure

### New files
- `backend/src/notifications/__init__.py` — package marker
- `backend/src/notifications/email/__init__.py` — sub-package marker
- `backend/src/notifications/email/provider.py` — `EmailMessage` dataclass, `EmailProvider` protocol
- `backend/src/notifications/email/console_provider.py` — `ConsoleEmailProvider`
- `backend/src/notifications/email/resend_provider.py` — `ResendEmailProvider`
- `backend/src/notifications/email/factory.py` — `get_email_provider()` factory
- `backend/src/notifications/stream.py` — `redis_client`, `publish_event()`
- `backend/src/notifications/events.py` — `TaskAssigneeChangedEvent` model
- `backend/src/notifications/templates.py` — `render_assigned_email()`, `render_unassigned_email()`
- `backend/src/notifications/celery_tasks.py` — `send_notification_email` Celery task
- `backend/src/notifications/handlers.py` — `handle_task_assignee_changed()`
- `backend/src/notifications/consumer.py` — event consumer loop

### Modified files
- `backend/pyproject.toml` — add `resend` dependency
- `backend/src/core/config.py` — add `RESEND_API_KEY`, `FROM_EMAIL`, `EMAIL_PROVIDER`
- `backend/src/models/users.py` — add `email_notifications_enabled` to `UserBase`
- `backend/src/api/routes/tasks.py` — publish events, remove inline `.delay()` call
- `backend/src/api/routes/users.py` — add `PATCH /users/me/notification-preference`
- `backend/src/tasks/email_sender.py` — absorbed into notifications package (later removed)
- `docker-compose.yml` — add `redis`, `event-consumer` services, `redis-data` volume
- `.env.example` — add `RESEND_API_KEY`, `FROM_EMAIL`, `EMAIL_PROVIDER`

### New test files
- `backend/tests/notifications/__init__.py`
- `backend/tests/notifications/test_console_provider.py`
- `backend/tests/notifications/test_factory.py`
- `backend/tests/notifications/test_stream.py`
- `backend/tests/notifications/test_templates.py`
- `backend/tests/notifications/test_handlers.py`
- `backend/tests/notifications/test_celery_tasks.py`
- `backend/tests/notifications/test_routes_integration.py`
- `backend/tests/models/test_user_preference.py`

---

### Task 1: Add `resend` dependency and notification package skeleton

**Files:**
- Modify: `backend/pyproject.toml`
- Create: `backend/src/notifications/__init__.py`
- Create: `backend/src/notifications/email/__init__.py`
- Create: `backend/tests/notifications/__init__.py`

**Interfaces:**
- Consumes: nothing
- Produces: `src/notifications/` package tree, `resend` available in deps

- [ ] **Step 1: Add `resend` to pyproject.toml dependencies**

```toml
# Add "resend>=4.0.0" to [project] dependencies
```

Edit `backend/pyproject.toml`:
```python
# In the dependencies list, add:
    "resend>=4.0.0",
```

- [ ] **Step 2: Create notification package init files**

```bash
# Run from backend/
New-Item -ItemType File -Path "src/notifications/__init__.py" -Force
New-Item -ItemType File -Path "src/notifications/email/__init__.py" -Force
New-Item -ItemType File -Path "tests/notifications/__init__.py" -Force
```

- [ ] **Step 3: Run tests to verify nothing broke**

```bash
# Run from backend/
uv run pytest -x
```
Expected: existing tests pass (no regressions).

- [ ] **Step 4: Commit**

```bash
git add backend/pyproject.toml backend/src/notifications/ backend/tests/notifications/
git commit -m "feat: add resend dep and notifications package skeleton"
```

---

### Task 2: Add config variables for email provider

**Files:**
- Modify: `backend/src/core/config.py`

**Interfaces:**
- Consumes: `Settings` class
- Produces: `settings.RESEND_API_KEY`, `settings.FROM_EMAIL`, `settings.EMAIL_PROVIDER`

- [ ] **Step 1: Write the failing test**

File `backend/tests/notifications/test_config.py`:
```python
from src.core.config import settings


def test_notification_config_vars_have_defaults():
    assert hasattr(settings, "RESEND_API_KEY")
    assert hasattr(settings, "FROM_EMAIL")
    assert hasattr(settings, "EMAIL_PROVIDER")
    assert settings.FROM_EMAIL == "noreply@familytaskhub.com"
    assert settings.EMAIL_PROVIDER == "console"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/notifications/test_config.py::test_notification_config_vars_have_defaults -x
```
Expected: FAIL — `AttributeError`

- [ ] **Step 3: Add config fields**

Edit `backend/src/core/config.py` — add after `REDIS_URL`:
```python
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@familytaskhub.com"
    EMAIL_PROVIDER: str = "console"
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/notifications/test_config.py::test_notification_config_vars_have_defaults -x
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/core/config.py backend/tests/notifications/test_config.py
git commit -m "feat: add email notification config vars"
```

---

### Task 3: Add `email_notifications_enabled` to User model

**Files:**
- Modify: `backend/src/models/users.py`
- Test: `backend/tests/models/test_user_preference.py`

**Interfaces:**
- Consumes: `UserBase`
- Produces: `UserBase.email_notifications_enabled` (default `True`)

- [ ] **Step 1: Write the failing test**

```python
from src.models.users import UserBase


class TestUserNotificationPreference:
    def test_email_notifications_enabled_defaults_to_true(self):
        user = UserBase(email="test@example.com")
        assert user.email_notifications_enabled is True

    def test_email_notifications_enabled_can_be_disabled(self):
        user = UserBase(email="test@example.com", email_notifications_enabled=False)
        assert user.email_notifications_enabled is False
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/models/test_user_preference.py -x
```
Expected: FAIL — `AttributeError` or `ValidationError`

- [ ] **Step 3: Add field to UserBase**

Edit `backend/src/models/users.py` — add after `image_url`:
```python
    email_notifications_enabled: bool = True
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/models/test_user_preference.py -x
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/models/users.py backend/tests/models/test_user_preference.py
git commit -m "feat: add email_notifications_enabled field to UserBase"
```

---

### Task 4: Create Email Provider protocol and implementations

**Files:**
- Create: `backend/src/notifications/email/provider.py`
- Create: `backend/src/notifications/email/console_provider.py`
- Create: `backend/src/notifications/email/resend_provider.py`
- Create: `backend/src/notifications/email/factory.py`
- Test: `backend/tests/notifications/test_console_provider.py`
- Test: `backend/tests/notifications/test_factory.py`

**Interfaces:**
- Produces: `EmailMessage(title, to_email, subject, html_body)`, `EmailProvider` protocol with `send(message) -> bool`, `ConsoleEmailProvider`, `ResendEmailProvider`, `get_email_provider() -> EmailProvider`

- [ ] **Step 1: Define EmailMessage and EmailProvider protocol**

File `backend/src/notifications/email/provider.py`:
```python
from dataclasses import dataclass
from typing import Protocol


@dataclass
class EmailMessage:
    to_email: str
    subject: str
    html_body: str


class EmailProvider(Protocol):
    def send(self, message: EmailMessage) -> bool: ...
```

- [ ] **Step 2: Implement ConsoleEmailProvider**

File `backend/src/notifications/email/console_provider.py`:
```python
import logging

from src.notifications.email.provider import EmailMessage

logger = logging.getLogger(__name__)


class ConsoleEmailProvider:
    def send(self, message: EmailMessage) -> bool:
        logger.info(
            "Email to %s | subject: %s | body: %s",
            message.to_email,
            message.subject,
            message.html_body,
        )
        print(
            f"Email to {message.to_email}: {message.subject}\n{message.html_body}"
        )
        return True
```

- [ ] **Step 3: Write test for ConsoleEmailProvider**

File `backend/tests/notifications/test_console_provider.py`:
```python
from src.notifications.email.console_provider import ConsoleEmailProvider
from src.notifications.email.provider import EmailMessage


def test_console_provider_returns_true():
    provider = ConsoleEmailProvider()
    msg = EmailMessage(
        to_email="test@example.com",
        subject="Test",
        html_body="<p>Hello</p>",
    )
    assert provider.send(msg) is True
```

- [ ] **Step 4: Run test**

```bash
uv run pytest tests/notifications/test_console_provider.py -x
```
Expected: PASS

- [ ] **Step 5: Implement ResendEmailProvider**

File `backend/src/notifications/email/resend_provider.py`:
```python
import logging

import resend

from src.core.config import settings
from src.notifications.email.provider import EmailMessage

logger = logging.getLogger(__name__)


class ResendEmailProvider:
    def __init__(self) -> None:
        resend.api_key = settings.RESEND_API_KEY

    def send(self, message: EmailMessage) -> bool:
        try:
            response = resend.Emails.send({
                "from": settings.FROM_EMAIL,
                "to": message.to_email,
                "subject": message.subject,
                "html": message.html_body,
            })
            logger.info("Resend API response: %s", response)
            return True
        except Exception as e:
            logger.error("Failed to send via Resend: %s", e)
            return False
```

- [ ] **Step 6: Implement factory**

File `backend/src/notifications/email/factory.py`:
```python
from src.core.config import settings
from src.notifications.email.console_provider import ConsoleEmailProvider
from src.notifications.email.provider import EmailProvider
from src.notifications.email.resend_provider import ResendEmailProvider


def get_email_provider() -> EmailProvider:
    provider_map: dict[str, EmailProvider] = {
        "console": ConsoleEmailProvider(),
        "resend": ResendEmailProvider(),
    }
    return provider_map.get(settings.EMAIL_PROVIDER, ConsoleEmailProvider())
```

- [ ] **Step 7: Write factory test**

File `backend/tests/notifications/test_factory.py`:
```python
from unittest.mock import patch

from src.notifications.email.console_provider import ConsoleEmailProvider
from src.notifications.email.factory import get_email_provider
from src.notifications.email.resend_provider import ResendEmailProvider


class TestEmailProviderFactory:
    @patch("src.notifications.email.factory.settings")
    def test_console_provider_returned_when_env_is_console(self, mock_settings):
        mock_settings.EMAIL_PROVIDER = "console"
        provider = get_email_provider()
        assert isinstance(provider, ConsoleEmailProvider)

    @patch("src.notifications.email.factory.settings")
    def test_resend_provider_returned_when_env_is_resend(self, mock_settings):
        mock_settings.EMAIL_PROVIDER = "resend"
        provider = get_email_provider()
        assert isinstance(provider, ResendEmailProvider)

    @patch("src.notifications.email.factory.settings")
    def test_unknown_provider_falls_back_to_console(self, mock_settings):
        mock_settings.EMAIL_PROVIDER = "unknown"
        provider = get_email_provider()
        assert isinstance(provider, ConsoleEmailProvider)
```

- [ ] **Step 8: Run all email tests**

```bash
uv run pytest tests/notifications/test_console_provider.py tests/notifications/test_factory.py -x
```
Expected: PASS (both)

- [ ] **Step 9: Commit**

```bash
git add backend/src/notifications/email/ backend/tests/notifications/test_console_provider.py backend/tests/notifications/test_factory.py
git commit -m "feat: email provider protocol with console and resend implementations"
```

---

### Task 5: Create email templates

**Files:**
- Create: `backend/src/notifications/templates.py`
- Test: `backend/tests/notifications/test_templates.py`

**Interfaces:**
- Produces: `render_assigned_email(task_title, task_category, due_date, actor_name) -> str`, `render_unassigned_email(task_title, task_category, due_date, actor_name) -> str`

- [ ] **Step 1: Write failing tests**

File `backend/tests/notifications/test_templates.py`:
```python
from src.notifications.templates import render_assigned_email, render_unassigned_email


class TestEmailTemplates:
    def test_assigned_template_includes_task_title(self):
        html = render_assigned_email(
            task_title="Grocery Shopping",
            task_category="Shopping",
            due_date="2026-07-25",
            actor_name="Alice",
        )
        assert "Grocery Shopping" in html
        assert "Shopping" in html
        assert "2026-07-25" in html
        assert "Alice" in html
        assert "assigned" in html

    def test_unassigned_template_informs_user(self):
        html = render_unassigned_email(
            task_title="Fix Leaky Faucet",
            task_category="Chore",
            due_date="2026-07-24",
            actor_name="Bob",
        )
        assert "Fix Leaky Faucet" in html
        assert "You are no longer responsible" in html
        assert "Bob" in html
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/notifications/test_templates.py -x
```
Expected: FAIL — `ImportError`

- [ ] **Step 3: Implement templates**

File `backend/src/notifications/templates.py`:
```python
def _base_html(body: str) -> str:
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
{body}
</body>
</html>"""


def render_assigned_email(
    task_title: str,
    task_category: str,
    due_date: str,
    actor_name: str,
) -> str:
    body = f"""
<h2>Task Assigned</h2>
<p><strong>{actor_name}</strong> assigned you a task.</p>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:4px 8px;font-weight:bold;">Task</td><td>{task_title}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Category</td><td>{task_category}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Due</td><td>{due_date}</td></tr>
</table>"""
    return _base_html(body)


def render_unassigned_email(
    task_title: str,
    task_category: str,
    due_date: str,
    actor_name: str,
) -> str:
    body = f"""
<h2>Task Unassigned</h2>
<p>You are no longer responsible for a task.</p>
<table style="width:100%;border-collapse:collapse;">
<tr><td style="padding:4px 8px;font-weight:bold;">Task</td><td>{task_title}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Category</td><td>{task_category}</td></tr>
<tr><td style="padding:4px 8px;font-weight:bold;">Due</td><td>{due_date}</td></tr>
</table>
<p>Unassigned by <strong>{actor_name}</strong>.</p>"""
    return _base_html(body)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/notifications/test_templates.py -x
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/notifications/templates.py backend/tests/notifications/test_templates.py
git commit -m "feat: email notification templates"
```

---

### Task 6: Create Celery notification task

**Files:**
- Create: `backend/src/notifications/celery_tasks.py`
- Modify: `backend/src/tasks/email_sender.py` — re-export or delegate
- Test: `backend/tests/notifications/test_celery_tasks.py`

**Interfaces:**
- Consumes: `celery` from `src.core.celery`, `get_email_provider()`, `render_assigned_email`, `render_unassigned_email`
- Produces: `send_notification_email(to_email, subject, html_body) -> None` Celery task

- [ ] **Step 1: Write failing test**

File `backend/tests/notifications/test_celery_tasks.py`:
```python
from unittest.mock import patch

from src.notifications.celery_tasks import send_notification_email


class TestSendNotificationEmail:
    @patch("src.notifications.celery_tasks.get_email_provider")
    def test_sends_email_via_provider(self, mock_get_provider):
        mock_provider = mock_get_provider.return_value
        mock_provider.send.return_value = True

        send_notification_email("test@example.com", "Subject", "<p>Body</p>")

        mock_provider.send.assert_called_once()
        args = mock_provider.send.call_args[0][0]
        assert args.to_email == "test@example.com"
        assert args.subject == "Subject"
        assert args.html_body == "<p>Body</p>"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/notifications/test_celery_tasks.py -x
```
Expected: FAIL — `ImportError`

- [ ] **Step 3: Implement Celery task**

File `backend/src/notifications/celery_tasks.py`:
```python
import logging

from src.core.celery import celery
from src.notifications.email.factory import get_email_provider
from src.notifications.email.provider import EmailMessage

logger = logging.getLogger(__name__)


@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def send_notification_email(self, to_email: str, subject: str, html_body: str):
    try:
        provider = get_email_provider()
        message = EmailMessage(
            to_email=to_email,
            subject=subject,
            html_body=html_body,
        )
        provider.send(message)
    except Exception as e:
        logger.error("Failed to send notification email to %s: %s", to_email, e)
        raise self.retry(exc=e)
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/notifications/test_celery_tasks.py -x
```
Expected: PASS

- [ ] **Step 5: Add re-export from old location to not break existing imports**

Edit `backend/src/tasks/email_sender.py` — replace content:
```python
import logging

from src.notifications.celery_tasks import send_notification_email as send_email_task

logger = logging.getLogger(__name__)
```

- [ ] **Step 6: Run all tests**

```bash
uv run pytest -x
```
Expected: all existing tests PASS

- [ ] **Step 7: Commit**

```bash
git add backend/src/notifications/celery_tasks.py backend/src/tasks/email_sender.py backend/tests/notifications/test_celery_tasks.py
git commit -m "feat: celery notification email task"
```

---

### Task 7: Create Redis Stream publisher and event models

**Files:**
- Create: `backend/src/notifications/events.py`
- Create: `backend/src/notifications/stream.py`
- Test: `backend/tests/notifications/test_stream.py`

**Interfaces:**
- Produces: `TaskAssigneeChangedEvent` Pydantic model, `publish_event(event_type, payload) -> None`

- [ ] **Step 1: Write failing tests**

File `backend/tests/notifications/test_stream.py`:
```python
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/notifications/test_stream.py -x
```
Expected: FAIL — `ImportError`

- [ ] **Step 3: Implement event model**

File `backend/src/notifications/events.py`:
```python
from pydantic import BaseModel


class TaskAssigneeChangedEvent(BaseModel):
    task_id: int
    task_title: str
    task_category: str
    task_due_date: str
    previous_assignee_id: str | None
    previous_assignee_email: str | None
    new_assignee_id: str | None
    new_assignee_email: str | None
    new_assignee_name: str | None
    actor_name: str
```

- [ ] **Step 4: Implement stream publisher**

File `backend/src/notifications/stream.py`:
```python
import json
import logging

import redis

from src.core.config import settings

logger = logging.getLogger(__name__)

redis_client = redis.Redis.from_url(settings.REDIS_URL)


def publish_event(event_type: str, payload: dict) -> None:
    redis_client.xadd(
        "task_events",
        {"type": event_type, "payload": json.dumps(payload)},
    )
    logger.info("Published event %s: %s", event_type, payload)
```

- [ ] **Step 5: Run test to verify it passes**

```bash
uv run pytest tests/notifications/test_stream.py -x
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/notifications/events.py backend/src/notifications/stream.py backend/tests/notifications/test_stream.py
git commit -m "feat: redis stream publisher and event models"
```

---

### Task 8: Publish events from task routes

**Files:**
- Modify: `backend/src/api/routes/tasks.py`
- Test: `backend/tests/notifications/test_routes_integration.py`

**Interfaces:**
- Consumes: `publish_event()`, `CurrentUserDep`, `TaskAssigneeChangedEvent`
- Modifies: `create_task` and `update_task` endpoints

- [ ] **Step 1: Write failing test verifying publish_event is imported**

File `backend/tests/notifications/test_routes_integration.py`:
```python
from src.api.routes.tasks import router


def test_router_still_has_routes():
    paths = [r.path for r in router.routes]
    assert "/" in paths
    assert "/{task_id}" in paths
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/notifications/test_routes_integration.py -x
```
Expected: FAIL — `ImportError`

- [ ] **Step 3: Add `current_user` parameter to route functions and implement event publishing**

Edit `backend/src/api/routes/tasks.py`:

1. Add imports:
```python
from src.api.deps import CurrentUserDep
from src.notifications.events import TaskAssigneeChangedEvent
from src.notifications.stream import publish_event
```

2. Remove import: `from src.tasks.email_sender import send_email_task`

3. Update `create_task` signature — add `current_user: CurrentUserDep`:
```python
def create_task(task_in: TaskCreate, session: SessionDep, current_user: CurrentUserDep):
```

4. Replace the inline `.delay()` block (lines 49-55) with event publishing:
```python
    if task.assignee_id:
        if str(task.assignee_id) != str(current_user.id):
            event = TaskAssigneeChangedEvent(
                task_id=task.id,
                task_title=task.title,
                task_category=task.category.value,
                task_due_date=str(task.due_date),
                previous_assignee_id=None,
                previous_assignee_email=None,
                new_assignee_id=str(task.assignee_id),
                new_assignee_email=task.assignee.email if task.assignee else None,
                new_assignee_name=task.assignee.full_name if task.assignee else None,
                actor_name=current_user.full_name or current_user.email,
            )
            publish_event("task.assignee_changed", event.model_dump())
```

5. Update `update_task` signature — add `current_user: CurrentUserDep`:
```python
def update_task(*, task_id: int, task_in: TaskUpdate, session: SessionDep, current_user: CurrentUserDep):
```

6. In `update_task`, capture old assignee before update, then after refresh publish event with proper payloads:
```python
    old_assignee_id = str(db_task.assignee_id) if db_task.assignee_id else None
    old_assignee_email = db_task.assignee.email if db_task.assignee else None

    update_data = task_in.model_dump(exclude_unset=True)
    db_task.sqlmodel_update(update_data)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    statement = (
        select(Task).options(selectinload(Task.assignee)).where(Task.id == task_id)
    )
    db_task = session.exec(statement).first()

    new_assignee_id = str(db_task.assignee_id) if db_task.assignee_id else None
    new_assignee_email = db_task.assignee.email if db_task.assignee else None
    new_assignee_name = db_task.assignee.full_name if db_task.assignee else None

    if old_assignee_id != new_assignee_id:
        if new_assignee_id and new_assignee_id != str(current_user.id):
            event = TaskAssigneeChangedEvent(
                task_id=task_id,
                task_title=db_task.title,
                task_category=db_task.category.value,
                task_due_date=str(db_task.due_date),
                previous_assignee_id=old_assignee_id,
                previous_assignee_email=old_assignee_email,
                new_assignee_id=new_assignee_id,
                new_assignee_email=new_assignee_email,
                new_assignee_name=new_assignee_name,
                actor_name=current_user.full_name or current_user.email,
            )
            publish_event("task.assignee_changed", event.model_dump())
        elif old_assignee_id and old_assignee_id != str(current_user.id):
            event = TaskAssigneeChangedEvent(
                task_id=task_id,
                task_title=db_task.title,
                task_category=db_task.category.value,
                task_due_date=str(db_task.due_date),
                previous_assignee_id=old_assignee_id,
                previous_assignee_email=old_assignee_email,
                new_assignee_id=None,
                new_assignee_email=None,
                new_assignee_name=None,
                actor_name=current_user.full_name or current_user.email,
            )
            publish_event("task.assignee_changed", event.model_dump())
```

- [ ] **Step 4: Verify the module imports correctly**

```bash
uv run python -c "from src.api.routes.tasks import router; print('OK')"
```
Expected: `OK`

- [ ] **Step 5: Run existing tests**

```bash
uv run pytest -x
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/api/routes/tasks.py
git commit -m "feat: publish task_assignee_changed events from routes"
```

---

### Task 9: Create event handlers with preference check

**Files:**
- Create: `backend/src/notifications/handlers.py`
- Test: `backend/tests/notifications/test_handlers.py`

**Interfaces:**
- Consumes: `send_notification_email.delay()`, `render_assigned_email()`, `render_unassigned_email()`, `Session`, `User`
- Produces: `handle_task_assignee_changed(payload: dict)`

- [ ] **Step 1: Write failing test**

File `backend/tests/notifications/test_handlers.py`:
```python
from unittest.mock import patch

import pytest

from src.notifications.handlers import handle_task_assignee_changed


class TestHandleTaskAssigneeChanged:
    @patch("src.notifications.handlers.send_notification_email.delay")
    @patch("src.notifications.handlers.Session")
    @patch("src.notifications.handlers.engine")
    def test_new_assignee_notified_on_assignment(
        self, mock_engine, mock_session_cls, mock_delay
    ):
        mock_session = mock_session_cls.return_value.__enter__.return_value
        mock_session.exec.return_value.first.return_value = None  # no pref override

        payload = {
            "task_id": 1,
            "task_title": "Test",
            "task_category": "Chore",
            "task_due_date": "2026-07-22",
            "previous_assignee_id": None,
            "previous_assignee_email": None,
            "new_assignee_id": "user-2",
            "new_assignee_email": "user2@test.com",
            "new_assignee_name": "User Two",
            "actor_name": "Alice",
        }
        handle_task_assignee_changed(payload)

        mock_delay.assert_called_once()
        args = mock_delay.call_args[1]
        assert args["to_email"] == "user2@test.com"
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/notifications/test_handlers.py -x
```
Expected: FAIL — `ImportError`

- [ ] **Step 3: Implement handler**

File `backend/src/notifications/handlers.py`:
```python
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

    # Notify new assignee
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

    # Notify previous assignee on unassignment/reassignment
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
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/notifications/test_handlers.py -x
```
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/notifications/handlers.py backend/tests/notifications/test_handlers.py
git commit -m "feat: event handlers with notification preference check"
```

---

### Task 10: Create event consumer

**Files:**
- Create: `backend/src/notifications/consumer.py`

**Interfaces:**
- Consumes: `redis_client`, `handle_task_assignee_changed()`
- Produces: `run_consumer()` — long-running `XREADGROUP` loop

- [ ] **Step 1: Implement consumer**

File `backend/src/notifications/consumer.py`:
```python
import json
import logging
import time

from src.notifications.handlers import handle_task_assignee_changed
from src.notifications.stream import redis_client

logger = logging.getLogger(__name__)

STREAM_NAME = "task_events"
GROUP_NAME = "notification-consumers"
CONSUMER_NAME = "consumer-1"


def _ensure_consumer_group():
    try:
        redis_client.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
    except Exception:
        logger.info("Consumer group already exists (or created)")


def run_consumer():
    _ensure_consumer_group()
    logger.info("Event consumer started on stream %s", STREAM_NAME)

    while True:
        try:
            messages = redis_client.xreadgroup(
                groupname=GROUP_NAME,
                consumername=CONSUMER_NAME,
                streams={STREAM_NAME: ">"},
                count=10,
                block=5000,
            )

            if not messages:
                continue

            for stream_name, entries in messages:
                for msg_id, fields in entries:
                    event_type = fields.get(b"type", b"").decode()
                    payload_raw = fields.get(b"payload", b"{}").decode()
                    payload = json.loads(payload_raw)

                    logger.info("Processing event %s: %s", event_type, msg_id)

                    if event_type == "task.assignee_changed":
                        handle_task_assignee_changed(payload)
                    else:
                        logger.warning("Unknown event type: %s", event_type)

                    redis_client.xack(STREAM_NAME, GROUP_NAME, msg_id)

        except Exception as e:
            logger.error("Consumer error: %s", e)
            time.sleep(1)


if __name__ == "__main__":
    run_consumer()
```

- [ ] **Step 2: Verify module imports correctly**

```bash
uv run python -c "from src.notifications.consumer import run_consumer; print('OK')"
```
Expected: OK

- [ ] **Step 3: Commit**

```bash
git add backend/src/notifications/consumer.py
git commit -m "feat: event consumer with XREADGROUP loop"
```

---

### Task 11: Add PATCH /users/me/notification-preference endpoint

**Files:**
- Modify: `backend/src/api/routes/users.py`
- Test: `backend/tests/notifications/test_user_preference_api.py`

**Interfaces:**
- Consumes: `CurrentUserDep`, `SessionDep`
- Produces: `PATCH /users/me/notification-preference` endpoint

- [ ] **Step 1: Write failing test**

File `backend/tests/notifications/test_user_preference_api.py`:
```python
from unittest.mock import patch

from src.api.routes.users import router


def test_notification_preference_route_exists():
    routes = [r.path for r in router.routes]
    assert "/me/notification-preference" in routes
```

- [ ] **Step 2: Run test to verify it fails**

```bash
uv run pytest tests/notifications/test_user_preference_api.py -x
```
Expected: FAIL — path not found

- [ ] **Step 3: Implement endpoint**

Add to `backend/src/api/routes/users.py` — after the `delete_user` route:
```python
from pydantic import BaseModel


class NotificationPreferenceUpdate(BaseModel):
    email_notifications_enabled: bool


@router.patch("/me/notification-preference")
def update_notification_preference(
    pref_in: NotificationPreferenceUpdate,
    session: SessionDep,
    current_user: CurrentUserDep,
):
    user = session.get(User, current_user.id)
    user.email_notifications_enabled = pref_in.email_notifications_enabled
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"email_notifications_enabled": user.email_notifications_enabled}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
uv run pytest tests/notifications/test_user_preference_api.py -x
```
Expected: PASS

- [ ] **Step 5: Run existing tests to check no regressions**

```bash
uv run pytest -x
```
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add backend/src/api/routes/users.py backend/tests/notifications/test_user_preference_api.py
git commit -m "feat: PATCH /users/me/notification-preference endpoint"
```

---

### Task 12: Update Docker Compose with redis and event-consumer services

**Files:**
- Modify: `docker-compose.yml`
- Modify: `.env.example`

- [ ] **Step 1: Add redis service to docker-compose.yml**

Edit `docker-compose.yml` — add after `db` service:
```yaml
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 5
      start_period: 3s
      timeout: 3s
    volumes:
      - redis-data:/data

  event-consumer:
    build:
      dockerfile: Dockerfile
      context: ./backend
    env_file: ".env"
    entrypoint: ["uv", "run", "python", "-m", "src.notifications.consumer"]
    depends_on:
      redis:
        condition: service_healthy
      db:
        condition: service_healthy
```

- [ ] **Step 2: Add `redis` to backend depends_on**

Edit the `backend` service's `depends_on`:
```yaml
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
```

- [ ] **Step 3: Add redis-data volume**

In `volumes:` section at bottom:
```yaml
  redis-data:
```

- [ ] **Step 4: Add new env vars to .env.example**

Edit `.env.example`:
```bash
# Redis
REDIS_URL=redis://redis:6379/0

# Notifications
RESEND_API_KEY=
FROM_EMAIL=noreply@familytaskhub.com
EMAIL_PROVIDER=console
```

- [ ] **Step 5: Verify docker-compose config**

```bash
docker-compose config
```
Expected: Parses successfully (or `docker compose config` on modern Docker)

- [ ] **Step 6: Commit**

```bash
git add docker-compose.yml .env.example
git commit -m "feat: add redis and event-consumer services to docker-compose"
```

---

### Task 13: Clean up old email_sender and finalize

**Files:**
- Delete: `backend/src/tasks/email_sender.py` (after confirming no remaining imports)

- [ ] **Step 1: Check for remaining imports of old email_sender**

```bash
rg "from src.tasks.email_sender" --type py
```
Expected: No results (the route file was updated in Task 8)

- [ ] **Step 2: Remove the old email_sender file**

```bash
Remove-Item -LiteralPath "backend/src/tasks/email_sender.py"
```

- [ ] **Step 3: Run full test suite**

```bash
uv run pytest -x
```
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: remove old email_sender module (moved to notifications package)"
```

---

### Task 14: Add Alembic migration for email_notifications_enabled

**Files:**
- Create: `backend/migrations/versions/xxxx_add_email_notifications_enabled.py`

- [ ] **Step 1: Generate migration**

```bash
cd backend
uv run alembic revision --autogenerate -m "Add email_notifications_enabled to users"
```

- [ ] **Step 2: Review generated migration**

Read the generated file in `migrations/versions/` to verify it adds the column with `server_default='true'`.

- [ ] **Step 3: Run migration locally (if DB is available)**

```bash
uv run alembic upgrade head
```

- [ ] **Step 4: Commit**

```bash
git add backend/migrations/versions/
git commit -m "feat: add migration for email_notifications_enabled"
```

---

### Task 15: Frontend — Notification preference toggle

**Files:**
- Create: `frontend/src/pages/SettingsPage.tsx` (or wherever user profile lives)
- Modify: `frontend/src/App.tsx` (add route if needed)

**Interfaces:**
- Consumes: `PATCH /users/me/notification-preference` API endpoint
- Produces: Toggle switch for email notifications in user settings

- [ ] **Step 1: Explore frontend structure to find existing user settings/profile page**

```bash
ls frontend/src/
```

Check for existing settings/profile routes and components.

- [ ] **Step 2: Create notification settings component**

File `frontend/src/components/NotificationSettings.tsx`:
```tsx
import { useState, useEffect } from "react";

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users/me/notification-preference")
      .then((res) => res.json())
      .then((data) => setEnabled(data.email_notifications_enabled))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    const next = !enabled;
    setEnabled(next);
    try {
      const res = await fetch("/api/users/me/notification-preference", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_notifications_enabled: next }),
      });
      if (!res.ok) setEnabled(!next);
    } catch {
      setEnabled(!next);
    }
  };

  if (loading) return <div>Loading preferences...</div>;

  return (
    <div>
      <label>
        <input type="checkbox" checked={enabled} onChange={toggle} />
        {" "}Email notifications
      </label>
      <p>Receive email when tasks are assigned to you.</p>
    </div>
  );
}
```

- [ ] **Step 3: Add route /settings that renders NotificationSettings**

Edit the appropriate frontend router file to add `/settings` pointing to `NotificationSettings`.

- [ ] **Step 4: Verify frontend builds**

```bash
cd frontend && npm run build
```
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add frontend/src/
git commit -m "feat: notification preference toggle in settings"
```
