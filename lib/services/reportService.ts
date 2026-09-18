import { IssueRepository } from '../repositories/issueRepository';
import { Issue } from '../models';
import { CommunityIntegrityAgent } from '../providers/ai/communityIntegrityAgent';
import { CommunityIntelligenceAgent } from '../providers/ai/communityIntelligenceAgent';
import { DEFAULT_MAP_CENTER } from '../config';

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
      coordinates: reportData.coordinates || { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng },
      trustMetrics: {
        coSigningCount: 1,
        accuracyRating: 100,
        verificationConfidence: 90,
        communityFlagsCount: 0,
        isVerified: false,
      },
    };

    const newIssue = await IssueRepository.create(issuePayload);

    // Fire and forget AI analysis background task
    setTimeout(async () => {
       try {
         // 1. Community Integrity Agent evaluates the report
         const integrityResult = await CommunityIntegrityAgent.evaluateReport(newIssue);
         
         // 2. Community Intelligence Agent analyzes for urgency and routing
         const intelligenceResult = await CommunityIntelligenceAgent.analyzeReport(newIssue);

         // Update the issue with AI insights
         const updatedIssue = { ...newIssue };
         updatedIssue.urgency = intelligenceResult.severityMatch as any;
         updatedIssue.category = intelligenceResult.categoryMatch;
         updatedIssue.trustMetrics = {
           ...updatedIssue.trustMetrics!,
           verificationConfidence: integrityResult.confidenceScore,
           isVerified: integrityResult.isVerified
         };
         
         // Add AI analysis events to timeline
         updatedIssue.timeline = [
           ...updatedIssue.timeline!,
           {
             id: `tl-ai-int-${Date.now()}`,
             type: 'update',
             title: 'AI Integrity Check',
             description: integrityResult.analysisSummary,
             timestamp: 'Just now',
           },
           {
             id: `tl-ai-intel-${Date.now()}`,
             type: 'update',
             title: 'AI Intelligence Routing',
             description: `Routed to ${intelligenceResult.routingTo}. ${intelligenceResult.aiSummary}`,
             timestamp: 'Just now',
           }
         ];

         await IssueRepository.update(newIssue.id, updatedIssue);

       } catch (err) {
         console.error("AI Analysis background task failed:", err);
       }
    }, 100); // Slight delay

    return newIssue;
  },
};
