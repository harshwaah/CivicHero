# CivicHero - Civic Engagement & Neighborhood Verification Portal

CivicHero is a high-fidelity, highly polished, next-generation civic engagement portal where citizens can capture, verify, and track neighborhood infrastructure concerns. This application empowers local agency by mapping local crowd-vetted reports directly into municipal public works queues.

This workspace represents the completion of **Phase 8.2 (Configuration Migration & Secret Hardening)**, establishing a centralized configuration single source of truth, isolating server-side secrets, and eliminating legacy configuration artifacts.

---

## 1. Project Directory Structure

```
/
├── app/                        # Next.js App Router (pages and routing)
│   ├── admin/                  # Mission Control Admin dashboard & controls
│   ├── api/                    # Server-side API Routes (AI orchestrators, diagnostics, sync)
│   ├── citizen/                # Citizen Workspace views and portals
│   ├── diagnostics/            # Live platform configuration & subsystem verification
│   ├── layout.tsx              # HTML root layout & font loading
│   └── page.tsx                # Public Landings & Hero entrypoints
├── components/                 # Shareable UI atomic React components
├── docs/                       # Architectural design manuals & guides
│   ├── info.md                 # Technical system manual (Architecture, files, structures)
│   ├── security.md             # Security audit & configuration hardening manual
│   ├── setup.md                # Developer platform setup guide (Canonical env, diagnostics)
│   ├── backend.md              # Backend implementation guide (Firestore, Storage, Maps, Gemini)
│   ├── maps.md                 # Google Maps Platform implementation & architecture manual
│   ├── firestore.md            # Persistence, lifecycles, and decoupled upload manuals
│   └── conventions.md          # Institutional Engineering Handbook
├── lib/                        # Core utility packages and data contracts
│   ├── config/                 # Centralized Configuration & Environment Validation
│   │   ├── index.ts            # Canonical single source of truth for all subsystems
│   │   └── validation.ts       # Non-crashing diagnostic validation utility
│   ├── firebase/               # Firebase Web SDK configurations & Firestore helpers
│   ├── repositories/           # Decoupled Repository Data Access Layer
│   ├── services/               # Service Business Logic Layer
│   ├── providers/              # AI Provider & Map Provider Context Layers
│   ├── ai-server/              # Server-side AI Multi-Model Orchestration Engine
│   ├── models.ts               # Centralized Canonical Data Models
│   ├── designTokens.ts         # Visual constants (radii, colors, shadows)
│   ├── animations.ts           # Framer Motion transitions and variants
│   ├── helpers.ts              # Formatting functions and styling maps
│   ├── mockData.ts             # Shared presets, categories, and stages mock registry
│   └── mockReports.ts          # Structured mock database records
└── public/                     # Static vector assets and illustrations
```

---

## 2. Centralized Configuration & Environment Architecture

All configuration is strictly governed through `/lib/config/index.ts`. Secrets and public variables are validated through non-crashing diagnostic helpers.

### Canonical Environment Variables

```env
# ==============================================================================
# CivicHero Canonical Environment Configuration
# ==============================================================================

# --- Firebase Web SDK (Client-Side Public) ---
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_DATABASE_ID=(default)

# --- Google Maps Platform (Client-Side Public) ---
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# --- AI & Intelligence Services (Server-Side Confidential Secrets) ---
GEMINI_API_KEY=
NEMOTRON_API_KEY=
COPILOT_TTL_MS=900000
```

### Deterministic Fallback Hierarchy
- **Firebase / Firestore**: When environment credentials are missing or invalid, the data layer transparently falls back to in-memory datasets (`data_backup.json` / `mockReports.ts`) with zero application crashes.
- **Google Maps Platform**: Falls back to an informative vector placeholder with full pan/zoom state simulation if the API key is not supplied.
- **AI Orchestrator**: Uses multi-model fallback across Gemini 3.1 Flash Lite -> Gemini 3.5 Flash -> Gemini 2.5 Pro -> Nemotron Nano VL -> deterministic local semantic simulation stubs.
- **Client Bundle Isolation**: Zero `@google/genai` imports exist in client-side bundles; all inferences are proxied exclusively through server-side `/api/ai/*` routes.

