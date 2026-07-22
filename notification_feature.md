---
goal: Add an event-driven email notification system using Redis, Celery, and a pluggable email provider (Resend by default)
version: 1.0
date_created: 2026-02-08
last_updated: 2026-02-08
owner: Family Task Hub Team
status: 'Planned'
tags: feature, notifications, email, celery, redis, event-driven, architecture
---

# Introduction

![Status: Planned](https://img.shields.io/badge/status-Planned-blue)

Implement an event-driven email notification system for Family Task Hub. When a task is created or updated and the assignee is someone other than the logged-in user, the assignee receives a concise email notification. The system uses an **in-process event bus** to decouple task routes from notification logic, **Celery** with a **Redis** broker for reliable async job processing with retries, and an **abstract email provider interface** with a **Resend** default implementation that can be swapped for any other provider (SendGrid, SES, SMTP, or a console logger for testing).

## 1. Requirements & Constraints

- **REQ-001**: When a task is **created** and the `assignee_id` refers to a user other than the currently signed-in user, the assignee must receive an email notification with the task title, category, due date, and who assigned it.
- **REQ-002**: When a task is **updated** and the `assignee_id` changed to a new user who is not the currently signed-in user, the new assignee must receive an email notification informing them of the assignment.
- **REQ-003**: Notifications must be **gentle and minimal** — only the essential info the assignee needs to know. This is not an audit log. No notification is sent if the user assigns a task to themselves.
- **REQ-004**: The email provider must be behind an **abstract interface** (Python Protocol / ABC) so it can be swapped without modifying any business logic. Implementations: `ResendEmailProvider` (production), `ConsoleEmailProvider` (development/testing).
- **REQ-005**: Failed email deliveries must be **retried automatically** with exponential backoff (up to 3 retries).
- **REQ-006**: The system must use an **event-driven architecture** — task routes emit domain events; notification handlers subscribe to those events and enqueue Celery jobs.
- **SEC-001**: The Resend API key must be stored as an environment variable (`RESEND_API_KEY`), never hardcoded. The `FROM_EMAIL` address must also be configurable via environment variable.
- **CON-001**: The backend currently uses `uv` as the package manager with `pyproject.toml`. All new dependencies must be added via `uv add`.
- **CON-002**: The project runs in Docker Compose. Redis and the Celery worker must be added as new services.
- **CON-003**: The existing task routes in `src/api/routes/tasks.py` must remain clean — event emission should be minimal (1-2 lines per route). All notification logic lives in separate modules.
- **CON-004**: Celery tasks must create their own database sessions (not reuse the request session) since they run in a separate worker process.
- **GUD-001**: Follow the existing project structure conventions: domain modules under `src/`, config in `src/core/config.py`, models in `src/models/`.
- **GUD-002**: Use Python type hints and Pydantic models for all event payloads and email data.
- **PAT-001**: Use the Strategy pattern for the email provider — a `Protocol` defining `send_email()`, with concrete implementations injected via a factory function controlled by an environment variable.
- **PAT-002**: Use the Observer pattern for the event bus — publishers emit events without knowing who subscribes; handlers register themselves at module import time.

## 2. Implementation Steps

### Phase 1: Infrastructure — Redis & Celery Setup

- GOAL-001: Add Redis as a Docker Compose service and configure Celery with Redis as the broker inside the backend.

| Task     | Description | Completed | Date |
| -------- | ----------- | --------- | ---- |
| TASK-001 | Add `redis` dependency to `pyproject.toml` by running `uv add celery[redis]` from the `backend/` directory. This installs both Celery and the Redis transport. Also run `uv add resend` for the default email provider. | | |
| TASK-002 | Add a `redis` service to `docker-compose.yml` after the `db` service. Configuration: image `redis:7-alpine`, expose port `6379`, add a healthcheck using `redis-cli ping`, add a named volume `redis-data` for persistence. Add `redis` to the `backend` service's `depends_on` with `condition: service_healthy`. | | |
| TASK-003 | Add a `celery-worker` service to `docker-compose.yml`. It should use the same `build` context as `backend`, set `command` to `uv run celery -A src.celery_app worker --loglevel=info`, share the same `env_file: ".env"` and environment variables as `backend`, and `depends_on` both `redis` and `db` (both with `condition: service_healthy`). | | |
| TASK-004 | Optionally add a `flower` service to `docker-compose.yml` for monitoring. Image: same backend build, command: `uv run celery -A src.celery_app flower --port=5555`, expose port `5555:5555`, depends on `redis`. | | |
| TASK-005 | Add two new environment variables to `src/core/config.py` in the `Settings` class: `REDIS_URL: str = Field(default="redis://redis:6379/0")` and `RESEND_API_KEY: str = Field(default="")` and `FROM_EMAIL: str = Field(default="noreply@familytaskhub.com")` and `EMAIL_PROVIDER: str = Field(default="console")`. The `EMAIL_PROVIDER` field controls which provider implementation is used (`"resend"` or `"console"`). Default to `"console"` so development works without a Resend key. | | |
| TASK-006 | Create `src/celery_app.py` — the Celery application instance. Import `Celery` from `celery`. Create the app: `celery_app = Celery("family_task_hub")`. Configure it with `celery_app.conf.broker_url = settings.REDIS_URL` and `celery_app.conf.result_backend = settings.REDIS_URL`. Set `celery_app.conf.task_serializer = "json"` and `celery_app.conf.accept_content = ["json"]`. Set `celery_app.autodiscover_tasks(["src.notifications"])` so it auto-discovers task modules in the notifications package. | | |

### Phase 2: Email Provider Abstraction Layer

- GOAL-002: Create a pluggable email provider interface with a Resend implementation and a Console implementation for development/testing.

| Task     | Description | Completed | Date |
| -------- | ----------- | --------- | ---- |
| TASK-007 | Create the directory `src/notifications/` with an `__init__.py` file. This package will contain all notification-related code: email providers, event handlers, Celery tasks, and the event bus. | | |
| TASK-008 | Create `src/notifications/email/` directory with `__init__.py`. This sub-package holds the provider abstraction and implementations. | | |
| TASK-009 | Create `src/notifications/email/provider.py`. Define a `dataclass` named `EmailMessage` with fields: `to: str`, `subject: str`, `html_body: str`. Define a `Protocol` class named `EmailProvider` with a single method: `def send(self, message: EmailMessage) -> bool`. This is the contract all providers must implement. | | |
| TASK-010 | Create `src/notifications/email/resend_provider.py`. Define class `ResendEmailProvider` that implements `EmailProvider`. In `__init__`, import `resend` and set `resend.api_key = api_key` (passed as constructor arg). Implement `send(self, message: EmailMessage) -> bool` that calls `resend.Emails.send({"from": self.from_email, "to": message.to, "subject": message.subject, "html": message.html_body})` inside a try/except block. Return `True` on success, raise on failure (so Celery can retry). Constructor signature: `__init__(self, api_key: str, from_email: str)`. | | |
| TASK-011 | Create `src/notifications/email/console_provider.py`. Define class `ConsoleEmailProvider` that implements `EmailProvider`. The `send` method prints the email details to stdout in a readable format (to, subject, body preview) prefixed with `[EMAIL-CONSOLE]` and returns `True`. This is used in development and testing. Constructor takes no arguments. | | |
| TASK-012 | Create `src/notifications/email/factory.py`. Define a function `get_email_provider() -> EmailProvider` that reads `settings.EMAIL_PROVIDER`. If `"resend"`, return `ResendEmailProvider(api_key=settings.RESEND_API_KEY, from_email=settings.FROM_EMAIL)`. If `"console"`, return `ConsoleEmailProvider()`. Raise `ValueError` for unknown providers. This is the single point where the provider is resolved. | | |

### Phase 3: Event Bus

- GOAL-003: Create a lightweight synchronous in-process event bus that decouples task route handlers from notification logic.

| Task     | Description | Completed | Date |
| -------- | ----------- | --------- | ---- |
| TASK-013 | Create `src/notifications/events/` directory with `__init__.py`. | | |
| TASK-014 | Create `src/notifications/events/bus.py`. Implement a simple event bus class `EventBus` with: (1) A class-level dict `_subscribers: dict[str, list[Callable]]` mapping event names to handler lists. (2) A class method `subscribe(event_name: str, handler: Callable)` that appends the handler. (3) A class method `emit(event_name: str, payload: dict)` that iterates over all subscribers for that event and calls them with the payload. Wrap each handler call in a try/except to ensure one failing handler doesn't block others (log the error). (4) Create a module-level singleton instance: `event_bus = EventBus()`. | | |
| TASK-015 | Create `src/notifications/events/task_events.py`. Define Pydantic models for event payloads: (1) `TaskAssignedEvent` with fields: `task_id: int`, `task_title: str`, `task_category: str`, `task_due_date: str`, `assignee_email: str`, `assignee_name: str | None`, `assigned_by_name: str | None`. (2) `TaskReassignedEvent` with the same fields plus `previous_assignee_id: str | None`. These are the data contracts for events. | | |

### Phase 4: Celery Tasks & Email Templates

- GOAL-004: Create the Celery tasks that compose and send notification emails, and simple HTML email templates.

| Task     | Description | Completed | Date |
| -------- | ----------- | --------- | ---- |
| TASK-016 | Create `src/notifications/templates.py`. Define two functions: (1) `render_task_assigned_email(task_title: str, task_category: str, task_due_date: str, assigned_by: str | None) -> tuple[str, str]` that returns `(subject, html_body)`. Subject: `"You've been assigned a new task: {task_title}"`. Body: a clean, minimal HTML email with: a greeting, a sentence saying who assigned the task (or "A new task has been assigned to you" if `assigned_by` is None), the task title, category, and due date in a simple styled card. (2) `render_task_reassigned_email(task_title: str, task_category: str, task_due_date: str, assigned_by: str | None) -> tuple[str, str]` that returns `(subject, html_body)`. Subject: `"You've been assigned to a task: {task_title}"`. Body: similar minimal HTML informing the user they've been assigned to an existing task. Keep emails short and friendly — this is a family app. | | |
| TASK-017 | Create `src/notifications/celery_tasks.py`. Import `celery_app` from `src.celery_app` and the email factory and templates. Define: (1) `@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)` named `send_task_assigned_email(self, assignee_email: str, assignee_name: str | None, task_title: str, task_category: str, task_due_date: str, assigned_by: str | None)`. Inside: call the template renderer to get subject + html, create an `EmailMessage`, get the provider via `get_email_provider()`, call `provider.send(message)`. Wrap in try/except and call `self.retry(exc=exc)` on failure. (2) `@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)` named `send_task_reassigned_email(self, ...)` with the same pattern but using the reassigned template. Both tasks accept only serializable primitive arguments (strings, ints) — no ORM objects. | | |

### Phase 5: Event Handlers — Gluing Events to Celery Tasks

- GOAL-005: Create event handlers that subscribe to task domain events and enqueue the appropriate Celery jobs.

| Task     | Description | Completed | Date |
| -------- | ----------- | --------- | ---- |
| TASK-018 | Create `src/notifications/handlers.py`. Import `event_bus` from `src.notifications.events.bus` and the Celery tasks from `src.notifications.celery_tasks`. Define: (1) `def handle_task_assigned(payload: dict)` — extracts fields from the payload and calls `send_task_assigned_email.delay(assignee_email=..., assignee_name=..., task_title=..., task_category=..., task_due_date=..., assigned_by=...)`. (2) `def handle_task_reassigned(payload: dict)` — same pattern but calls `send_task_reassigned_email.delay(...)`. (3) At module level, register both: `event_bus.subscribe("task.assigned", handle_task_assigned)` and `event_bus.subscribe("task.reassigned", handle_task_reassigned)`. | | |
| TASK-019 | In `src/notifications/__init__.py`, import `src.notifications.handlers` to ensure the event subscriptions are registered when the notifications package is loaded. Add a comment explaining this side-effect import. | | |
| TASK-020 | In `src/main.py`, add `import src.notifications` at the top-level imports (after existing imports). This ensures the notification handlers are registered when the FastAPI app starts. Add a comment: `# Register notification event handlers`. | | |

### Phase 6: Emit Events from Task Routes

- GOAL-006: Modify the task creation and update routes to emit domain events with minimal code changes.

| Task     | Description | Completed | Date |
| -------- | ----------- | --------- | ---- |
| TASK-021 | In `src/api/routes/tasks.py`, add imports at the top: `from src.notifications.events.bus import event_bus` and `from src.api.deps import CurrentUserDep`. | | |
| TASK-022 | Modify the `create_task` route signature to accept `current_user: CurrentUserDep` as a parameter (the dependency is already applied at the router level via `dependencies=[Depends(get_current_user)]`, but we need the actual user object in the route body now). After the task is created and the eager-loaded task is fetched (after `task = session.exec(statement).first()`), add the event emission block: `if task.assignee_id and str(task.assignee_id) != str(current_user.id): event_bus.emit("task.assigned", {"task_id": task.id, "task_title": task.title, "task_category": task.category.value, "task_due_date": str(task.due_date), "assignee_email": task.assignee.email, "assignee_name": task.assignee.full_name, "assigned_by_name": current_user.full_name})`. This is 3 lines added to the route. | | |
| TASK-023 | Modify the `update_task` route signature to accept `current_user: CurrentUserDep`. Before applying the update, capture the old assignee: `old_assignee_id = db_task.assignee_id`. After the update is committed and the eager-loaded task is re-fetched, add the event emission block: `if task_in.assignee_id is not None and str(db_task.assignee_id) != str(old_assignee_id) and str(db_task.assignee_id) != str(current_user.id): event_bus.emit("task.reassigned", {"task_id": db_task.id, "task_title": db_task.title, "task_category": db_task.category.value, "task_due_date": str(db_task.due_date), "assignee_email": db_task.assignee.email, "assignee_name": db_task.assignee.full_name, "assigned_by_name": current_user.full_name, "previous_assignee_id": str(old_assignee_id) if old_assignee_id else None})`. | | |

### Phase 7: Docker Compose & Environment Finalization

- GOAL-007: Ensure all infrastructure services, environment variables, and worker entrypoints are properly configured for both local development and Docker Compose.

| Task     | Description | Completed | Date |
| -------- | ----------- | --------- | ---- |
| TASK-024 | Add `REDIS_URL=redis://redis:6379/0` to the project's `.env` file (or `.env.example` if one exists). Add `RESEND_API_KEY=` (empty for development, user fills in their key). Add `FROM_EMAIL=noreply@familytaskhub.com`. Add `EMAIL_PROVIDER=console` (default to console for safe development). | | |
| TASK-025 | Update the `backend` service in `docker-compose.yml` to include `REDIS_URL`, `RESEND_API_KEY`, `FROM_EMAIL`, and `EMAIL_PROVIDER` in the `environment` block (reading from `.env` via `${VARIABLE}` syntax). | | |
| TASK-026 | Add `redis-data` to the `volumes` section at the bottom of `docker-compose.yml`. | | |
| TASK-027 | For local development (outside Docker), add a dev task to `.vscode/tasks.json`: a `celery-worker: dev` task with command `uv run celery -A src.celery_app worker --loglevel=info` with `cwd` set to `${workspaceFolder}/backend`. Also add a `flower: dev` task with command `uv run celery -A src.celery_app flower --port=5555`. Update the `dev: all` compound task to include `celery-worker: dev` in its `dependsOn` array. | | |

## 3. Alternatives

- **ALT-001**: **FastAPI BackgroundTasks instead of Celery** — Rejected because `BackgroundTasks` provides no retry mechanism, no persistence, and no monitoring. A failed email API call would be silently lost. For a learning project, Celery teaches production-grade async job patterns.
- **ALT-002**: **RabbitMQ instead of Redis as Celery broker** — Rejected for now. Redis is lighter (~5MB RAM vs ~100MB), simpler to configure, and sufficient for the current scale. Celery makes the broker swappable via config, so migrating to RabbitMQ later is a one-line change.
- **ALT-003**: **Direct email sending in the route handler** (synchronous) — Rejected because it blocks the HTTP response for the duration of the email API call (200-500ms), degrades user experience, and provides no retry on failure.
- **ALT-004**: **Using a third-party event library (blinker, pyee)** instead of a custom event bus — Considered but rejected. The event bus is ~30 lines of code with no external dependency. For a learning project, building it from scratch teaches the Observer pattern. Can be swapped for `blinker` later if needed.
- **ALT-005**: **Storing notifications in a database table** — Not in scope for v1. The current requirement is email-only. A `Notification` model can be added later if in-app notifications are needed, subscribing to the same events.

## 4. Dependencies

- **DEP-001**: `celery[redis]` — Distributed task queue with Redis transport. Added to `pyproject.toml` via `uv add "celery[redis]"`.
- **DEP-002**: `resend` — Transactional email API SDK. Added to `pyproject.toml` via `uv add resend`.
- **DEP-003**: `redis:7-alpine` Docker image — Lightweight Redis server for Celery broker, added to `docker-compose.yml`.
- **DEP-004**: Existing `src/core/config.py` `Settings` class — Extended with `REDIS_URL`, `RESEND_API_KEY`, `FROM_EMAIL`, `EMAIL_PROVIDER` fields.
- **DEP-005**: Existing `src/api/deps.py` `CurrentUserDep` — Already defined, used in task routes to identify the logged-in user.
- **DEP-006**: Existing `src/models/tasks.py` `Task` model with `assignee` relationship — Used to resolve assignee email/name after task creation/update.

## 5. Files

### New Files
- **FILE-001**: `backend/src/celery_app.py` — Celery application instance and configuration.
- **FILE-002**: `backend/src/notifications/__init__.py` — Package init with side-effect import to register event handlers.
- **FILE-003**: `backend/src/notifications/events/__init__.py` — Events sub-package init.
- **FILE-004**: `backend/src/notifications/events/bus.py` — In-process event bus (Observer pattern singleton).
- **FILE-005**: `backend/src/notifications/events/task_events.py` — Pydantic models for `TaskAssignedEvent` and `TaskReassignedEvent` payloads.
- **FILE-006**: `backend/src/notifications/email/__init__.py` — Email sub-package init.
- **FILE-007**: `backend/src/notifications/email/provider.py` — `EmailMessage` dataclass and `EmailProvider` Protocol.
- **FILE-008**: `backend/src/notifications/email/resend_provider.py` — Resend implementation of `EmailProvider`.
- **FILE-009**: `backend/src/notifications/email/console_provider.py` — Console/stdout implementation for dev/testing.
- **FILE-010**: `backend/src/notifications/email/factory.py` — Factory function that returns the correct provider based on `EMAIL_PROVIDER` setting.
- **FILE-011**: `backend/src/notifications/templates.py` — HTML email template rendering functions.
- **FILE-012**: `backend/src/notifications/celery_tasks.py` — Celery task definitions for sending emails with retry logic.
- **FILE-013**: `backend/src/notifications/handlers.py` — Event handlers that subscribe to task events and enqueue Celery jobs.

### Modified Files
- **FILE-014**: `backend/pyproject.toml` — Add `celery[redis]` and `resend` dependencies.
- **FILE-015**: `backend/src/core/config.py` — Add `REDIS_URL`, `RESEND_API_KEY`, `FROM_EMAIL`, `EMAIL_PROVIDER` settings.
- **FILE-016**: `backend/src/main.py` — Add `import src.notifications` to register event handlers at startup.
- **FILE-017**: `backend/src/api/routes/tasks.py` — Import event bus and `CurrentUserDep`. Emit `task.assigned` event in `create_task`. Emit `task.reassigned` event in `update_task`.
- **FILE-018**: `docker-compose.yml` — Add `redis`, `celery-worker`, and `flower` services. Add `redis-data` volume. Update `backend` service `depends_on` and environment variables.
- **FILE-019**: `.vscode/tasks.json` — Add `celery-worker: dev` and `flower: dev` tasks. Update `dev: all` compound task.

## 6. Testing

- **TEST-001**: **Unit — ConsoleEmailProvider**: Create a test that instantiates `ConsoleEmailProvider`, calls `send()` with a sample `EmailMessage`, and asserts it returns `True`. Verify the output is printed to stdout using `capsys`.
- **TEST-002**: **Unit — Email factory**: Test `get_email_provider()` returns `ConsoleEmailProvider` when `EMAIL_PROVIDER=console` and `ResendEmailProvider` when `EMAIL_PROVIDER=resend`. Test it raises `ValueError` for unknown values.
- **TEST-003**: **Unit — Event bus**: Test that `event_bus.subscribe()` registers a handler, `event_bus.emit()` calls all registered handlers with the correct payload, and a failing handler does not prevent other handlers from being called.
- **TEST-004**: **Unit — Email templates**: Test `render_task_assigned_email()` and `render_task_reassigned_email()` return tuples of `(subject, html_body)` where subject contains the task title and html_body contains the task details.
- **TEST-005**: **Integration — Task creation event emission**: Use a test that patches `event_bus.emit`, creates a task with an assignee different from the current user via the API, and asserts `event_bus.emit` was called with `"task.assigned"` and the correct payload.
- **TEST-006**: **Integration — Task update event emission**: Patch `event_bus.emit`, update a task's assignee to a different user, and assert `event_bus.emit` was called with `"task.reassigned"` and the correct payload.
- **TEST-007**: **Integration — No event when self-assigning**: Create a task where `assignee_id` equals the current user's ID. Assert `event_bus.emit` was NOT called.
- **TEST-008**: **Manual — End-to-end with console provider**: Set `EMAIL_PROVIDER=console`, start the Celery worker, create a task assigned to another user via the UI, and verify the email details appear in the Celery worker's stdout logs.
- **TEST-009**: **Manual — End-to-end with Resend**: Set `EMAIL_PROVIDER=resend` with a valid `RESEND_API_KEY`, create a task assigned to another user, and verify the email arrives in the assignee's inbox.
- **TEST-010**: **Manual — Celery retry**: Temporarily set an invalid `RESEND_API_KEY`, create a task, and verify in Flower dashboard that the task retries up to 3 times before failing permanently.
- **TEST-011**: **Manual — Flower dashboard**: Access `http://localhost:5555`, verify you can see queued, active, succeeded, and failed tasks.

## 7. Risks & Assumptions

- **RISK-001**: **Celery worker not discovering tasks** — If `autodiscover_tasks` path is wrong, no tasks will be found. Mitigation: The path `["src.notifications"]` matches the module where `celery_tasks.py` lives. Verify with `celery -A src.celery_app inspect registered` after starting the worker.
- **RISK-002**: **Redis connection failure** — If Redis is down, Celery cannot enqueue jobs and the `event_bus.emit` handler will fail silently (caught by the try/except in the event bus). The API response is not affected, but the notification is lost. Mitigation: Redis healthcheck in Docker Compose ensures it's ready before the backend starts. For production, consider a dead-letter mechanism.
- **RISK-003**: **Resend API rate limits** — Resend free tier allows 3,000 emails/month and 100/day. For a family app this is more than sufficient, but if the app is used in testing with many task operations, the limit could be hit. Mitigation: Use `EMAIL_PROVIDER=console` during development.
- **RISK-004**: **Circular import between `celery_app.py` and `src.core.config`** — Since `celery_app.py` is at `src/celery_app.py` and imports from `src.core.config`, this should be safe as long as `celery_app` doesn't import models or routes. Mitigation: Keep `celery_app.py` minimal — only Celery instance and config.
- **RISK-005**: **Event bus handler failure blocks response** — The event bus calls handlers synchronously in the request thread. If a handler takes too long (e.g., Redis is slow to enqueue), it could add latency to the API response. Mitigation: The handler only calls `.delay()` which is a Redis `LPUSH` (sub-millisecond). The actual email sending happens in the worker process.
- **ASSUMPTION-001**: The `Task.assignee` relationship is always loaded (via `selectinload`) before event emission in both `create_task` and `update_task` routes. This is verified by reading the current code — both routes eagerly load the assignee.
- **ASSUMPTION-002**: The `CurrentUserDep` dependency can be added as a route parameter without breaking existing functionality. The `get_current_user` dependency is already applied at the router level; adding it as a parameter simply makes the return value available in the route body.
- **ASSUMPTION-003**: The Celery worker has access to the same environment variables as the backend (ensured by sharing `env_file` in Docker Compose).
- **ASSUMPTION-004**: Users have valid email addresses stored in the `User.email` field (enforced by `EmailStr` Pydantic validator in the model).

## 8. Related Specifications / Further Reading

- [Celery Documentation — Getting Started](https://docs.celeryq.dev/en/stable/getting-started/introduction.html)
- [Celery — Using Redis as Broker](https://docs.celeryq.dev/en/stable/getting-started/backends-and-brokers/redis.html)
- [Resend Python SDK](https://resend.com/docs/sdks/python)
- [Flower — Celery Monitoring](https://flower.readthedocs.io/en/latest/)
- [FastAPI — Background Tasks vs Celery](https://fastapi.tiangolo.com/tutorial/background-tasks/)
- [Python Protocol (PEP 544) — Structural Subtyping](https://peps.python.org/pep-0544/)