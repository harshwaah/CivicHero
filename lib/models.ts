/**
 * CivicHero Centralized Canonical Data Models
 * Single source of truth for types and interfaces shared across the application.
 */

export interface Citizen {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  trustScore: number; // Civic trust rating score (0 to 100)
  completedReports: number;
  verifiedReports: number;
  badgeTitle?: string; // e.g., "Eagle Scout", "First Responder"
  joinedAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string; // e.g. "DPW-ROAD", "UTILITY-GRID"
  headName: string;
  contactEmail: string;
  activeWorkers: number;
  resolvedCount: number;
}

export interface TrustMetrics {
  coSigningCount: number;
  accuracyRating: number; // 0 to 100%
  verificationConfidence: number; // AI-assigned confidence
  communityFlagsCount: number;
  isVerified: boolean;
}

export interface AIAnalysis {
  reportId: string;
  categoryMatch: string; // Suggested taxonomy
  severityMatch: 'Low' | 'Medium' | 'High' | 'Critical';
  routingTo: string; // Dynamic destination department
  confidence: number; // Percentage Match 0-100
  analysisSummary: string; // Narrative computed from optical scanning
  detectedObjects: string[];
  processedAt: string;
}

export interface TimelineEvent {
  id: string;
  type: string; // e.g. 'reported', 'ai_categorized', 'community_verified', etc.
  title: string;
  description: string;
  timestamp: string;
  actor?: string;
  status?: string;
  category?: string;
}

export interface Comment {
  id: string;
  issueId?: string;
  user?: {
    name: string;
    avatar?: string;
    isOfficial?: boolean;
    badge?: string;
  };
  timeAgo?: string;
  text?: string;
  likesCount?: number;
  
  // Keep original fields for backward compatibility during transition
  authorName?: string;
  authorAvatar?: string;
  authorBadge?: string;
  content?: string;
  timestamp?: string;
  likes?: number;
}

export interface Verification {
  issueId: string;
  userId: string;
  userName: string;
  userBadge?: string;
  timestamp: string;
  type: 'confirm_presence' | 'flag_resolved' | 'dispute_report';
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  status: 'Live' | 'Reported' | 'In Progress' | 'Resolved';
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Live' | 'Reported' | 'In Progress' | 'Resolved';
  timestamp: string;
  location: string;
  upvotes: number;
  commentsCount?: number;
  imageUrl?: string;
  distance?: string;
  aiSummary?: {
    summary: string;
    confidence: number;
    categoryMatch: string;
    severityMatch: string;
    routingTo: string;
  };
  confidence?: number;
  verifiedByCount?: number;
  reporter?: {
    name: string;
    avatar?: string;
    badge?: string;
  };
  reporterName?: string;
  reporterBadge?: string;
  timeline?: TimelineEvent[];
  discussion?: Comment[];
  comments?: Comment[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  verificationStats?: {
    confirmCount: number;
    alreadyFixedCount: number;
    notFoundCount: number;
    spamCount: number;
  };
  trustMetrics?: TrustMetrics;
  routingDepartment?: string;
  relatedIssues?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'alert' | 'system' | 'status_update' | 'community';
  isRead: boolean;
  timestamp: string;
  relatedIssueId?: string;
}
