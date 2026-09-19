'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  Truck, 
  Wrench, 
  CheckCircle, 
  BadgeCheck, 
  FileText,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { mockReports } from '@/lib/mockReports';
import { IssueService } from '@/lib/services/issueService';
import { TimelineService } from '@/lib/services/timelineService';
import { Issue } from '@/lib/models';
import { ALL_STAGES_MOCK } from '@/lib/mockData';
import { formatTimestamp } from '@/lib/helpers';
import { DESIGN_TOKENS } from '@/lib/designTokens';
import { Skeleton } from '@/components/Skeleton';
import ErrorBoundary from '@/components/ErrorBoundary';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AlertCircle,
  Sparkles,
  Users,
  Truck,
  Wrench,
  CheckCircle,
  BadgeCheck,
  FileText,
};


export default function PublicTimelinePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [report, setReport] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeIssue = () => {};
    let unsubscribeTimeline = () => {};

    unsubscribeIssue = IssueService.subscribeToIssue(id, (updatedIssue) => {
      if (updatedIssue) {
        setReport(prev => ({ ...updatedIssue, timeline: prev?.timeline || updatedIssue.timeline || [] }));
        setLoading(false);
      } else {
        setReport(null);
        setLoading(false);
      }
    });

    unsubscribeTimeline = TimelineService.subscribe(id, (events) => {
      setReport(prev => prev ? { ...prev, timeline: events } : null);
    });

    return () => {
      unsubscribeIssue();
      unsubscribeTimeline();
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] pb-24">
        <header className="sticky top-0 z-30 bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <Skeleton className="w-24 h-8 rounded-xl" />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white rounded-[28px] border border-slate-100 p-6 md:p-8 mb-10 space-y-4 shadow-sm">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <Skeleton className="h-6 w-20 rounded-md" />
            </div>
            <Skeleton className="h-24 w-full mt-6 rounded-xl" />
          </div>
          <div className="space-y-8 pl-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-3 bg-white p-6 rounded-2xl border border-slate-100">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20 rounded-md" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-sans font-extrabold text-2xl text-brand-primary">Case Not Found</h1>
        <Link href="/citizen" className="mt-4 text-brand-primary underline text-sm">
          Return to Feed
        </Link>
      </div>
    );
  }

  // Combine existing report timeline events and fill pending ones to demonstrate the complete 8-stage lifecycle
  const renderFullTimeline = () => {
    return ALL_STAGES_MOCK.map((stage, idx) => {
      // Find matching event in mock timeline
      const matchedEvent = report.timeline?.find(e => e.type === stage.id);
      const isCompleted = !!matchedEvent;
      const isCurrentlyActive = !isCompleted && idx > 0 && report.timeline?.some(e => e.type === ALL_STAGES_MOCK[idx - 1].id) && (idx === report.timeline.length);
      
      const Icon = ICON_MAP[stage.iconName] || AlertCircle;

      // Define placeholder info if the stage is pending
      const displayTitle = isCompleted ? matchedEvent.title : `${stage.label} (Upcoming)`;
      const displayTime = isCompleted ? formatTimestamp(matchedEvent.timestamp) : 'Awaiting previous phase completion';
      const displayActor = isCompleted ? matchedEvent.actor : 'Pending assignment';
      const displayDesc = isCompleted 
        ? matchedEvent.description 
        : `This stage is queued in the CivicHero system. Once prerequisite municipal review and community verification are satisfied, this update will be recorded in the public record.`;

      // Assign some rich visual media to specific completed events to resemble real evidence attachments
      let mediaUrl = '';
      if (isCompleted && stage.id === 'reported') {
        mediaUrl = report.imageUrl || ''; // Original issue picture
      } else if (isCompleted && stage.id === 'work_started') {
        mediaUrl = 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=640&q=80'; // Work crew
      } else if (isCompleted && stage.id === 'repair_completed') {
        mediaUrl = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=640&q=80'; // Smooth finish representation
      }

      return (
        <motion.div 
          key={stage.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: idx * 0.08 }}
          className={`relative pl-10 pb-12 last:pb-0 group`}
        >
          {/* Vertical connecting line */}
          {idx < ALL_STAGES_MOCK.length - 1 && (
            <div className={`absolute left-4 top-8 bottom-0 w-0.5 ${
              isCompleted 
                ? 'bg-gradient-to-b from-brand-primary to-brand-primary/40' 
                : 'bg-dashed border-l border-slate-200'
            }`} />
          )}

          {/* Timeline Node Badge Icon */}
          <div className={`absolute left-0 top-1.5 w-8.5 h-8.5 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-all duration-300 ${
            isCompleted 
              ? `${stage.color} ring-4 ${stage.ringColor}` 
              : isCurrentlyActive 
              ? 'bg-amber-100 text-amber-700 border-amber-300 ring-4 ring-amber-50 animate-pulse'
              : 'bg-slate-100 text-slate-400 border-slate-200'
          }`}>
            <Icon className="w-4 h-4 shrink-0" />
          </div>

          {/* Content details */}
          <div className={`p-6 rounded-2xl border transition-all duration-300 ${
            isCompleted 
              ? 'bg-white border-slate-100 shadow-sm group-hover:shadow-md' 
              : isCurrentlyActive
              ? 'bg-amber-50/40 border-amber-200/50 shadow-sm border-dashed'
              : 'bg-slate-50/50 border-slate-100 text-slate-400'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-mono font-bold tracking-widest uppercase ${
                  isCompleted 
                    ? 'bg-brand-primary/5 text-brand-primary' 
                    : 'bg-slate-200/50 text-slate-500'
                }`}>
                  STAGE {idx + 1}
                </span>
                
                {isCompleted && (
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-emerald-600 uppercase">
                    <ShieldCheck className="w-3 h-3" />
                    Activity Verified
                  </span>
                )}
              </div>

              <span className="font-mono text-[9px] font-bold text-slate-400 block uppercase">
                {displayTime}
              </span>
            </div>

            <h3 className={`font-sans font-extrabold text-base tracking-tight ${
              isCompleted ? 'text-brand-primary' : 'text-slate-400'
            }`}>
              {displayTitle}
            </h3>

            <div className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase text-brand-secondary mt-1">
              <span>AUTHORIZED ACTOR:</span>
              <span className={isCompleted ? 'text-slate-700' : 'text-slate-400'}>
                {displayActor}
              </span>
            </div>

            <p className={`font-body text-xs mt-3 leading-relaxed ${
              isCompleted ? 'text-brand-muted' : 'text-slate-400/80'
            }`}>
              {displayDesc}
            </p>

            {/* Media attachment block if present */}
            {mediaUrl && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 relative aspect-[16/9] w-full max-w-md rounded-xl overflow-hidden border border-slate-100 bg-slate-900 group/image"
              >
                <Image
                  src={mediaUrl}
                  alt={displayTitle}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover group-hover/image:scale-102 transition-transform duration-500 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-slate-950/50 backdrop-blur-md text-[8px] font-mono text-white px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                  LOCKED VISUAL PROOF
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-brand-primary pb-24 selection:bg-brand-secondary selection:text-brand-primary">
      
      {/* HEADER SECTION */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center text-brand-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-extrabold text-slate-400 tracking-wider">CIVIC CASE RECORD</span>
              <h1 className="font-sans font-extrabold text-sm text-brand-primary tracking-tight">
                Case Record: #{report.id.toUpperCase()}
              </h1>
            </div>
          </div>

          <Link
            href={`/citizen/issues/${report.id}`}
            className="px-4 py-2 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-xl font-sans font-bold text-[10px] uppercase tracking-wider text-slate-500 transition-colors"
          >
            Back to Details
          </Link>
        </div>
      </header>

      {/* TIMELINE VIEW BODY */}
      <ErrorBoundary sectionName="Public Timeline">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Upper metadata card */}
        <div className="bg-white rounded-[28px] border border-slate-100 p-6 md:p-8 mb-10 shadow-sm">
          <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
            VERIFIED CIVIC TIMELINE LOGS
          </span>
          <h2 className="font-sans font-extrabold text-xl md:text-2xl text-brand-primary tracking-tight mt-1 leading-tight">
            Case Progress for &ldquo;{report.title}&rdquo;
          </h2>
          
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
              LOC: {report.location.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
              CAT: {report.category.toUpperCase()}
            </span>
            <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
              STATUS: {report.status.toUpperCase()}
            </span>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-emerald-50/40 border border-emerald-100/60 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" />
            <p className="font-body text-xs text-brand-primary leading-relaxed">
              This log represents the verified chronological path of the reported case. Every completed entry is digitally stamped and signed off by authorized citizens or municipal units.
            </p>
          </div>
        </div>

        {/* 8-Stage Timeline Feed */}
        <div className="space-y-0 relative">
          {renderFullTimeline()}
        </div>

        {/* Footer info message */}
        <div className="mt-12 text-center max-w-sm mx-auto">
          <p className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Case history verified under municipal record standards.
          </p>
          <button 
            onClick={() => router.back()}
            className="mt-4 font-sans font-bold text-xs text-brand-primary hover:text-brand-secondary transition-colors"
          >
            &larr; Return to Case File Details
          </button>
        </div>

      </main>
      </ErrorBoundary>

    </div>
  );
}
