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
    KnownExpression("y", "y", "y", "The second real input variable."),
    KnownExpression("e", "e", "E", "Euler's number, discovered as eml(1, 1)."),
    KnownExpression("exp_x", "exp(x)", "exp(x)", "The exponential function."),
    KnownExpression("exp_y", "exp(y)", "exp(y)", "The exponential function in y."),
    KnownExpression(
        "log_x_bridge_a",
        "log bridge x I",
        "E - log(x)",
        "A playable intermediate on the EML path to log(x).",
    ),
    KnownExpression(
        "log_x_bridge_b",
        "log bridge x II",
        "exp(E)/x",
        "A playable intermediate on the EML path to log(x).",
    ),
    KnownExpression(
        "log_y_bridge_a",
        "log bridge y I",
        "E - log(y)",
        "A playable intermediate on the EML path to log(y).",
    ),
    KnownExpression(
        "log_y_bridge_b",
        "log bridge y II",
        "exp(E)/y",
        "A playable intermediate on the EML path to log(y).",
    ),
    KnownExpression("log_x", "log(x)", "log(x)", "The natural logarithm."),
    KnownExpression("log_y", "log(y)", "log(y)", "The natural logarithm in y."),
    KnownExpression("zero", "0", "0", "The additive identity."),
    KnownExpression("minus_one", "-1", "-1", "Negative one."),
    KnownExpression("two", "2", "2", "Two."),
    KnownExpression("half", "1/2", "1/2", "One half."),
    KnownExpression("neg_x", "-x", "-x", "Negation."),
    KnownExpression("neg_y", "-y", "-y", "Negation in y."),
    KnownExpression("inv_x", "1/x", "1/x", "Reciprocal."),
    KnownExpression("inv_y", "1/y", "1/y", "Reciprocal in y."),
    KnownExpression("x_plus_one", "x + 1", "x + 1", "Successor."),
    KnownExpression("y_plus_one", "y + 1", "y + 1", "Successor in y."),
    KnownExpression("x_minus_one", "x - 1", "x - 1", "Predecessor."),
    KnownExpression("y_minus_one", "y - 1", "y - 1", "Predecessor in y."),
    KnownExpression("x_squared", "x^2", "x**2", "Square."),
    KnownExpression("y_squared", "y^2", "y**2", "Square in y."),
    KnownExpression("sqrt_x", "sqrt(x)", "sqrt(x)", "Principal square root."),
    KnownExpression("sqrt_y", "sqrt(y)", "sqrt(y)", "Principal square root in y."),
    KnownExpression("x_plus_y", "x + y", "x + y", "Addition."),
    KnownExpression("x_minus_y", "x - y", "x - y", "Subtraction."),
    KnownExpression("y_minus_x", "y - x", "y - x", "Reverse subtraction."),
    KnownExpression("x_times_y", "x * y", "x*y", "Multiplication."),
    KnownExpression("x_div_y", "x / y", "x/y", "Division."),
    KnownExpression("y_div_x", "y / x", "y/x", "Reverse division."),
    KnownExpression("pow_x_y", "x^y", "x**y", "Power."),
    KnownExpression("pow_y_x", "y^x", "y**x", "Reverse power."),
    KnownExpression("log_base_x_y", "log_x(y)", "log(y)/log(x)", "Logarithm of y base x."),
    KnownExpression("log_base_y_x", "log_y(x)", "log(x)/log(y)", "Logarithm of x base y."),
    KnownExpression("sin_x", "sin(x)", "sin(x)", "Sine."),
    KnownExpression("cos_x", "cos(x)", "cos(x)", "Cosine."),
    KnownExpression("tan_x", "tan(x)", "tan(x)", "Tangent."),
    KnownExpression("sinh_x", "sinh(x)", "sinh(x)", "Hyperbolic sine."),
    KnownExpression("cosh_x", "cosh(x)", "cosh(x)", "Hyperbolic cosine."),
    KnownExpression("tanh_x", "tanh(x)", "tanh(x)", "Hyperbolic tangent."),
    KnownExpression("logistic_x", "sigma(x)", "1/(1 + exp(-x))", "Logistic sigmoid."),
    KnownExpression(
        "gaussian_kernel",
        "Gaussian kernel",
        "exp(-x**2)",
        "Unnormalized Gaussian kernel.",
    ),
    KnownExpression("pi", "pi", "pi", "The circle constant."),
    KnownExpression("i", "i", "I", "The imaginary unit."),
    KnownExpression(
        "standard_normal_pdf",
        "standard normal pdf",
        "exp(-x**2/2)/sqrt(2*pi)",
        "The probability density function of the standard normal distribution.",
    ),
)


STARTER_KEYS = ("one", "x", "y")


GOALS = (
    ("discover-e", "Discover e", "e"),
    ("discover-exp", "Discover exp(x)", "exp_x"),
    ("discover-exp-y", "Discover exp(y)", "exp_y"),
    ("discover-log", "Discover log(x)", "log_x"),
    ("discover-log-y", "Discover log(y)", "log_y"),
)
