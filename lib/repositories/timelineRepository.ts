import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
import { TimelineEvent } from '../models';
import { mockReports } from '../mockReports';

export const TimelineRepository = {
  /**
   * Fetch timeline events for a specific issue
   */
  async getEventsByIssueId(issueId: string): Promise<TimelineEvent[]> {
    const report = mockReports.find((r) => r.id === issueId);
    const mockEvents: TimelineEvent[] = (report?.timeline || []).map((e: any) => ({
      id: e.id,
      type: e.type,
      title: e.title,
      description: e.description,
      timestamp: e.timestamp,
      status: e.status,
      category: e.category,
    }));

    if (!isFirebaseConfigured) {
      return mockEvents;
    }

    try {
      // Future Firebase subcollection lookup:
      // const ref = collection(db, 'issues', issueId, 'timeline');
      // const snap = await getDocs(ref);
      // return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TimelineEvent));
      return mockEvents;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `issues/${issueId}/timeline`);
    }
  },

  /**
   * Append a new stage verification event to an issue's timeline ledger
   */
  async addEvent(issueId: string, event: Omit<TimelineEvent, 'id'>): Promise<TimelineEvent> {
    const newEvent: TimelineEvent = {
      ...event,
      id: `timeline-${Date.now()}`,
    };

    const report = mockReports.find((r) => r.id === issueId);
    if (report) {
      if (!report.timeline) report.timeline = [];
      report.timeline.push(newEvent as any);
    }

    if (!isFirebaseConfigured) {
      return newEvent;
    }

    try {
      // Future Firebase subcollection write:
      // await addDoc(collection(db, 'issues', issueId, 'timeline'), newEvent);
      return newEvent;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${issueId}/timeline`);
    }
  },
};
