---
goal: Add an event-driven notification system using Redis Streams, Celery, and a pluggable email provider
version: 2.0
date_created: 2026-07-22
owner: Family Task Hub Team
status: Planned
tags: feature, notifications, email, celery, redis-streams, event-driven, architecture
supersedes: notification_feature.md v1.0
---

# Introduction

Event-driven notification system for Family Task Hub. When a task's assignee changes (assigned, reassigned, or unassigned), the affected user receives a concise email notification. The system uses **Redis Streams** for event dispatch and persistence, **Celery** for async email delivery with retries, and an **abstract email provider interface** with Resend as the default.

## Domain Model

See [CONTEXT.md](./CONTEXT.md) for canonical terms.

**Key events:**
- `TaskAssigneeChanged` — emitted whenever `assignee_id` changes. Carries `previous_assignee_id`, `new_assignee_id`, `task_id`, and actor info.
- Self-assignments (actor === assignee) never emit events.

**Notification rules:**
- New assignee notified on assignment / reassignment
- Previous assignee notified on reassignment / unassignment
- Actor never notified (they performed the action)
- Recipients only receive notifications if their **Notification Preference** is enabled — checked by the handler before enqueuing delivery

## Architecture

```
Route handler → redis.xadd("task_events", {type, payload})
                       │
                       ▼
            Event Consumer (new Docker service)
                       │
              ┌────────┴────────┐
              │                 │
     handle assignee      handle unassignee
              │                 │
     celery send_email    celery send_email
```

- Routes push to Redis Streams (not an in-process event bus)
- Event Consumer runs as a dedicated Docker Compose service
- Stream persists events for replay/debugging
- Celery handles retry with exponential backoff (up to 3 retries)

## Implementation Steps

### Phase 1: Infrastructure — Redis & Streams Setup

| Task | Description |
|------|-------------|
| TASK-001 | Add `resend` to dependencies: `uv add resend` from `backend/`. Celery and redis are already present. |
| TASK-002 | Add `redis` service to `docker-compose.yml` after `db`. Image `redis:7-alpine`, port `6379`, healthcheck with `redis-cli ping`, named volume `redis-data`. Add `redis` to `backend` depends_on with `condition: service_healthy`. |
| TASK-003 | Add `event-consumer` service to `docker-compose.yml`. Same build as `backend`, command runs the consumer entrypoint, same env file, depends_on both `redis` and `db`. |
| TASK-004 | Add to `src/core/config.py`: `RESEND_API_KEY: str = ""`, `FROM_EMAIL: str = "noreply@familytaskhub.com"`, `EMAIL_PROVIDER: str = "console"`. `REDIS_URL` already exists. |
| TASK-005 | Create `src/notifications/` package with `__init__.py`. |

### Phase 2: Email Provider Layer

| Task | Description |
|------|-------------|
| TASK-006 | Create `src/notifications/email/provider.py` — `EmailMessage` dataclass, `EmailProvider` Protocol with `send(message) -> bool`. |
| TASK-007 | Create `src/notifications/email/resend_provider.py` — `ResendEmailProvider` implementing Protocol. |
| TASK-008 | Create `src/notifications/email/console_provider.py` — `ConsoleEmailProvider` for dev/testing. |
| TASK-009 | Create `src/notifications/email/factory.py` — `get_email_provider()` reads `settings.EMAIL_PROVIDER`, returns correct implementation. |

### Phase 3: Event Stream — Redis Streams Publisher

| Task | Description |
|------|-------------|
| TASK-010 | Create `src/notifications/stream.py` — module-level `redis_client` from `settings.REDIS_URL`. Function `publish_event(event_type: str, payload: dict)` that calls `redis_client.xadd("task_events", {"type": event_type, "payload": json.dumps(payload)})`. |
| TASK-011 | Define `TaskAssigneeChangedEvent` Pydantic model in `src/notifications/events.py` with fields: `task_id`, `task_title`, `task_category`, `task_due_date`, `previous_assignee_id`, `previous_assignee_email`, `new_assignee_id`, `new_assignee_email`, `new_assignee_name`, `actor_name`. |

### Phase 4: Event Consumer

| Task | Description |
|------|-------------|
| TASK-012 | Create `src/notifications/consumer.py` — a long-running process that uses `XREADGROUP` to consume from the `task_events` stream. Dispatches to handlers based on event type. Handles acknowledgements with `XACK`. Includes error handling and logging. |
| TASK-013 | Create consumer entrypoint script (e.g., `bin/run-consumer` or referenced via `pyproject.toml` scripts). |

### Phase 5: Celery Tasks & Email Templates

