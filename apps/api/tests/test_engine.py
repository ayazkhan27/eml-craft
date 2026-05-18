from eml_craft import engine


def test_eml_of_one_and_one_discovers_e() -> None:
    one = engine.seed_item("one")
    result = engine.combine(one, one).item

    assert result.label == "e"
    assert result.known_key == "e"


def test_eml_of_x_and_one_discovers_exp_x() -> None:
    one = engine.seed_item("one")
    x = engine.seed_item("x")
    result = engine.combine(x, one).item

    assert result.label == "exp(x)"
    assert result.known_key == "exp_x"


def test_nested_eml_discovers_log_x() -> None:
    one = engine.seed_item("one")
    x = engine.seed_item("x")

    first = engine.combine(one, x).item
    second = engine.combine(first, one).item
    third = engine.combine(one, second).item

    assert third.label == "log(x)"
    assert third.known_key == "log_x"

