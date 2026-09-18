import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env or .env.local if present
const rootDir = path.resolve(__dirname, '..');
const envPath = path.resolve(rootDir, '.env.local');
const fallbackEnvPath = path.resolve(rootDir, '.env');

function loadEnvFile(filePath) {
  if (fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(envPath);
loadEnvFile(fallbackEnvPath);

const backupPath = path.resolve(__dirname, '../data_backup.json');
const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'mock-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-civichero'}.firebaseapp.com`,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-civichero',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-civichero'}.firebasestorage.app`,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000000000'
};

console.log('Connecting to Firebase project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig, 'migration-worker');
const db = getFirestore(app);

async function runSync() {
  console.log(`Starting sync: ${backupData.issues.length} issues, ${backupData.users.length} users, ${backupData.notifications.length} notifications`);
  
  let issuesSynced = 0;
  for (const issue of backupData.issues) {
    try {
      await setDoc(doc(db, 'issues', issue.id), issue);
      issuesSynced++;
    } catch (err) {
      console.error(`Failed to write issue ${issue.id}:`, err.message);
    }
  }

  let usersSynced = 0;
  for (const user of backupData.users) {
    try {
      const uid = user.uid || user.id;
      await setDoc(doc(db, 'users', uid), user);
      usersSynced++;
    } catch (err) {
      console.error(`Failed to write user ${user.uid || user.id}:`, err.message);
    }
  }

  let notifsSynced = 0;
  for (const notif of backupData.notifications) {
    try {
      await setDoc(doc(db, 'notifications', notif.id), notif);
      notifsSynced++;
    } catch (err) {
      console.error(`Failed to write notification ${notif.id}:`, err.message);
    }
  }

  console.log(`Sync completed: ${issuesSynced}/${backupData.issues.length} issues, ${usersSynced}/${backupData.users.length} users, ${notifsSynced}/${backupData.notifications.length} notifications.`);
}

runSync().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
