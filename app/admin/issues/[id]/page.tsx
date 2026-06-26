'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  ArrowLeft, MapPin, Clock, ShieldAlert, MessageSquare, 
  Activity, CheckCircle, ChevronRight, User, AlertTriangle, Workflow, Settings
} from 'lucide-react';
import { IssueService } from '@/lib/services/issueService';
import { TimelineService } from '@/lib/services/timelineService';
import { Issue } from '@/lib/models';
import MapPlaceholder from '@/components/MapPlaceholder';
import AISummaryCard from '@/components/AISummaryCard';

export default function AdminIssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for Admin actions
  const [assigning, setAssigning] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  
  const loadIssue = async () => {
    setLoading(true);
    const data = await IssueService.getIssueDetails(id);
    if (data) {
      const timeline = await TimelineService.getTimeline(id);
      setIssue({ ...data, timeline });
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadIssue();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateStatus = async (status: 'Live' | 'Reported' | 'In Progress' | 'Resolved') => {
    if (!issue) return;
    await IssueService.updateIssueStatus(issue.id, status, 'Admin User');
    setToastMessage(`Status updated to ${status}`);
    setTimeout(() => setToastMessage(null), 3000);
    loadIssue();
  };

  const handleAssignDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue || !selectedDept) return;
    setAssigning(true);
    await IssueService.assignDepartment(issue.id, selectedDept, 'Admin User');
    setAssigning(false);
    setSelectedDept('');
    setToastMessage(`Issue assigned to ${selectedDept}`);
    setTimeout(() => setToastMessage(null), 3000);
    loadIssue();
  };

  const handleManualTimelineEvent = async () => {
    if (!issue) return;
    await TimelineService.appendMilestone(issue.id, 'admin_note', 'Administrative Review', 'An administrator has manually reviewed this issue.');
    setToastMessage(`Timeline updated`);
    setTimeout(() => setToastMessage(null), 3000);
    loadIssue();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-8 h-8 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs text-slate-500 font-bold uppercase tracking-widest">Accessing Secure Records...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight">Record Not Found</h1>
        <Link href="/admin" className="mt-6 px-5 py-3 rounded-2xl bg-slate-900 text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors hover:bg-slate-800">
          Return to Mission Control
        </Link>
      </div>
    );
  }

  const getPriorityClasses = (p: string) => {
    switch (p) {
      case 'Critical': return 'bg-red-500 text-white border-red-600';
      case 'High': return 'bg-orange-500 text-white border-orange-600';
      case 'Medium': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getStatusClasses = (s: string) => {
    switch (s) {
      case 'Live': return 'bg-red-600/90 text-white';
      case 'Resolved': return 'bg-emerald-600/90 text-white';
      case 'In Progress': return 'bg-amber-500/90 text-white';
      default: return 'bg-blue-600/90 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 relative selection:bg-brand-primary selection:text-white">
      {/* Dynamic Toast Feed */}
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed top-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-50"
        >
          <div className="bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-xl border border-slate-800 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-sans font-bold text-xs uppercase tracking-widest text-emerald-400 block">System Update</span>
              <p className="font-body text-xs text-slate-200 mt-0.5 leading-relaxed">{toastMessage}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-slate-900 backdrop-blur-xl border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-extrabold text-brand-accent tracking-wider uppercase">Mission Control • Case File</span>
              <h1 className="font-sans font-extrabold text-sm tracking-tight uppercase">#{issue.id}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE DATA SYNC</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* LEFT COLUMN: PRIMARY NARRATIVE & MAP */}
          <section className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            
            {/* Visual Header Banner Stage */}
            <div className="relative aspect-[16/10] sm:aspect-[21/10] lg:aspect-[16/9] rounded-[32px] overflow-hidden bg-slate-950 border border-slate-200 shadow-sm group">
              <Image
                src={issue.imageUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=640&q=80'}
                alt={issue.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

              <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${getStatusClasses(issue.status)} shadow-sm border border-white/10 flex items-center gap-1.5`}>
                  {issue.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {issue.status}
                </span>
                <span className="font-mono text-[10px] text-white/95 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 uppercase tracking-widest font-bold">
                  {issue.category}
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/90 font-bold drop-shadow-md">
                  <MapPin className="w-4 h-4 text-brand-accent" />
                  <span>{issue.location}</span>
                </div>
              </div>
            </div>

            {/* Core Text Section */}
            <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${getPriorityClasses(issue.urgency)}`}>
                  {issue.urgency} Priority
                </span>
                <span className="text-slate-300 font-mono text-xs">•</span>
                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reported {issue.timestamp}</span>
                </div>
              </div>

              <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight leading-tight mb-4">
                {issue.title}
              </h2>
              <p className="font-body text-sm md:text-base text-slate-600 leading-relaxed mb-6">
                {issue.description}
              </p>

              {/* Verification & Trust Metrics */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-xs text-slate-900">Reporter: {issue.reporter?.name || issue.reporterName || 'Citizen'}</h4>
                    <span className="font-mono text-[10px] text-slate-500 uppercase">{issue.reporter?.badge || issue.reporterBadge || 'Unverified'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-sans font-extrabold text-lg text-emerald-600">{issue.trustMetrics?.coSigningCount || issue.upvotes || 0}</span>
                  <span className="font-mono text-[9px] text-slate-500 font-bold uppercase">Validations</span>
                </div>
              </div>
            </div>

            {/* Admin Operational Controls */}
            <div className="bg-slate-900 rounded-[28px] border border-slate-800 p-6 md:p-8 shadow-xl text-white">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-brand-accent" />
                <h3 className="font-sans font-extrabold text-lg tracking-tight">Operational Controls</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Assignment */}
                <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                  <h4 className="font-sans font-bold text-sm mb-1 text-slate-200">Department Routing</h4>
                  <p className="font-body text-xs text-slate-400 mb-4">Current: {issue.routingDepartment || 'Unassigned'}</p>
                  <form onSubmit={handleAssignDepartment} className="flex gap-2">
                    <select 
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-body text-slate-200 focus:outline-none focus:border-brand-accent"
                    >
                      <option value="">Select Department...</option>
                      <option value="Roads & Transport">Roads & Transport</option>
                      <option value="Public Works">Public Works</option>
                      <option value="Water & Sanitation">Water & Sanitation</option>
                      <option value="Parks & Rec">Parks & Rec</option>
                    </select>
                    <button type="submit" disabled={!selectedDept || assigning} className="px-4 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-primary/90 transition-colors disabled:opacity-50">
                      Assign
                    </button>
                  </form>
                </div>

                {/* Status Update */}
                <div className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                  <h4 className="font-sans font-bold text-sm mb-4 text-slate-200">Issue Status</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Live', 'In Progress', 'Resolved'].map(st => (
                      <button 
                        key={st}
                        onClick={() => handleUpdateStatus(st as any)}
                        className={`py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-colors border ${
                          issue.status === st ? 'bg-brand-accent/20 border-brand-accent text-brand-accent' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Summarization Card */}
            <AISummaryCard
              summary={issue.aiSummary?.summary}
              confidence={issue.aiSummary?.confidence}
              categoryMatch={issue.aiSummary?.categoryMatch}
              severityMatch={issue.aiSummary?.severityMatch}
              routingTo={issue.aiSummary?.routingTo}
            />

            {/* GIS Map */}
            <div className="flex flex-col gap-3">
              <h3 className="font-sans font-extrabold text-sm text-slate-900 uppercase tracking-wider px-2">Geospatial Data</h3>
              <MapPlaceholder locationName={issue.location} categoryName={issue.category} />
            </div>

          </section>

          {/* RIGHT COLUMN: TIMELINE & REPORTS */}
          <aside className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
            
            {/* TIMELINE MODULE */}
            <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-sm text-slate-900 uppercase tracking-wider">Immutable Lifecycle</h3>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block">AUDIT TRAIL</span>
                  </div>
                </div>
              </div>

              <div className="relative pl-6 border-l border-slate-200 ml-2 space-y-6">
                {issue.timeline && issue.timeline.length > 0 ? (
                  issue.timeline.map((event, idx) => (
                    <div key={event.id || idx} className="relative">
                      <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                        idx === 0 ? 'bg-brand-primary ring-4 ring-brand-primary/10' : 'bg-slate-300'
                      }`} />
                      
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 font-bold block">{event.timestamp.toUpperCase()}</span>
                        <h4 className="font-sans font-bold text-xs text-slate-900 mt-1 leading-snug">{event.title}</h4>
                        <span className="font-mono text-[8px] text-brand-secondary font-bold uppercase mt-0.5 block">ACTOR: {event.actor || 'System'}</span>
                        <p className="font-body text-[11px] text-slate-600 mt-1 leading-relaxed">{event.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-slate-400 text-xs italic font-body">No timeline records generated yet.</div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={handleManualTimelineEvent}
                  className="w-full py-3 bg-brand-primary text-white border border-transparent rounded-2xl flex items-center justify-center gap-2 font-sans font-bold text-xs uppercase tracking-wider hover:bg-brand-primary/90 transition-all text-center shadow-md"
                >
                  Append Administrative Review
                </button>
              </div>
            </div>

            {/* COMMUNITY DISCUSSION PANEL */}
            <div className="bg-white rounded-[28px] border border-slate-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-sm text-slate-900 uppercase tracking-wider">Citizen Field Reports</h3>
                  <span className="font-mono text-[9px] font-bold text-slate-400 uppercase block">
                    {(issue.comments || issue.discussion || []).length} CONFIRMED POSTS
                  </span>
                </div>
              </div>

              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                {(issue.comments || issue.discussion || []).map((comment) => (
                  <div key={comment.id} className="group border-b border-slate-100 pb-5 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                          <Image
                            src={comment.user?.avatar || comment.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'}
                            alt={comment.user?.name || comment.authorName || 'User'}
                            fill
                            sizes="32px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans font-bold text-xs text-slate-900">
                              {comment.user?.name || comment.authorName || 'Unknown'}
                            </span>
                          </div>
                          <span className="font-mono text-[8px] text-slate-400 font-bold block mt-0.5 uppercase">
                            {comment.timestamp || comment.timeAgo} • {comment.user?.badge || comment.authorBadge || 'Citizen'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="font-body text-xs text-slate-600 leading-relaxed pl-10">
                      {comment.text || comment.content}
                    </p>
                  </div>
                ))}
                {(issue.comments || issue.discussion || []).length === 0 && (
                  <p className="text-xs text-slate-400 italic">No community reports logged.</p>
                )}
              </div>
            </div>

          </aside>
        </div>
      </main>
    </div>
  );
}
