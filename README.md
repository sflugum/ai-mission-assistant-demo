# AI Mission Assistant

AI Mission Assistant transforms natural language ideas into structured project frameworks. Users describe a goal in plain language and receive a breakdown of action steps, potential risks, and recommended tools. Powered by the Gemini 2.5 Flash API.

This project documents my process of building a full-stack AI application with an emphasis on responsible development: deliberate architectural decisions, human-in-the-loop verification, and tradeoffs made to keep the system intentional and maintainable.

## Demo / Gif

🔗 **Live Demo**: <https://ai-mission-assistant-demo.vercel.app>
🔗 Backend: <https://ai-mission-assistant-demo.onrender.com>

| Original Build: | Current Build: |
| --------------- | -------------- |
| <p align="center"><img width="100%" alt="ai-mission-demo" src="https://github.com/user-attachments/assets/e4820582-c538-49de-aef6-0aea57470382" /></p> | <p align="center"><img width="100%" alt="ai-mission-browser-screenshot" src="https://github.com/user-attachments/assets/2aac3f0c-9f01-4274-9667-b9fa7ef794e8" /></p> |

---

## ✨ Features

* **Mission Analysis**: Describe any goal in plain language and receive a structured breakdown of action steps, potential risks, and recommended tools.
* **Mission History**: Save past missions and reload them for re-analysis via a persistent Supabase-backed mission list.
* **Responsible AI Output**: Every response is generated through a verified, human-approved workflow — not raw, unreviewed model output.
* **Flexible Local Setup**: Runs via Docker or manual install, with environment configurations for both local development and production deployment.

---

## 🏗️ System Evolution

The development of this project represents a shift from feature prototyping to system hardening. I use a **Human-in-the-Loop (HITL)** architecture to ensure every output meets logic and safety standards.

* **Modular Architectural Refactor**: Refactored from a monolithic structure to a modular service layer.
* **Verification Policy**: Every module is audited for accuracy. I frequently pause agentic workflows to question logic, ensuring the codebase is intentional and maintainable.

---

## 🧪 Testing

Automated testing runs in CI via `.github/workflows/ci.yaml` in this order: `test:run` → `test:e2e` → `build`.

### Test Suite (12 checks total)

**Database — pgTAP** (`npm run db:test` → `supabase db test --local`)

| File | What it asserts |
|------|-----------------|
| `supabase/tests/database/missions_schema.test.sql` | `public.missions` table exists (migrations applied). |

**Unit / Integration — Vitest** (`npm run test:run` → frontend Vitest)

| File | Suite / cases |
|------|---------------|
| `frontend/src/services/aiService.test.js` | `describe('aiService.analyzeMission')` — 5 tests: POST `/analyze` + body; error from JSON body; error from plain text; default message when body empty; absolute URL when `VITE_API_URL` is set. |

**End-to-End — Playwright** (`npm run test:e2e`)

| File | Tests |
|------|-------|
| `frontend/e2e/smoke.spec.ts` | App loads and document title matches `/AI Mission Assistant/`. |
| `frontend/e2e/landing.spec.ts` | Landing H1 renders; "Start new mission" navigates to `/mission/new`. |
| `frontend/e2e/visual-regression.spec.ts` | Full-page screenshot baselines for `/` and `/mission/new`. |
| `frontend/e2e/analyze-route-mock.spec.ts` | Mocked `/analyze`: JSON 500 message + screenshot; opaque 500 → `Request failed: 500`. |

> **Note:** There are no backend-specific test files; the backend is exercised indirectly via E2E tests against the running app (when not mocked). `npm run build` runs `vite build` only and does not invoke the test suite.

| Layer | Count |
|-------|-------|
| pgTAP | 1 |
| Vitest | 5 |
| Playwright | 6 |
| **Total** | **12** |

---

## 🤖 Agentic Verification Workflow

A multi-model workflow designed to minimize hallucinations and ensure technical accuracy:

* **Lead Agent (Cursor)**: Used for code execution in "ask-before-act" mode, requiring manual approval for every file change.
* **Cross-Model Verification (Gemini)**: Used as an external consultant to cross-verify logic produced by the Lead Agent.
* **Core Logic**: Application logic is powered by the **Gemini 2.5 Flash API** for natural language processing.

---

## 📈 Roadmap

Planned updates focus on building system reliability, persistence, and multi-user support:

* **Resilient API Calls**: Automated retry logic and exponential backoff to handle rate limits and "Server Busy" errors.
* **Modular API Adapter**: A flexible configuration to allow swapping AI models to ensure service availability.
* **Persistent Mission Results**: Store and retrieve full analysis results alongside saved missions, eliminating the need to re-run analysis.
* **User Accounts**: Individual user authentication so each user has a private mission history.

---

## 🛠️ Technologies Used

### ⚙️ App Stack

* **Frontend**: React (Vite), Tailwind CSS
* **Backend**: Node.js, Express
* **Database**: Supabase (Postgres), Docker (Local)
* **Deployment**: Render (Backend), Vercel (Frontend)

### 🕸️ Agentic Systems & Orchestration

* **Human-in-the-Loop (HITL)**: Manual code approval and output verification.
* **Orchestration**: Multi-model prompting and context management to distill agent instructions.
* **Verification**: Cross-referencing outputs between Cursor and Gemini to mitigate hallucinations.

---

## 💻 Local Setup

### Quick Start (Docker)

```bash
git clone https://github.com/sflugum/ai-mission-assistant-demo
cd ai-mission-assistant-demo
cp .env.example .env
# Fill .env from: npx supabase status -o env
npx supabase start
docker compose up --build
```

Docker uses the **repo-root** `.env` only (not `backend/.env` or `frontend/.env`).

### Manual Installation (host `npm run dev`)

1. **Backend**: `cd backend && npm install && npm start`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **Environment Variables**:
   * Copy `backend/.env.example` → `backend/.env` and `frontend/.env.example` → `frontend/.env`
   * Do not use the repo-root `.env` for host dev unless you symlink intentionally
   * Backend (no `VITE_` prefix): `GOOGLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   * Frontend (browser): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; optional `VITE_API_URL`
   * `VITE_SUPABASE_*` must point at the same Supabase project the backend writes to
4. **Database migrations**: Run Supabase migrations against the same database your backend uses (for example `supabase db push` for local, or apply migration files in `supabase/migrations` to hosted Postgres). Saving missions requires the `public.mission_lines` table from `20260514120000_mission_lines.sql`.
