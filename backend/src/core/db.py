from sqlmodel import SQLModel, create_engine

POSTGRES_DB = "family_task_hub"
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "example"
POSTGRES_SERVER = "db"
POSTGRES_PORT = "5432"

POSTGRES_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

engine = create_engine(POSTGRES_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
