import uuid
from typing import TYPE_CHECKING

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

# Just for ty to not show missing import error
if TYPE_CHECKING:
    from src.models.tasks import Task


class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)
    is_active: bool = True
    is_superuser: bool = False


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    tasks: list["Task"] = Relationship(back_populates="assignee")


class UserPublic(UserBase):
    id: uuid.UUID


class UserCreate(UserBase):
    password: str
