import { isFirebaseConfigured } from '../firebase/firestore';

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
      // Future Firebase query summaries
      return mockAnalytics;
    } catch (err) {
      console.error('Failed to aggregate analytical insights:', err);
      return mockAnalytics;
    }
  },
};
