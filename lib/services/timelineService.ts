import { TimelineRepository } from '../repositories/timelineRepository';
import { TimelineEvent } from '../models';

export const TimelineService = {
  subscribe(issueId: string, callback: (events: TimelineEvent[]) => void) {
    return TimelineRepository.subscribe(issueId, callback);
  },

  /**
   * Retrieves chronological checkpoints for a specific issue ID
   */
  async getTimeline(issueId: string): Promise<TimelineEvent[]> {
    return TimelineRepository.getEventsByIssueId(issueId);
  },

  /**
   * Logs a new milestone step (e.g. assigned, work started, repair complete)
   */
  async appendMilestone(
    issueId: string,
    type: string,
    title: string,
    description: string
  ): Promise<TimelineEvent> {
    const event: Omit<TimelineEvent, 'id'> = {
      type,
      title,
      description,
      timestamp: 'Just now',
    };
    return TimelineRepository.addEvent(issueId, event);
  },
};
