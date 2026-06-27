# CivicHero - Civic Engagement & Neighborhood Verification Portal

CivicHero is a high-fidelity, highly polished, next-generation civic engagement portal where citizens can capture, verify, and track neighborhood infrastructure concerns. This application empowers local agency by mapping local crowd-vetted reports directly into municipal public works queues.

This workspace represents the completion of **Phase 2**, which establishes a production-ready, decoupled, and highly extensible backend service and repository data architecture.

---

## 1. Project Directory Structure

```
/
├── app/                        # Next.js App Router (pages and routing)
│   ├── citizen/                # Citizen Workspace views and portals
│   ├── layout.tsx              # HTML root layout & font loading
│   └── page.tsx                # Public Landings & Hero entrypoints
├── components/                 # Shareable UI atomic React components
├── docs/                       # Architectural design manuals & guides
│   ├── info.md                 # Technical system manual (Architecture, files, structures)
│   ├── backend.md              # [NEW] Backend implementation guide (Firestore, Storage, Maps, Gemini)
│   ├── maps.md                 # [NEW] Google Maps Platform implementation & architecture manual
│   ├── setup.md                # [NEW] Developer platform setup guide (Env, Firebase, Diagnostics)
│   └── conventions.md          # Institutional Engineering Handbook
├── lib/                        # Core utility packages and data contracts
│   ├── firebase/               # [NEW] Firebase Web SDK configurations
│   ├── repositories/           # [NEW] Decoupled Repository Data Access Layer
│   ├── services/               # [NEW] Service Business Logic Layer
│   ├── providers/              # [NEW] AI Provider & Map Provider Context Layers
│   ├── models.ts               # [NEW] Centralized Canonical Data Models
│   ├── designTokens.ts         # Visual constants (radii, colors, shadows)
│   ├── animations.ts           # Framer Motion transitions and variants
│   ├── helpers.ts              # Formatting functions and styling maps
│   ├── mockData.ts             # Shared presets, categories, and stages mock registry
│   └── mockReports.ts          # Structured mock database records
└── public/                     # Static vector assets and illustrations
```

---

## 2. Environment Setup

All backend settings and secrets are read dynamically from standard environment variables, keeping credentials safely hidden from client browsers.

For detailed setup instructions, troubleshooting, and synchronization validation, refer to the **[CivicHero Platform Setup Guide](docs/setup.md)**.

Create a `.env` file in the root directory (matching the keys in `.env.example`):

```env
# Firebase Web SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Google Maps Platform Configuration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Gemini API Key (Server-Side Only Secret)
GEMINI_API_KEY=your-gemini-key
```

*Note: The application is designed to boot and run flawlessly using local simulation fallbacks even if environment variables are temporarily absent. Developer-friendly warnings will be logged in the console.*

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

*   **Phase 5 (Google Maps Platform Integration) [COMPLETED]**: Replaced all map placeholder components with fully interactive, unified Google Maps, supporting user geolocations, real-time spatial heatmaps via deck.gl, clustered markers, custom priority styling, and interactive report point selection.
*   **Phase 2.2 (Gemini Live API)**: Connect `scanInfrastructureImage` base64 uploads directly to a server-side Gemini 3.5 API route.
*   **Phase 2.3 (Cloud Persistence)**: Hook all Repository methods directly into live Firestore collections and set up real-time `onSnapshot` collections synchronization.
