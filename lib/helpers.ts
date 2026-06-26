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
 * Clean up location names (e.g. truncating long paths or uppercase formatting)
 */
export function formatLocation(loc: string): string {
  if (!loc) return 'Unknown Location';
  return loc.trim();
}
