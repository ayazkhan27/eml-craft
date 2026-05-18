from __future__ import annotations

from pydantic import BaseModel, Field


class Item(BaseModel):
    id: str
    label: str
    expression: str
    eml_tree: str
    depth: int
    known: bool
    known_key: str | None = None
    created_at: str


class Recipe(BaseModel):
    id: str
    left_id: str
    right_id: str
    result_id: str
    created_at: str


class Goal(BaseModel):
    id: str
    label: str
    target_key: str
    completed: bool
    completed_item_id: str | None = None


class CraftRequest(BaseModel):
    left_id: str = Field(..., min_length=1)
    right_id: str = Field(..., min_length=1)


class CraftResponse(BaseModel):
    result: Item
    recipe: Recipe
    goals: list[Goal]
    cached: bool


class StateResponse(BaseModel):
    items: list[Item]
    recipes: list[Recipe]
    goals: list[Goal]

