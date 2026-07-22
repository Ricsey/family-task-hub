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
    actor_id: str
    actor_name: str
