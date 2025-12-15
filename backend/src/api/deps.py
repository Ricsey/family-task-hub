from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from src.core.config import settings
from src.core.db import engine


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]


# @lru_cache
def get_config():
    return settings
