import { UserRepository } from '../repositories/userRepository';
import { IssueRepository } from '../repositories/issueRepository';
import { TrustMetrics } from '../models';

export const TrustService = {
  /**
   * Co-sign or verification event that modifies community reliability scores
   */
  async registerCoSigning(issueId: string, userId: string): Promise<TrustMetrics> {
    const issue = await IssueRepository.getById(issueId);
    if (!issue) throw new Error(`Issue ${issueId} not found`);

    const user = await UserRepository.getByUid(userId);
    const coSignWeight = user ? Math.max(1, Math.floor(user.trustScore / 10)) : 1;

    const currentMetrics = issue.trustMetrics || {
      coSigningCount: 0,
      accuracyRating: 100,
      verificationConfidence: 50,
      communityFlagsCount: 0,
      isVerified: false,
    };

    const newCoSignings = currentMetrics.coSigningCount + 1;
    // Calculate new accuracy rating incorporating trust weight
    const newAccuracy = Math.min(100, currentMetrics.accuracyRating + coSignWeight);
    const newConfidence = Math.min(100, Math.floor((newCoSignings / 5) * 100)); // Quorum is 5 signers
    const isNowVerified = newCoSignings >= 5;

    const updatedMetrics: TrustMetrics = {
      coSigningCount: newCoSignings,
      accuracyRating: newAccuracy,
      verificationConfidence: newConfidence,
      communityFlagsCount: currentMetrics.communityFlagsCount,
      isVerified: isNowVerified,
    };

    // Update Issue
    await IssueRepository.update(issueId, {
      trustMetrics: updatedMetrics,
      verifiedByCount: newCoSignings,
    });

    return updatedMetrics;
  },

  /**
   * Submit a flag disputing the accuracy of a report
   */
  async flagIssue(issueId: string): Promise<TrustMetrics> {
    const issue = await IssueRepository.getById(issueId);
    if (!issue) throw new Error(`Issue ${issueId} not found`);

    const currentMetrics = issue.trustMetrics || {
      coSigningCount: 0,
      accuracyRating: 100,
      verificationConfidence: 50,
      communityFlagsCount: 0,
      isVerified: false,
    };

    const updatedFlags = currentMetrics.communityFlagsCount + 1;
    const newAccuracy = Math.max(0, currentMetrics.accuracyRating - 20); // Demote accuracy on dispute

    const updatedMetrics: TrustMetrics = {
      ...currentMetrics,
      communityFlagsCount: updatedFlags,
      accuracyRating: newAccuracy,
    };

    await IssueRepository.update(issueId, { trustMetrics: updatedMetrics });
    return updatedMetrics;
  },
};
