# AI Mission Assistant Demo

Minimal fullstack MVP:
- Frontend: React (Vite) + Tailwind CSS
- Backend: Node.js + Express
- AI: Google AI Studio (Generative Language API)

See `docs/prd.md` for the strict JSON contract.

## Quick start (local)

1. Backend
   - `cd backend`
   - Copy `./.env.example` to `./.env` and set `GOOGLE_API_KEY`
   - Install deps: `npm install`
   - Run: `npm run dev`

2. Frontend
   - `cd frontend`
   - Install deps: `npm install`
   - Run: `npm run dev`

The frontend calls `POST /analyze` (proxied to the backend in dev).

