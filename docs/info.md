# CivicHero Technical Architecture & Design Document

This document details the frontend architecture, system flows, design tokens, reusable component inventory, and newly established backend data layers of the **CivicHero Application**.

---

## 1. Application Directory Structure

The project conforms to a clean, component-driven, and multi-layered architectural taxonomy:

```
/
├── app/                        # Next.js App Router root
│   ├── admin/                  # Mission Control Admin dashboard & controls
│   ├── citizen/                # Citizen Portal layout & workspace
│   │   ├── issues/             # Browse & inspection dynamic subroutes
│   │   │   └── [id]/           # Dynamic Issue view
│   │   │       ├── page.tsx    # Interactive Issue Detail (AISummary, verification)
│   │   │       └── timeline/   # Progressive stage verification ledger (8 Stages)
│   │   ├── report/             # Step-by-step incident reporting flow
│   │   │   └── page.tsx        # Multi-step state-preserving wizard (autofills, scanner)
│   │   ├── globals.css         # Core Tailwind CSS variables & glassmorphic styles
│   │   ├── layout.tsx          # HTML wrapper / font injection (Inter, Space Grotesk, Mono)
│   │   └── page.tsx            # Citizen Portal Feed entrypoint (spotlights, category filter)
│   └── page.tsx                # CivicHero Platform Hero Landing page
├── components/                 # Shareable UI atomic React components
│   ├── AISummaryCard.tsx       # Computer-vision diagnostic results block
│   ├── CitizenFeed.tsx         # Scrolling incident feeds with expandable search
│   ├── CitizenNav.tsx          # Mobile (Bottom-glass) & Desktop (Left-rail) navigation
│   ├── ClusteredMarkers.tsx    # Google Maps clustered markers engine
│   ├── DeckGlOverlay.tsx       # WebGL dynamic heatmap layer
│   ├── EvidenceCard.tsx        # Feed list element summarizing category & status
│   ├── IncidentsMapPreview.tsx # Desktop sidebar georef dashboard preview
│   ├── VerificationBar.tsx     # Co-signing incrementer enabling crowd certification
│   ├── Header.tsx              # Global application navigation bar
│   ├── Footer.tsx              # Standardized institutional footer layout
│   └── MapPlaceholder.tsx      # Shared static SVG responsive map canvas (Deprecated)
├── lib/                        # Core utility packages and data contracts
│   ├── config/                 # Centralized Configuration Hub & Validation
│   │   ├── index.ts            # Canonical single source of truth for all subsystems
│   │   └── validation.ts       # Non-crashing environment validation utility
│   ├── firebase/               # Firebase Web SDK initialization & helpers
│   │   ├── firebase.ts         # Base client config & lazy initializer
│   │   ├── firestore.ts        # Firestore helpers & error handlers
│   │   └── storage.ts          # Storage helpers & error handlers
│   ├── repositories/           # Repository Data Layer (Decoupled from UI)
│   │   ├── issueRepository.ts  # Issue, upvote, and comment CRUD operations (and Copilot invalidation)
│   │   ├── userRepository.ts   # User profile and leaderboards
│   │   ├── timelineRepository.ts # Milestone checkpoints logging
│   │   ├── analyticsRepository.ts # City-wide metrics & charts
│   │   └── notificationRepository.ts # Alert notifications and inbox
│   ├── services/               # Service Business Logic Layer
│   │   ├── issueService.ts     # Advanced listings, search matching, comments
│   │   ├── reportService.ts    # Wizard submission coordinator
│   │   ├── timelineService.ts  # Milestone lifecycle management
│   │   ├── trustService.ts     # Trust rating calculation, upvotes, flags
│   │   └── mapService.ts       # Coordinate cluster mapping
│   ├── providers/              # Provider and Context abstraction layers
│   │   ├── ai/                 # Custom Agent Providers & stubs
│   │   │   ├── aiProvider.tsx  # Centralized AI React context
│   │   │   ├── geminiProvider.ts # Low-level Gemini proxy
│   │   │   ├── communityIntelligenceAgent.ts # Macro-trend clustering
│   │   │   ├── administratorCopilot.ts # Admin work-order drafter
│   │   │   └── communityIntegrityAgent.ts # Abuse/spam inspector
│   │   └── maps/               # Location Abstraction layers
│   │       └── mapProvider.tsx # Google Maps dynamic script loaders
│   ├── models.ts               # Centralized canonical TypeScript interfaces
│   ├── designTokens.ts         # Centralized visual constants (radii, colors, shadows)
│   ├── animations.ts           # Centralized Framer Motion transition variants
│   ├── helpers.ts              # Centralized reusable formatters & mapping rules
│   ├── mockData.ts             # Centralized mock lists, categories, presets
│   ├── mockReports.ts          # Structured mock database records
│   └── utils.ts                # Tailwind merging configuration helpers
└── docs/                       # Architectural design document manuals
    ├── info.md                 # [THIS FILE] Technical system manual
    ├── ai.md                   # AI architecture, Fallbacks & Router manual
    ├── performance.md          # Technical performance optimization handbook
    ├── maps.md                 # Google Maps Platform implementation manual
    └── conventions.md          # Institutional Engineering Handbook
```

