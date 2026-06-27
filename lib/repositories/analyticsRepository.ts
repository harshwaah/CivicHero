import { isFirebaseConfigured, handleFirestoreError, OperationType } from '../firebase/firestore';
import { IssueRepository } from './issueRepository';

export interface CityAnalytics {
  totalIssuesCount: number;
  resolvedIssuesCount: number;
  inProgressIssuesCount: number;
  reportedIssuesCount: number;
  activeCitizensCount: number;
  communityCoSigningsCount: number;
  averageResolutionDays: number;
  categoryDistribution: { name: string; value: number }[];
}

const mockAnalytics: CityAnalytics = {
  totalIssuesCount: 142,
  resolvedIssuesCount: 98,
  inProgressIssuesCount: 29,
  reportedIssuesCount: 15,
  activeCitizensCount: 1420,
  communityCoSigningsCount: 3840,
  averageResolutionDays: 4.2,
  categoryDistribution: [
    { name: 'Roads', value: 58 },
    { name: 'Utilities', value: 34 },
    { name: 'Water', value: 25 },
    { name: 'Safety', value: 15 },
    { name: 'Environment', value: 10 },
  ],
};

export const AnalyticsRepository = {
  /**
   * Fetch city-wide analytics scorecard
   */
  async getCityScorecard(): Promise<CityAnalytics> {
    if (!isFirebaseConfigured) {
      return mockAnalytics;
    }

    try {
      const issues = await IssueRepository.getAll();
      
      const totalIssuesCount = issues.length;
      const resolvedIssuesCount = issues.filter(i => i.status === 'Resolved').length;
      const inProgressIssuesCount = issues.filter(i => i.status === 'In Progress').length;
      const reportedIssuesCount = issues.filter(i => i.status === 'Reported').length;
      
      let communityCoSigningsCount = 0;
      const categoryMap = new Map<string, number>();
      
      issues.forEach(i => {
        communityCoSigningsCount += (i.verifiedByCount || 0);
        const count = categoryMap.get(i.category) || 0;
        categoryMap.set(i.category, count + 1);
      });
      
      const categoryDistribution = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

      return {
        totalIssuesCount,
        resolvedIssuesCount,
        inProgressIssuesCount,
        reportedIssuesCount,
        activeCitizensCount: 1420, // hardcoded mock as we don't have all users
        communityCoSigningsCount,
        averageResolutionDays: 4.2, // mock value
        categoryDistribution: categoryDistribution.length > 0 ? categoryDistribution : mockAnalytics.categoryDistribution,
      };
    } catch (err) {
      console.error('Failed to aggregate analytical insights:', err);
      handleFirestoreError(err, OperationType.LIST, 'analytics');
      return mockAnalytics;
    }
  },
};
