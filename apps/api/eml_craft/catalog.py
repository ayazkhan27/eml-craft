from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class KnownExpression:
    key: str
    label: str
    expression: str
    description: str


KNOWN_EXPRESSIONS: tuple[KnownExpression, ...] = (
    KnownExpression("one", "1", "1", "The distinguished terminal constant."),
    KnownExpression("x", "x", "x", "The first real input variable."),
    KnownExpression("e", "e", "E", "Euler's number, discovered as eml(1, 1)."),
    KnownExpression("exp_x", "exp(x)", "exp(x)", "The exponential function."),
    KnownExpression("log_x", "log(x)", "log(x)", "The natural logarithm."),
    KnownExpression("zero", "0", "0", "The additive identity."),
    KnownExpression("minus_one", "-1", "-1", "Negative one."),
    KnownExpression("two", "2", "2", "Two."),
    KnownExpression("neg_x", "-x", "-x", "Negation."),
    KnownExpression("inv_x", "1/x", "1/x", "Reciprocal."),
    KnownExpression("x_plus_one", "x + 1", "x + 1", "Successor."),
    KnownExpression("x_minus_one", "x - 1", "x - 1", "Predecessor."),
    KnownExpression("x_squared", "x^2", "x**2", "Square."),
    KnownExpression("sqrt_x", "sqrt(x)", "sqrt(x)", "Principal square root."),
    KnownExpression("x_plus_y", "x + y", "x + y", "Addition."),
    KnownExpression("x_minus_y", "x - y", "x - y", "Subtraction."),
    KnownExpression("x_times_y", "x * y", "x*y", "Multiplication."),
    KnownExpression("x_div_y", "x / y", "x/y", "Division."),
    KnownExpression("pi", "pi", "pi", "The circle constant."),
    KnownExpression("i", "i", "I", "The imaginary unit."),
    KnownExpression(
        "standard_normal_pdf",
        "standard normal pdf",
        "exp(-x**2/2)/sqrt(2*pi)",
        "The probability density function of the standard normal distribution.",
    ),
)


STARTER_KEYS = ("one", "x")


GOALS = (
    ("discover-exp", "Discover exp(x)", "exp_x"),
    ("discover-log", "Discover log(x)", "log_x"),
    ("discover-pi", "Discover pi", "pi"),
    ("normal-pdf", "Craft the standard normal PDF", "standard_normal_pdf"),
)

