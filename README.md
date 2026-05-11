# AI Mission Assistant

AI Mission Assistant transforms natural language ideas into structured project frameworks. Users describe a goal in plain language and receive a breakdown of action steps, potential risks, and recommended tools. Powered by the Gemini 2.5 Flash API.

This project documents my process of building a full-stack AI application with an emphasis on responsible development: deliberate architectural decisions, human-in-the-loop verification, and tradeoffs made to keep the system intentional and maintainable.

## Demo / Gif

🔗 **Live Demo**: <https://ai-mission-assistant-demo.vercel.app>
🔗 Backend: <https://ai-mission-assistant-demo.onrender.com>

📺 <img width="50%" alt="ai-mission-demo" src="https://github.com/user-attachments/assets/05bb73ed-18c7-4895-b254-e5ec998e7c9f" />

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
docker-compose up --build
```

### Manual Installation

1. **Backend**: `cd backend && npm install && npm start`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **Environment Variables**:
   * Copy `.env.example` to `.env` in both `/frontend` and `/backend`
   * See comments inside each file for local vs. production configuration
   * Required: `GOOGLE_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   * Optional: `PORT`, `CORS_ORIGIN`, `VITE_API_URL` (see comments for defaults)
