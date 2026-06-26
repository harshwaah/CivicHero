import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
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

// Ensure standard or dummy config is initialized safely
const activeConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: 'mock-api-key-civichero-placeholder',
      authDomain: 'mock-civichero.firebaseapp.com',
      projectId: 'mock-civichero',
      storageBucket: 'mock-civichero.appspot.com',
      messagingSenderId: '000000000000',
      appId: '1:000000000000:web:0000000000000000000000',
    };

const app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { isFirebaseConfigured };