---

## 2. Reusable Component Inventory

*   **AISummaryCard** (`components/AISummaryCard.tsx`): Displays computer-vision analysis results, including a dynamic confidence score, structured category matching labels, severity analysis, and routing departments.
*   **EvidenceCard** (`components/EvidenceCard.tsx`): Highly scalable card summarizing issue titles, geographic locations, category badges, dynamic timestamps, priority indicators, and status chips.
*   **CivicMap** (`lib/providers/maps/mapProvider.tsx`): Unified, high-fidelity responsive Google Map wrapper. Supports custom-colored pins, marker clustering via `@googlemaps/markerclusterer`, dynamic user geolocations, map style selections, and custom touch interactions.
*   **DeckGlOverlay** (`components/DeckGlOverlay.tsx`): Dynamic WebGL-based heatmap rendering layer using `@deck.gl/google-maps`. Maps real-time hotspot clusters based on issue category, severity, and upvote engagement levels.
*   **ClusteredMarkers** (`components/ClusteredMarkers.tsx`): Combines multiple individual incident nodes into unified, zoom-adaptive cluster objects to optimize rendering performance.
*   **VerificationBar** (`components/VerificationBar.tsx`): A community co-signing tool with state managers allowing local residents to upvote report accuracy, flag resolved issues, and register reports.
*   **CitizenNav** (`components/CitizenNav.tsx`): Polymorphic navigation that dynamically switches between a glass bottom-bar on mobile viewports and a clean, responsive left-side rail on desktop screens.

---

## 3. Data Layers & Responsibilities

To ensure maximum scalability and clean testing boundaries, CivicHero implements an n-tier data separation architecture:

```
[UI Components] ──► [Service Layer] ──► [Repository Layer] ──► [Firebase / Firestore]
```

### 3.1 Repository Responsibilities
Repositories handle direct database queries and CRUD updates, converting database documents into canonical data models:
*   **IssueRepository**: Manages write/read pipelines for public concerns, appending comments, transactional upvote counters, and event-driven invalidation of AI briefings.
*   **UserRepository**: Retrieves citizen stats, computes leaderboard ranks, and saves trust credentials.
*   **TimelineRepository**: Handles audit-log entries tracking milestone progression.
*   **AnalyticsRepository**: Compiles aggregated system performance metrics and category distributions.
*   **NotificationRepository**: Manages alerts and reads for the citizen notification trays.

### 3.2 Service Responsibilities
Services incorporate business logic, domain filters, trust calculations, and coordination of multiple repository actions:
*   **IssueService**: Powers advanced search, text parsing, and category matching.
*   **ReportService**: Guides the 5-step reporting wizard pipeline and coordinates the asynchronous upload process.
*   **TimelineService**: Manages workflow status transitions.
*   **TrustService**: Incorporates trust weighting formulas into upvote co-signings and registers disputes.
*   **MapService**: Formulates coordinates for clustering.

