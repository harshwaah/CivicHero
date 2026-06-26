import { IssueRepository } from '../repositories/issueRepository';
import { Issue, Comment } from '../models';

export const IssueService = {
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
