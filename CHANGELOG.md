# Changelog

All notable changes to the CivicHero platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.3.0] - 2026-09-17

### Added
- **Centralized Configuration Single Source of Truth (`lib/config/index.ts`)**:
  - Unified configuration for Firebase, Google Maps Platform, server-side Gemini, and Nemotron.
  - Safe default normalization (`(default)` database ID, 15-minute Copilot TTL).
- **Environment Diagnostics & Validation Engine (`lib/config/validation.ts` & `/app/api/diagnostics/check`)**:
  - Structured, non-crashing configuration checks.
  - Exposes masked diagnostic status via safe API route without leaking secrets to client bundles.
- **Developer Reference Template**:
  - Added `firebase-applet-config.template.json` for documentation while keeping `firebase-applet-config.json` gitignored.

### Changed
- **Firebase Decoupling & Modernization (`lib/firebase/firebase.ts`)**:
  - Completely removed dependency on `firebase-applet-config.json`.
  - App initializes strictly from centralized `firebaseConfig` with graceful fallback to simulation mode.
- **Client Bundle Hardening (`lib/providers/ai/geminiProvider.ts`)**:
  - Decoupled `@google/genai` completely from browser code; proxied all AI operations through server-side `/api/ai/*` routes.
- **AI Orchestration & Secret Isolation (`lib/ai-server/orchestrator.ts`)**:
  - Standardized resolution for canonical `GEMINI_API_KEY` (with `APP_GEMINI_API_KEY` backwards-compatibility) and `NEMOTRON_API_KEY`.
  - Implemented singleton `GoogleGenAI` client reuse across requests.
  - Sanitized runtime error logs to eliminate accidental parameter or token leakage.
- **Hardcoded Identifier Removal**:
  - `components/SettingsPanel.tsx` & `app/api/sync-new-db/route.ts`: Swapped hardcoded project strings with `firebaseConfig.projectId`.
  - `scripts/sync-to-new-db.mjs`: Rewritten with automated `.env` loading and environment resolution.
  - `next.config.ts`: Removed redundant `env: { GOOGLE_MAPS_PLATFORM_KEY }` block.
- **Documentation Suite Updates**:
  - Updated `README.md`, `docs/security.md`, `docs/info.md`, and `docs/setup.md` with canonical configuration guidelines and fallback behavior.

---

## [0.2.0] - 2026-09-17

### Added
- **Phase 8.1 – Secret & Configuration Audit (Read-Only)**:
  - Conducted full-spectrum repository scan across `app/`, `components/`, `lib/`, `providers/`, `services/`, `repositories/`, `docs/`, `scripts/`, and root configuration files.
  - Formulated `docs/security.md` detailing the Secret Inventory, Configuration Topography, and Exposure Surface Analysis.
  - Cataloged duplicate initializations across Firebase Web SDK, Google Maps SDK, and Google Gen AI client instances.
  - Documented git exposure posture for `firebase-applet-config.json`, `scripts/sync-to-new-db.mjs`, and `.env*`.
  - Created Phase 8.2 Migration Plan for environment variable standardization, server-side secret isolation, and error sanitization.
- **Architectural Documentation Pass**:
  - Updated `README.md` with Phase 8.1 milestones and centralized credential topography.
  - Updated `docs/info.md` with security and configuration management specifications.

### Security Audit Findings (Read-Only Baseline)
- Identified client-accessible Firebase config in `firebase-applet-config.json` and inlined config in `scripts/sync-to-new-db.mjs`.
- Identified hardcoded project ID occurrences in `components/SettingsPanel.tsx` and `app/api/sync-new-db/route.ts`.
- Verified zero exposure of private cryptographic service account keys or SSH/TLS credentials.
- Confirmed server-side isolation for Gemini and Nemotron LLM keys in all active API routes.

---

## [0.1.0] - 2026-09-17

### Added
- Initial deployment of CivicHero Civic Engagement & Hyperlocal Issue Verification Portal.
- Phase 1–6 implementations:
  - Decoupled Repository and Service Architecture (`lib/repositories`, `lib/services`).
  - Google Maps Platform integration (`@vis.gl/react-google-maps`, deck.gl spatial layers).
  - Autonomous AI Agents (Community Intelligence, Administrator Copilot, Community Integrity).
  - Real-time Firestore synchronization and non-blocking Firebase Storage uploads.
  - System diagnostics test suite and Mission Control admin dashboard.
