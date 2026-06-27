import { db, isFirebaseConfigured, handleFirestoreError, OperationType, collection, doc, getDoc, getDocs, setDoc } from '../firebase/firestore';
import { Citizen } from '../models';

// Default simulation active profile
const defaultCitizen: Citizen = {
  uid: 'citizen-admin-1',
  name: 'Marcus Vance',
  email: 'marcus.vance@civichero.org',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  trustScore: 94,
  completedReports: 14,
  verifiedReports: 38,
  badgeTitle: 'Neighborhood Warden',
  joinedAt: 'Feb 2026',
};

const defaultLeaderboard: Citizen[] = [
  defaultCitizen,
  {
    uid: 'citizen-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@civichero.org',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    trustScore: 89,
    completedReports: 9,
    verifiedReports: 22,
    badgeTitle: 'Pavement Pioneer',
    joinedAt: 'Mar 2026',
  },
  {
    uid: 'citizen-3',
    name: 'Carlos Mendez',
    email: 'carlos.m@civichero.org',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
    trustScore: 82,
    completedReports: 5,
    verifiedReports: 12,
    badgeTitle: 'Hydraulic Helper',
    joinedAt: 'Jan 2026',
  },
];

let seeded = false;

async function ensureUserSeedData() {
  if (!isFirebaseConfigured || seeded) return;
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    if (snapshot.empty) {
      seeded = true;
      for (const user of defaultLeaderboard) {
        await setDoc(doc(db, 'users', user.uid), user);
      }
    } else {
      seeded = true;
    }
  } catch (err) {
    console.error('Error seeding users:', err);
  }
}

export const UserRepository = {
  /**
   * Fetch a citizen's profile details by uid
   */
  async getByUid(uid: string): Promise<Citizen | null> {
    if (!isFirebaseConfigured) {
      return defaultCitizen;
    }

    try {
      await ensureUserSeedData();
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? (snap.data() as Citizen) : null;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
      return null;
    }
  },

  /**
   * Create or update a user's record
   */
  async save(uid: string, data: Partial<Citizen>): Promise<Citizen> {
    const updatedCitizen = {
      ...defaultCitizen,
      ...data,
      uid,
    };

    if (!isFirebaseConfigured) {
      return updatedCitizen;
    }

    try {
      await setDoc(doc(db, 'users', uid), updatedCitizen, { merge: true });
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.data() as Citizen;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
      throw err;
    }
  },

  /**
   * Retrieve active local citizen leaderboard
   */
  async getLeaderboard(): Promise<Citizen[]> {
    if (!isFirebaseConfigured) {
      return defaultLeaderboard;
    }
    
    try {
      await ensureUserSeedData();
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Citizen)).sort((a, b) => b.trustScore - a.trustScore);
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `users`);
      return defaultLeaderboard;
    }
  },
};
