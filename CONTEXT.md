# Family Task Hub

A family task management application where household members assign tasks to each other. The notification subsystem delivers timely, minimal updates when task assignments change.

## Language

**Assignee**:
The family member responsible for completing a task.
_Avoid_: Owner, responsible person

**Actor**:
The user who performed the action (created the task, changed the assignee). Determined by the current authenticated user at the time of the request.
_Avoid_: Assigned by, changed by

**Notification**:
A multi-channel message delivered when a domain event occurs. Email is the first channel; in-app, push, or SMS may follow.
_Avoid_: Email (when referring to the general concept)

**TaskAssigneeChanged**:
A single domain event emitted whenever the assignee of a task is added, changed, or removed. Carries `previous_assignee_id` and `new_assignee_id`, both nullable.
_Avoid_: TaskAssigned, TaskReassigned (these conflate the unified semantics)

**Self-assignment**:
An operation where the Actor and the Assignee are the same user. Never produces a notification.
_Avoid_: No notification needed

**Unassignment**:
Setting a task's assignee to null. The previous assignee is notified that they are no longer responsible.

**Notification Preference**:
A per-user setting (`email_notifications_enabled`) controlling whether the user receives any notifications. Handlers check this before enqueuing delivery. Defaults to enabled.
_Avoid_: Opt-out, unsubscribe (keeps the framing positive — you opt into helpful updates)
