# CivicHero System Security & Platform Hardening Manual

This manual details the security architecture, configuration isolation, error containment, and judge-safe demo capabilities of the **CivicHero Platform** implemented in Phase 11.

---

## 1. Zero-Trust Configuration & Secret Security

CivicHero adheres strictly to modern decentralized secret-management practices, completely eliminating hardcoded credentials, exposed build files, and configuration files.

### 1.1 Complete Removal of Config Files
*   **The Problem:** Build configurations like `firebase-applet-config.json` can inadvertently leak project parameters and structure when committed to version control.
*   **The Mitigation:** `firebase-applet-config.json` has been entirely removed from the application tree.
*   **Decentralized Loading:** The Firebase Web SDK initialization routine in `lib/firebase/firebase.ts` reads configurations strictly and exclusively from standard environment variables:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`

### 1.2 Multi-Model API Integrity
*   All downstream integrations (Google Maps Platform, Google Gemini API, and Nemotron API) read exclusively from centralized variables, preventing configuration drift:
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (Unified client-side Maps renderer)
    *   `GEMINI_API_KEY` (Server-side-only API secret)
*   **Example Secure Entry (`.env.example`):**
    ```env
    # Core Firebase Credentials
    NEXT_PUBLIC_FIREBASE_API_KEY=
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
    NEXT_PUBLIC_FIREBASE_APP_ID=

    # Third-Party API Credentials
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
    GEMINI_API_KEY=
    ```

---

## 2. Secure Judge Demo Sandbox Environment

During testing, evaluation, and judging phases, raw database writes can quickly pollute production queues, corrupt analytical metrics, and lead to inconsistent visual states.

### 2.1 Sandbox Architecture (`IssueRepository.getIsSandbox()`)
To address this risk, CivicHero implements an isolated, secure, in-memory **Demo Mode Sandbox**:
*   **Activation:** Toggled inside the Developer Settings panel. This persists a local storage key: `civichero_demo_mode = true`.
*   **Isolation Logic:**
    ```ts
    export function getIsSandbox(): boolean {
      if (typeof window !== 'undefined') {
        const demoMode = localStorage.getItem('civichero_demo_mode') === 'true';
        if (demoMode) return true;
      }
      return !isFirebaseConfigured;
    }
    ```
*   **Behavioral Redirection:** When `getIsSandbox() === true`, all write/read pipelines bypass actual Firestore connection queries entirely. All mutations are applied to an isolated, in-memory collection cache (`currentIssues`). This completely prevents judges and evaluators from corrupting production databases.
*   **Reset on Demand:** In-memory collections can be instantly restored to initial curated high-fidelity demonstration states using the "Reset Demo Data" option in Settings, with zero performance footprint.

---

## 3. Client Error Isolation & Partial Failure Containment

In full-stack applications, an unhandled exception in a minor UI component or a third-party script load failure should never cause the entire page to crash or display a blank screen.

### 3.1 Isolated Error Boundaries (`components/ErrorBoundary.tsx`)
CivicHero uses an isolated React Error Boundary component that intercepts exceptions, traps rendering errors, and renders elegant component fallbacks:
*   **Scope:** All major views of the Citizen Dashboard (Feed, Maps, Safety Desk, Bulletins, Search, Notification Center, Passport, and Settings) are individually wrapped in separate Error Boundaries.
*   **Aesthetic Recoveries:** If a component fails due to an API timeout or an unexpected null property, CivicHero suppresses the standard white-screen crash, displays a detailed and friendly recovery pane, and exposes a clean "Reset Component" button.
*   **User Resilience:** The surrounding application remains fully operational, allowing users to keep navigating other active tabs safely.

---

## 4. Onboarding and Display Personalization

*   **Non-Invasive Guided Onboarding:** The First Launch onboarding tour is saved locally via `civichero_onboard_completed`. It runs exactly once upon initial visit, guiding users through the live tabs of the system with intuitive, non-disruptive overlays (Skip, Next, Prev, Finish).
*   **Zero Hardcoded Identities:** The system reads the personalized user identity from standard Web Storage parameters (`civichero_display_name`). If changed inside settings, all welcome headers, success logs, and co-signing audit panels adapt instantly.
