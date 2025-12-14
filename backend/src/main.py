from fastapi import FastAPI

from src.api.routes.heroes import router as heroes_router
from src.core.db import create_db_and_tables


async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/healthcheck")
async def healthcheck():
    return {"status": "ok"}


app.include_router(heroes_router)
