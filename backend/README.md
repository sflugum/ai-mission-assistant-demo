# Backend (Express)

## Security (SQL injection)

- Persisted data writes use **`@supabase/supabase-js`** (`.insert()` / builders), which invoke **parameterized PostgREST** requests—not string‑concatenated SQL.
- **`input`** is validated as a trimmed string before any Gemini call (`analyzeMission`).
- **`POST /missions`** and **`PUT /missions/:id`** validate JSON bodies before writes (`createMission`, `replaceMission`).
- If you introduce **direct Postgres** access (for example via `pg`), use **placeholder parameters** (`$1`, `$2`, … / named binds) exclusively; never interpolate user‑controlled fragments into SQL text.

Schema changes for this repo stay in **`supabase/migrations`** (Supabase CLI), separate from application queries.

## Endpoints

`POST /analyze` — runs Gemini only; **does not** write to the database.

Request body:
```json
{ "input": "string" }
```

Success response (strict JSON):
```json
{ "actionPlan": ["..."], "risks": ["..."], "tools": ["..."] }
```

`POST /missions` — create a saved mission (brief + selected lines). Optional `title`; if omitted or blank, the server uses the truncated mission brief (same rule as before).

`PUT /missions/:id` — replace an existing mission’s brief, title, and all stored lines.

Request body for save routes:
```json
{
  "description": "string",
  "title": "optional string",
  "actionPlan": ["..."],
  "risks": ["..."],
  "tools": ["..."]
}
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

