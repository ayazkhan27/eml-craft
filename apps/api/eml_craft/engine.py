from __future__ import annotations

import hashlib
from dataclasses import dataclass
from typing import Any

import sympy as sp

from .catalog import KNOWN_EXPRESSIONS, KnownExpression

x, y, mu, sigma = sp.symbols("x y mu sigma", positive=True)

LOCAL_DICT: dict[str, Any] = {
    "x": x,
    "y": y,
    "mu": mu,
    "sigma": sigma,
    "E": sp.E,
    "I": sp.I,
    "pi": sp.pi,
    "exp": sp.exp,
    "log": sp.log,
    "sqrt": sp.sqrt,
    "sin": sp.sin,
    "cos": sp.cos,
    "tan": sp.tan,
}

SAMPLES = (
    {x: sp.Rational(3, 2), y: sp.Rational(5, 2), mu: 0, sigma: 1},
    {x: sp.Rational(2, 1), y: sp.Rational(7, 3), mu: sp.Rational(1, 3), sigma: 2},
    {x: sp.Rational(5, 4), y: sp.Rational(11, 5), mu: sp.Rational(1, 2), sigma: 3},
)


@dataclass(frozen=True)
class EngineItem:
    id: str
    label: str
    expression: str
    eml_tree: str
    depth: int
    known: bool
    known_key: str | None


@dataclass(frozen=True)
class EngineResult:
    item: EngineItem
    raw_expression: str


KNOWN_BY_KEY = {entry.key: entry for entry in KNOWN_EXPRESSIONS}


def parse_expression(expression: str) -> sp.Expr:
    return sp.sympify(expression, locals=LOCAL_DICT)


def normalize_expression(expr: sp.Expr) -> sp.Expr:
    simplified = sp.simplify(expr)
    simplified = sp.powsimp(simplified, force=True)
    simplified = sp.cancel(simplified)
    return sp.simplify(simplified)


def canonical_text(expr: sp.Expr) -> str:
    return sp.sstr(normalize_expression(expr), order="lex")


def item_id_for(expr: sp.Expr) -> str:
    digest = hashlib.sha256(canonical_text(expr).encode("utf-8")).hexdigest()[:16]
    return f"item_{digest}"


def recipe_id_for(left_id: str, right_id: str) -> str:
    digest = hashlib.sha256(f"{left_id}|{right_id}".encode()).hexdigest()[:16]
    return f"recipe_{digest}"


def known_expr(entry: KnownExpression) -> sp.Expr:
    return normalize_expression(parse_expression(entry.expression))


def symbolic_equal(left: sp.Expr, right: sp.Expr) -> bool:
    try:
        return normalize_expression(left - right) == 0
    except Exception:
        return False


def numeric_equal(left: sp.Expr, right: sp.Expr) -> bool:
    for sample in SAMPLES:
        try:
            left_value = complex(sp.N(left.subs(sample), 50))
            right_value = complex(sp.N(right.subs(sample), 50))
        except Exception:
            return False

        scale = max(1.0, abs(left_value), abs(right_value))
        if abs(left_value - right_value) > 1e-8 * scale:
            return False
    return True


def match_known(expr: sp.Expr) -> KnownExpression | None:
    normalized = normalize_expression(expr)
    for entry in KNOWN_EXPRESSIONS:
        target = known_expr(entry)
        if symbolic_equal(normalized, target) or numeric_equal(normalized, target):
            return entry
    return None


def compact_eml_label(left_label: str, right_label: str, max_len: int = 42) -> str:
    label = f"E({left_label}, {right_label})"
    if len(label) <= max_len:
        return label
    return label[: max_len - 1] + "…"


def seed_item(key: str) -> EngineItem:
    entry = KNOWN_BY_KEY[key]
    expr = normalize_expression(parse_expression(entry.expression))
    return EngineItem(
        id=item_id_for(expr),
        label=entry.label,
        expression=canonical_text(expr),
        eml_tree=entry.label,
        depth=0,
        known=True,
        known_key=entry.key,
    )


def combine(left: EngineItem, right: EngineItem) -> EngineResult:
    left_expr = parse_expression(left.expression)
    right_expr = parse_expression(right.expression)
    raw_expr = sp.exp(left_expr) - sp.log(right_expr)
    normalized = normalize_expression(raw_expr)
    known = match_known(normalized)
    label = known.label if known else compact_eml_label(left.label, right.label)
    eml_tree = f"eml({left.eml_tree}, {right.eml_tree})"
    item = EngineItem(
        id=item_id_for(normalized),
        label=label,
        expression=canonical_text(normalized),
        eml_tree=eml_tree,
        depth=max(left.depth, right.depth) + 1,
        known=known is not None,
        known_key=known.key if known else None,
    )
    return EngineResult(item=item, raw_expression=sp.sstr(raw_expr, order="lex"))
