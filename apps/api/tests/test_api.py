from eml_craft.main import craft, state
from eml_craft.schemas import CraftRequest
from eml_craft.store import Store


def test_craft_endpoint_discovers_e(tmp_path) -> None:
    test_store = Store(tmp_path / "test.sqlite3")
    test_store.init_db()

    current = state(test_store)
    one = next(item for item in current.items if item.label == "1")
    response = craft(CraftRequest(left_id=one.id, right_id=one.id), test_store)

    assert response.result.label == "e"
    assert response.cached is False
