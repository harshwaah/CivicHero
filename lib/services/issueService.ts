import { IssueRepository } from '../repositories/issueRepository';
import { NotificationRepository } from '../repositories/notificationRepository';
import { Issue, Comment } from '../models';

export const IssueService = {
  subscribe(callback: (issues: Issue[]) => void) {
    return IssueRepository.subscribe(callback);
  },

  subscribeToIssue(id: string, callback: (issue: Issue | null) => void) {
    return IssueRepository.subscribeToIssue(id, callback);
  },

  /**
   * List all reports with optional categories and search keywords
   */
  async getIssues(category?: string, queryStr?: string): Promise<Issue[]> {
    let list = await IssueRepository.getAll();

    if (category && category !== 'All') {
      list = list.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    }

    if (queryStr) {
      const lower = queryStr.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower) ||
          item.location.toLowerCase().includes(lower)
      );
    }

    return list;
  },

  /**
   * Fetch details of a single report
   */
  async getIssueDetails(id: string): Promise<Issue | null> {
    return IssueRepository.getById(id);
  },

  /**
   * Update issue status and append timeline event
   */
  async updateIssueStatus(id: string, status: 'Live' | 'Reported' | 'In Progress' | 'Resolved', actor: string): Promise<Issue> {
    const issue = await IssueRepository.update(id, { status });
    await import('./timelineService').then(m => m.TimelineService.appendMilestone(
      id,
      'status_update',
      `Status updated to ${status}`,
      `The issue status was changed to ${status} by ${actor}.`
    ));

    // Create notifications inside Firestore
    try {
      if (status === 'In Progress') {
        await NotificationRepository.create({
          userId: 'citizen-admin-1',
          title: 'Work Started',
          message: `Public Works has started working on: "${issue.title}".`,
          type: 'status_update',
          isRead: false,
          timestamp: 'Just now',
          relatedIssueId: id,
        });
      } else if (status === 'Resolved') {
        await NotificationRepository.create({
          userId: 'citizen-admin-1',
          title: 'Issue Resolved',
          message: `Hurrah! The issue "${issue.title}" is now marked as Resolved. Please verify!`,
          type: 'status_update',
          isRead: false,
          timestamp: 'Just now',
          relatedIssueId: id,
        });
        // Create Admin notification for resolution and trust updates
        await NotificationRepository.create({
          userId: 'admin-1',
          title: 'Trust Changes Recorded',
          message: `Issue "${issue.title}" was resolved. Social trust metrics updated.`,
          type: 'system',
          isRead: false,
          timestamp: 'Just now',
          relatedIssueId: id,
        });
      }
    } catch (err) {
      console.error('Error creating status notification:', err);
    }

    return issue;
  },

  /**
   * Assign issue to a department
   */
  async assignDepartment(id: string, department: string, actor: string): Promise<Issue> {
    const issue = await IssueRepository.update(id, { routingDepartment: department });
    await import('./timelineService').then(m => m.TimelineService.appendMilestone(
      id,
      'department_assigned',
      `Assigned to ${department}`,
      `The issue has been assigned to the ${department} department for resolution.`
    ));

    // Create assigned notifications
    try {
      await NotificationRepository.create({
        userId: 'citizen-admin-1',
        title: 'Department Assigned',
        message: `Your report "${issue.title}" has been routed to the ${department} department.`,
        type: 'status_update',
        isRead: false,
        timestamp: 'Just now',
        relatedIssueId: id,
      });

      // Admin notification
      await NotificationRepository.create({
        userId: 'admin-1',
        title: 'Workforce Assignment',
        message: `Issue "${issue.title}" assigned to department: ${department}.`,
        type: 'system',
        isRead: false,
        timestamp: 'Just now',
        relatedIssueId: id,
      });
    } catch (err) {
      console.error('Error creating assignment notification:', err);
    }

    return issue;
  },

  /**
   * Append a citizen comment to a report
   */
  async postComment(issueId: string, content: string, authorName: string, authorBadge?: string): Promise<Comment> {
    if (!content.trim()) throw new Error('Comment content cannot be empty.');
    return IssueRepository.addComment(issueId, content, authorName, authorBadge);
  },

  /**
   * Upvote a report to raise community awareness
   */
  async supportReport(id: string): Promise<number> {
    return IssueRepository.upvote(id);
  },
};
