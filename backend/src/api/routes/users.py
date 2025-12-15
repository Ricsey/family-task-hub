import uuid

from fastapi import APIRouter, HTTPException
from sqlmodel import select

from src.api.deps import SessionDep
from src.models.users import User, UserCreate

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
def read_users(session: SessionDep):
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
