import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';

// Use firebase-applet-config.json as primary configuration if it contains a valid project configuration
const hasAppletConfig = !!(firebaseAppletConfig && firebaseAppletConfig.apiKey && firebaseAppletConfig.projectId);

const activeConfig = hasAppletConfig
  ? {
      apiKey: firebaseAppletConfig.apiKey,
      authDomain: firebaseAppletConfig.authDomain,
      projectId: firebaseAppletConfig.projectId,
      storageBucket: firebaseAppletConfig.storageBucket,
      messagingSenderId: firebaseAppletConfig.messagingSenderId,
      appId: firebaseAppletConfig.appId,
    }
  : process.env.NEXT_PUBLIC_FIREBASE_API_KEY
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  : {
      apiKey: 'mock-api-key-civichero-placeholder',
      authDomain: 'mock-civichero.firebaseapp.com',
      projectId: 'mock-civichero',
      storageBucket: 'mock-civichero.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
    };

const isFirebaseConfigured = hasAppletConfig || !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!isFirebaseConfigured) {
  console.warn(
    '⚠️ Firebase Environment variables are missing (NEXT_PUBLIC_FIREBASE_API_KEY is not set). ' +
    'CivicHero is running in mock repository fallback mode. Check .env.example for required configuration keys.'
  );
}

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

export const auth = getAuth(app);

// Use custom firestoreDatabaseId if configured in the applet configuration
export const db = hasAppletConfig && firebaseAppletConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseAppletConfig.firestoreDatabaseId)
  : getFirestore(app);

export const storage = getStorage(app);
export { isFirebaseConfigured };
