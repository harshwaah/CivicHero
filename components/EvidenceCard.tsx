'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { MapPin, ArrowRight, Check } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  type: 'reported' | 'ai_categorized' | 'community_verified' | 'assigned' | 'work_started' | 'repair_completed' | 'community_confirmation' | 'closed';
  title: string;
  time: string;
  actor: string;
  description: string;
  imageUrl?: string;
  status: string;
}

export interface DiscussionComment {
  id: string;
  user: {
    name: string;
    avatar: string;
    isOfficial?: boolean;
    badge?: string;
  };
  timeAgo: string;
  text: string;
  likesCount: number;
  replies?: DiscussionComment[];
}

export interface CivicReport {
  id: string;
  title: string;
  description: string;
  location: string;
  distance: string;
  imageUrl: string;
  timeAgo: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Live' | 'Reported' | 'In Progress' | 'Resolved';
  watchingCount: number;
  verifiedCount?: number;
  timeline?: TimelineEvent[];
  reporter?: {
    name: string;
    avatar: string;
    badge?: string;
  };
  discussion?: DiscussionComment[];
  verificationStats?: {
    confirmCount: number;
    alreadyFixedCount: number;
    notFoundCount: number;
    spamCount: number;
  };
  aiSummary?: {
    summary: string;
    confidence: number;
    categoryMatch: string;
    severityMatch: string;
    routingTo: string;
  };
  relatedIssues?: string[];
}

interface EvidenceCardProps {
  report: CivicReport;
}

export default function EvidenceCard({ report }: EvidenceCardProps) {
  // Determine color theme based on priority & status
  const getStatusBadge = () => {
    switch (report.status) {
      case 'Live':
        return {
          bg: 'bg-red-500/95 text-white',
          label: 'LIVE',
          pulse: true
        };
      case 'Resolved':
        return {
          bg: 'bg-emerald-500/95 text-white',
          label: 'RESOLVED',
          pulse: false
        };
      case 'In Progress':
        return {
          bg: 'bg-amber-500/95 text-white',
          label: 'IN PROGRESS',
          pulse: true
        };
      default:
        return {
          bg: 'bg-blue-500/95 text-white',
          label: 'REPORTED',
          pulse: false
        };
    }
  };

  const getPriorityBadge = () => {
    switch (report.priority) {
      case 'Critical':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'High':
        return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  const badge = getStatusBadge();

  return (
    <motion.div
      className="bg-white rounded-[28px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full group"
      whileHover={{ y: -4 }}
    >
      {/* Visual Top Image Stage */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
        <Image
          src={report.imageUrl}
          alt={report.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        {/* Soft dark vignette gradient on bottom of image to protect overlay text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges overlay */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          {/* Status badge with glassmorphism backing */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono font-bold tracking-wider ${badge.bg} shadow-sm backdrop-blur-sm border border-white/10`}>
            {badge.pulse && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
            )}
            {badge.label}
          </div>

          {/* Time ago floating glass pill */}
          <div className="bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-mono text-white/90 border border-white/10 tracking-wider">
            {report.timeAgo.toUpperCase()}
          </div>
        </div>

        {/* Geotag location overlay on bottom of image */}
        <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none">
          <div className="flex items-center gap-1 text-[11px] font-mono text-slate-100 drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-brand-secondary" />
            <span>{report.location} • {report.distance}</span>
          </div>
        </div>
      </div>

      {/* Narrative Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Tags & Metadata bar */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-wider ${getPriorityBadge()}`}>
              {report.priority} priority
            </span>
            <span className="text-slate-300 font-mono text-xs">•</span>
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {report.category}
            </span>
          </div>

          <h3 className="font-sans font-bold text-lg text-brand-primary tracking-tight leading-snug mb-2 group-hover:text-brand-secondary transition-colors duration-200">
            {report.title}
          </h3>

          <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed mb-4">
            {report.description}
          </p>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100 my-4" />

        {/* Action & Engagement footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Minimalistic avatars overlay */}
            <div className="flex -space-x-2">
              <span className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-mono text-[8px] font-bold text-brand-primary">JD</span>
              <span className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center font-mono text-[8px] font-bold text-brand-secondary">AK</span>
              <span className="w-6 h-6 rounded-full bg-brand-primary/10 border-2 border-white flex items-center justify-center font-mono text-[8px] font-bold text-brand-primary">MC</span>
            </div>
            
            <span className="font-mono text-[10px] font-bold text-slate-400">
              {report.status === 'Resolved' 
                ? `${report.verifiedCount || 12} verified resolve` 
                : `${report.watchingCount} watching`
              }
            </span>
          </div>

          {/* Contextual primary action trigger */}
          <motion.div 
            className={`p-2.5 rounded-xl border flex items-center justify-center transition-all duration-300 ${
              report.status === 'Resolved'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                : report.status === 'Live'
                ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                : 'bg-slate-50 text-brand-primary border-slate-100 hover:bg-slate-100'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {report.status === 'Resolved' ? (
              <Check className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
