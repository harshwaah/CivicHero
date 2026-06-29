/**
 * CivicHero Reusable Utility Functions
 * Centralized helpers for formatting, mapping, and utility layers.
 */

import { DESIGN_TOKENS } from './designTokens';

/**
 * Format confidence percentage nicely
 */
export function formatConfidence(score: number | string | undefined): string {
  if (score === undefined || score === null) return '0%';
  const num = typeof score === 'string' ? parseFloat(score) : score;
  return `${num}%`;
}

/**
 * Get status style classes
 */
export function getStatusClasses(status: string): string {
  const mapping = DESIGN_TOKENS.colors.status[status as keyof typeof DESIGN_TOKENS.colors.status];
  return mapping ? mapping.bg : 'bg-slate-500/10 text-slate-600 border-slate-500/20';
}

/**
 * Get status badge indicator dot color
 */
export function getStatusDotClasses(status: string): string {
  const mapping = DESIGN_TOKENS.colors.status[status as keyof typeof DESIGN_TOKENS.colors.status];
  return mapping ? mapping.dot : 'bg-slate-500';
}

/**
 * Get status text colors
 */
export function getStatusTextClasses(status: string): string {
  const mapping = DESIGN_TOKENS.colors.status[status as keyof typeof DESIGN_TOKENS.colors.status];
  return mapping ? mapping.text : 'text-slate-600';
}

/**
 * Get priority style classes
 */
export function getPriorityClasses(priority: string): string {
  const mapping = DESIGN_TOKENS.colors.priority[priority as keyof typeof DESIGN_TOKENS.colors.priority];
  return mapping || 'bg-slate-50 text-slate-700 border-slate-100';
}

/**
 * Format dates/time strings cleanly
 */
export function formatRelativeTime(timeStr: string): string {
  if (!timeStr) return '';
  return timeStr;
}

/**
 * Safe formatter for any timestamp format, handling Firestore Timestamps, Date objects, and strings.
 */
export function formatTimestamp(timestamp: any): string {
  if (!timestamp) return 'Just now';
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (typeof timestamp === 'object') {
    if (typeof timestamp.seconds === 'number') {
      const d = new Date(timestamp.seconds * 1000);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (typeof timestamp.toDate === 'function') {
      const d = timestamp.toDate();
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }
  return String(timestamp);
}

/**
 * Clean up location names (e.g. truncating long paths or uppercase formatting)
 */
export function formatLocation(loc: string): string {
  if (!loc) return 'Unknown Location';
  return loc.trim();
}

/**
 * Resolves the issue description based on the priority:
 * User description -> AI Summary -> Fallback text
 * And filters out any empty or placeholder string.
 */
export function getIssueDescription(
  description: string | undefined,
  aiSummary: any,
  fallbackText = 'No additional description provided.'
): string {
  if (description && description.trim() !== '' && description !== 'No secondary details provided.' && description !== 'No additional description provided.') {
    return description;
  }
  
  // aiSummary can be a string or an object with a summary property
  const aiSummaryText = aiSummary && typeof aiSummary === 'object' ? aiSummary.summary : aiSummary;
  if (aiSummaryText && aiSummaryText.trim() !== '') {
    return aiSummaryText;
  }
  
  return fallbackText;
}

/**
 * Calculates a sort score based on the issue's id and timestamp
 * to enable consistent "Newest first" sorting.
 */
export function getSortScore(issue: any): number {
  if (!issue) return 0;
  
  // 1. If the ID is a Date-based string (e.g., issue-1719600000000)
  if (issue.id && typeof issue.id === 'string' && issue.id.startsWith('issue-')) {
    const tsStr = issue.id.replace('issue-', '');
    const ts = parseInt(tsStr, 10);
    if (!isNaN(ts)) return ts;
  }
  
  // 2. Try parsing relative/absolute timestamp strings first to get real date/time
  if (issue.timestamp && typeof issue.timestamp === 'string') {
    const lower = issue.timestamp.toLowerCase();
    if (lower === 'just now' || lower === 'recent') {
      return Date.now();
    }
    if (lower.includes('mins ago') || lower.includes('min ago')) {
      const mins = parseInt(lower, 10) || 0;
      return Date.now() - mins * 60 * 1000;
    }
    if (lower.includes('hours ago') || lower.includes('hour ago')) {
      const hours = parseInt(lower, 10) || 0;
      return Date.now() - hours * 60 * 60 * 1000;
    }
    if (lower.includes('days ago') || lower.includes('day ago')) {
      const days = parseInt(lower, 10) || 0;
      return Date.now() - days * 24 * 60 * 60 * 1000;
    }
    if (lower.includes('today')) {
      return Date.now() - 2 * 60 * 60 * 1000; // assume 2 hours ago today
    }
    
    const parsed = Date.parse(issue.timestamp);
    if (!isNaN(parsed)) return parsed;
  }

  // 3. Fallback to sequential mock report (e.g., report-1)
  if (issue.id && typeof issue.id === 'string' && issue.id.startsWith('report-')) {
    const numStr = issue.id.replace('report-', '');
    const num = parseInt(numStr, 10);
    if (!isNaN(num)) {
      // Scale sequential IDs (report-1 oldest, report-10 newer)
      // Add it to a baseline time (e.g., 3 days ago) so it's a valid recent timestamp
      const baseline = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days ago
      return baseline + num * 60 * 60 * 1000; // each step is 1 hour
    }
  }
  
  return 0;
}
