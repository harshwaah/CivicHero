import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
import { TimelineEvent } from '../models';
import { IssueRepository } from './issueRepository';

type TimelineSubscriber = (events: TimelineEvent[]) => void;

export const TimelineRepository = {
  subscribe(issueId: string, callback: TimelineSubscriber): () => void {
    return IssueRepository.subscribeToIssue(issueId, (issue) => {
      if (issue) {
        const events = (issue.timeline || []).map((e: any) => ({
          id: e.id,
          type: e.type,
          title: e.title,
          description: e.description,
          timestamp: e.timestamp,
          status: e.status,
          category: e.category,
        }));
        callback(events);
      } else {
        callback([]);
      }
    });
  },

  /**
   * Fetch timeline events for a specific issue
   */
  async getEventsByIssueId(issueId: string): Promise<TimelineEvent[]> {
    try {
      const issue = await IssueRepository.getById(issueId);
      return (issue?.timeline || []).map((e: any) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        timestamp: e.timestamp,
        status: e.status,
        category: e.category,
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, `issues/${issueId}/timeline`);
      return [];
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

    try {
      const issue = await IssueRepository.getById(issueId);
      if (issue) {
        const updatedTimeline = [...(issue.timeline || []), newEvent as any];
        await IssueRepository.update(issueId, { timeline: updatedTimeline });
      }
      return newEvent;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${issueId}/timeline`);
      throw err;
    }
  },
};
