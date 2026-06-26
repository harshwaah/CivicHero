import { db, isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
import { TimelineEvent } from '../models';
import { IssueRepository } from './issueRepository';

type TimelineSubscriber = (events: TimelineEvent[]) => void;
const timelineSubscribers: Map<string, TimelineSubscriber[]> = new Map();

function notifyTimelineSubscribers(issueId: string, events: TimelineEvent[]) {
  const subs = timelineSubscribers.get(issueId);
  if (subs) {
    subs.forEach(sub => sub([...events]));
  }
}

export const TimelineRepository = {
  subscribe(issueId: string, callback: TimelineSubscriber): () => void {
    if (!timelineSubscribers.has(issueId)) {
      timelineSubscribers.set(issueId, []);
    }
    timelineSubscribers.get(issueId)!.push(callback);
    
    IssueRepository.getById(issueId).then(issue => {
      const events = (issue?.timeline || []).map((e: any) => ({
        id: e.id,
        type: e.type,
        title: e.title,
        description: e.description,
        timestamp: e.timestamp,
        status: e.status,
        category: e.category,
      }));
      callback(events);
    });
    
    return () => {
      const subs = timelineSubscribers.get(issueId) || [];
      timelineSubscribers.set(issueId, subs.filter(sub => sub !== callback));
    };
  },

  /**
   * Fetch timeline events for a specific issue
   */
  async getEventsByIssueId(issueId: string): Promise<TimelineEvent[]> {
    const issue = await IssueRepository.getById(issueId);
    const mockEvents: TimelineEvent[] = (issue?.timeline || []).map((e: any) => ({
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
      return mockEvents;
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

    const issue = await IssueRepository.getById(issueId);
    if (issue) {
      const updatedTimeline = [...(issue.timeline || []), newEvent as any];
      await IssueRepository.update(issueId, { timeline: updatedTimeline });
      notifyTimelineSubscribers(issueId, updatedTimeline);
    }

    if (!isFirebaseConfigured) {
      return newEvent;
    }

    try {
      return newEvent;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `issues/${issueId}/timeline`);
      throw err;
    }
  },
};
