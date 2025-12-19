from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes.tasks import router as tasks_router
from src.api.routes.users import router as users_router
from src.core.db import create_db_and_tables


async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/healthcheck")
async def healthcheck():
    return {"status": "ok"}


app.include_router(users_router)
app.include_router(tasks_router)
