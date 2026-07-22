import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from src.api.deps import CurrentUserDep, SessionDep, get_current_user
from src.models.users import User, UserCreate


class NotificationPreferenceUpdate(BaseModel):
    email_notifications_enabled: bool

router = APIRouter(
    prefix="/users", tags=["users"], dependencies=[Depends(get_current_user)]
)


@router.get("/")
def read_users(session: SessionDep, response_model=list[User]):
    users = session.exec(select(User)).all()
    return users


@router.get("/{user_id}")
def read_user(*, user_id: uuid.UUID, session: SessionDep):
    user = session.get(User, user_id)
    return user


@router.post("/", status_code=201)
def create_user(user_in: UserCreate, session: SessionDep):
    # Check if user with the same email already exists
    existing_user = session.exec(
        select(User).where(User.email == user_in.email)
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create new user
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
        hashed_password=user_in.password,  # TODO: Hash the password properly
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: str, session: SessionDep):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return {"ok": True}


@router.get("/me/notification-preference")
def get_notification_preference(current_user: CurrentUserDep):
    return {"email_notifications_enabled": current_user.email_notifications_enabled}


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
