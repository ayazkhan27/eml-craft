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


def test_exploratory_unknown_combo_creates_expression() -> None:
    x = engine.seed_item("x")
    y = engine.seed_item("y")

    result = engine.combine(x, y).item

    assert result.depth == 1
    assert result.known is False
    assert result.expression == "exp(x) - log(y)"


def test_exploratory_chain_stops_at_interactive_depth_budget() -> None:
    one = engine.seed_item("one")
    too_deep = engine.EngineItem(
        id="item_too_deep",
        label="deep",
        latex="x",
        expression="x",
        eml_tree="deep",
        depth=engine.MAX_INTERACTIVE_DEPTH,
        known=False,
        known_key=None,
    )

    try:
        engine.combine(too_deep, one)
    except engine.ExpressionTooComplexError as exc:
        assert "interactive depth budget" in str(exc)
    else:
        raise AssertionError("Expected depth-budget rejection")


def test_undefined_or_non_finite_result_is_rejected() -> None:
    one = engine.seed_item("one")
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

    try:
        engine.combine(one, zero)
    except engine.InvalidExpressionError as exc:
        assert "undefined or non-finite" in str(exc)
    else:
        raise AssertionError("Expected invalid-expression rejection")
