import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
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

export const NotificationRepository = {
  /**
   * Fetch all notifications for a specific user
   */
  async getByUserId(userId: string): Promise<Notification[]> {
    if (!isFirebaseConfigured) {
      return defaultNotifications;
    }

    try {
      // Future Firebase Query Implementation
      // const ref = collection(db, 'notifications');
      // const q = query(ref, where('userId', '==', userId), orderBy('timestamp', 'desc'));
      // ...
      return defaultNotifications;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'notifications');
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<boolean> {
    const notif = defaultNotifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
    }

    if (!isFirebaseConfigured) {
      return true;
    }

    try {
      // Future Firebase Update Implementation
      // await updateDoc(doc(db, 'notifications', id), { isRead: true });
      return true;
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  },
};
