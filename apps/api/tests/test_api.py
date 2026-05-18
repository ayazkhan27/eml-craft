import pytest
from fastapi import HTTPException

from eml_craft import engine
from eml_craft.main import craft, reset, state
from eml_craft.schemas import CraftRequest
from eml_craft.store import Store

PLAYABLE_GOAL_RECIPES = (
    ("one", "one", "e"),
    ("x", "one", "exp_x"),
    ("y", "one", "exp_y"),
    ("one", "x", "log_x_bridge_a"),
    ("log_x_bridge_a", "one", "log_x_bridge_b"),
    ("one", "log_x_bridge_b", "log_x"),
    ("one", "y", "log_y_bridge_a"),
    ("log_y_bridge_a", "one", "log_y_bridge_b"),
    ("one", "log_y_bridge_b", "log_y"),
)


def item_by_key(test_store: Store, known_key: str):
    return next(item for item in state(test_store).items if item.known_key == known_key)


def test_craft_endpoint_discovers_e(tmp_path) -> None:
    test_store = Store(tmp_path / "test.sqlite3")
    test_store.init_db()

    current = state(test_store)
    one = next(item for item in current.items if item.label == "1")
    response = craft(CraftRequest(left_id=one.id, right_id=one.id), test_store)

    assert response.result.label == "e"
    assert response.cached is False


def test_reset_clears_recipes_and_restores_starters(tmp_path) -> None:
    test_store = Store(tmp_path / "test.sqlite3")
    test_store.init_db()
    current = state(test_store)
    one = next(item for item in current.items if item.label == "1")

    craft(CraftRequest(left_id=one.id, right_id=one.id), test_store)
    reset_state = reset(test_store)

    assert {item.label for item in reset_state.items} == {"1", "x", "y"}
    assert reset_state.recipes == []
    assert all(not goal.completed for goal in reset_state.goals)


def test_unknown_combo_creates_exploratory_expression(tmp_path) -> None:
    test_store = Store(tmp_path / "test.sqlite3")
    test_store.init_db()
    current = state(test_store)
    x = next(item for item in current.items if item.label == "x")
    y = next(item for item in current.items if item.label == "y")

    response = craft(CraftRequest(left_id=x.id, right_id=y.id), test_store)

    assert response.result.known is False
    assert response.result.known_key is None
    assert response.result.expression == "exp(x) - log(y)"


def test_too_deep_combo_is_rejected_for_interactive_budget(tmp_path) -> None:
    test_store = Store(tmp_path / "test.sqlite3")
    test_store.init_db()
    current = state(test_store)
    one = next(item for item in current.items if item.label == "1")
    deep_item = engine.EngineItem(
        id="item_too_deep",
        label="deep",
        latex="x",
        expression="x",
        eml_tree="deep",
        depth=engine.MAX_INTERACTIVE_DEPTH,
        known=False,
        known_key=None,
    )
    stored_deep_item = test_store.upsert_item(deep_item)

    with pytest.raises(HTTPException) as exc_info:
        craft(CraftRequest(left_id=stored_deep_item.id, right_id=one.id), test_store)

    assert exc_info.value.status_code == 422
    assert "interactive depth budget" in exc_info.value.detail


def test_non_finite_combo_is_rejected(tmp_path) -> None:
    test_store = Store(tmp_path / "test.sqlite3")
    test_store.init_db()
    current = state(test_store)
    one = next(item for item in current.items if item.label == "1")
    zero = engine.EngineItem(
        id="item_zero",
        label="0",
        latex="0",
        expression="0",
        eml_tree="0",
        depth=0,
        known=True,
        known_key="zero",
    )
    stored_zero = test_store.upsert_item(zero)

    with pytest.raises(HTTPException) as exc_info:
        craft(CraftRequest(left_id=one.id, right_id=stored_zero.id), test_store)

    assert exc_info.value.status_code == 422
    assert "undefined or non-finite" in exc_info.value.detail


def test_visible_goals_are_reachable_through_product_recipes(tmp_path) -> None:
    test_store = Store(tmp_path / "test.sqlite3")
    test_store.init_db()

    for left_key, right_key, result_key in PLAYABLE_GOAL_RECIPES:
        left = item_by_key(test_store, left_key)
        right = item_by_key(test_store, right_key)
        response = craft(CraftRequest(left_id=left.id, right_id=right.id), test_store)
        assert response.result.known_key == result_key

    final_state = state(test_store)
    incomplete_goals = [goal.label for goal in final_state.goals if not goal.completed]

    assert incomplete_goals == []
