/**
 * CivicHero Centralized Configuration Hub (Phase 8.2)
 *
 * Single canonical source of truth for all runtime configuration parameters across:
 * - Firebase Web SDK (Auth, Firestore, Cloud Storage)
 * - Google Maps Platform
 * - Gemini Generative AI Server Orchestration
 * - Nemotron & Secondary AI Models
 * - Administrator Copilot Caching
 *
 * Eliminates duplicated lookup chains, inlined constants, and JSON config artifacts.
 */

// 1. Firebase Core Configuration (Client & Server Public)
// Sources values exclusively from environment variables (.env / process.env)
const rawFirebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
const rawFirebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '';
const rawFirebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (rawFirebaseProjectId ? `${rawFirebaseProjectId}.firebaseapp.com` : '');
const rawFirebaseStorageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (rawFirebaseProjectId ? `${rawFirebaseProjectId}.firebasestorage.app` : '');
const rawFirebaseSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '';
const rawFirebaseAppId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '';
const rawFirebaseDbId = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID || '(default)';

export const isFirebaseConfigured = !!(rawFirebaseApiKey && rawFirebaseProjectId && rawFirebaseProjectId !== 'mock-civichero');

export const mockFirebaseConfig = {
  apiKey: 'mock-api-key-civichero-placeholder',
  authDomain: 'mock-civichero.firebaseapp.com',
  projectId: 'mock-civichero',
  storageBucket: 'mock-civichero.appspot.com',
  messagingSenderId: '000000000000',
  appId: '1:000000000000:web:0000000000000000000000',
  databaseId: '(default)',
};

export const firebaseConfig = {
  apiKey: rawFirebaseApiKey || mockFirebaseConfig.apiKey,
  authDomain: rawFirebaseAuthDomain || (rawFirebaseProjectId ? `${rawFirebaseProjectId}.firebaseapp.com` : mockFirebaseConfig.authDomain),
  projectId: rawFirebaseProjectId || mockFirebaseConfig.projectId,
  storageBucket: rawFirebaseStorageBucket || (rawFirebaseProjectId ? `${rawFirebaseProjectId}.firebasestorage.app` : mockFirebaseConfig.storageBucket),
  messagingSenderId: rawFirebaseSenderId || mockFirebaseConfig.messagingSenderId,
  appId: rawFirebaseAppId || mockFirebaseConfig.appId,
  databaseId: rawFirebaseDbId,
  firestoreDatabaseId: rawFirebaseDbId,
  isConfigured: isFirebaseConfigured,
};

// 2. Google Maps Platform Configuration (Client & Server Public)
const rawMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
export const mapsConfig = {
  apiKey: rawMapsApiKey,
  isConfigured: !!rawMapsApiKey && rawMapsApiKey !== 'YOUR_API_KEY',
};

// Canonical Default Geographic Center (Mumbai, Maharashtra, India)
export const DEFAULT_MAP_CENTER = {
  lat: 19.0760,
  lng: 72.8777,
  name: 'Mumbai, Maharashtra, India',
  city: 'Mumbai',
  state: 'Maharashtra',
  country: 'India',
  zoom: 13,
};

export const MUMBAI_LANDMARKS = [
  { name: 'Bandra Kurla Complex (BKC), Mumbai', lat: 19.0666, lng: 72.8687 },
  { name: 'Linking Road, Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { name: 'Dadar TT Circle, Dadar, Mumbai', lat: 19.0178, lng: 72.8478 },
  { name: 'SV Road, Andheri West, Mumbai', lat: 19.1197, lng: 72.8468 },
  { name: 'Colaba Causeway, South Mumbai', lat: 18.9220, lng: 72.8347 },
  { name: 'Powai Lake Promenade, Powai, Mumbai', lat: 19.1257, lng: 72.9051 },
  { name: 'Worli Sea Face, Worli, Mumbai', lat: 19.0144, lng: 72.8153 },
  { name: 'Goregaon Hub Mall, Western Express Highway', lat: 19.1553, lng: 72.8497 },
];

// 3. Server-Side Confidential AI Orchestrator Configuration
// Evaluated server-side; NEVER exposed via NEXT_PUBLIC_ prefixes.
const getSafeServerEnv = (key: string): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || '';
  }
  return '';
};

const canonicalGeminiKey = getSafeServerEnv('GEMINI_API_KEY') || getSafeServerEnv('APP_GEMINI_API_KEY');
const canonicalNemotronKey = getSafeServerEnv('NEMOTRON_API_KEY') || getSafeServerEnv('OPENROUTER_API_KEY') || getSafeServerEnv('NVIDIA_API_KEY');
const rawCopilotTtl = getSafeServerEnv('COPILOT_TTL_MS');

export const serverAiConfig = {
  // Canonical: GEMINI_API_KEY (with backward-compatible APP_GEMINI_API_KEY fallback)
  geminiApiKey: canonicalGeminiKey,
  hasGeminiKey: !!canonicalGeminiKey,

  // Canonical: NEMOTRON_API_KEY (with backward-compatible fallbacks)
  nemotronApiKey: canonicalNemotronKey,
  hasNemotronKey: !!canonicalNemotronKey,

  // Cache invalidation TTL in milliseconds (defaults to 15 minutes)
  copilotTtlMs: rawCopilotTtl ? (parseInt(rawCopilotTtl, 10) || 15 * 60 * 1000) : 15 * 60 * 1000,
};

export { validateEnvironment, getEnvironmentDiagnostics } from './validation';
export type { EnvironmentDiagnosticReport, VariableStatus } from './validation';
