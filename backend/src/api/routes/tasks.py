from sqlalchemy.orm import selectinload
from fastapi import APIRouter, HTTPException, Response, status
from sqlmodel import select

from src.api.deps import SessionDep
from src.models.tasks import Task, TaskCategory, TaskCreate, TaskUpdate, TaskPublic

router = APIRouter(prefix="/tasks", tags=["task"])


@router.get("/", response_model=list[TaskPublic])
def read_tasks(session: SessionDep):
    statement = select(Task).options(selectinload(Task.assignee)) #type: ignore
    tasks = session.exec(statement).all()
    return tasks


@router.get("/category")
def read_categories(session: SessionDep):
    return [c.value for c in TaskCategory]


@router.get("/{task_id}", response_model=TaskPublic)
def read_task(*, task_id: int, session: SessionDep):
    statement = select(Task).options(selectinload(Task.assignee)).where(Task.id == task_id) #type: ignore
    task = session.exec(statement).first()  # Add eager loading
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("/", status_code=201, response_model=TaskPublic)
def create_task(task_in: TaskCreate, session: SessionDep):
    task = Task.model_validate(task_in)
    session.add(task)
    session.commit()
    session.refresh(task)

    statement = select(Task).options(selectinload(Task.assignee)).where(Task.id == task.id) #type: ignore
    task = session.exec(statement).first()

    return task


@router.patch("/{task_id}", response_model=TaskPublic)
def update_task(*, task_id: int, task_in: TaskUpdate, session: SessionDep):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_in.model_dump(exclude_unset=True)
    db_task.sqlmodel_update(update_data)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)

    # Add eager loading
    statement = select(Task).options(selectinload(Task.assignee)).where(Task.id == task_id) #type: ignore
    db_task = session.exec(statement).first()
    return db_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(*, task_id: int, session: SessionDep):
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
