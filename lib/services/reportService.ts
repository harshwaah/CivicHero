import { IssueRepository } from '../repositories/issueRepository';
import { Issue } from '../models';

export const ReportService = {
  /**
   * Submits a newly reported incident to the system
   */
  async submitNewReport(reportData: {
    title: string;
    description: string;
    category: string;
    urgency: 'Low' | 'Medium' | 'High' | 'Critical';
    location: string;
    imageUrl?: string;
    reporterName?: string;
    reporterBadge?: string;
    coordinates?: { lat: number; lng: number };
  }): Promise<Issue> {
    const defaultTimeline = [
      {
        id: `tl-init-${Date.now()}`,
        type: 'reported',
        title: 'Report Submitted',
        description: 'Neighborhood concern logged into the ledger.',
        timestamp: 'Just now',
      },
    ];

    const issuePayload: Omit<Issue, 'id'> = {
      title: reportData.title,
      description: reportData.description,
      category: reportData.category,
      urgency: reportData.urgency,
      status: 'Reported',
      timestamp: 'Just now',
      location: reportData.location,
      upvotes: 0,
      commentsCount: 0,
      imageUrl: reportData.imageUrl,
      verifiedByCount: 1,
      reporterName: reportData.reporterName || 'Citizen Hero',
      reporterBadge: reportData.reporterBadge || 'First-time Reporter',
      timeline: defaultTimeline,
      comments: [],
      coordinates: reportData.coordinates || { lat: 37.7749, lng: -122.4194 },
      trustMetrics: {
        coSigningCount: 1,
        accuracyRating: 100,
        verificationConfidence: 90,
        communityFlagsCount: 0,
        isVerified: false,
      },
    };

    return IssueRepository.create(issuePayload);
  },
};