### 3.3 Provider Responsibilities
Providers register React states and third-party script configurations globally:
*   **MapProvider**: Abstracts the Google Maps SDK bootstrap.
*   **AIProvider**: Packs and exposes custom AI Agents (GeminiProvider, CommunityIntelligenceAgent, AdministratorCopilot, CommunityIntegrityAgent) safely.

---

## 4. Canonical Data Models

Centralized in `lib/models.ts`:
*   `Issue`: Canonical incident details.
*   `TimelineEvent`: Chronological verification ledger item.
*   `Comment`: Neighbor feedback response.
*   `Verification`: Community co-signing audit log.
*   `Citizen`: User profile, completed reports, and Trust rating.
*   `Department`: Municipal division assigned to address concerns.
*   `TrustMetrics`: Verification progress and upvote integrity stats.
*   `AIAnalysis`: Computer vision outputs.
*   `Notification`: User status updates and inbox items.
*   `MapMarker`: Map pinpoint.

---

## 5. Robust Error Handling & Performance-Grade Routing

Our unified error framework guarantees that low-level failures are caught, logged inside developer-friendly diagnostic contexts, and translated into clean human labels without compromising system safety:
*   **Firestore Errors**: Handled by `handleFirestoreError`, packing operations, routes, and auth states into serializable JSON payloads.
*   **Storage Errors**: Handled by `handleStorageError` detailing upload and file format issues.
*   **AI Routing Failures**: Handled by our dynamic provider-skipping router. If critical API keys (e.g. `GEMINI_API_KEY` or `NEMOTRON_API_KEY`) are omitted in the workspace settings, the gateway bypasses network requests immediately and redirects directly to `getGracefulFallback`, safeguarding form operations and dashboard render cycles.

---

## 6. Future Backend Milestones

*   **Milestone 2.1 (Google Maps API)**: Activate live coordinates mapping, reverse address lookup, and vector clustering. (COMPLETED)
*   **Milestone 2.2 (Gemini Server-side Routes)**: Wire base64 photo scans directly to `gemini-3.5-flash` API routes. (COMPLETED)
*   **Milestone 2.3 (Firebase Active Collections)**: Swap in-memory state fallbacks with real-time Firestore collection references. (COMPLETED)
*   **Milestone 2.4 (Security Audit)**: Deploy and dry-run `firestore.rules` using the Red-Team test suite. (COMPLETED)

---

## 7. Mission Control (Administrator) Architecture

The CivicHero Administrator Portal ("Mission Control") operates alongside the Citizen Portal to provide a comprehensive management interface for municipal operations. 

### 7.1 Shared Synchronization Flow
CivicHero is built on the philosophy of "Trust Through Transparency." The Citizen application and the Administrator Portal are not separate applications; they are two interfaces connected to the exact same shared data models.
*   **One Source of Truth**: When an administrator performs an action (e.g., assigning a department, updating a status), the `IssueService` updates the repository. This state change is instantly available to the Citizen UI.
*   **Automated Transparency**: Administrative actions automatically append entries to the timeline via the `TimelineService`. Citizens immediately see these events (e.g., "Work Started").

### 7.2 Administrator Workflow & Cached Operational Briefings
*   **AI Copilot & Analytics**: Empowers administrators with AI-generated work drafts, geographic hotspot detection, resource forecasting, and live civic trust indices.
*   **Cached Intelligence Gateway**: To preserve rate-limits and eliminate continuous background Gemini polling, the dashboard reads briefings from a cached Firestore document.
*   **Configurable TTL**: A cached briefing expires based on `process.env.COPILOT_TTL_MS` (defaulting to 15 minutes).
*   **Automated Invalidations**: Any new citizen report creation or critical-level status modification invalidates the active cache, forcing a refresh of the briefings on the next request.
*   **Manual On-Demand Refresh**: Administrators can trigger manual briefing generation via the on-screen **"Refresh Briefing"** button, instantly bypassing active caches and updating Firestore.

---

## 8. Secret & Configuration Architecture (Phase 8.2 Hardened)

As implemented in Phase 8.2, CivicHero enforces strict boundaries between public client identifiers and private server-side secrets via a centralized configuration layer (`lib/config/index.ts`).

