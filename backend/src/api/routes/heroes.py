from fastapi import APIRouter, HTTPException
from sqlmodel import select

from src.core.deps import SessionDep
from src.models.heroes import Hero

router = APIRouter(prefix="/heroes", tags=["heroes"])


@router.post("/", status_code=201)
async def create_hero(hero: Hero, session: SessionDep):
    session.add(hero)
    session.commit()
    session.refresh(hero)
    return hero


@router.get("/{hero_id}")
async def read_hero(hero_id: int, session: SessionDep):
    hero = session.get(Hero, hero_id)
    if not hero:
        raise HTTPException(status_code=404, detail="Hero not found")
    return hero


@router.get("/")
async def read_heroes(session: SessionDep):
    heroes = session.exec(select(Hero)).all()
    return heroes


@router.delete("/{hero_id}")
async def delete_hero(hero_id: int, session: SessionDep):
    hero = session.get(Hero, hero_id)
    if not hero:
        raise HTTPException(status_code=404, detail="Hero not found")
    session.delete(hero)
    session.commit()
    return {"ok": True}
