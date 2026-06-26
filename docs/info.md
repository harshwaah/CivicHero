# CivicHero Technical Architecture & Design Document

This document details the frontend architecture, system flows, design tokens, reusable component inventory, and future expansion paths of the **CivicHero Citizen Application**.

---

## 1. Application Directory Structure

```
/
├── app/                      # Next.js App Router root
│   ├── citizen/              # Citizen Portal layout & workspace
│   │   ├── issues/           # Browse & inspection dynamic subroutes
│   │   │   └── [id]/         # Dynamic Issue view
│   │   │       ├── page.tsx  # Interactive Issue Detail (AISummary, map point, verification)
│   │   │       └── timeline/ # Progressive stage verification ledger (8 Stages)
│   │   ├── report/           # Step-by-step incident reporting flow
│   │   │   └── page.tsx      # Multi-step state-preserving wizard (autofills, scanner)
│   │   ├── globals.css       # Core Tailwind CSS variables & glassmorphic styles
│   │   ├── layout.tsx        # HTML wrapper / font injection (Inter, Space Grotesk, JetBrains Mono)
│   │   └── page.tsx          # Citizen Portal Feed entrypoint (spotlights, category filter)
│   └── page.tsx              # CivicHero Platform Hero Landing page
├── components/               # Shareable UI atomic React components
│   ├── AISummaryCard.tsx     # Computer-vision diagnostic results block (Shared)
│   ├── CitizenFeed.tsx       # Scrolling incident feeds with expandable search
│   ├── CitizenNav.tsx        # Mobile (Bottom-glass) & Desktop (Left-rail) navigation
│   ├── EvidenceCard.tsx      # Feed list element summarizing category & status (Shared)
│   ├── IncidentsMapPreview.tsx # Desktop sidebar georef dashboard preview
│   ├── VerificationBar.tsx   # Co-signing incrementer enabling crowd certification
│   ├── Header.tsx            # Global application navigation bar
│   ├── Footer.tsx            # Standardized institutional footer layout
│   └── MapPlaceholder.tsx    # Shared static SVG responsive map canvas
├── lib/                      # Core utility packages and mock database collections
│   ├── designTokens.ts       # Centralized design constants (radii, colors, shadows)
│   ├── animations.ts         # Centralized Framer Motion transition variants
│   ├── helpers.ts            # Centralized reusable formatters & mapping rules
│   ├── mockData.ts           # Centralized mock lists, categories, presets, and constants
│   ├── mockReports.ts        # Fully structured mock JSON records for dynamic routes
│   └── utils.ts              # Tailwind merging configuration helpers
└── docs/                     # Architectural design document manuals
    ├── info.md               # [THIS FILE] Technical system manual
    └── conventions.md        # Institutional Engineering Handbook
```

---

## 2. Reusable Component Inventory

CivicHero is built with atomic, reusable building blocks designed to be shared directly between Citizen and upcoming Administrator workspaces:

*   **AISummaryCard** (`components/AISummaryCard.tsx`): A card presenting computer-vision analysis results, including a dynamic confidence score, structured category matching labels, severity analysis, and routing departments.
*   **EvidenceCard** (`components/EvidenceCard.tsx`): Highly scalable card summarizing issue titles, geographic locations, category badges, dynamic timestamps, priority indicators, and status chips.
*   **MapPlaceholder** (`components/MapPlaceholder.tsx`): A responsive, custom-styled SVG canvas with styled pins representing real geofenced coordinates. Perfect for high-fidelity offline layouts.
*   **VerificationBar** (`components/VerificationBar.tsx`): A community co-signing tool with state managers allowing local residents to upvote report accuracy, flag resolved issues, and register reports.
*   **CitizenNav** (`components/CitizenNav.tsx`): Polymorphic navigation that dynamically switches between a glass bottom-bar on mobile viewports and a clean, responsive left-side rail on desktop screens.

---

## 3. Design Token Documentation

All visual aesthetics are centralized in `/lib/designTokens.ts` to enforce branding guidelines:

