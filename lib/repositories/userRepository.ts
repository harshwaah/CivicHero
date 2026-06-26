import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
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

export const UserRepository = {
  /**
   * Fetch a citizen's profile details by uid
   */
  async getByUid(uid: string): Promise<Citizen | null> {
    if (!isFirebaseConfigured) {
      return defaultCitizen;
    }

    try {
      // Future Firebase lookup:
      // const snap = await getDoc(doc(db, 'users', uid));
      // return snap.exists() ? (snap.data() as Citizen) : null;
      return defaultCitizen;
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
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
      // Future Firebase write:
      // await setDoc(doc(db, 'users', uid), updatedCitizen, { merge: true });
      return updatedCitizen;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  },

  /**
   * Retrieve active local citizen leaderboard
   */
  async getLeaderboard(): Promise<Citizen[]> {
    return [
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
  },
};
