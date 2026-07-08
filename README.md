# AI Mission Assistant

![Docs Status](https://img.shields.io/badge/docs-up_to_date-brightgreen) ![Tests](https://img.shields.io/badge/tests-bypassed_pending_refactor-yellow) ![GitHub last commit](https://img.shields.io/github/last-commit/sflugum/ai-mission-assistant-demo/main)

AI Mission Assistant transforms natural language ideas into structured project frameworks. Users describe a goal in plain language and receive a breakdown of action steps, potential risks, and recommended tools. Powered by the Gemini 2.5 Flash API and the Vercel AI SDK.

This project documents my process of building a full-stack application with an emphasis on responsible development: deliberate architectural decisions, human-in-the-loop verification, and the continuous evolution of using AI as a consultant rather than a crutch.

## Demo / Gif

🔗 **Live Demo**: <https://ai-mission-assistant-demo.vercel.app>
🔗 Backend: <https://ai-mission-assistant-demo.onrender.com>

| Original Build: | Current Build: |
| --------------- | -------------- |
| <p align="center"><img width="100%" alt="ai-mission-demo" src="https://github.com/user-attachments/assets/e4820582-c538-49de-aef6-0aea57470382" /></p> | <p align="center"><img width="100%" alt="ai-mission-browser-screenshot" src="https://github.com/user-attachments/assets/2aac3f0c-9f01-4274-9667-b9fa7ef794e8" /></p> |

---

## ✨ Features

* **Mission Analysis**: Describe any goal in plain language and receive a structured breakdown of action steps, potential risks, and recommended tools.
* **Edge Streaming**: AI responses are streamed in real-time via Vercel Edge functions, preventing timeouts and providing immediate user feedback.
* **Mission History**: Save past missions and reload them for re-analysis via a persistent Postgres-backed mission list.
* **Flexible Local Setup**: Runs via Docker (Database) and Vercel CLI, with environment configurations for both local development and production deployment.

---

## 🏗️ System Evolution

The development of this project represents a shift from feature prototyping to system hardening. Recent major architectural refactors include:

* **API Decoupling & Edge Migration**: The Gemini API calls were decoupled from the Node.js/Express backend and moved to a Vercel Serverless Function utilizing the Edge Runtime. This solved intermittent free-tier Render blocking and eliminated cold-start timeouts via streaming.
* **Database Migration**: Transitioned from Supabase to Neon Postgres to better accommodate the usage patterns of a portfolio project.
* **Monorepo Structure**: The frontend directory serves as the root for Vercel deployments, allowing seamless integration of serverless functions alongside the Vite React app.

---

## 🧠 AI Development Methodology

This project serves as a case study in my growth using AI as a development tool. I have actively shifted away from fully automated, integrated agents in favor of a deliberate, verification-first approach:

* **From Agent to Consultant**: Initial development was heavily reliant on Cursor as a lead agent. I have since migrated to VS Code, utilizing Gemini Pro Extended as a specialized "consultant" and Leo AI (Brave) for rapid documentation retrieval and cross-verification.
* **Human-in-the-Loop (HITL)**: Every line of code, architectural decision, and tool recommendation is manually verified. 
* **AI Workflow & Verification**: Throughout this project, my prompting strategy matured from seeking tutorials to actively directing and redirecting AI agents. By interrogating the AI's technical decisions and continuously reframing constraints, I have honed my ability to identify subtle flaws, force the model to align with my intended architecture, and maintain strict control over the application's foundational mechanics.

---

## 🧪 Testing

> **⚠️ Status Note:** Due to the recent major architectural refactor (decoupling the API and migrating to Vercel Serverless functions), the automated test suite is currently outdated. Tests are temporarily bypassed in the GitHub Actions workflows (`.github/workflows/ci.yaml`) while they are being rewritten to reflect the new Edge runtime and API logic.

### Historical Test Suite (Pending Update)

**Database — pgTAP**
* Asserts `public.missions` table exists.

**Unit / Integration — Vitest**
* Asserts `aiService.analyzeMission` routing and error handling.

**End-to-End — Playwright**
* Asserts app loading, rendering, navigation, and visual regression baselines.

---

## 📈 Roadmap & Known Issues

Planned updates focus on resolving current UI bugs and building out persistence features:

* **Bug Fix - State Management**: When unchecking mission lines prior to saving, the lines currently persist in the UI. 
* **Optimize Mission Resumption**: Currently, resuming a mission locks edits until re-analyzed, resulting in wasted API calls with no state changes. This flow will be optimized to allow immediate editing.
* **Resilient API Calls**: Add automated retry logic and exponential backoff to handle rate limits.
* **User Accounts**: Individual user authentication so each user has a private mission history.

---

## 🛠️ Technologies Used

### ⚙️ App Stack

* **Frontend**: React (Vite), Tailwind CSS
* **API/Serverless**: Vercel Serverless Functions, Edge Runtime, Vercel AI SDK
* **Backend**: Node.js, Express.js (handling core app logic outside of AI streaming)
* **Database**: Neon (Postgres), Docker Desktop (Local)
* **Deployment**: Render (Backend), Vercel (Frontend & Serverless API)

---

## 💻 Local Setup

### Quick Start (Database via Docker)

```bash
git clone [https://github.com/sflugum/ai-mission-assistant-demo](https://github.com/sflugum/ai-mission-assistant-demo)
cd ai-mission-assistant-demo
cp .env.example .env
docker compose up --build

```

*Docker uses the **repo-root** `.env` only.*

### Manual Installation & Local Testing

Because the AI API has been decoupled into Vercel Serverless functions, testing the frontend locally requires the Vercel CLI to properly emulate the Edge runtime.

1.**Backend Initialization**:

```bash
cd backend && npm install && npm start

```

2.**Frontend Initialization**:

```bash
cd frontend && npm install

```

3.**Environment Variables**:
*Copy `backend/.env.example` → `backend/.env`
*Copy `frontend/.env.example` → `frontend/.env`
***Backend**: `DATABASE_URL`
***Frontend**: `GOOGLE_GENERATIVE_AI_API_KEY` (Required for the serverless function) and `VITE_API_URL` (optional).

4.**Running the Frontend Locally**:
To ensure the Vercel Serverless functions (like the Gemini API stream) work locally, use the Vercel CLI rather than the standard Vite dev script:

```bash
npm i -g vercel
vercel dev

```

5.**Database Initialization**: Run the migration script to automatically generate the required schema (including the missions and mission_lines tables) in your database:

```bash
npm run migrate

```
