# Deployment

The current app can be hosted now, but it has two deployable parts:

- `apps/web`: static Vite frontend.
- `apps/api`: FastAPI backend with SQLite persistence.

## Recommended MVP Deployment

1. Deploy `apps/api` as a Python web service.
   - Build: `uv sync --project apps/api --extra dev`
   - Start: `uv run --project apps/api uvicorn eml_craft.main:app --host 0.0.0.0 --port $PORT`
   - Set `EML_CRAFT_DB` to a writable persistent disk path.
2. Deploy `apps/web` as a static site.
   - Build: `npm ci && npm run build -w apps/web`
   - Output directory: `apps/web/dist`
   - Set `VITE_API_BASE_URL` to the deployed API URL.

You do not need to buy a domain to test publicly. Most hosts provide a generated
subdomain. A custom domain is useful once the name is stable.

## Audio

The MVP uses Web Audio synthesis in `apps/web/src/lib/sound.ts`, so there are no
audio files to license, bundle, or preload.

Good CC0 sources for a later asset pass:

- Kenney Interface Sounds
- OpenGameArt GUI Sound Effects by LokiF
- OpenGameArt UI Sounds by HaelDB
- OpenGameArt UI Sound Effects by Robin Lamb
