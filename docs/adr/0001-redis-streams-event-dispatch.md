# 0001: Redis Streams for event dispatch

The notification subsystem uses **Redis Streams** as the event backbone rather than an in-process event bus. Routes push events to a Redis stream via `XADD`; a dedicated event-consumer service reads from the stream via `XREADGROUP` and dispatches to handlers. Handlers enqueue Celery tasks for actual email delivery.

## Context

The original feature doc proposed a synchronous in-process EventBus (Observer pattern) where route handlers emit events that synchronously iterate over registered handlers. Those handlers then call `celery_task.delay()` to enqueue email work. During grilling, we identified that:

- The design should scale to many users — synchronous handler dispatch, even if fast, couples event publication to the request lifecycle.
- We want **event replay** for debugging and observability — the in-process bus has no persistence.
- The route handler should be maximally decoupled from notification logic — a single `XADD` call, not even a handler iteration.

## Decision

Publish events to Redis Streams directly from route handlers. A separate event-consumer service (Docker Compose) reads from the stream and dispatches to the appropriate Celery tasks.

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

- The stream acts as both the **dispatch mechanism** and the **event log** for replay.
- The existing `src/core/celery.py` and `src/tasks/email_sender.py` are refactored (absorbed, not replaced).
- No in-process EventBus class is created.

## Considered Options

- **In-process EventBus** (original design) — simpler code but no persistence, synchronous dispatch, no replay. Rejected because it couples emission to the request and provides no event history.
- **Celery `send_task` directly from routes** — removes the EventBus but still goes through Celery's broker protocol (Redis list), which doesn't support consumer groups or event replay as naturally as Streams. Rejected in favour of Streams for the explicit replay capability.
- **Database event log table** — `EventLog` table written to after each event. Keeps Celery `.delay()` for dispatch. Rejected because it adds database writes to every event and doesn't provide a natural consumption mechanism (would need polling).

## Consequences

- The event-consumer service is a new moving part in Docker Compose.
- Redis Streams consumer groups allow multiple consumer instances to coordinate — horizontal scaling is built in.
- Streams consume Redis memory; a maxlen policy is needed to prevent unbounded growth.
