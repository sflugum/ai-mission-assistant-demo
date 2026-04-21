# Reverse Prompt Case Study
## AI Mission Assistant


I saw the **job post**, then hit the keyboard, tapping. **Five hours** later, I had a ***fully functional prototype.***

The job description became my **client**, and my first move was treating it like one.

I fed the post to *GPT-4* to extract and synthesize requirements, then used those to prompt ~~**Claude Sonnet 4.6*~~ to produce a tight PRD. That doc launched my Cursor project.

From there, I orchestrated an **agentic system** with specialized AI roles:

**GPT-4** → primary consultant: high-level research, strategic logic  
**Google AI** → verification layer: bias reduction, hallucination mitigation  
**Cursor** agent → execution: parallel AI models, ask-before-act mode  

**Three** models. ***One*** system. An *AI Mission Assistant*, built between dinner and bedtime.

***Honorable Mention**: Claude Sonnet 4.6 was initially used as a secondary consultant, but replaced by Google AI Overview / AI Mode after PRD completion due to performance constraints. 👾

---

## 📸 Demo / Gif

📺 **Live Demo**: https://ai-mission-assistant-demo.vercel.app
Backend: https://ai-mission-assistant-demo.onrender.com

<img width="50%" alt="ai-mission-demo" src="https://github.com/user-attachments/assets/05bb73ed-18c7-4895-b254-e5ec998e7c9f" />

---

⚠️ Backend logic currently consolidated into a single service file; refactoring in progress to modularize architecture for scalability and maintainability.

## ⚡ Key Features

-   **Instant Concept to Motion:** AI Mission Assistant takes your vague ideas and transforms them into structured, actionable plans.
-   **Structured IRAD Analysis:** Instantly generates three critical pillars using an Internal Research and Development (IRAD) approach: **Action Plan**, **Risks**, and **Tools**.
-   **Google Studio AI Powered:** Delivers comprehensive, AI-curated output for rapid decision-making using the latest Gemini models.

---

## 🛠️ Technologies Used

### ⚙️ App Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Node.js, Express 
- **AI Model**: Google Gemini 2.5 Flash
- **Deployment**: Render (backend), Vercel (frontend)

### 🕸️ Agentic System Architecture

1. **Human-in-the-Loop (HITL)**: Engineering oversight, code approval, and a no-trust verification policy to ensure safety and accuracy.
2. **GPT-4**: Strategic Consultant for research, architecture structure, and rapid troubleshooting. Context management to distill agent prompts for clearer instructions.
3. **Cursor Integrated Agent:** Multi-model code generation utilizing "ask-before-act" directives with strict guardrails.
4. **Google AI Overview / AI Mode**: Secondary consultant for verification, cross-referencing, and hallucination mitigation.

---

## 🌵 Issues Encountered / Lessons Learned 💡

- Cursor agent automatically retried API calls when failure occurred. This caused limit issues with free API being used.
    - Moving forward, I will ensure agent is instructed to pause after failure, report finding, and require my input to proceed.
- Variable mismatch between 'plan' and 'actionPlan' occurred during API build and affected JSON responses.
    - Paused to complete full app 'migration' to ensure only 'actionplan' appears on both ends.
    - Need to ensure agent has strict variable naming protocol to prevent future issues.
- Needed to switch API AI model due to high traffic
    - Will ensure the agent is instructed to keep API configuration modular so it can be easily changed  

---

## 💻 Running AI Mission Assistant Locally

### Prerequisites
- Node.js: v18.0.0 or higher
- npm: v9.0.0 or higher

**1. ⌛ Installation**
Clone the repository and install all dependencies for both frontend and backend.

```Bash
git clone https://github.com/sflugum/ai-mission-assistant-demo
cd ai-mission-assistant-demo

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

**2. 🧱 Environment Configuration**
Navigate to the backend directory and set up your environment variables.
```Bash
cd backend
cp .env.example .env
```

**3. 🎬 Running the Application**
Two separate terminal windows are needed to run the full-stack suite

### Terminal 1 (Backend)
```Bash
cd backend
npm start
```
*Running on: http://localhost:3001*

### Terminal 2 (Frontend)
```Bash
cd frontend
npm run dev
```
*Running on: http://localhost:5173*

---

## 📡 API & Proxy Architecture
The frontend uses a Vite development proxy. 
All requests made to /analyze on the frontend are automatically routed to the backend at http://localhost:3001/analyze, eliminating CORS issues during development.








