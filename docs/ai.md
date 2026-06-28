# CivicHero AI Integration & Router

CivicHero is an AI-native civic operating system. We do not use chatbots. AI exists purely to strengthen transparency, accountability, and automated decision-making.

## Centralized AI Router & Fallback Strategy

To optimize cost, speed, and reliability, all AI agents route requests through a unified model gateway that executes a sequential fallback order:

1. **Gemini Flash Lite** (`gemini-3.1-flash-lite`): Fast, lightweight, low-cost baseline model for parsing and structured classifications.
2. **Gemini Flash** (`gemini-3.5-flash`): Balanced model with exceptional speed and deep context capabilities.
3. **Gemini Pro** (`gemini-2.5-pro` / `gemini-1.5-pro`): High-tier model for resolving complex geocoding mismatches and deep operational brief alignments.
4. **Nemotron Nano VL** (`nemotron-nano-vl`): Edge-compatible local fallbacks where available.
5. **Graceful Failures**: A robust mock generator (`getGracefulFallback`) takes over to yield a clean operational schema if downstream APIs are throttled or keys are omitted, ensuring the core platform never crashes.

### Dynamic Key Verification & Provider Skipping
* To eliminate latency and prevent timeout errors, the AI Router dynamically inspects environment keys at runtime:
  - If `GEMINI_API_KEY` (or `APP_GEMINI_API_KEY`) is absent, Gemini models are skipped instantly.
  - If `NEMOTRON_API_KEY` (or OpenRouter/NVIDIA API fallback keys) is absent, Nemotron models are skipped instantly.
  - If all keys are absent, the router directly invokes `getGracefulFallback` in 0ms, safeguarding the dashboard and report creation states.

---

## Event-Driven Orchestration Model & Cached Briefings

CivicHero minimizes continuous background API polling through a smart, cached briefing model:

- **Cached Briefings**: The Administrator Copilot reads the operational briefing from Firestore/Server Memory.
- **Cache TTL**: Configurable via `COPILOT_TTL_MS` (default is **15 minutes**). Dashboard loads within the TTL window hit the cache and make **zero** external Gemini calls.
- **Event-Driven Invalidation**: The cache document is automatically flagged as `invalidated: true` when:
  - A citizen submits a new report (via `IssueRepository.create`).
  - A critical-level issue changes state/status (via `IssueRepository.update`).
- **Forced Regeneration**: On invalidation or when an administrator explicitly clicks the **"Refresh Briefing"** button, the next fetch triggers the AI Router, generates an updated brief, and updates the cache.

---

## Background Upload Pipeline Lifecycle

To deliver a friction-free citizen submission workflow, CivicHero decouples image uploads from report generation:

1. **Immediate Parallelization**: When a citizen captures/selects an image, the upload to Firebase Storage begins **immediately** in the background while the user continues to:
   - Choose a category
   - Select urgency level
   - Set the GPS location coordinates
   - Fill in description/title
2. **Non-Blocking Flow**: The citizen never blocks waiting for a slow upload step on final submission.
3. **Smart Awaiting**: When "Submit" is pressed, if the upload is already complete, the pipeline starts the Integrity/Intelligence Agents instantly. If the upload is still completing, the pipeline elegantly awaits the background promise with friendly progress indicators.

---

## Citizen Mode vs. Developer Mode Logging

CivicHero separates engineering telemetry from beautiful citizen-facing UI experiences:

- **Citizen Mode (Default)**: All technical lingo (e.g., `[STORAGE]`, `[LEDGER]`, `[AI_INTEGRITY]`) is replaced with friendly, community-focused messages (e.g., "Uploading your photo...", "Securing your report details...").
- **Developer Mode**: Enabled by setting `localStorage.setItem('developer_mode', 'true')`. When active, detailed developer-level logs are appended in the scanning terminal on screen.
- **Console Logs**: The full technical logging output is always streamed to the browser console for developer convenience.

---

## AI Agents

### 1. Community Intelligence Agent
- **Endpoint**: `/api/ai/community-intelligence`
- **Function**: Classifies category, severity, and target department.

### 2. Administrator Copilot
- **Endpoint**: `/api/ai/administrator-copilot`
- **Function**: Aggregates operational briefs, priority recommendations, and geographical hotspots.

### 3. Community Integrity Agent
- **Endpoint**: `/api/ai/community-integrity`
- **Function**: Validates safety, authenticity, and tone scores.
