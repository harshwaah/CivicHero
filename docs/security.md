# CivicHero - Security & Credential Architecture Audit

**Document Status:** Approved & Hardened  
**Audit Phase:** Phase 8.2 – Configuration Migration & Secret Hardening Complete  
**Last Audit Date:** September 17, 2026  
**Auditor:** AI Studio Senior Platform Architect  

---

## 1. Executive Summary

This security architecture document details the complete credential classification, secret hardening, environment centralization, and exposure surface remediation across the CivicHero codebase.

Phase 8.2 has successfully implemented all findings from the Phase 8.1 audit:
- All Firebase credentials load strictly from environment variables via the centralized configuration hub (`lib/config/index.ts`).
- `firebase-applet-config.json` is completely decoupled from application runtime and added to `.gitignore` with a template fallback.
- Client bundles have zero `@google/genai` imports.
- All Gemini and AI inference is strictly server-side with deterministic offline fallbacks.
- Hardcoded project IDs in scripts and UI badges have been replaced with dynamic configuration getters.
- Console error outputs in AI orchestration are sanitized to prevent secret/parameter leakage.

---

## 2. Secret Inventory & Asset Classification

| Secret / Asset Identifier | Classification | Current Locations | Access Tier | Exposure Status |
| :--- | :--- | :--- | :--- | :--- |
| **Firebase Web API Key** (`AIzaSyC4OZa...`) | Client-Public Identifier | `firebase-applet-config.json`, `scripts/sync-to-new-db.mjs`, `.env` | Client / Web SDK | In repo files & `.env` |
| **Firebase Project ID** (`studio-8104759134-540e1`) | Public System Identifier | `firebase-applet-config.json`, `scripts/sync-to-new-db.mjs`, `.env`, `components/SettingsPanel.tsx`, `app/api/sync-new-db/route.ts` | Client / Server | Hardcoded in 5 files |
| **Firebase App ID** (`1:780088215652:web:...`) | Client Identifier | `firebase-applet-config.json`, `scripts/sync-to-new-db.mjs`, `.env` | Client / Web SDK | Tracked in repo config |
| **Firebase Storage Bucket** (`studio-...firebasestorage.app`) | Bucket Identifier | `firebase-applet-config.json`, `scripts/sync-to-new-db.mjs`, `.env` | Client / Storage SDK | Tracked in repo config |
| **Google Maps API Key** | Client-Public Key | Environment (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_PLATFORM_KEY`), `next.config.ts` | Browser SDK | Injected via Next env |
| **Gemini API Key** | **Confidential Server Secret** | Server Environment (`APP_GEMINI_API_KEY`, `GEMINI_API_KEY`) | Server-Side Only | Evaluated in `lib/ai-server/orchestrator.ts`, `geminiProvider.ts` |
| **Nemotron / OpenRouter API Key** | **Confidential Server Secret** | Server Environment (`NEMOTRON_API_KEY`, `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`) | Server-Side Only | Evaluated in `lib/ai-server/orchestrator.ts` |
| **Service Account Keys** | Private Cryptographic Key | *None Present* | N/A | **Zero Exposure (Verified)** |

---

## 3. Configuration Mapping & Target Topography

| Configuration Parameter | Defined Location | Consumers / References | Scope Target | Phase 8.2 Migration Priority |
| :--- | :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `.env`, `firebase-applet-config.json` | `lib/firebase/firebase.ts`, `scripts/sync-to-new-db.mjs` | Client / Public | **Critical** (Centralize via Env) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `.env`, `firebase-applet-config.json` | `lib/firebase/firebase.ts`, `components/SettingsPanel.tsx`, `app/api/sync-new-db/route.ts` | Client / Public | **High** (Remove Hardcodes) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `.env`, `firebase-applet-config.json` | `lib/firebase/firebase.ts` | Client / Public | **High** (Centralize via Env) |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`| `.env`, `firebase-applet-config.json` | `lib/firebase/firebase.ts` | Client / Public | **High** (Centralize via Env) |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`| `.env`, `firebase-applet-config.json`| `lib/firebase/firebase.ts` | Client / Public | **Medium** |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `.env`, `firebase-applet-config.json` | `lib/firebase/firebase.ts` | Client / Public | **Medium** |
| `NEXT_PUBLIC_FIREBASE_DATABASE_ID` | `.env`, `firebase-applet-config.json` | `lib/firebase/firebase.ts`, `app/diagnostics/page.tsx` | Client / Public | **High** (Standardize default) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `.env.example`, `next.config.ts` | `lib/providers/maps/mapProvider.tsx`, `app/diagnostics/page.tsx` | Client / Public | **High** (Consolidate dual naming) |
| `GEMINI_API_KEY` | Server Environment | `lib/ai-server/orchestrator.ts`, `lib/providers/ai/geminiProvider.ts` | **Server-Only** | **Critical** (Isolate from Client) |
| `APP_GEMINI_API_KEY` | Server Environment / Settings | `lib/ai-server/orchestrator.ts` | **Server-Only** | **Critical** (Harmonize with `GEMINI_API_KEY`) |
| `NEMOTRON_API_KEY` | Server Environment / Settings | `lib/ai-server/orchestrator.ts` | **Server-Only** | **Medium** |
| `COPILOT_TTL_MS` | Server Environment / Default | `app/api/ai/administrator-copilot/route.ts` | **Server-Only** | **Low** |

---

## 4. Duplicate Configuration Audit

### 4.1 Duplicate Firebase Initialization
1. **Primary Runtime App**: Initialized in `lib/firebase/firebase.ts` via `initializeApp(activeConfig)`.
2. **Worker Script App**: Initialized in `scripts/sync-to-new-db.mjs` via `initializeApp(firebaseConfig, 'migration-worker')`.
3. **Triple-Tier Config Fallback**: `lib/firebase/firebase.ts` contains fallback chains from `firebaseAppletConfig` to `process.env.NEXT_PUBLIC_FIREBASE_*` to mock string values (`mock-api-key-civichero-placeholder`).

### 4.2 Duplicate Google Maps Ingestion
1. **Next Config Inlining**: `next.config.ts` maps `GOOGLE_MAPS_PLATFORM_KEY: process.env.GOOGLE_MAPS_PLATFORM_KEY || ''` into the client bundle at build time.
2. **Dual-Key Lookup in Provider**: `lib/providers/maps/mapProvider.tsx` checks `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY`.
3. **Diagnostics Page Dual Check**: `app/diagnostics/page.tsx` repeats the dual-check logic independently.

### 4.3 Duplicate Gemini Client Instantiation
1. **Orchestrator Module Client**: `lib/ai-server/orchestrator.ts` defines `getAIClient()` using `aiInstance = new GoogleGenAI(...)`.
2. **Orchestrator Execution Loop**: Inside `execute()`, lines 183–190 re-instantiate `new GoogleGenAI({ apiKey })` inside a loop for each model fallback.
3. **Provider Stub Client**: `lib/providers/ai/geminiProvider.ts` defines a third `getGeminiClient()` with its own module-level `aiClient` variable.
4. **Client-Side Import Leak**: `lib/providers/ai/geminiProvider.ts` imports `@google/genai` and is imported directly by `app/diagnostics/page.tsx` (a `'use client'` component).

---

## 5. Git Exposure & File Artifact Audit

*   **`firebase-applet-config.json`**: Located at root. Contains project credentials. Currently not ignored in `.gitignore`. Recommended for `.gitignore` inclusion with template generation.
*   **`scripts/sync-to-new-db.mjs`**: Contains inline credentials dictionary. Must be refactored to read from environment or shared configuration before version control tracking.
*   **`data_backup.json`**: Contains pre-seeded database snapshot, including old Cloud Run container blob URLs. Safe from credential leakage but contains domain-specific instance URIs.
*   **`.env`**: Exists locally. Correctly matched and ignored by `.gitignore` (`.env*`).
*   **`.env.example`**: Tracked in version control. Contains empty variable declarations without secret values. **Compliant.**
*   **Service Account Credentials**: Scanned all `.json`, `.key`, `.pem`, and `.p12` extensions across the repository. Zero service account keys exist in the repository.

---

## 6. Security Vulnerability & Leakage Evaluation

1.  **Console Logging Analysis**:
    *   `scripts/sync-to-new-db.mjs`: Logs `projectId` during synchronization.
    *   `lib/ai-server/orchestrator.ts`: Line 273 logs `err?.message || err` on model failure. In Phase 8.2, ensure error sanitization to strip potential query parameters or Authorization headers.
    *   `lib/firebase/firestore.ts` & `lib/firebase/storage.ts`: Log serialized error metadata (`OperationType`, `path`). Does **not** expose auth tokens or database secrets.
2.  **UI Exposure Analysis**:
    *   `components/SettingsPanel.tsx`: Hardcodes `studio-8104759134-540e1` in the visual DOM. Should dynamically reflect the active project from environment configuration.
    *   `app/api/sync-new-db/route.ts`: Hardcodes `targetProject: 'studio-8104759134-540e1'` in the GET response.
    *   `app/diagnostics/page.tsx`: Safely displays presence indicators (`✅ Present` / `⚠️ Missing`) without printing raw secret strings.
3.  **Client-Side Secret Exposure**:
    *   `GEMINI_API_KEY` is securely kept server-side in all API routes.
    *   However, `lib/providers/ai/geminiProvider.ts` references `process.env.GEMINI_API_KEY` inside client-accessible provider code, which can cause bundling confusion or undefined behavior in the browser. Must be strictly gated to server routes in Phase 8.2.

---

## 7. Migration Plan (Governing Phase 8.2 Execution)

### 7.1 Scope of Changes for Phase 8.2
*   **Files to Edit**:
    1.  `lib/firebase/firebase.ts`: Consolidate configuration loaders into a single canonical environment resolution layer.
    2.  `scripts/sync-to-new-db.mjs`: Remove hardcoded `firebaseConfig` object; read from `process.env` or dynamic import.
    3.  `components/SettingsPanel.tsx`: Replace hardcoded project ID strings with dynamic configuration getters.
    4.  `app/api/sync-new-db/route.ts`: Replace hardcoded project ID with environment configuration.
    5.  `lib/providers/maps/mapProvider.tsx`: Standardize on `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` as canonical key.
    6.  `next.config.ts`: Clean up legacy `GOOGLE_MAPS_PLATFORM_KEY` inlining if no longer needed.
    7.  `lib/ai-server/orchestrator.ts`: Standardize Gemini key resolution to `process.env.GEMINI_API_KEY || process.env.APP_GEMINI_API_KEY`; eliminate redundant `new GoogleGenAI` allocations.
    8.  `lib/providers/ai/geminiProvider.ts`: Decouple client bundle from `@google/genai` SDK; delegate all inferences exclusively to server-side `/api/ai/*` routes.
    9.  `.gitignore`: Append `firebase-applet-config.json` to prevent accidental upstream commit.

### 7.2 Variable Classification
*   **Public Variables (`NEXT_PUBLIC_*`)**:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`
    *   `NEXT_PUBLIC_FIREBASE_DATABASE_ID`
    *   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
*   **Private Server-Side Secrets**:
    *   `GEMINI_API_KEY` (Master server key)
    *   `APP_GEMINI_API_KEY` (AI Studio alias)
    *   `NEMOTRON_API_KEY` / `OPENROUTER_API_KEY`
    *   `COPILOT_TTL_MS`

### 7.3 Validation & Rollback Strategy
*   **Validation**:
    1.  Run `npm run build` (`compile_applet`) to ensure zero broken imports or client bundle leaks.
    2.  Execute `/diagnostics` verification suite to confirm all 7 subsystems pass.
    3.  Confirm Firestore live listeners and storage uploads remain active.
*   **Rollback Strategy**:
    *   Keep fallback object references intact so that missing environment variables gracefully trigger mock simulation rather than hard runtime exceptions.

---

## 8. Phase 8.2 Execution & Hardening Record

### 8.1 Implemented Changes
1. **Centralized Configuration Hub (`lib/config/index.ts`)**:
   - Single point of truth for `firebaseConfig`, `mapsConfig`, `serverAiConfig`, and `isFirebaseEnvironmentConfigured`.
   - Normalizes database identifiers and fallback values with safe defaults.
2. **Environment Diagnostics Validation (`lib/config/validation.ts` & `/app/api/diagnostics/check/route.ts`)**:
   - Non-crashing validation checks returning structured JSON diagnostic statuses without exposing confidential secret values.
3. **Firebase Subsystem Migration (`lib/firebase/firebase.ts`)**:
   - Eliminated direct `firebase-applet-config.json` imports.
   - Initialized purely from `firebaseConfig` object with clear warning telemetry when running in simulation fallback mode.
4. **Client Bundle Decoupling (`lib/providers/ai/geminiProvider.ts`)**:
   - Fully decoupled `@google/genai` from client-side bundles; delegated client requests to server API routes.
5. **AI Secret Isolation & Singleton Client (`lib/ai-server/orchestrator.ts`)**:
   - Standardized `GEMINI_API_KEY` (with `APP_GEMINI_API_KEY` fallback) and `NEMOTRON_API_KEY`.
   - Shared singleton `GoogleGenAI` instance.
   - Sanitized inference logging to prevent credential leakage.
6. **Hardcoded Artifact Removal**:
   - `scripts/sync-to-new-db.mjs`: Rewritten to read environment variables dynamically with `.env` loader.
   - `components/SettingsPanel.tsx` & `app/api/sync-new-db/route.ts`: Rewritten to retrieve dynamic project IDs from centralized config.
   - `next.config.ts`: Removed redundant `env: { GOOGLE_MAPS_PLATFORM_KEY }` block.
   - `.gitignore`: Added `firebase-applet-config.json`.
   - Added `firebase-applet-config.template.json` for developer reference.

---

## 9. Phase 8.3 Reliability & Data Safety Verification

### 9.1 Blast Radius Containment
- **Error Boundaries**: Client-side component crashes are strictly quarantined within localized tabs/views using `components/ErrorBoundary.tsx`. Unhandled runtime errors in presentation layers do not unmount parent navigations, state managers, or session contexts.
- **Service Degraded States**: Subsystem outages (e.g. Firebase offline, Maps quota limits, Gemini rate limiting) invoke non-blocking `RecoveryState` components rather than throwing unhandled rejections that trigger browser whitescreens.

### 9.2 Zero Production Data Destruction Invariant
- **Demo State Reset Audit**: The "Reset Demo State" control in `components/SettingsPanel.tsx` strictly purges client-side `localStorage` keys (`civichero_onboarding_*`, search query histories, cached filters, UI preferences).
- **Audit Finding**: Confirmed that `handleResetDemoState` makes zero network requests and executes zero Firestore delete/batch mutate operations. Live collections (`issues`, `users`, `notifications`, `audit_logs`) in Google Cloud Firestore remain untouched.
