'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Eye, 
  Check, 
  AlertTriangle, 
  ShieldAlert, 
  MessageSquare, 
  Activity, 
  ChevronRight, 
  Share2, 
  Bookmark,
  Sparkles,
  Award
} from 'lucide-react';
import { mockReports } from '@/lib/mockReports';
import { IssueService } from '@/lib/services/issueService';
import { TimelineService } from '@/lib/services/timelineService';
import { Issue } from '@/lib/models';
import { formatTimestamp } from '@/lib/helpers';
import { CivicMap } from '@/lib/providers/maps/mapProvider';
import AISummaryCard from '@/components/AISummaryCard';
import VerificationBar from '@/components/VerificationBar';
import { Skeleton } from '@/components/Skeleton';
import { getPlaceholderImage } from '@/lib/utils';
import { IssueRepository } from '@/lib/repositories/issueRepository';
import { storage, ref, uploadBytesResumable, getDownloadURL, isFirebaseConfigured } from '@/lib/firebase/storage';

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [report, setReport] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsList, setCommentsList] = useState<any[]>([]);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Retry states
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryProgress, setRetryProgress] = useState(0);
  const [retryError, setRetryError] = useState<string | null>(null);
  const retryFileInputRef = useRef<HTMLInputElement>(null);

  const handleRetryUpload = async (file: File) => {
    setIsRetrying(true);
    setRetryProgress(0);
    setRetryError(null);

    // If Firebase is not configured, simulate it and patch
    if (!isFirebaseConfigured) {
      console.warn('[RETRY] Firebase Storage is absent. Using simulated retry upload.');
      let currentProgress = 0;
      const interval = setInterval(async () => {
        currentProgress += 20;
        if (currentProgress >= 100) {
          clearInterval(interval);
          setRetryProgress(100);
          
          const localUrl = URL.createObjectURL(file);
          try {
            await IssueRepository.update(id, {
              imageUrl: localUrl,
              evidenceStatus: 'AVAILABLE'
            });
            setIsRetrying(false);
            setToastMessage('Evidence media uploaded successfully (Fallback/Simulation)!');
          } catch (err: any) {
            setRetryError(err.message || 'Failed to update database');
            setIsRetrying(false);
          }
        } else {
          setRetryProgress(currentProgress);
        }
      }, 150);
      return;
    }

    try {
      const storagePath = `issues/evidence/${Date.now()}_img.jpg`;
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setRetryProgress(progress);
        },
        async (error) => {
          console.error('[RETRY] Firebase Storage error:', error);
          setRetryError(error.message);
          setIsRetrying(false);
          await IssueRepository.update(id, {
            evidenceStatus: 'FAILED'
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            await IssueRepository.update(id, {
              imageUrl: downloadUrl,
              evidenceStatus: 'AVAILABLE',
              timeline: [
                ...(report?.timeline || []),
                {
                  id: `tl-media-retry-${Date.now()}`,
                  type: 'update',
                  title: 'Evidence Media Secured (Retry)',
                  description: 'Verification photo uploaded and attached successfully.',
                  timestamp: 'Just now'
                }
              ]
            });
            setIsRetrying(false);
            setToastMessage('Evidence media uploaded and attached successfully!');
          } catch (err: any) {
            console.error('[RETRY] Failed to get url or patch:', err);
            setRetryError(err.message);
            setIsRetrying(false);
          }
        }
      );
    } catch (err: any) {
      console.error('[RETRY] Initialization failed:', err);
      setRetryError(err.message);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    let unsubscribeIssue = () => {};
    let unsubscribeTimeline = () => {};

    unsubscribeIssue = IssueService.subscribeToIssue(id, (updatedIssue) => {
      if (updatedIssue) {
        setReport(prev => ({ ...updatedIssue, timeline: prev?.timeline || updatedIssue.timeline || [] }));
        setCommentsList(updatedIssue.comments || updatedIssue.discussion || []);
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
            <section className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
              <Skeleton className="w-full aspect-[16/10] sm:aspect-[21/10] lg:aspect-[16/9] rounded-[32px]" />
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 md:p-8 space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-32 rounded-full" />
                </div>
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <div className="pt-6 border-t border-slate-100 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-2 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </section>
            <aside className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-xl" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-24" />
                  </div>
                </div>
                <div className="space-y-4 pl-6 border-l border-slate-100 ml-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-2 w-16" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="font-sans font-extrabold text-2xl text-brand-primary tracking-tight">Report Not Found</h1>
        <p className="font-body text-sm text-brand-muted mt-2 max-w-sm">
          The requested report ID &ldquo;{id}&rdquo; might be archived, private, or invalid.
        </p>
        <Link 
          href="/citizen" 
          className="mt-6 px-5 py-3 rounded-2xl bg-brand-primary text-white font-sans font-bold text-xs uppercase tracking-wider transition-colors hover:bg-brand-primary/90"
        >
          Return to Feed
        </Link>
      </div>
    );
  }

  // Handle Crowd-Sourcing verification triggers
  const handleVerify = (type: string, label: string) => {
    let message = '';
    switch (type) {
      case 'still_there':
        message = 'Thank you! You verified this hazard is still active. Priority weight upgraded.';
        break;
      case 'already_fixed':
        message = 'Report registered! Community notes updated to "Possible Resolution". Municipal confirmation pending.';
        break;
      case 'not_found':
        message = 'Verification registered. A secondary inspection has been queued for verification.';
        break;
      case 'spam':
        message = 'Report flagged for spam. Moderation queue notified.';
        break;
      default:
        message = `Feedback registered for "${label}"!`;
    }
    
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handle simulated comment submission
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment = {
      id: `new-${Date.now()}`,
      user: {
        name: 'Alex Rivera', // Logged-in profile simulation
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
        badge: 'Verified Citizen'
      },
      timeAgo: 'Just now',
      text: commentInput,
      likesCount: 0
    };

    setCommentsList([newComment, ...commentsList]);
    setCommentInput('');
    
    setToastMessage('Comment posted successfully (simulated UI state)!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Determine priority classes
  const getPriorityClasses = (p: string) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-500 text-white border-red-600';
      case 'High':
        return 'bg-orange-500 text-white border-orange-600';
      case 'Medium':
        return 'bg-amber-500 text-white border-amber-600';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const getStatusClasses = (s: string) => {
    switch (s) {
      case 'Live':
        return 'bg-red-600/90 text-white border-red-500/20';
      case 'Resolved':
        return 'bg-emerald-600/90 text-white border-emerald-500/20';
      case 'In Progress':
        return 'bg-amber-500/90 text-white border-amber-400/20';
      default:
        return 'bg-blue-600/90 text-white border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-brand-primary pb-24 relative selection:bg-brand-secondary selection:text-brand-primary">
      
      {/* Dynamic Toast Feed */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.95 }}
            className="fixed top-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-50"
          >
            <div className="bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-xl border border-slate-800 flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-secondary text-brand-primary flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="flex-1">
                <span className="font-sans font-bold text-xs uppercase tracking-widest text-brand-secondary block">
                  System Notification
                </span>
                <p className="font-body text-xs text-slate-200 mt-0.5 leading-relaxed">
                  {toastMessage}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. STICKY ACTION HEADER BAR */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2.5 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center text-brand-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-extrabold text-slate-400 tracking-wider">CIVICHERO PORTAL</span>
              <h1 className="font-sans font-extrabold text-sm text-brand-primary tracking-tight">
                Case File: #{report.id.toUpperCase()}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsSaved(!isSaved);
                handleVerify('save', isSaved ? 'Removed bookmark' : 'Saved to dashboard');
              }}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center ${
                isSaved 
                  ? 'bg-amber-50 border-amber-200 text-amber-600' 
                  : 'bg-white border-slate-200/60 hover:bg-slate-50 text-slate-400 hover:text-brand-primary'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => {
                setIsShareOpen(!isShareOpen);
                handleVerify('share', 'Link copied to clipboard!');
              }}
              className="p-2.5 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center text-slate-400 hover:text-brand-primary"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* LEFT COLUMN: PRIMARY NARRATIVE & MAP (8 Cols on Desktop) */}
          <section className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            
            {/* Hidden Retry Input */}
            <input 
              type="file" 
              ref={retryFileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleRetryUpload(file);
              }} 
            />

            {/* Evidence Upload Status Banner */}
            {report.evidenceStatus && report.evidenceStatus !== 'AVAILABLE' && (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-800 text-brand-secondary border border-slate-700 shrink-0">
                    <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-white">
                      {report.evidenceStatus === 'UPLOADING' ? 'Uploading Verification Photo...' : 'Evidence Media Upload Interrupted'}
                    </h4>
                    <p className="font-body text-xs text-slate-400 mt-0.5">
                      {report.evidenceStatus === 'UPLOADING' 
                        ? 'Your civic report is logged safely. We are finalizing media attachments.' 
                        : 'Your civic report was created successfully, but your evidence photo failed to secure. Please retry below.'}
                    </p>
                    {isRetrying && (
                      <div className="mt-2.5 w-full max-w-[240px] bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-brand-secondary h-full transition-all duration-300" style={{ width: `${retryProgress}%` }} />
                      </div>
                    )}
                    {retryError && <p className="text-[10px] text-red-400 mt-1">Error: {retryError}</p>}
                  </div>
                </div>

                {report.evidenceStatus !== 'UPLOADING' && (
                  <button
                    onClick={() => retryFileInputRef.current?.click()}
                    disabled={isRetrying}
                    className="px-4 py-2.5 bg-brand-secondary hover:bg-brand-secondary/95 disabled:opacity-50 text-slate-950 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition-all self-start sm:self-auto shrink-0"
                  >
                    {isRetrying ? `Uploading (${retryProgress}%)` : 'Retry Upload'}
                  </button>
                )}
              </div>
            )}

            {/* Visual Header Banner Stage */}
            <div className="relative aspect-[16/10] sm:aspect-[21/10] lg:aspect-[16/9] rounded-[32px] overflow-hidden bg-slate-950 border border-slate-100 shadow-sm group">
              <Image
                src={(!report.evidenceStatus || report.evidenceStatus === 'AVAILABLE') ? (report.imageUrl || getPlaceholderImage(report.category, report.title, report.description)) : getPlaceholderImage(report.category, report.title, report.description)}
                alt={report.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover group-hover:scale-102 transition-transform duration-700 ease-out opacity-90"
                referrerPolicy="no-referrer"
              />
              {/* Vignette Layer */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

              {/* Status and Retry overlays for incomplete evidence */}
              {report.evidenceStatus && report.evidenceStatus !== 'AVAILABLE' && (
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-4">
                  {report.evidenceStatus === 'UPLOADING' ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-3 border-brand-secondary border-t-transparent rounded-full animate-spin" />
                      <span className="font-mono text-[10px] font-bold text-white tracking-widest uppercase bg-slate-950/80 px-3 py-1.5 rounded-lg border border-white/10">
                        Securing Photo...
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-center max-w-sm">
                      <span className="font-mono text-[10px] font-bold text-red-400 tracking-widest uppercase bg-red-950/80 px-3 py-1.5 rounded-lg border border-red-500/20">
                        Missing Evidence Media
                      </span>
                      <p className="text-xs text-slate-300">
                        Representative {report.category} placeholder is currently active.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Float overlays */}
              <div className="absolute top-6 left-6 right-6 flex items-center justify-between pointer-events-none">
                <span className={`px-3 py-1.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${getStatusClasses(report.status)} shadow-sm border border-white/10 flex items-center gap-1.5`}>
                  {report.status === 'Live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  {report.status.toUpperCase()}
                </span>
                
                <span className="font-mono text-[10px] text-white/95 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 uppercase tracking-widest font-bold">
                  {report.category}
                </span>
              </div>

              {/* Bottom location info overlay */}
              <div className="absolute bottom-6 left-6 right-6 text-white pointer-events-none">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-white/90 font-bold drop-shadow-md">
                  <MapPin className="w-4 h-4 text-brand-secondary" />
                  <span>{report.location} • {report.distance}</span>
                </div>
              </div>
            </div>

            {/* Core Text Section */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${getPriorityClasses(report.urgency)}`}>
                  {report.urgency} Priority
                </span>
                <span className="text-slate-300 font-mono text-xs">•</span>
                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Reported {formatTimestamp(report.timestamp)}</span>
                </div>
              </div>

              <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-brand-primary tracking-tight leading-tight mb-4">
                {report.title}
              </h2>

              <p className="font-body text-xs sm:text-sm md:text-base text-brand-muted leading-relaxed">
                {report.description}
              </p>

              {/* Reporter HUD Section */}
              <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-slate-200/80 bg-slate-100 shrink-0">
                    <Image
                      src={report.reporter?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'}
                      alt={report.reporter?.name || 'Reporter'}
                      fill
                      sizes="40px"
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">CASE INITIATOR</span>
                    <span className="font-sans font-bold text-xs text-brand-primary block mt-0.5">
                      {report.reporter?.name || 'Anonymous Citizen'}
                    </span>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-secondary shrink-0" />
                  <span className="font-mono text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    {report.reporter?.badge || 'Verified Resident'}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Summarization Card block */}
            <AISummaryCard
              summary={report.aiSummary?.summary}
              confidence={report.aiSummary?.confidence}
              categoryMatch={report.aiSummary?.categoryMatch}
              severityMatch={report.aiSummary?.severityMatch}
              routingTo={report.aiSummary?.routingTo}
            />

            {/* GIS Map Canvas Placeholder */}
            <div className="flex flex-col gap-3">
              <h3 className="font-sans font-extrabold text-sm text-brand-primary uppercase tracking-wider px-2">
                Geospatial Incident Coordinates
              </h3>
              <div className="w-full h-64 rounded-3xl overflow-hidden border border-slate-100">
                <CivicMap 
                  locationName={report.location} 
                  categoryName={report.category} 
                  interactive={true}
                  mapId={`MAP_${report.id}`}
                  latitude={report.coordinates?.lat || 40.7128 + ((parseInt(report.id.split('-')[1] || '0') % 100) / 100 - 0.5) * 0.05}
                  longitude={report.coordinates?.lng || -74.0060 + ((parseInt(report.id.split('-')[1] || '0') % 50) / 50 - 0.5) * 0.05}
                  markers={[{
                    id: report.id,
                    lat: report.coordinates?.lat || 40.7128 + ((parseInt(report.id.split('-')[1] || '0') % 100) / 100 - 0.5) * 0.05,
                    lng: report.coordinates?.lng || -74.0060 + ((parseInt(report.id.split('-')[1] || '0') % 50) / 50 - 0.5) * 0.05,
                    title: report.title,
                    urgency: report.urgency,
                    status: report.status
                  }]}
                />
              </div>
            </div>

            {/* Crowd Sourcing verification interactive bar */}
            <VerificationBar 
              onVerify={handleVerify}
              confirmCount={report.verificationStats?.confirmCount || report.upvotes}
              alreadyFixedCount={report.verificationStats?.alreadyFixedCount || 0}
            />

          </section>

          {/* RIGHT COLUMN: TIMELINE & COMMUNITY PANEL (5 Cols on Desktop) */}
          <aside className="lg:col-span-5 flex flex-col gap-6 md:gap-8">
            
            {/* TIMELINE MINI MODULE */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-sm text-brand-primary uppercase tracking-wider">
                      Immutable Life Cycle
                    </h3>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      SECURED REGISTRY LOGS
                    </span>
                  </div>
                </div>
                
                <Link
                  href={`/citizen/issues/${report.id}/timeline`}
                  className="font-mono text-[10px] font-bold text-brand-primary hover:text-brand-secondary transition-colors uppercase tracking-wider border-b border-brand-primary hover:border-brand-secondary"
                >
                  Dedicated View
                </Link>
              </div>

              {/* Sequential timeline dots */}
              <div className="relative pl-6 border-l border-slate-100/90 ml-2 space-y-6">
                {report.timeline && report.timeline.length > 0 ? (
                  report.timeline.map((event, idx) => (
                    <div key={event.id} className="relative">
                      {/* Interactive dot */}
                      <span className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                        idx === 0 
                          ? 'bg-brand-primary ring-4 ring-brand-primary/10' 
                          : 'bg-emerald-500'
                      }`} />
                      
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 font-bold block">
                          {formatTimestamp(event.timestamp).toUpperCase()}
                        </span>
                        <h4 className="font-sans font-bold text-xs text-brand-primary mt-1 leading-snug">
                          {event.title}
                        </h4>
                        <span className="font-mono text-[8px] text-brand-secondary font-bold uppercase mt-0.5 block">
                          ACTOR: {event.actor}
                        </span>
                        <p className="font-body text-[11px] text-brand-muted mt-1 leading-relaxed">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-2 text-slate-400 text-xs italic font-body">
                    No timeline records generated yet.
                  </div>
                )}
              </div>

              {/* View Full Timeline button */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <Link
                  href={`/citizen/issues/${report.id}/timeline`}
                  className="w-full py-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-2 text-brand-primary font-sans font-bold text-xs uppercase tracking-wider hover:bg-slate-100 hover:border-slate-200 transition-all text-center"
                >
                  <span>Verify Full Lifecycle Ledger ({report.timeline?.length || 0} events)</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* COMMUNITY DISCUSSION PANEL */}
            <div className="bg-white rounded-[28px] border border-slate-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-sm text-brand-primary uppercase tracking-wider">
                      Resident Discussion
                    </h3>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase block">
                      {commentsList.length} CONFIRMED POSTS
                    </span>
                  </div>
                </div>
              </div>

              {/* Simulated comment composer */}
              <form onSubmit={handlePostComment} className="mb-6">
                <div className="relative">
                  <textarea
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Provide neighborhood insight..."
                    className="w-full min-h-[90px] rounded-2xl border border-slate-100 bg-slate-50/50 p-4 font-body text-xs sm:text-sm text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all resize-none"
                  />
                  <div className="absolute bottom-3 right-3">
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className={`px-4 py-2 rounded-xl font-sans font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm ${
                        commentInput.trim()
                          ? 'bg-brand-primary text-white hover:bg-brand-primary/95'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/40'
                      }`}
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </form>

              {/* Comments stack */}
              <div className="space-y-5 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
                {commentsList.map((comment) => (
                  <div key={comment.id} className="group border-b border-slate-50 pb-5 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                          <Image
                            src={comment.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80'}
                            alt={comment.user?.name || 'User'}
                            fill
                            sizes="32px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-sans font-bold text-xs text-brand-primary">
                              {comment.user?.name || 'Unknown'}
                            </span>
                            {comment.user?.isOfficial && (
                              <span className="bg-brand-primary/5 text-brand-primary px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border border-brand-primary/10">
                                Official
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[8px] text-slate-400 font-bold block mt-0.5 uppercase">
                            {formatTimestamp(comment.timestamp || comment.timeAgo)} • {comment.user?.badge || 'Verified Neighbor'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="font-body text-xs text-brand-muted leading-relaxed pl-10">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Non-functional view all comments button as required */}
              <div className="mt-6 pt-5 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => handleVerify('all_discussion', 'Full neighborhood discussion interface is loaded.')}
                  className="w-full py-3 border border-dashed border-slate-200 hover:border-slate-300 text-slate-500 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all text-center block"
                >
                  View All Neighborhood Comments ({commentsList.length})
                </button>
              </div>

            </div>

          </aside>

        </div>
      </main>

    </div>
  );
}
