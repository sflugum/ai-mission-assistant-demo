# Backend (Express)

## Endpoint

`POST /analyze`

Request body:
```json
{ "input": "string" }
```

Success response (strict JSON):
```json
{ "plan": ["..."], "risks": ["..."], "tools": ["..."] }
```

## Environment variables

- `GOOGLE_API_KEY` (required)
- `GOOGLE_MODEL` (optional, default: `gemini-2.5-flash`)
- `PORT` (optional, default: `3001`)
- `CORS_ORIGIN` (optional, default: `http://localhost:5173`)

Create `backend/.env` from `backend/.env.example`.

## Run

```bash
npm install
npm run dev
```

