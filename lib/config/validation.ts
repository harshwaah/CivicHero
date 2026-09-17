/**
 * CivicHero Centralized Environment Validation Utility (Phase 8.2)
 *
 * Provides safe, non-crashing diagnostics for client & server subsystems.
 * Never outputs raw secret keys or tokens.
 * Accurately reports states: "Present", "Missing", or "Fallback Active".
 */

export type VariableStatus = 'Present' | 'Missing' | 'Fallback Active';

export interface VariableDiagnostic {
  name: string;
  scope: 'Public' | 'Server Secret';
  status: VariableStatus;
  description: string;
  fallbackDescription?: string;
}

export interface EnvironmentDiagnosticReport {
  timestamp: string;
  isFullyConfigured: boolean;
  variables: VariableDiagnostic[];
  subsystems: {
    firebase: {
      status: VariableStatus;
      projectId: string;
      databaseId: string;
      authDomain: string;
    };
    googleMaps: {
      status: VariableStatus;
    };
    geminiAI: {
      status: VariableStatus;
    };
    nemotronAI: {
      status: VariableStatus;
    };
    copilotCache: {
      status: VariableStatus;
      ttlMs: number;
    };
  };
}

export function validateEnvironment(): EnvironmentDiagnosticReport {
  const getEnv = (key: string): string => {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || '';
    }
    return '';
  };

  // 1. Firebase Variables
  const fbApiKey = getEnv('NEXT_PUBLIC_FIREBASE_API_KEY');
  const fbProjectId = getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  const fbAuthDomain = getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  const fbStorageBucket = getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  const fbSenderId = getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  const fbAppId = getEnv('NEXT_PUBLIC_FIREBASE_APP_ID');
  const fbDbId = getEnv('NEXT_PUBLIC_FIREBASE_DATABASE_ID');

  // 2. Maps Variables
  const mapsKey = getEnv('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
  const legacyMapsKey = getEnv('GOOGLE_MAPS_PLATFORM_KEY');

  // 3. AI Variables (Server Secrets)
  const geminiCanonical = getEnv('GEMINI_API_KEY');
  const geminiLegacy = getEnv('APP_GEMINI_API_KEY');
  const nemotronKey = getEnv('NEMOTRON_API_KEY');
  const nemotronAlt = getEnv('OPENROUTER_API_KEY') || getEnv('NVIDIA_API_KEY');
  const copilotTtl = getEnv('COPILOT_TTL_MS');

  const variables: VariableDiagnostic[] = [
    {
      name: 'NEXT_PUBLIC_FIREBASE_API_KEY',
      scope: 'Public',
      status: fbApiKey ? 'Present' : 'Fallback Active',
      description: 'Firebase Web API Key for client authentication & Firestore',
      fallbackDescription: fbApiKey ? undefined : 'Using mock in-memory data repository',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      scope: 'Public',
      status: fbProjectId ? 'Present' : 'Fallback Active',
      description: 'Target Firebase Google Cloud project identifier',
      fallbackDescription: fbProjectId ? undefined : 'Using default mock project namespace',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      scope: 'Public',
      status: fbAuthDomain ? 'Present' : (fbProjectId ? 'Present' : 'Fallback Active'),
      description: 'Firebase authentication redirect and token domain',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
      scope: 'Public',
      status: fbStorageBucket ? 'Present' : (fbProjectId ? 'Present' : 'Fallback Active'),
      description: 'Cloud Storage bucket for civic incident evidence media',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
      scope: 'Public',
      status: fbSenderId ? 'Present' : 'Fallback Active',
      description: 'Firebase Cloud Messaging numeric sender project ID',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_APP_ID',
      scope: 'Public',
      status: fbAppId ? 'Present' : 'Fallback Active',
      description: 'Unique Firebase Web Client Application Identifier',
    },
    {
      name: 'NEXT_PUBLIC_FIREBASE_DATABASE_ID',
      scope: 'Public',
      status: fbDbId ? 'Present' : 'Fallback Active',
      description: 'Cloud Firestore database identifier',
      fallbackDescription: fbDbId ? undefined : 'Defaults to (default) root database',
    },
    {
      name: 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
      scope: 'Public',
      status: mapsKey ? 'Present' : (legacyMapsKey ? 'Fallback Active' : 'Missing'),
      description: 'Google Maps Platform JavaScript API Key',
      fallbackDescription: !mapsKey && legacyMapsKey ? 'Resolved from GOOGLE_MAPS_PLATFORM_KEY alias' : undefined,
    },
    {
      name: 'GEMINI_API_KEY',
      scope: 'Server Secret',
      status: geminiCanonical ? 'Present' : (geminiLegacy ? 'Fallback Active' : 'Missing'),
      description: 'Server-side Google Gen AI Master API Key',
      fallbackDescription: !geminiCanonical && geminiLegacy ? 'Resolved from APP_GEMINI_API_KEY platform alias' : 'AI router uses deterministic simulation fallback',
    },
    {
      name: 'NEMOTRON_API_KEY',
      scope: 'Server Secret',
      status: nemotronKey ? 'Present' : (nemotronAlt ? 'Fallback Active' : 'Missing'),
      description: 'NVIDIA Nemotron / OpenRouter multimodal model key',
      fallbackDescription: !nemotronKey && nemotronAlt ? 'Resolved from secondary model provider key' : undefined,
    },
    {
      name: 'COPILOT_TTL_MS',
      scope: 'Server Secret',
      status: copilotTtl ? 'Present' : 'Fallback Active',
      description: 'Administrator Copilot briefing cache TTL in milliseconds',
      fallbackDescription: copilotTtl ? undefined : 'Defaults to 900000ms (15 minutes)',
    },
  ];

  const hasFirebase = !!(fbApiKey && fbProjectId);
  const hasMaps = !!(mapsKey || legacyMapsKey);
  const hasGemini = !!(geminiCanonical || geminiLegacy);
  const hasNemotron = !!(nemotronKey || nemotronAlt);

  return {
    timestamp: new Date().toISOString(),
    isFullyConfigured: hasFirebase && hasMaps && hasGemini,
    variables,
    subsystems: {
      firebase: {
        status: hasFirebase ? 'Present' : 'Fallback Active',
        projectId: fbProjectId || 'mock-civichero',
        databaseId: fbDbId || '(default)',
        authDomain: fbAuthDomain || (fbProjectId ? `${fbProjectId}.firebaseapp.com` : 'mock-civichero.firebaseapp.com'),
      },
      googleMaps: {
        status: hasMaps ? (mapsKey ? 'Present' : 'Fallback Active') : 'Missing',
      },
      geminiAI: {
        status: hasGemini ? (geminiCanonical ? 'Present' : 'Fallback Active') : 'Fallback Active',
      },
      nemotronAI: {
        status: hasNemotron ? (nemotronKey ? 'Present' : 'Fallback Active') : 'Missing',
      },
      copilotCache: {
        status: copilotTtl ? 'Present' : 'Fallback Active',
        ttlMs: copilotTtl ? (parseInt(copilotTtl, 10) || 15 * 60 * 1000) : 15 * 60 * 1000,
      },
    },
  };
}

export const getEnvironmentDiagnostics = validateEnvironment;
