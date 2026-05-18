# Architecture

EML Craft is split into a deterministic math API and a canvas-first web app.

## Runtime Flow

1. The user selects an ordered pair of expression items.
2. The web app sends `POST /api/craft` with `left_id` and `right_id`.
3. The API loads the parent expressions from SQLite.
4. The engine constructs `exp(left) - log(right)`.
5. The result is simplified, fingerprinted, matched against known expressions,
   persisted, and returned.
6. The UI adds the result to the discovery sidebar and canvas.

## Data Model

- `items`: discovered expressions with labels, SymPy strings, raw EML trees, and
  depth.
- `recipes`: ordered pairs and their deterministic result.
- `goals`: curated targets for onboarding and challenge play.

## Design Direction

The UI borrows the approachable sidebar + canvas loop from Infinite Craft, but
the visual language is more precise: expression tiles, ordered-combine affordance,
math notation, and optional raw EML tree inspection.

