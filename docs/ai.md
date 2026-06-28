# CivicHero AI Integration & Router

CivicHero is an AI-native civic operating system. We do not use chatbots. AI exists purely to strengthen transparency, accountability, and automated decision-making.

## Centralized AI Router & Fallback Strategy

To optimize cost, speed, and reliability, all AI agents route requests through a unified model gateway that executes a sequential fallback order:

1. **Gemini 2.5 Flash Lite** (`gemini-2.5-flash-lite`): Fast, lightweight, low-cost baseline model for parsing and structured classifications.
2. **Gemini 2.5 Flash** (`gemini-2.5-flash`): Balanced model with exceptional speed and deep context capabilities.
3. **Gemini 2.5 Pro** (`gemini-2.5-pro`): High-tier model for resolving complex geocoding mismatches and deep operational brief alignments.
4. **Nemotron Nano VL** (`nemotron-nano-vl`): Edge-compatible local fallbacks where available.
5. **Graceful Failures**: A robust mock generator takes over to yield a clean operational schema if downstream APIs are throttled or keys are omitted, ensuring the core platform never crashes.

*The model selection occurs dynamically server-side, and no UI components are aware of which model specifically fulfilled the request.*

---

## Event-Driven Orchestration Model

Current AI execution is event-driven to preserve API quota:

- **Citizen Browsing / Feed Scrolling**: No AI.
- **Opening Existing Issue / Reading Timelines**: No AI (uses Firestore cached data).
- **Administrator Browsing / Maps**: No AI (uses Firestore cached data).
- **Status Updates**: No AI.

### Trigger Vectors
- **New Report Submission**: Triggered exactly once during submission.
- **Explicit "Generate Operational Briefing"**: Triggered on-demand by the Administrator.
- **Moderator Integrity Review**: Triggered manually on demand.
- **Manual AI Refresh**: Triggered via UI buttons.

---

## AI Agents

### 1. Community Intelligence Agent
Activates when a citizen submits a report.
- **Function**: Analyzes report titles, descriptions, and images to determine the actual category, severity (urgency), and target routing department.
- **Endpoint**: `/api/ai/community-intelligence`

### 2. Administrator Copilot
Assists Mission Control in the administrative dashboard.
- **Function**: Generates real-time operational briefings, priority queues, and department recommendations based on the active issue database. It also identifies emerging geographic hotspots with geospatial awareness.
- **Endpoint**: `/api/ai/administrator-copilot`
- **Trigger**: Click-to-generate manually from the "Administrator AI Copilot" tab.

### 3. Community Integrity Agent
Ensures reporting quality and prevents spam.
- **Function**: Validates the authenticity of a report, assesses language tone, and provides a confidence score.
- **Endpoint**: `/api/ai/community-integrity`

---

## Architecture & Credentials
- All AI calls are strictly server-side using the `@google/genai` SDK.
- The `AIOrchestrator` handles prompt execution and forced JSON structure via the Gemini `responseSchema` configuration.
- The platform uses a custom API Key provided through the environment via `GEMINI_API_KEY` or `APP_GEMINI_API_KEY`.
