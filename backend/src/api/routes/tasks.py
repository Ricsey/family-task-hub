from fastapi import APIRouter, HTTPException
from sqlmodel import select

from src.api.deps import SessionDep
from src.models.tasks import Task, TaskCategory, TaskCreate, TaskUpdate

router = APIRouter(prefix="/task", tags=["task"])


@router.get("/")
def read_tasks(session: SessionDep):
    tasks = session.exec(select(Task)).all()
    return tasks


@router.get("/category")
def read_categories(session: SessionDep):
    return [c.value for c in TaskCategory]


@router.get("/{task_id}", response_model=Task)
def read_task(*, task_id: int, session: SessionDep):
    task = session.get(Task, task_id)
    return task


@router.post("/", status_code=201, response_model=Task)
def create_task(task_in: TaskCreate, session: SessionDep):
    # task = Task(
    #     title=task_in.title,
    #     description=task_in.description,
    #     assignee_id=task_in.assignee_id,
    #     assignee=None,  # TODO: what should I do here?
    #     category=task_in.category,
    #     dueDate=task_in.dueDate,
    #     status=task_in.status,  # TODO: Is this okay?
    # )
    task = Task.model_validate(task_in)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.patch("/{task_id}", response_model=Task)
def update_task(*, task_id: int, task_in: TaskUpdate, session: SessionDep):
    db_task = session.get(Task, task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_in.model_dump(exclude_unset=True)

    db_task.sqlmodel_update(update_data)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task