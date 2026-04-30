# AI Mission Assistant


### AI Mission Assistant is a full-stack application that transforms natural language ideas into structured project frameworks. This project serves as a showcase of High-Speed AI Orchestration paired with Strict Engineering Oversight.

---

## 📸 Demo / Gif

📺 **Live Demo**: https://ai-mission-assistant-demo.vercel.app
Backend: https://ai-mission-assistant-demo.onrender.com

<img width="50%" alt="ai-mission-demo" src="https://github.com/user-attachments/assets/05bb73ed-18c7-4895-b254-e5ec998e7c9f" />

---

## 🏗️ System Evolution

The evolution of this project represents a shift from rapid feature prototyping to production-grade system hardening. Throughout development, I maintained a "Human-in-the-Loop" architecture to ensure every output meets strict logic and safety standards.

    - Supervised Architectural Refactor: I directed the transition from a monolithic structure to a modular Service Layer. While I used AI to help move the code, I acted as the lead architect—questioning logic, enforcing file structure, and manually intervening whenever the AI drifted toward over-abstraction.
    
    - Zero-Trust Code Quality: I maintained a "Trust but Verify" policy. Every module was combed through for accuracy. I frequently paused the AI agent to question its decisions, ensuring the final codebase was intentional and follow-able.
  
---

## 🤖 Multi-Model Verification Workflow

I developed a "Multi-AI" workflow designed to minimize errors and maximize speed:

    - The Lead Agent (Cursor): Used for rapid code execution and boilerplate generation. I operated this in "ask-before-act" mode, requiring manual approval for every file change.

    - The External Consultant (Gemini): To prevent "hallucinations," I used Gemini as an external reference to cross-verify the code produced by the Lead Agent. This "Double-AI" check ensured that the logic was technically sound and followed modern best practices.

    - The Project Engine: The application is powered by the Gemini 2.5 Flash API, handling the core natural language processing tasks.

---

## 📈 Current Sprint: Dynamic Reliability

I am currently implementing Dynamic API Management to handle real-world constraints:

    - Resilient API Calls: Developing automated retry logic and exponential backoff to handle "Server Busy" errors gracefully.

    - Modular API Adapter: Designing a flexible configuration that allows for hot-swapping AI models to ensure the service remains available during high-traffic periods.

---

## 💻 Local Setup

### Quick Start (Docker)


```
git clone https://github.com/sflugum/ai-mission-assistant-demo
docker-compose up --build
```


### Manual Installation

1. Backend: cd backend && npm install && npm start

2. Frontend: cd frontend && npm install && npm run dev

3. Configuration: Add your GEMINI_API_KEY to the /backend/.env file.

---

## 🛠️ Technologies Used

### ⚙️ App Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express 
- **AI Model**: Google Gemini 2.5 Flash
- **Deployment**: Render (backend), Vercel (frontend)

### 🕸️ Agentic System Architecture

1. **Human-in-the-Loop (HITL)**: Engineering oversight, code approval, and a no-trust verification policy to ensure safety and accuracy.
2. **Gemini**: Strategic Consultant for research, architecture structure, and rapid troubleshooting. Context management to distill agent prompts for clearer instructions.
3. **Cursor Integrated Agent:** Multi-model code generation utilizing "ask-before-act" directives with strict guardrails.
4. **Google AI Overview / AI Mode**: Secondary consultant for verification, cross-referencing, and hallucination mitigation.









