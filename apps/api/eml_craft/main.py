from __future__ import annotations

from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import engine
from .schemas import CraftRequest, CraftResponse, StateResponse
from .store import Store

store = Store()


@asynccontextmanager
async def lifespan(app: FastAPI):
    store.init_db()
    yield


app = FastAPI(title="EML Craft API", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_store() -> Store:
    return store


StoreDep = Annotated[Store, Depends(get_store)]


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/state", response_model=StateResponse)
def state(db: StoreDep) -> StateResponse:
    return StateResponse(
        items=db.list_items(),
        recipes=db.list_recipes(),
        goals=db.list_goals(),
    )


@app.get("/api/items")
def items(db: StoreDep):
    return db.list_items()


@app.get("/api/recipes")
def recipes(db: StoreDep):
    return db.list_recipes()


@app.get("/api/goals")
def goals(db: StoreDep):
    return db.list_goals()


@app.post("/api/craft", response_model=CraftResponse)
def craft(payload: CraftRequest, db: StoreDep) -> CraftResponse:
    left = db.get_item(payload.left_id)
    right = db.get_item(payload.right_id)
    if left is None:
        raise HTTPException(status_code=404, detail=f"Unknown left item: {payload.left_id}")
    if right is None:
        raise HTTPException(status_code=404, detail=f"Unknown right item: {payload.right_id}")

    cached_recipe = db.get_recipe(left.id, right.id)
    if cached_recipe:
        result = db.get_item(cached_recipe.result_id)
        if result is None:
            raise HTTPException(status_code=500, detail="Cached recipe result is missing")
        return CraftResponse(
            result=result,
            recipe=cached_recipe,
            goals=db.list_goals(),
            cached=True,
        )

    result = engine.combine(
        engine.EngineItem(**left.model_dump(exclude={"created_at"})),
        engine.EngineItem(**right.model_dump(exclude={"created_at"})),
    )
    item = db.upsert_item(result.item)
    recipe = db.create_recipe(left.id, right.id, item.id)
    return CraftResponse(result=item, recipe=recipe, goals=db.list_goals(), cached=False)
