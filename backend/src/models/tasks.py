import uuid
from datetime import date
from enum import Enum
from typing import Optional

from sqlmodel import Field, Relationship, SQLModel

from src.models.users import User, UserPublic


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
    assignee: Optional[User] = Relationship(back_populates="tasks")


class TaskPublic(TaskBase):
    id: int
    assignee: Optional[UserPublic] = None


class TaskCreate(TaskBase): ...


class TaskUpdate(SQLModel):
    title: str | None = None
    description: str | None = None
    assignee_id: uuid.UUID | None = None
    category: TaskCategory | None = None
    due_date: date | None = None
    status: TaskStatus | None = None