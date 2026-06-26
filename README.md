# CivicHero - Dynamic Civic Engagement Portal

CivicHero is a high-fidelity, highly polished, next-generation civic engagement portal where citizens can capture, verify, and track neighborhood infrastructure concerns. This application empowers local agency by mapping local crowd-vetted reports directly into municipal public works queues.

---

## 1. Project Directory Structure

```
/
├── app/                      # Next.js App Router (pages and routing)
│   ├── citizen/              # Citizen Workspace views and portals
│   ├── layout.tsx            # HTML root layout & font loading
│   └── page.tsx              # Public Landings & Hero entrypoints
├── components/               # Shareable UI atomic React components
│   └── ui/                   # Primitive widgets and third-party UI blocks
├── docs/                     # Technical specifications and handbooks
│   ├── info.md               # Architecture and functional documentation
│   └── conventions.md        # Institutional Engineering Handbook
├── hooks/                    # Reusable React stateful hooks
├── lib/                      # Centralized data collections, constants, and utilities
│   ├── designTokens.ts       # Visual constants (radii, colors, shadows)
│   ├── animations.ts         # Framer Motion transitions and variants
│   ├── helpers.ts            # Formatting functions and styling maps
│   ├── mockData.ts           # Shared presets, categories, and stages mock registry
│   └── mockReports.ts        # Dynamic issue reports base
└── public/                   # Static vector assets and illustrations
```

---

## 2. Core Frontend Architecture

CivicHero is engineered using a robust, decoupled, and component-driven modular design system, ensuring that components are fully shared between the **Citizen** application and upcoming **Administrator** portals.

*   **Design Token Layer (`lib/designTokens.ts`)**: Consolidates design primitives like corner rounding (`radius`), elevated shadows (`shadows`), and state status colors (`colors`).
*   **Animation System (`lib/animations.ts`)**: Standardizes motion transitions (page entries, spring pop-ups, and hover lifts) using hardware-accelerated `motion/react` variants.
*   **Utility & Formatting Layer (`lib/helpers.ts`)**: Houses pure formatting functions (`formatConfidence`, `getPriorityClasses`, `getStatusClasses`) to separate business logic from the view layer.
*   **Mock Data Registry (`lib/mockData.ts`)**: Centralizes list definitions, dropdown categories, and incident presets to facilitate consistent simulations.

---

## 3. Implemented User Flows

*   **Premium Landing & Portal Hero Gateway (`/app/page.tsx`)**: Prompts onboarding, sets visual hierarchies with elegant typography pairing (Inter + Space Grotesk), and establishes brand tone.
*   **Citizen Scrolling Dashboard (`/app/citizen/page.tsx`)**: Showcases critical neighborhood alerts, custom search matching engines, and interactive spotlights.
*   **Incident Browse & Dynamic Detail Inspection (`/app/citizen/issues/[id]/page.tsx`)**: Full case folder containing geographic map layouts, verification panels, and community comments.
*   **Chronological Verification Ledger (`/app/citizen/issues/[id]/timeline/page.tsx`)**: High-fidelity, 8-stage visual timeline tracking a case's lifecycle.
*   **5-Step Interactive Report Wizard (`/app/citizen/report/page.tsx`)**: Guided form containing image capture presets, animated optical laser scanner feedback, automated routing department classifiers, and ticket generation workflows.

---

## 4. Engineering Conventions & Workflow

We maintain a pristine codebase by sticking to strict principles:
1.  **Decomposed Components**: Decoupled from route states where possible, accepting properties via clear, typed interfaces.
2.  **No Mock Inline Configurations**: Static dropdown lists, categories, and animation duration numbers are imported from `lib/mockData` and `lib/animations` respectively.
3.  **Strict Lint & TypeScript Compilation**: Continuous testing ensures the codebase maintains **zero compile errors and zero warning markers**.

---

## 5. Development Workflow

### Prerequisites
*   Node.js (v18+)
*   npm

### Installation & Run
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

## 6. Roadmap & Upcoming Integration Points

*   **Phase 2.1 (Google Maps SDK)**: Transition map placeholders to active Google Maps SDK views with dynamic vector geofencing layers.
*   **Phase 2.2 (Gemini AI API)**: Power the scanner using live server-side Gemini 3.5 API routes parsing base64 image data dynamically.
*   **Phase 2.3 (Cloud persistence)**: Wire state captures into persistent Google Cloud Firestore/Auth clusters.
