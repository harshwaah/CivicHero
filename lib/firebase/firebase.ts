import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Read Firebase configurations exclusively from environment variables
const activeConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const isFirebaseConfigured = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!isFirebaseConfigured) {
  console.warn(
    '⚠️ Firebase Environment variables are missing (NEXT_PUBLIC_FIREBASE_API_KEY is not set). ' +
    'CivicHero is running in mock repository fallback mode. Check .env.example for required configuration keys.'
  );
}

// Fallback config if environment variables are not set (e.g. for mock mode/offline fallback)
const finalConfig = isFirebaseConfigured
  ? activeConfig
  : {
      apiKey: 'mock-api-key-civichero-placeholder',
      authDomain: 'mock-civichero.firebaseapp.com',
      projectId: 'mock-civichero',
      storageBucket: 'mock-civichero.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
    };

const app = getApps().length === 0 ? initializeApp(finalConfig) : getApp();

export const auth = getAuth(app);

// Use custom firestoreDatabaseId if configured in environment variables
export const db = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID
  ? getFirestore(app, process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID)
  : getFirestore(app);

export const storage = getStorage(app);
export { isFirebaseConfigured };