| Task | Description |
|------|-------------|
| TASK-014 | Create `src/notifications/templates.py` — `render_assigned_email()` and `render_unassigned_email()`. Minimal HTML: greeting, task title, category, due date, who acted. |
| TASK-015 | Refactor `src/tasks/email_sender.py` into `src/notifications/celery_tasks.py`. Define `send_notification_email` task with `max_retries=3`, `default_retry_delay=10`. Uses `get_email_provider()` to send. |

### Phase 6: Event Handlers

| Task | Description |
|------|-------------|
| TASK-016 | Create `src/notifications/handlers.py`: `handle_task_assignee_changed(payload: dict)`. Logic: if `new_assignee_id` and not self-assignment → call `send_notification_email.delay(...)` for new assignee. If `previous_assignee_id` and differs from new → call for previous assignee (unassignment). |

### Phase 7: Emit Events from Routes

| Task | Description |
|------|-------------|
| TASK-017 | In `src/api/routes/tasks.py`, remove the existing `send_email_task.delay(...)` call from `create_task`. Import `publish_event` and `CurrentUserDep`. |
| TASK-018 | In `create_task`, after task creation with eager-loaded assignee: if `task.assignee_id` and not self-assignment → `publish_event("task.assignee_changed", {...})`. |
| TASK-019 | In `update_task`, capture `old_assignee_id` before update. After update: if assignee changed → `publish_event("task.assignee_changed", {...})` with both old and new IDs. |

### Phase 8: User Preference — Backend API

| Task | Description |
|------|-------------|
| TASK-020 | Add `email_notifications_enabled: bool = Field(default=True)` to `UserBase` in `src/models/users.py`. |
| TASK-021 | Add a PATCH route `PATCH /users/me/notification-preference` that accepts `{"email_notifications_enabled": bool}` and updates the current user's preference. Returns the updated preference. |

### Phase 9: User Preference — Frontend

| Task | Description |
|------|-------------|
| TASK-022 | Add a notification settings page or section in the user profile. A simple toggle: "Email notifications" with a description like "Receive email when tasks are assigned to you." |
| TASK-023 | Wire the toggle to `PATCH /users/me/notification-preference`. Show the current value on load, optimistically update on toggle, handle errors gracefully. |

### Phase 10: Handler Preference Check

| Task | Description |
|------|-------------|
| TASK-024 | In `src/notifications/handlers.py`, before calling `send_notification_email.delay(...)`, query the user's `email_notifications_enabled` from the database. Skip enqueue if disabled. The handler creates its own DB session (same pattern as Celery tasks per CON-004). |

### Phase 11: Docker Compose & Environment

| Task | Description |
|------|-------------|
| TASK-025 | Add `RESEND_API_KEY=`, `FROM_EMAIL=noreply@familytaskhub.com`, `EMAIL_PROVIDER=console` to `.env.example`. |
| TASK-026 | Add `redis-data` volume and environment variables to all relevant services in `docker-compose.yml`. |

## Testing

| Test | Description |
|------|-------------|
| TEST-001 | Unit: ConsoleEmailProvider returns True |
| TEST-002 | Unit: Email factory returns correct provider per env var |
| TEST-003 | Unit: Redis Stream publish creates stream entry |
| TEST-004 | Unit: Templates render correct fields |
| TEST-005 | Integration: Task create → stream entry created (with mocked redis) |
| TEST-006 | Integration: No event on self-assignment |
| TEST-007 | Integration: Both parties notified on reassignment |
| TEST-008 | Integration: Previous assignee notified on unassignment |
| TEST-009 | Integration: User with notifications disabled does NOT receive email on assignment |
| TEST-010 | Integration: User who disables notifications mid-session — subsequent assignments skip them |
| TEST-011 | Unit: PATCH /users/me/notification-preference updates the field |
| TEST-012 | Frontend: Toggle reflects current preference and calls the API |

## Files

### New
- `src/notifications/__init__.py`
- `src/notifications/stream.py`
- `src/notifications/events.py`
- `src/notifications/consumer.py`
- `src/notifications/handlers.py`
- `src/notifications/celery_tasks.py`
- `src/notifications/templates.py`
- `src/notifications/email/__init__.py`
- `src/notifications/email/provider.py`
- `src/notifications/email/resend_provider.py`
- `src/notifications/email/console_provider.py`
- `src/notifications/email/factory.py`

### Modified
- `docker-compose.yml` — add redis, event-consumer services
- `src/core/config.py` — add RESEND_API_KEY, FROM_EMAIL, EMAIL_PROVIDER
- `src/api/routes/tasks.py` — emit events, remove old inline .delay()
- `src/api/routes/users.py` — add PATCH /users/me/notification-preference
- `src/models/users.py` — add email_notifications_enabled field
- `pyproject.toml` — add resend
- `.env.example` — add new env vars
- `src/tasks/email_sender.py` — refactored into notifications package
