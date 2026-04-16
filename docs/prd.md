# AI Mission Assistant — PRD

---

# 1. PRODUCT REQUIREMENTS DOCUMENT (PRD)

## 1.1 App Vision

### Problem
Users receive vague, unstructured requests (e.g. "assess this risk" or "plan this launch") and struggle to turn them into actionable steps.

### Solution
An AI-powered assistant that converts vague mission inputs into structured outputs:
- Action Plan
- Risks
- Tools

### Value
Reduces cognitive load by turning ambiguity into structured, usable plans instantly.

---

## 1.2 User Personas

### Alex — Research Analyst
- Converts vague requests into structured research plans
- Needs clarity and speed

### Jordan — Engineer
- Evaluates technical risks for systems or deployments
- Wants missing risks identified automatically

### Morgan — Program Manager
- Turns ideas into structured briefs
- Needs fast drafts for communication

---

## 1.3 Core User Stories

- User submits a vague mission request → receives structured output
- User sees risks relevant to their scenario
- Output is grouped into:
  - Action Plan
  - Risks
  - Tools
- User sees loading state during processing
- User sees error message if request fails
- Input includes example placeholder

---

## 1.4 Technical MVP Scope

### Frontend (React + Vite + Tailwind CSS)
- Single page application
- Textarea input
- Submit button
- Output sections:
  - Action Plan
  - Risks
  - Tools
- Loading state ("Analyzing...")
- Error state display

### Backend (Node.js + Express)
- Single POST endpoint: `/analyze`
- Input: `{ input: string }`
- Calls LLM API (Google AI Studio)
- Returns structured JSON

### AI Output Format (STRICT)

```json
{
  "plan": ["step 1", "step 2"],
  "risks": ["risk 1", "risk 2"],
  "tools": ["tool 1", "tool 2"]
}

### No markdown. No explanations. JSON only.

## 1.5 Out of Scope
- Authentication
- Database / persistence
- User accounts
- Multi-page routing
- Export features (PDF, etc.)
- Saving history

## 1.6 UI Requirements
- One input textarea
- One submit button labeled "Analyze"
- Three output sections:
  - Action Plan
  - Risks
  - Tools
- Loading indicator while AI processes request
- Error message on failure
## 1.7 Success Criteria
- Full input → AI → structured output flow works
- JSON output is consistent
- App works end-to-end without crashes
- Demo completes in under 1 minute
