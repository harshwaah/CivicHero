import { AnalyticsRepository, CityAnalytics } from '../repositories/analyticsRepository';

export const AnalyticsService = {
  async getCityScorecard(): Promise<CityAnalytics> {
    return AnalyticsRepository.getCityScorecard();
  },
};
