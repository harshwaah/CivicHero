import { db, isFirebaseConfigured, handleFirestoreError, OperationType, collection, doc, getDocs, updateDoc, query, where, orderBy, setDoc, onSnapshot } from '../firebase/firestore';
import { Notification } from '../models';

const defaultNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'citizen-admin-1',
    title: 'Report Verified',
    message: 'Your report "Large expanding pothole in center lane" has been co-signed by 5 neighbors.',
    type: 'community',
    isRead: false,
    timestamp: '2 hours ago',
    relatedIssueId: 'issue-1',
  },
  {
    id: 'notif-2',
    userId: 'citizen-admin-1',
    title: 'Work Started',
    message: 'Public Works Dept has dispatched a crew to address your reported water main leak.',
    type: 'status_update',
    isRead: true,
    timestamp: '1 day ago',
    relatedIssueId: 'issue-3',
  },
];

let seeded = false;

async function ensureNotificationSeedData() {
  if (!isFirebaseConfigured || seeded) return;
  try {
    const snapshot = await getDocs(collection(db, 'notifications'));
    if (snapshot.empty) {
      seeded = true;
      for (const notif of defaultNotifications) {
        await setDoc(doc(db, 'notifications', notif.id), notif);
      }
    } else {
      seeded = true;
    }
  } catch (err) {
    console.error('Error seeding notifications:', err);
  }
}

export const NotificationRepository = {
  /**
   * Fetch all notifications for a specific user
   */
  async getByUserId(userId: string): Promise<Notification[]> {
    if (!isFirebaseConfigured) {
      return defaultNotifications;
    }

    try {
      await ensureNotificationSeedData();
      const ref = collection(db, 'notifications');
      const q = query(ref, where('userId', '==', userId));
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification));
      return notifications;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'notifications');
      return [];
    }
  },

  /**
   * Subscribe to notifications for a user in real-time
   */
  subscribeByUserId(userId: string, callback: (notifications: Notification[]) => void): () => void {
    if (!isFirebaseConfigured) {
      callback([...defaultNotifications]);
      return () => {};
    }

    ensureNotificationSeedData();
    const ref = collection(db, 'notifications');
    const q = query(ref, where('userId', '==', userId));
    return onSnapshot(q, (snapshot: any) => {
      const list = snapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id } as Notification));
      callback(list);
    }, (err: any) => {
      console.error('Error listening to notifications:', err);
    });
  },

  /**
   * Create a new notification
   */
  async create(notification: Omit<Notification, 'id'>): Promise<Notification> {
    const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newNotif: Notification = {
      ...notification,
      id,
    };

    if (!isFirebaseConfigured) {
      defaultNotifications.unshift(newNotif);
      return newNotif;
    }

    try {
      await setDoc(doc(db, 'notifications', id), newNotif);
      return newNotif;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${id}`);
      throw err;
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    if (!isFirebaseConfigured) {
      const notif = defaultNotifications.find((n) => n.id === id);
      if (notif) {
        notif.isRead = true;
      }
      return true;
    }

    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
      return false;
    }
  },
};
