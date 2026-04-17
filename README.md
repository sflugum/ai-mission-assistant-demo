# AI Mission Assistant

AI-first agentic orchestration system that converts ambiguous natural language into structured, schema-validated JSON using LLM-driven workflow design, prompt decomposition, and validation layers.

Built as a rapid AI-first software prototype exploring how far **LLM-driven development can replace traditional deterministic application logic**.

Live Demo: https://ai-mission-assistant-demo.vercel.app
Backend: https://ai-mission-assistant-demo.onrender.com

---

## 🚀 Problem → Approach

Modern natural language input is inherently ambiguous and non-deterministic, making it unreliable for downstream system use without structure.

This system treats that ambiguity as a first-class constraint and resolves it through:
- prompt decomposition
- schema-constrained generation
- validation + correction loops
- structured orchestration design

Goal: turn unstructured intent into **reliable machine-executable output**.

---

## 🧠 System Architecture (AI Orchestration Model)

User Input  
→ Intent Interpretation (Prompt Decomposition Layer)  
→ LLM Execution (Gemini 2.5 Flash)  
→ Structured JSON Generation  
→ Schema Validation Layer  
→ Correction / Re-prompt Loop (if invalid)  
→ Final Output

### Key Design Principle:
The LLM is treated as a **probabilistic execution engine**, not a deterministic logic layer.

The backend functions as an **AI orchestration boundary** responsible for:
- structuring ambiguous inputs into constrained prompts
- enforcing schema compliance on outputs
- detecting invalid or partial model responses
- triggering re-generation or correction flows when needed

---

## ⚙️ Stack (AI-First System Design)

- Frontend: React (Vite), Tailwind CSS
- Backend: Node.js, Express (Orchestration Layer)
- AI Model: Google Gemini 2.5 Flash
- Pattern: LLM-as-core-logic with validation guardrails
- Deployment: [Vercel / Render]

---

## 🔑 Key Engineering Decisions (What Was Actually Built)

- **Prompt-as-architecture design:** system behavior defined through structured prompt decomposition rather than hardcoded business logic
- **Schema-constrained generation:** ensures LLM outputs are structurally valid for downstream consumption
- **Validation + correction loop:** treats model output as untrusted input requiring enforcement and recovery
- **Orchestration boundary separation:** isolates AI reasoning layer from UI and transport logic
- **Iterative prompt refinement loop:** generate → test → evaluate failure modes → refine prompts/schemas

---

## ⚖️ Failure Modes & Non-Deterministic Behavior Handling

This system explicitly accounts for LLM unpredictability:

- **Schema drift:** mitigated via strict validation layer and rejection logic
- **Ambiguity collapse:** resolved through prompt decomposition before model execution
- **Hallucinated or partial outputs:** handled via validation failure detection and re-prompting
- **Inconsistent formatting:** normalized through structured output enforcement
- **Model dependency risk:** external API constraints treated as part of system design

Core principle:  
**All LLM outputs are treated as untrusted inputs.**

---

## 🧪 Agentic / AI-First Capabilities Demonstrated

- Natural language → structured system instruction transformation
- Prompt decomposition into executable sub-intents
- AI-driven workflow orchestration pattern (non-rule-based logic)
- Validation-driven correction loops for unreliable outputs
- Rapid iteration of system behavior through prompt and schema evolution

---

## 🔁 Development Model (IRAD-Style Iteration)

Built using an AI-first iterative loop:

Generate → Test → Observe failure modes → Adjust prompts/schemas → Re-run

No reliance on traditional linear feature development; system behavior evolves through continuous prompt and constraint tuning.

---

## 📌 What This Demonstrates 

- AI-first software design (LLM as primary development medium)
- Agentic system thinking (decomposition + orchestration + correction loops)
- Strong judgment around non-deterministic system behavior
- Rapid prototyping under ambiguity and undefined requirements
- Production-aware handling of probabilistic execution systems