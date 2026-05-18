# Math Recognition

The MVP uses a conservative hybrid recognizer.

## Recognition Layers

1. Build an EML tree string for recipe ancestry.
2. Build a SymPy expression with `exp(left) - log(right)`.
3. Simplify the expression.
4. Compare symbolically against a curated known-expression catalog.
5. If symbolic equality is inconclusive, compare numeric values at deterministic
   positive sample points.

The MVP intentionally avoids using an LLM for correctness. A later service can
generate hints or explanations from already-verified math facts.

## Domain Caveat

The paper's full construction uses complex logarithm branch conventions. The MVP
recognizer starts with positive real sample points so early discoveries such as
`log(x)` can be recognized reliably for gameplay. Deeper branch-aware recognition
should be added before presenting this as a formal proof assistant.

