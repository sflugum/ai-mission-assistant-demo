# DEVELOPER NOTES (BUILD GUIDE)

## 1 Stack (IMPORTANT)
- Frontend: React (Vite)
- Styling: Tailwind CSS
- Backend: Node.js + Express
- AI API: Google AI Studio


## 2 Project Structure

ai-mission-assistant/
frontend/
backend/
docs/


## 2.3 Cursor AI Workflow

### You will use Cursor to generate most code.

### Your role:
- Define structure
- Prompt AI
- Review output
- Fix issues via iteration

### Not:
- Manually writing everything

## 2.4 First Step

### Create:

docs/prd.md

### Then use this prompt:

Read docs/prd.md.

### Extract:
- features
- backend endpoints
- frontend components
- data model

## 2.5 Build Order (CRITICAL)

### Step 1 — Scaffold
Create frontend (React Vite) and backend (Express) minimal structure.

### Step 2 — Backend
Create Express server with POST /analyze.
Input: { input }
Return JSON response.

### Step 3 — AI Integration
Connect Google AI Studio API in backend.
Force output format:
{ plan: [], risks: [], tools: [] }

### Step 4 — Frontend
Create textarea + submit button.
Call backend /analyze.
Display structured response.

## 2.6 Core AI Prompt (Backend)
You are a senior analyst.

### User input:
"${input}"

Return ONLY valid JSON:

{
  "plan": [],
  "risks": [],
  "tools": []
}

No markdown. No explanation. Only JSON.

## 2.7 Iteration Strategy

### Build → test → fix → repeat

### Never spend >20 minutes stuck on one issue

### If stuck:
paste error into Cursor
ask: "fix this and explain briefly"

## 2.8 Folder Structure (FINAL)
```
ai-mission-assistant-demo/
├── frontend/
│   ├── src/
│   └── App.jsx
├── backend/
│   └── server.js
├── docs/
│   └── prd.md
```

## 2.9 Build Principle

### You are not building everything manually.

### You are:

directing AI
validating output
iterating quickly
keeping scope minimal




