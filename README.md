# EML Craft

EML Craft is an Infinite Craft-inspired math game based on the paper
`All elementary functions from a single operator`. Players combine ordered
expressions with one rule:

```text
eml(A, B) = exp(A) - log(B)
```

The app is deterministic: the backend uses symbolic and numeric math tooling to
recognize discoveries. There is no LLM in the MVP loop.

## Stack

- `apps/web`: React, Vite, TypeScript
- `apps/api`: FastAPI, SymPy, mpmath, SQLite
- `packages/shared`: shared TypeScript API types
- Tooling: npm workspaces, uv, pytest, Ruff, Vitest, Playwright

## Quick Start

```bash
npm install
uv sync --project apps/api
npm run dev
```

The web app runs on `http://127.0.0.1:5173` and proxies API calls to
`http://127.0.0.1:8000`.

Run the API directly:

```bash
uv run --project apps/api uvicorn eml_craft.main:app --reload --host 127.0.0.1 --port 8000
```

Run the web app directly:

```bash
npm run dev -w apps/web
```

## Checks

```bash
npm run typecheck
npm run test
uv run --project apps/api pytest
uv run --project apps/api ruff check .
```

## Product Shape

The first playable mode is a sandbox with visible goals. The player starts with
`1` and `x`, places expression tiles on a canvas, selects an ordered pair, and
crafts `eml(left, right)`. Known discoveries get human-readable names such as
`e`, `exp(x)`, and `log(x)`. Unknown expressions remain craftable with compact
EML labels.
