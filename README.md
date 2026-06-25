# CivicHero

CivicHero is a high-fidelity, highly polished, next-generation civic engagement portal where citizens can capture, verify, and track neighborhood infrastructure concerns. This application empowers local agency by mapping local crowd-vetted reports directly into municipal public works queues.

## Project Overview

CivicHero bridges the gap between chaos and coordinate-precise action. By employing micro-visual scanner feedback, transparent community endorsement mechanics, and structural timeline tracking, CivicHero turns citizen observation into real municipal momentum.

## Tech Stack

*   **Framework**: Next.js (App Router, React 19)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS (v4) with custom utility glassmorphic styles
*   **Animations**: Framer Motion (`motion/react`)
*   **Icons**: Lucide React

---

## Completed Phases

### Phase 1.0: Premium Landing Experience
*   Establishes the visual identity, premium typography pairing (Inter + Space Grotesk), and spacing rhythm.
*   Builds the cohesive visual theme: **Deep Navy** (`#001e40`) with emerald-green accents (`#006c49`), set against crisp off-white canvas spaces.

### Phase 1.1: Citizen Application Frontend Shell & Feed
*   Unified navigation sidebar (desktop) and responsive persistent bottom tab-bar (mobile).
*   Search and filter filters for real-time neighborhood event reports.
*   Interactive spotlight hero cards highlight critical municipal actions and status updates.

### Phase 1.2: Complete Citizen Browse Flow
*   Integrated comprehensive inspection view (Issue Detail) supporting dynamic map positions, chronological stage timeline widgets, and local citizen co-signing bars.
*   Developed nested forums (Community Discussion Threads) enabling crowdsourced visual status updates.

### Phase 1.3: Interactive Citizen Report Flow (Latest)
*   Implemented the **5-Step Report Engine** to capture, preview, and process neighborhood incidents.
*   **Simulated Photo Capture / Gallery presets** representing common municipal hazards (Potholes, Water Rruptures, Tree Collapse, Lighting Outage, Garbage Overflow).
*   **Progressive AI Diagnostics Analyzer** with animated laser scanning visual feeds and live log outputs.
*   **Consolidated Case Docket Ledger** reviews raw input coordinates side-by-side with automated confidence scores and suggested department routing targets.
*   **Polished Success confirmation** with randomized ticket IDs (`#CH-XXXXX`) and structured dispatch workflow.

---

## Roadmap & Upcoming Integration Points

*   **Phase 2.1 (Google Maps Integration)**: Transition map placeholders to active Google Maps SDK views with dynamic vector geofencing layers.
*   **Phase 2.2 (Gemini AI Processing)**: Power the scanner using live server-side Gemini 3.5 API calls to classify visual images, extract addresses, and auto-generate narrative summaries.
*   **Phase 2.3 (Firebase Firestore Storage)**: Migrate from local mock state data storage to real-time Cloud Firestore clusters, enabling durable collaborative co-signing and forum entries.

---

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm

### Installation & Run

1. Clone the workspace files.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Access the application locally on [http://localhost:3000](http://localhost:3000).