---

## 3. Architecture Overview

Phase 2 introduces a robust, n-tier decoupled data layer. By separating database calls from the visual UI, the application can switch between in-memory mock data and real-time live databases seamlessly, with **zero changes required to UI components**.

```
[UI Views] ──► [Service Layer] ──► [Repository Layer] ──► [Firebase SDK]
```

### 3.1 Repository Layer (`lib/repositories/`)
Exposes asynchronous data contracts and executes raw queries against Firestore or local fallback caches:
*   **IssueRepository**: Creating reports, adding comments, and managing transactional upvote triggers.
*   **UserRepository**: Querying citizen profile details and generating leaderboards.
*   **TimelineRepository**: Logging milestone progression audit events.
*   **AnalyticsRepository**: Aggregating city-wide resolution metrics and category charts.
*   **NotificationRepository**: Storing and marking user notifications as read.

### 3.2 Service Layer (`lib/services/`)
Encapsulates business rules, trust rating equations, address coordinate geocoding, and transaction coordinators:
*   **IssueService**: Search keyword matching, filtering, and detail extraction.
*   **ReportService**: Submission validation and wizard coordination.
*   **TimelineService**: Transitioning incident milestone checkpoints.
*   **TrustService**: Computing citizen trust scores and applying upvote/flag ratios.
*   **MapService**: Extracting map pinpoint geolocations.

### 3.3 Provider & Context Layer (`lib/providers/`)
Hosts central context bindings for maps and AI agents:
*   **MapProvider**: Abstracts script bootloaders and exports a polymorphic `<CivicMap>` component.
*   **AIProvider**: Packs and distributes our 4 specialized intelligence stubs:
    *   `GeminiProvider`: Image scanning and computer-vision classification.
    *   `CommunityIntelligenceAgent`: Macro hotspot identification and cluster recommendations.
    *   `AdministratorCopilot`: Admin work order drafts and automated citizen newsletters.
    *   `CommunityIntegrityAgent`: Anti-abuse content analysis and spam detection.

---

## 4. Development Workflow

### Prerequisites
*   Node.js (v18+)
*   npm

### Run local dev server
1. Clone the project workspace.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the local dev server:
   ```bash
   npm run dev
   ```
4. Access the server at [http://localhost:3000](http://localhost:3000).

---

## 5. Upcoming Implementation Roadmaps

*   **Phase 8.1 (Secret & Configuration Audit) [COMPLETED]**: Comprehensive read-only audit of all secrets, environment parameters, duplicate initialization logic, and git-exposure surfaces. Documented in `docs/security.md` and `CHANGELOG.md`.
*   **Phase 8.2 (Configuration Migration & Secret Hardening) [PLANNED]**: Centralize all environment parameters, decouple client code from SDK secrets, remove inline configuration redundancies, and sanitize console output.
*   **Phase 6 (AI-Native Integration) [COMPLETED]**: Replaced generic AI stubs with fully autonomous AI agents (Community Intelligence, Administrator Copilot, Community Integrity) leveraging the server-side `@google/genai` SDK and Gemini 3.5. Automated urgency classification, department routing, and heatmap generation are now driven by AI.
*   **Phase 5 (Google Maps Platform Integration) [COMPLETED]**: Replaced all map placeholder components with fully interactive, unified Google Maps, supporting user geolocations, real-time spatial heatmaps via deck.gl, clustered markers, custom priority styling, and interactive report point selection.
*   **Phase 2.3 (Cloud Persistence) [COMPLETED]**: Hooked all Repository methods directly into live Firestore collections and set up real-time `onSnapshot` collections synchronization.
