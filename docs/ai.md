# CivicHero AI Integration

CivicHero is an AI-native civic operating system. We do not use chatbots. AI exists purely to strengthen transparency, accountability, and automated decision-making.

## AI Agents

### 1. Community Intelligence Agent
Activates when a citizen submits a report.
- **Function**: Analyzes report titles, descriptions, and images to determine the actual category, severity (urgency), and target routing department.
- **Integration**: Triggers in the background after a report is saved to Firestore. 
- **Endpoint**: `/api/ai/community-intelligence`

### 2. Administrator Copilot
Assists Mission Control in the administrative dashboard.
- **Function**: Generates real-time operational briefings, priority queues, and department recommendations based on the active issue database. It also identifies emerging geographic hotspots with geospatial awareness.
- **Integration**: Triggered automatically in `app/admin/page.tsx` via the IssueService subscription.
- **Endpoint**: `/api/ai/administrator-copilot`

### 3. Community Integrity Agent
Ensures reporting quality and prevents spam.
- **Function**: Validates the authenticity of a report, assesses language tone, and provides a confidence score.
- **Integration**: Triggers alongside the Intelligence Agent upon report creation.
- **Endpoint**: `/api/ai/community-integrity`

## Architecture
- All AI calls are strictly server-side using the `@google/genai` SDK.
- The `AIOrchestrator` handles prompt execution and forced JSON structure via the Gemini `responseSchema` configuration.
- The platform uses a custom API Key provided through the environment via `GEMINI_API_KEY`.