```typescript
export const DESIGN_TOKENS = {
  radius: {
    xs: 'rounded-md',      // 6px
    sm: 'rounded-xl',      // 12px
    md: 'rounded-2xl',     // 16px
    lg: 'rounded-[24px]',  // 24px
    xl: 'rounded-[28px]',  // 28px
    xxl: 'rounded-[32px]', // 32px
    full: 'rounded-full',
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  colors: {
    status: {
      Live: { bg: 'bg-red-500/10 text-red-600', dot: 'bg-red-500' },
      Reported: { bg: 'bg-blue-500/10 text-blue-600', dot: 'bg-blue-50' },
      'In Progress': { bg: 'bg-amber-500/10 text-amber-600', dot: 'bg-amber-500' },
      Resolved: { bg: 'bg-emerald-500/10 text-emerald-600', dot: 'bg-emerald-500' },
    }
  }
};
```

---

## 4. Animation System

Cohesive transition animations are centralized in `/lib/animations.ts` using Framer Motion:

*   **Page Transitions (`ANIMATIONS.pageTransition`)**: Slide-up fade entrance on page layout mountings.
*   **Modal Entries (`ANIMATIONS.modal`)**: High-performance spring scale-up slide entrances for overlay boxes.
*   **Toasts (`ANIMATIONS.toast`)**: Bouncy spring slips slide-in from the corner of screen with smooth opacity exit steps.
*   **Hover Lift (`ANIMATIONS.hoverLift`)**: Hardware-accelerated gentle y-axis offset lifts for cards and interactive assets.

---

## 5. Utility Functions

Standardized helper functions reside in `/lib/helpers.ts` for clean code decoupling:

*   `formatConfidence(score)`: Translates numerical ranges into exact formatted percentages (e.g. `96%`).
*   `getStatusClasses(status)`: Fetches precise, high-contrast Tailwind classes associated with a current incident stage.
*   `getPriorityClasses(priority)`: Translates critical, high, or medium priorities into accessible badge color styles.
*   `formatLocation(loc)`: Standardizes input addresses into readable city listings.

---

## 6. Mock Data Organization

Mock data is entirely isolated from UI components inside `/lib/mockData.ts` and `/lib/mockReports.ts`:

*   `mockReports`: Main registry of reported neighborhood issues with full timeline records, commenter profiles, and verification counters.
*   `PRESET_OPTIONS`: Templates representing realistic potholes, water geysers, or streetlight outages, enabling instantaneous user testing autofills.
*   `CATEGORIES`: List of approved reporting branches.
*   `ALL_STAGES_MOCK`: Sequential lifecycle stages mapping the 8 chronological check-points of the blockchain registry ledger.

---

## 7. Routing Architecture

Routing is powered by Next.js App Router for deep-linking, query syncs, and native browser back navigation:

*   `/`: Home Page with institutional branding and gateway paths.
*   `/citizen`: Main scrolling dashboard. Supports `activeTab` query sync state.
*   `/citizen/issues/[id]`: Interactive detail file. Deep-linked dynamic cases.
*   `/citizen/issues/[id]/timeline`: Chronological 8-stage ledger details.
*   `/citizen/report`: Five-stage wizard. Syncs `?step=...` directly to browser historical layers for robust user back-navigation.

---

## 8. Accessibility & Responsive Strategy

*   **Responsive Adaptation**: Pure CSS media-query layouts dynamically scale navigation, side-by-side maps, and forms between Mobile (touch targets >= 44px), Tablet grid columns, and spacious Desktop layouts.
*   **Accessibility (a11y)**: Focus rings are styled on form entries. Proper semantic structures (`blockquote`, `button`, `main`, `header`) are enforced. Every image contains robust descriptive alternate text (`alt`), and high contrast levels satisfy eye-safety guidelines.

---

## 9. Technical Debt & Future Refactoring

*   **Google Maps SDK Integration**: Placeholder maps should be swapped with reactive `@react-google-maps/api` canvases linked with actual coordinate filters.
*   **Server-Side Gemini AI**: Visual analyzer logs will be connected to server-side Gemini 3.5 API routes parsing base64 inputs dynamically.
*   **Cloud Persistence**: React states for newly submitted files will be wired into Google Cloud Firestore/Auth clusters using `@google-cloud/firestore` systems.
