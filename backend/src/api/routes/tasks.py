from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import selectinload
from sqlmodel import select

from src.api.deps import CurrentUserDep, SessionDep, get_current_user
from src.models.tasks import Task, TaskCategory, TaskCreate, TaskPublic, TaskUpdate
from src.notifications.events import TaskAssigneeChangedEvent
from src.notifications.stream import publish_event

router = APIRouter(
    prefix="/tasks", tags=["task"], dependencies=[Depends(get_current_user)]
)


@router.get("/", response_model=list[TaskPublic])
def read_tasks(session: SessionDep):
    statement = select(Task).options(selectinload(Task.assignee))  # type: ignore
    tasks = session.exec(statement).all()
    return tasks


@router.get("/category")
def read_categories(session: SessionDep):
    return [c.value for c in TaskCategory]


@router.get("/{task_id}", response_model=TaskPublic)
def read_task(*, task_id: int, session: SessionDep):
    statement = (
        select(Task).options(selectinload(Task.assignee)).where(Task.id == task_id)  # type: ignore
    )
    task = session.exec(statement).first()  # Add eager loading
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", status_code=201, response_model=TaskPublic)
def create_task(task_in: TaskCreate, session: SessionDep, current_user: CurrentUserDep):
    task = Task.model_validate(task_in)
    session.add(task)
    session.commit()
    session.refresh(task)

    statement = (
        select(Task).options(selectinload(Task.assignee)).where(Task.id == task.id)  # type: ignore
    )
    task = session.exec(statement).first()

    if task.assignee_id:
        if str(task.assignee_id) != str(current_user.id):
            event = TaskAssigneeChangedEvent(
                task_id=task.id,
                task_title=task.title,
                task_category=task.category.value,
                task_due_date=str(task.due_date),
                previous_assignee_id=None,
                previous_assignee_email=None,
                new_assignee_id=str(task.assignee_id),
                new_assignee_email=task.assignee.email if task.assignee else None,
                new_assignee_name=task.assignee.full_name if task.assignee else None,
                actor_id=str(current_user.id),
                actor_name=current_user.full_name or current_user.email,
            )
            publish_event("task.assignee_changed", event.model_dump())

    return task


@router.patch("/{task_id}", response_model=TaskPublic)
def update_task(
    *,
    task_id: int,
    task_in: TaskUpdate,
    session: SessionDep,
    current_user: CurrentUserDep,
):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    old_assignee_id = str(db_task.assignee_id) if db_task.assignee_id else None
    old_assignee_email = db_task.assignee.email if db_task.assignee else None

    update_data = task_in.model_dump(exclude_unset=True)
    db_task.sqlmodel_update(update_data)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    statement = (
        select(Task).options(selectinload(Task.assignee)).where(Task.id == task_id)
    )
    db_task = session.exec(statement).first()

    new_assignee_id = str(db_task.assignee_id) if db_task.assignee_id else None
    new_assignee_email = db_task.assignee.email if db_task.assignee else None
    new_assignee_name = db_task.assignee.full_name if db_task.assignee else None

    if old_assignee_id != new_assignee_id:
        # if new_assignee_id and new_assignee_id != str(current_user.id):
        if new_assignee_id:
            event = TaskAssigneeChangedEvent(
                task_id=task_id,
                task_title=db_task.title,
                task_category=db_task.category.value,
                task_due_date=str(db_task.due_date),
                previous_assignee_id=old_assignee_id,
                previous_assignee_email=old_assignee_email,
                new_assignee_id=new_assignee_id,
                new_assignee_email=new_assignee_email,
                new_assignee_name=new_assignee_name,
                actor_id=str(current_user.id),
                actor_name=current_user.full_name or current_user.email,
            )
            publish_event("task.assignee_changed", event.model_dump())
        # elif old_assignee_id and old_assignee_id != str(current_user.id):
        elif old_assignee_id:
            event = TaskAssigneeChangedEvent(
                task_id=task_id,
                task_title=db_task.title,
                task_category=db_task.category.value,
                task_due_date=str(db_task.due_date),
                previous_assignee_id=old_assignee_id,
                previous_assignee_email=old_assignee_email,
                new_assignee_id=None,
                new_assignee_email=None,
                new_assignee_name=None,
                actor_id=str(current_user.id),
                actor_name=current_user.full_name or current_user.email,
            )
            publish_event("task.assignee_changed", event.model_dump())

    return db_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(*, task_id: int, session: SessionDep):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
