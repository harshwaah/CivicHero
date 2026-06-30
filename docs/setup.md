# CivicHero Platform Setup Guide

Welcome to the CivicHero platform! This guide covers everything you need to get the shared data synchronization, Firebase, Google Maps, and Gemini API capabilities running locally.

## 1. Environment Variables

CivicHero requires specific environment variables to function correctly. 
Copy `.env.example` to `.env` in the root of the project:

```bash
cp .env.example .env
```

### Firebase Web SDK Configuration
The application is configured to fall back gracefully to a mock local repository if Firebase variables are not set. However, for true synchronization between Citizen and Administrator apps, set the following keys from your Firebase Console:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Google Maps Platform Configuration
CivicHero uses `@react-google-maps/api` to render high-fidelity maps for civic incidents. A demo key is usually provided.

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Gemini API Key (Server-Side Secret)
For the Administrator Copilot, Community Intelligence Agent, and Integrity Agent, you need a Gemini API Key. Do NOT prefix this with `NEXT_PUBLIC_` as it is a server-side secret.

```
GEMINI_API_KEY=your_gemini_api_key
```

## 2. Shared Data Synchronization

The Citizen and Administrator applications communicate through a shared repository pattern (`IssueRepository`, `TimelineRepository`, etc.) found in `lib/repositories`.

These repositories act as a single source of truth.
Currently, they mock Firestore using in-memory arrays. When Firebase environment variables are provided, these repositories will automatically proxy requests to Firestore.

### Verifying Synchronization
- Open the Citizen App and create/verify an issue.
- Observe the issue timeline.
- Because both apps use `IssueService.ts`, updates made in memory (and eventually Firestore) will seamlessly reflect across both boundaries.

## 3. Developer Diagnostics Utility

If you encounter issues during setup, CivicHero includes a built-in diagnostics utility.
Navigate to `/diagnostics` in your browser (e.g., `http://localhost:3000/diagnostics`).

The diagnostic dashboard will display:
- Firebase Connection Status (Configured vs. Fallback Mode)
- Google Maps API Status (Loaded, Error, or Missing)
- Data Synchronization Layer Status
- Environment Variable Presence

## 4. Troubleshooting & Common Configuration Errors

**Map is Grey / Says "Loading Map..."**
- Verify `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is present.
- Ensure the API key has the **Maps JavaScript API** enabled in Google Cloud Console.

**Firebase Fails to Connect / Shows Fallback Warning**
- Verify `NEXT_PUBLIC_FIREBASE_API_KEY` is in your `.env` file.
- Ensure you have restarted the Next.js development server after updating `.env`.
- Check the browser console for specific Firebase permission errors if Firestore is loaded but denying access.

**Gemini AI Features Not Working**
- The Gemini API is implemented securely via Next.js API Routes / Server Actions.
- Ensure `GEMINI_API_KEY` is present. If it is exposed to the client, Next.js will strip it. It must be read on the server.

## 5. Phase 11 Production Hardening & Demo Sandbox

In Phase 11, the platform has been hardened for production deployment and seamless judging evaluation:

*   **Config Security**: No build files are committed to the repository. The Firebase Web SDK reads parameters exclusively from `.env`.
*   **Secure Sandbox**: Toggle **Demo Mode** in Settings (Developer Mode) to activate a sandboxed in-memory environment, preventing database pollution. Run "Reset Demo Data" to restore initial curated reports instantly.
*   **High-Visibility Indicators**: When Sandbox Mode is active, a clear banner is displayed on the Diagnostics workspace (`/diagnostics`).
*   **Isolated Error Recovery**: Individual parts of the Citizen Dashboard are wrapped in `ErrorBoundary` widgets, ensuring that localized component issues never bring down the entire portal.

