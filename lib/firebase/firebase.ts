import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { firebaseConfig, isFirebaseConfigured } from '@/lib/config';

if (!isFirebaseConfigured) {
  console.warn(
    '⚠️ Firebase environment variables are missing (NEXT_PUBLIC_FIREBASE_API_KEY is not set). ' +
    'CivicHero is running in mock repository fallback mode. Check .env.example for required configuration keys.'
  );
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use custom firestoreDatabaseId according to Firebase standard pattern
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export const storage = getStorage(app);
export { isFirebaseConfigured };
