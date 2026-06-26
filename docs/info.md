# CivicHero Technical Architecture & Design Document

This document details the frontend architecture, system flows, design tokens, reusable component inventory, and newly established backend data layers of the **CivicHero Application**.

---

## 1. Application Directory Structure

The project conforms to a clean, component-driven, and multi-layered architectural taxomony:

```
/
├── app/                        # Next.js App Router root
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
│   ├── EvidenceCard.tsx        # Feed list element summarizing category & status
│   ├── IncidentsMapPreview.tsx # Desktop sidebar georef dashboard preview
│   ├── VerificationBar.tsx     # Co-signing incrementer enabling crowd certification
│   ├── Header.tsx              # Global application navigation bar
│   ├── Footer.tsx              # Standardized institutional footer layout
│   └── MapPlaceholder.tsx      # Shared static SVG responsive map canvas
├── lib/                        # Core utility packages and data contracts
│   ├── firebase/               # Firebase Web SDK initialization & helpers
│   │   ├── firebase.ts         # Base client config & lazy initializer
│   │   ├── firestore.ts        # Firestore helpers & error handlers
│   │   └── storage.ts          # Storage helpers & error handlers
│   ├── repositories/           # Repository Data Layer (Decoupled from UI)
│   │   ├── issueRepository.ts  # Issue, upvote, and comment CRUD operations
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
    ├── backend.md              # Technical backend implementation roadmap
    └── conventions.md          # Institutional Engineering Handbook
```

---

## 2. Reusable Component Inventory

*   **AISummaryCard** (`components/AISummaryCard.tsx`): Displays computer-vision analysis results, including a dynamic confidence score, structured category matching labels, severity analysis, and routing departments.
*   **EvidenceCard** (`components/EvidenceCard.tsx`): Highly scalable card summarizing issue titles, geographic locations, category badges, dynamic timestamps, priority indicators, and status chips.
*   **MapPlaceholder** (`components/MapPlaceholder.tsx`): A responsive, custom-styled SVG canvas with styled pins representing real geofenced coordinates. Perfect for high-fidelity offline layouts.
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
*   **IssueRepository**: Manages write/read pipelines for public concerns, appending comments, and transactional upvote counters.
*   **UserRepository**: Retrieves citizen stats, computes leaderboard ranks, and saves trust credentials.
*   **TimelineRepository**: Handles audit-log entries tracking milestone progression.
*   **AnalyticsRepository**: Compiles aggregated system performance metrics and category distributions.
*   **NotificationRepository**: Manages alerts and reads for the citizen notification trays.

### 3.2 Service Responsibilities
Services incorporate business logic, domain filters, trust calculations, and coordination of multiple repository actions:
*   **IssueService**: Powers advanced search, text parsing, and category matching.
*   **ReportService**: Guides the 5-step reporting wizard pipeline and handles asset uploads.
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

## 5. Robust Error Handling

Our unified error framework guarantees that low-level failures are caught, logged inside developer-friendly diagnostic contexts, and translated into clean human labels without compromising system safety:
*   **Firestore Errors**: Handled by `handleFirestoreError`, packing operations, routes, and auth states into serializable JSON payloads.
*   **Storage Errors**: Handled by `handleStorageError` detailing upload and file format issues.
*   **Service & AI Failures**: Gracefully logs developer warnings and falls back to robust, cached local data if environment credentials (e.g. `GEMINI_API_KEY`) are temporarily missing, keeping the frontend stable.

---

## 6. Future Backend Milestones

*   **Milestone 2.1 (Google Maps API)**: Activate live coordinates mapping, reverse address lookup, and vector clustering.
*   **Milestone 2.2 (Gemini Server-side Routes)**: Wire base64 photo scans directly to `gemini-3.5-flash` API routes.
*   **Milestone 2.3 (Firebase Active Collections)**: Swap in-memory state fallbacks with real-time Firestore collection references.
*   **Milestone 2.4 (Security Audit)**: Deploy and dry-run `firestore.rules` using the Red-Team test suite.
