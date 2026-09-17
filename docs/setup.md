# CivicHero Platform Setup Guide

Welcome to the CivicHero platform! This guide covers everything you need to get the shared data synchronization, Firebase, Google Maps, and Gemini API capabilities running locally.

## 1. Canonical Environment Variables

CivicHero centralizes all environment configuration in `lib/config/index.ts`. All subsystem settings are read dynamically without requiring manual JSON configuration files.

Copy `.env.example` to `.env` in the root of the project:

```bash
cp .env.example .env
```

### 1.1 Firebase Web SDK Configuration (Client-Public)
The application is configured to fall back gracefully to in-memory datasets if Firebase variables are not configured. For live cloud synchronization between Citizen and Administrator apps, set the following keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_DATABASE_ID=(default)
```

### 1.2 Google Maps Platform Configuration (Client-Public)
CivicHero uses `@vis.gl/react-google-maps` with dynamic pin clustering and Deck.gl overlays.

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 1.3 AI & Intelligence Services (Server-Side Secrets)
For the Administrator Copilot, Community Intelligence Agent, and Integrity Agent, configure your LLM API keys. These are confidential secrets that must **never** be prefixed with `NEXT_PUBLIC_`.

```env
GEMINI_API_KEY=your_gemini_api_key
NEMOTRON_API_KEY=your_nemotron_api_key
COPILOT_TTL_MS=900000
```

## 2. Shared Data Synchronization

The Citizen and Administrator applications communicate through a shared repository pattern (`IssueRepository`, `TimelineRepository`, `UserRepository`, `NotificationRepository`) located in `lib/repositories`.

These repositories act as a single source of truth:
- In production / live mode: Repositories proxy requests to Cloud Firestore (`lib/firebase/firestore.ts`).
- In simulation / offline mode: Repositories use rich in-memory records (`data_backup.json` and `mockReports.ts`) with zero runtime errors.

## 3. Developer Diagnostics Utility

If you encounter issues during setup, CivicHero includes a built-in diagnostics utility.
Navigate to `/diagnostics` in your browser (e.g., `http://localhost:3000/diagnostics`) or query `/api/diagnostics/check`.

The diagnostic dashboard verifies 7 key subsystems:
1. **Firebase Configuration**: Checks client credentials and project identification.
2. **Google Maps Platform SDK**: Verifies key presence and map viewport initialization.
3. **Data Access Repository Layer**: Evaluates repository contracts and entity collections.
4. **AI & Gemini Server Orchestration**: Checks server key availability and model routing hierarchy.
5. **Community Integrity Agent**: Validates anti-spam analysis pipeline.
6. **Administrator Copilot**: Checks caching layer and TTL invalidations.
7. **Cloud Storage Engine**: Tests non-blocking asset upload pipelines.

## 4. Troubleshooting & Fallback Behaviors

**Map shows placeholder canvas**
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env`.
- Ensure the API key has the **Maps JavaScript API** enabled in Google Cloud Console.
- In the absence of a key, the interactive vector canvas provides simulated pin placement.

**Firebase shows Fallback Mode**
- If `NEXT_PUBLIC_FIREBASE_API_KEY` or `NEXT_PUBLIC_FIREBASE_PROJECT_ID` is missing, the application logs a warning and activates local in-memory simulation.
- The UI remains 100% interactive and functional.

**Gemini AI Features Fallback**
- If `GEMINI_API_KEY` is not present, the `AIOrchestrator` automatically activates deterministic local simulation responses for photo classification, copilot briefings, and spam checks.
