import os

os.environ.setdefault("CLERK_WEBHOOK_SECRET_KEY", "test")
os.environ.setdefault("CLERK_JWT_ISSUER", "https://test.clerk.accounts.dev")
os.environ.setdefault("CLERK_JWKS_URL", "https://test.clerk.accounts.dev/.well-known/jwks.json")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

from datetime import date
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from src.api.deps import get_current_user, get_session
from src.api.routes.tasks import router
from src.main import app
from src.models.tasks import Task, TaskCategory, TaskStatus
from src.models.users import User

TEST_ENGINE = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


def _override_get_session():
    with Session(TEST_ENGINE) as session:
        yield session


app.dependency_overrides[get_session] = _override_get_session


@pytest.fixture(autouse=True)
def _setup_database():
    SQLModel.metadata.create_all(TEST_ENGINE)
    yield
    SQLModel.metadata.drop_all(TEST_ENGINE)


@pytest.fixture(autouse=True)
def _reset_auth_override():
    yield
    app.dependency_overrides.pop(get_current_user, None)


@pytest.fixture
def client():
    return TestClient(app)


def _db_add(obj):
    with Session(TEST_ENGINE) as session:
        session.add(obj)
        session.commit()
        session.refresh(obj)
    return obj


@pytest.fixture
def user_alice():
    return _db_add(
        User(
            email="alice@example.com",
            full_name="Alice",
            clerk_id="clerk_alice",
        )
    )


@pytest.fixture
def user_bob():
    return _db_add(
        User(
            email="bob@example.com",
            full_name="Bob",
            clerk_id="clerk_bob",
        )
    )


@pytest.fixture
def user_charlie():
    return _db_add(
        User(
            email="charlie@example.com",
            full_name="Charlie",
            clerk_id="clerk_charlie",
        )
    )


def test_router_still_has_routes():
    paths = [r.path for r in router.routes]
    assert "/tasks/" in paths
    assert "/tasks/{task_id}" in paths


def test_create_task_emits_event_for_other_user(client, user_alice, user_bob):
    app.dependency_overrides[get_current_user] = lambda: user_alice

    with patch("src.api.routes.tasks.publish_event") as mock_publish:
        response = client.post(
            "/tasks/",
            json={
                "title": "Buy groceries",
                "category": "Shopping",
                "status": "todo",
                "due_date": "2026-08-01",
                "assignee_id": str(user_bob.id),
            },
        )

    assert response.status_code == 201
    mock_publish.assert_called_once()
    args = mock_publish.call_args[0]
    assert args[0] == "task.assignee_changed"
    payload = args[1]
    assert payload["task_id"] == response.json()["id"]
    assert payload["task_title"] == "Buy groceries"
    assert payload["task_category"] == "Shopping"
    assert payload["new_assignee_id"] == str(user_bob.id)
    assert payload["new_assignee_email"] == "bob@example.com"
    assert payload["new_assignee_name"] == "Bob"
    assert payload["previous_assignee_id"] is None
    assert payload["previous_assignee_email"] is None
    assert payload["actor_name"] == "Alice"


def test_create_task_does_not_emit_event_on_self_assignment(client, user_alice):
    app.dependency_overrides[get_current_user] = lambda: user_alice

    with patch("src.api.routes.tasks.publish_event") as mock_publish:
        response = client.post(
            "/tasks/",
            json={
                "title": "My own task",
                "category": "Homework",
                "status": "todo",
                "due_date": "2026-08-01",
                "assignee_id": str(user_alice.id),
            },
        )

    assert response.status_code == 201
    mock_publish.assert_not_called()


def test_task_update_emits_event_on_reassignment(
    client, user_alice, user_bob, user_charlie
):
    app.dependency_overrides[get_current_user] = lambda: user_alice

    task = _db_add(
        Task(
            title="Reassign me",
            category=TaskCategory.Chore,
            status=TaskStatus.TODO,
            due_date=date(2026, 8, 1),
            assignee_id=user_bob.id,
        )
    )

    with patch("src.api.routes.tasks.publish_event") as mock_publish:
        response = client.patch(
            f"/tasks/{task.id}",
            json={"assignee_id": str(user_charlie.id)},
        )

    assert response.status_code == 200
    mock_publish.assert_called_once()
    args = mock_publish.call_args[0]
    assert args[0] == "task.assignee_changed"
    payload = args[1]
    assert payload["task_id"] == task.id
    assert payload["previous_assignee_id"] == str(user_bob.id)
    assert payload["previous_assignee_email"] == "bob@example.com"
    assert payload["new_assignee_id"] == str(user_charlie.id)
    assert payload["new_assignee_email"] == "charlie@example.com"
    assert payload["new_assignee_name"] == "Charlie"
    assert payload["actor_name"] == "Alice"


def test_task_update_emits_event_on_unassignment(client, user_alice, user_bob):
    app.dependency_overrides[get_current_user] = lambda: user_alice

    task = _db_add(
        Task(
            title="Unassign me",
            category=TaskCategory.Other,
            status=TaskStatus.TODO,
            due_date=date(2026, 8, 1),
            assignee_id=user_bob.id,
        )
    )

    with patch("src.api.routes.tasks.publish_event") as mock_publish:
        response = client.patch(
            f"/tasks/{task.id}",
            json={"assignee_id": None},
        )

    assert response.status_code == 200
    mock_publish.assert_called_once()
    args = mock_publish.call_args[0]
    assert args[0] == "task.assignee_changed"
    payload = args[1]
    assert payload["task_id"] == task.id
    assert payload["previous_assignee_id"] == str(user_bob.id)
    assert payload["previous_assignee_email"] == "bob@example.com"
    assert payload["new_assignee_id"] is None
    assert payload["new_assignee_email"] is None
    assert payload["new_assignee_name"] is None
    assert payload["actor_name"] == "Alice"


def test_task_update_does_not_emit_event_if_assignee_unchanged(
    client, user_alice, user_bob
):
    app.dependency_overrides[get_current_user] = lambda: user_alice

    task = _db_add(
        Task(
            title="Original title",
            category=TaskCategory.Chore,
            status=TaskStatus.TODO,
            due_date=date(2026, 8, 1),
            assignee_id=user_bob.id,
        )
    )

    with patch("src.api.routes.tasks.publish_event") as mock_publish:
        response = client.patch(
            f"/tasks/{task.id}",
            json={"title": "New title"},
        )

    assert response.status_code == 200
    assert response.json()["title"] == "New title"
    mock_publish.assert_not_called()


def test_task_update_does_not_emit_event_on_self_reassignment(client, user_alice):
    app.dependency_overrides[get_current_user] = lambda: user_alice

    task = _db_add(
        Task(
            title="Still my task",
            category=TaskCategory.Chore,
            status=TaskStatus.TODO,
            due_date=date(2026, 8, 1),
            assignee_id=user_alice.id,
        )
    )

    with patch("src.api.routes.tasks.publish_event") as mock_publish:
        response = client.patch(
            f"/tasks/{task.id}",
            json={"title": "Still my task, updated"},
        )

    assert response.status_code == 200
    mock_publish.assert_not_called()