### 8.1 Centralized Access Tier Distribution
*   **Client-Accessible Identifiers (`NEXT_PUBLIC_*`)**:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`: Browser Firebase SDK initialization.
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: Cloud Firestore and Storage scoping.
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: Firebase Authentication domain.
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: Asset persistence bucket.
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` & `NEXT_PUBLIC_FIREBASE_APP_ID`: Firebase project telemetry.
    *   `NEXT_PUBLIC_FIREBASE_DATABASE_ID`: Database instance identifier (default `(default)`).
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Client-side Google Maps Platform JS SDK and deck.gl integration.
*   **Server-Side Only Confidential Secrets**:
    *   `GEMINI_API_KEY` / `APP_GEMINI_API_KEY`: Master keys for server-side Google Gen AI orchestration (`@google/genai`). Never exposed to browser or prefixed with `NEXT_PUBLIC_`.
    *   `NEMOTRON_API_KEY`: Secondary LLM inference key handled exclusively inside `/api/ai/*` server endpoints.
    *   `COPILOT_TTL_MS`: Internal cache invalidation window.

### 8.2 Architectural Invariants
1.  **Single Source of Truth**: All subsystems access configuration exclusively through `lib/config/index.ts` rather than ad-hoc `process.env` lookups or static JSON files.
2.  **Server-Side AI Gateway**: All LLM inferences are routed through Next.js App Router API endpoints (`/api/ai/*`). Zero `@google/genai` imports exist in client bundles.
3.  **Graceful Non-Crashing Fallbacks**: In the absence of live cloud credentials, all data repositories and AI routers activate deterministic simulation modes with clear diagnostic warnings.
4.  **Audit Reference**: For the complete credential mapping and hardening audit, consult `docs/security.md`.

---

## 9. Product Polish, Accessibility, and Reliability Architecture (Phase 8.3)

Phase 8.3 hardens runtime resilience, user recovery, accessibility compliance, and visual fidelity without changing business models or Firestore schemas.

### 9.1 Error Boundary Subsystem (`components/ErrorBoundary.tsx`)
- **Granular Feature Isolation**: Instead of a global error page that unmounts the entire application upon unexpected UI crashes, error boundaries are wrapped around individual tabs and functional modules (`CitizenFeed`, `CitizenNav`, `AdminOverview`, `AdminAnalytics`, `DiagnosticsGrid`, and dynamic detail views).
- **Subsystem Reset Mechanisms**: Provides users with inline "Retry" capabilities that reset local component state without requiring a full browser reload.

### 9.2 Friendly Service Recovery States (`components/RecoveryState.tsx`)
- **Subsystem-Specific Contexts**: Pre-configured recovery views for `firestore`, `storage`, `maps`, `ai`, and `general` services.
- **Actionable Diagnostics**: Displays plain-language operational guidance alongside non-destructive retry handlers and links to the system diagnostics console.

### 9.3 Category-Specific Placeholder Engine (`lib/placeholders.ts`)
- **Deterministic Offline Visuals**: Generates high-fidelity SVG data URIs tailored to specific municipal infrastructure categories (Roads, Water, Sanitation, Electrical, Safety, Parks, and Structures).
- **Zero-Network Fallback**: When external images fail to load or devices operate offline, placeholders render instantaneously without external network requests or broken image badges.

### 9.4 Global Offline Detection (`components/OfflineStatusBanner.tsx`)
- **Real-Time Network Telemetry**: Mounts top-level `online` and `offline` event listeners in `app/layout.tsx`.
- **User Continuity Feedback**: Warns users immediately when network connectivity is disrupted, confirming that pending actions are queued locally. Automatically displays a temporary positive confirmation when reconnected.

### 9.5 Safe Curated Demo State Reset (`components/SettingsPanel.tsx`)
- **Deterministic Environment Reset**: Allows developers and testers to clear tutorial flags, cached search queries, drafts, and UI preferences in a single action.
- **Production Isolation Invariant**: The reset routine explicitly targets browser `localStorage` and strictly avoids calling Firestore `deleteDoc` or mutating live database collections.

