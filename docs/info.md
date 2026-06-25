# CivicHero Technical Architecture & Design Document

This document details the frontend architecture, system flows, and future expansion paths of the **CivicHero Citizen Application**.

---

## 1. Application Directory Structure

```
/
├── app/                      # Next.js App Router root
│   ├── citizen/              # Citizen Portal layout & workspace
│   │   ├── issues/           # Browse & inspection dynamic subroutes
│   │   │   └── [id]/         # Dynamic Issue view
│   │   │       ├── page.tsx  # Interactive Issue Detail (AISummary, map point, verification)
│   │   │       └── timeline/ # Progressive stage verification ledger
│   │   ├── report/           # Step-by-step incident reporting flow
│   │   │   └── page.tsx      # Multi-step state-preserving wizard (Latest addition)
│   │   ├── globals.css       # Core Tailwind CSS variables & glassmorphic styles
│   │   ├── layout.tsx        # HTML wrapper / font injection (Inter, Space Grotesk, JetBrains Mono)
│   │   └── page.tsx          # Citizen Portal Feed entrypoint (spotlights, category filter)
│   └── page.tsx              # CivicHero Platform Hero Landing page
├── components/               # Shareable UI atomic React components
│   ├── AISummaryCard.tsx     # Computer-vision diagnostic results block
│   ├── CitizenFeed.tsx       # Scrolling incident feeds with expandable search
│   ├── CitizenNav.tsx        # Mobile (Bottom-glass) & Desktop (Left-rail) navigation
│   ├── EvidenceCard.tsx      # Feed list element summarizing category & status
│   ├── IncidentsMapPreview.tsx # Desktop sidebar georef dashboard preview
│   └── VerificationBar.tsx   # Co-signing incrementer enabling crowd certification
├── lib/                      # Core utility packages and mock database collections
│   ├── mockReports.ts        # Fully structured mock JSON records for dynamic routes
│   └── utils.ts              # Tailwind merging configuration helpers
└── docs/                     # Architectural design document manuals
    └── info.md               # [THIS FILE] Technical system manual
```

---

## 2. Core Frontend Flows

### The Citizen Incident Report Workflow

The Reporting flow resides at `/app/citizen/report/page.tsx` and guides users through an incremental five-stage state engine that simulates real deep diagnostics while keeping browser back-navigation alive:

```
[Citizen Feed] ➔ click Floating Action button
       ▼
[Step 1: Initiate Case] ── Upload/Capture ➔ Presets auto-populate narrative details
       ▼
[Step 2: Review Raw]    ── Co-sign inputs before matching classifiers
       ▼
[Step 3: AI Diagnostic] ── Visual neural scan bar + real-time diagnostic telemetry log reveal
       ▼
[Step 4: Docket Review] ── Unified panel linking citizen details with auto-detected department routing
       ▼
[Step 5: Success Anchor]── Lock report on local ledger (renders unique case ticket ID)
```

---

## 3. Key Technical Decisions & Design Philosophy

### Browser-Level History Integration (Deep Linking & Safe State)
*   **The Challenge**: Next.js App Router query parameter syncing via standard `useSearchParams` hook requires wrapping pages in `<Suspense>` chunks to avoid compilation-time server-side generation warnings.
*   **Our Solution**: Implemented native event listeners bound directly to the browser history (`popstate` API). This achieves:
    1.  **Strict State Preservation**: Navigating between wizard steps (`?step=review` ➔ `?step=report`) preserves typed description text, title strings, and images without mounting/unmounting components.
    2.  **Back-Button Support**: Tapping the browser back button rolls back individual steps seamlessly.
    3.  **Static Build Safety**: No hydration mismatch or `<Suspense>` bundling bottlenecks.

### Interactive "Autofill Presets"
*   Since file uploads and device hardware cameras are simulated in the current frontend phase, we designed an **Interactive Presets Gallery**.
*   Users select a specific real-world incident type (e.g., *Potable Water main spray*, *Crater pothole*, *Tree fall blockages*). Tapping a preset loads a high-resolution Unsplash visual, and offers an **Auto-fill** link that instantly populates the title, categories, urgency levels, and location fields.
*   This ensures the simulation behaves predictably while allowing developers and testers to inspect realistic AI summaries.

### Architecture-Aligned Design Language
*   **Aesthetic Continuity**: Adheres strictly to the **Stitch Design System** rules:
    *   **Typography**: Generous pairing of display-weight titles (Inter) with technical labels (JetBrains Mono).
    *   **Colors**: Deep, commanding dark blues (`brand-primary`) paired with highly stable emerald green status markers (`brand-secondary`).
    *   **Geometry**: Circular rounded geometry (`rounded-[28px]`, `rounded-[32px]`) that mimics tactile touch elements.

---

## 4. Limitations & Future Integration Points

### Live Google Maps Integration
*   *Current state*: Static layout with SVG icons mimicking vector pins.
*   *Phase 2 integration*: Swap static markers with `<GoogleMap>` React components from `@react-google-maps/api`. Map the report coordinates to active coordinates, pulling from the user's geofenced device GPS location.

### Dynamic Gemini AI Processing
*   *Current state*: Client-side preset dictionaries return pre-mapped diagnostic analysis fields.
*   *Phase 2 integration*: Create an API Route endpoint (`/api/gemini/analyze`) utilizing the `@google/genai` SDK. Pass the uploaded image data block as base64 and feed it into a structured prompt schema:
    ```json
    {
      "title": "Road crater with visual water leaking",
      "category": "Roads",
      "urgency": "High",
      "suggestedDepartment": "Public Works - Road Maintenance Division",
      "confidenceScore": 96
    }
    ```

### Durable Firebase Firestore Storage
*   *Current state*: Local React state manages newly created records, disappearing upon browser session termination.
*   *Phase 2 integration*: Hook up firebase-blueprint rules so that when a user completes Step 5 (Success), the system executes:
    ```javascript
    await addDoc(collection(db, "reports"), { ...newReport, status: "Submitted" });
    ```
    This updates the main list collection, enabling real-time global feed additions!
