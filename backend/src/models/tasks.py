import uuid
from datetime import date
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

# Just for ty to not show missing import error
if TYPE_CHECKING:
    from src.models.users import User


class TaskCategory(str, Enum):
    Chore = "Chore"
    Shopping = "Shopping"
    Homework = "Homework"
    Other = "Other"


class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"


class TaskBase(SQLModel):
    title: str
    description: str | None = Field(default=None)
    assignee_id: uuid.UUID | None = Field(default=None, foreign_key="user.id")
    category: TaskCategory
    due_date: date
    status: TaskStatus


class Task(TaskBase, table=True):
    id: int = Field(default=None, primary_key=True)
    assignee: Optional["User"] = Relationship(back_populates="tasks")


class TaskPublic(TaskBase):
    id: int


class TaskCreate(TaskBase): ...


class TaskUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    assignee_id: uuid.UUID | None = None
    category: TaskCategory | None = None
    due_date: date | None = None
    status: TaskStatus | None = None