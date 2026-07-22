# Notification Subsystem

Event-driven notification system that delivers email updates when task assignments change. Uses Redis Streams for event dispatch, Celery for async delivery, and a pluggable email provider interface.

## Architecture

```
Route handler → redis.xadd("task_events", {type, payload})
                       │
                       ▼
            Event Consumer (Docker service)
                       │
              ┌────────┴────────┐
              │                 │
     handle assignee      handle unassignee
              │                 │
     celery send_email    celery send_email
```

Routes push events to a Redis Stream. The event consumer (`consumer.py`) reads from the stream and dispatches to handlers. Handlers check the recipient's notification preference, then enqueue Celery tasks for email delivery.

## Package Structure

```
src/notifications/
├── __init__.py
├── stream.py          # Redis client and publish_event()
├── events.py          # TaskAssigneeChangedEvent (Pydantic model)
├── consumer.py        # Long-running XREADGROUP event consumer
├── handlers.py        # handle_task_assignee_changed()
├── celery_tasks.py    # send_notification_email task (3 retries, 10s delay)
├── templates.py       # HTML email templates
└── email/
    ├── __init__.py
    ├── _protocol.py   # EmailProvider ABC
    ├── _console.py    # ConsoleEmailProvider (dev)
    ├── _resend.py     # ResendEmailProvider (prod)
    └── _factory.py    # get_email_provider() — reads EMAIL_PROVIDER setting
```

## Event Flow

### 1. Routes emit events

Routes in `src/api/routes/tasks.py` construct a `TaskAssigneeChangedEvent` and call `publish_event("task.assignee_changed", event.model_dump())`.

**`create_task`**: Emits when a new task is created with an assignee other than the actor.

**`update_task`**: Captures the old assignee before the update. After the update, compares old and new. Emits on:
- Reassignment (A → B): both assignees receive separate notifications
- Unassignment (A → null): previous assignee notified

**Self-assignments** (actor == new assignee) are suppressed at route level — no event published.

### 2. publish_event writes to Redis Stream

`publish_event()` in `stream.py` writes to `task_events` stream with `maxlen=10000`. Redis connection failures are caught and logged — notifications are fire-and-forget.

### 3. Event consumer dispatches to handlers

`consumer.py` runs as a long-lived process (Docker service). Uses `XREADGROUP` with consumer group `notification-consumers`. Each instance gets a unique consumer name (`hostname-PID`). On startup, creates the consumer group if it doesn't exist (handles `BUSYGROUP` gracefully).

For each event, it decodes the `type` field and dispatches to the matching handler. Currently only `task.assignee_changed` is handled. Unknown types are logged as warnings.

### 4. Handler checks preference and enqueues

`handle_task_assignee_changed()` in `handlers.py`:
- Checks if new assignee differs from previous and is not the actor → renders assigned email, calls `send_notification_email.delay()`
- Checks if previous assignee differs from new and is not the actor → renders unassigned email, calls `send_notification_email.delay()`
- Before each `.delay()`, calls `_user_has_email_enabled()` which queries the DB for `email_notifications_enabled`. Users with preferences disabled are skipped.

### 5. Celery task sends the email

`send_notification_email` in `celery_tasks.py`:
- Gets the email provider via `get_email_provider()`
- Calls `provider.send_email()` synchronously
- On failure, retries up to 3 times with 10-second exponential backoff

## Runtime Services

| Service | docker-compose entry | Purpose |
|---|---|---|
| `redis` | `redis:7-alpine` | Stream storage, Celery broker, result backend |
| `event-consumer` | `uv run python -m src.notifications.consumer` | Reads stream, dispatches to handlers |
| `celery-worker` | `uv run celery -A src.core.celery worker` | Processes async email tasks |

The `backend` service only publishes to the stream. It does not consume. This keeps request handling fast and decoupled from notification logic.

## Email Providers

The `EmailProvider` ABC (`_protocol.py`) defines a single method:

```python
class EmailProvider(ABC):
    @abstractmethod
    def send_email(self, to: str, subject: str, body: str) -> None:
        ...
```

### ConsoleEmailProvider (`_console.py`)
Logs the email content. Used when `EMAIL_PROVIDER=console` (default).

### ResendEmailProvider (`_resend.py`)
Sends via the [Resend](https://resend.com) API. Used when `EMAIL_PROVIDER=resend`. Requires `RESEND_API_KEY` set.

### Adding a New Provider

1. Create a class implementing `EmailProvider` in `src/notifications/email/`
2. Add a branch in `get_email_provider()` in `_factory.py`

```python
def get_email_provider() -> EmailProvider:
    if settings.EMAIL_PROVIDER == "resend":
        from src.notifications.email._resend import ResendEmailProvider
        return ResendEmailProvider()
    if settings.EMAIL_PROVIDER == "sendgrid":
        from src.notifications.email._sendgrid import SendgridEmailProvider
        return SendgridEmailProvider()
    # ... falls back to console
```

3. Add any new config vars to `src/core/config.py` and `.env.example`

## Adding a New Event Type

1. Define the event model in `events.py`
2. Add a handler in `handlers.py`
3. Register the handler in `consumer.py`:

```python
if event_type == "task.assignee_changed":
    handle_task_assignee_changed(payload)
elif event_type == "my.new_event":
    handle_my_new_event(payload)
```

4. Call `publish_event("my.new_event", event.model_dump())` from the route

## Notification Rules Reference

| Scenario | New Assignee | Previous Assignee | Actor |
|---|---|---|---|
| Assignment (null → B) | Notified | — | Suppressed |
| Reassignment (A → B) | Notified | Notified ("unassigned") | Suppressed |
| Unassignment (A → null) | — | Notified | Suppressed |
| Self-assignment (A assigns to A) | Suppressed (route-level) | — | — |

Recipients only receive notifications if `email_notifications_enabled` is `true`.

## User Preference API

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/me/notification-preference` | Returns `{"email_notifications_enabled": true/false}` |
| `PATCH` | `/users/me/notification-preference` | Accepts `{"email_notifications_enabled": bool}`, updates current user |

## Configuration

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | (required) | Redis connection URL. Used for streams and Celery broker |
| `EMAIL_PROVIDER` | `console` | `console` or `resend` |
| `FROM_EMAIL` | `noreply@familytaskhub.com` | Sender address |
| `RESEND_API_KEY` | `""` | Required when `EMAIL_PROVIDER=resend` |

## Testing

Tests live in `backend/tests/notifications/`. Run from the backend directory:

```bash
uv run pytest tests/notifications/ -v
```

### Test Files

| File | Covers |
|---|---|
| `test_stream.py` | Event model validation, `publish_event` calls `xadd` |
| `test_handlers.py` | Handler dispatches `.delay()` for assignment, unassignment, reassignment; skips when preferences disabled |
| `test_celery_tasks.py` | Task calls `provider.send_email()` |
| `test_templates.py` | HTML templates include task fields |
| `test_routes_integration.py` | Routes emit (or suppress) events on create/update |
| `test_user_preference_api.py` | Preference PATCH route exists |
| `email/test_email_provider.py` | Provider implementations, factory logic |
