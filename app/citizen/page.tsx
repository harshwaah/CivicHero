'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  ShieldAlert, 
  Bell, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  X, 
  Map, 
  Activity 
} from 'lucide-react';
import CitizenNav from '../../components/CitizenNav';
import CitizenFeed from '../../components/CitizenFeed';
import IncidentsMapPreview from '../../components/IncidentsMapPreview';
import CivicPassport from '../../components/CivicPassport';
import NotificationCenter from '../../components/NotificationCenter';
import GlobalSearch from '../../components/GlobalSearch';
import SettingsPanel from '../../components/SettingsPanel';
import { getIssueDescription, getSortScore } from '../../lib/helpers';
import { CivicMap } from '../../lib/providers/maps/mapProvider';
import { IssueService } from '../../lib/services/issueService';
import { Issue } from '../../lib/models';

export default function CitizenPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMilestone, setSelectedMilestone] = useState<{
    title: string;
    phase: string;
    desc: string;
  } | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  React.useEffect(() => {
    const unsubscribe = IssueService.subscribe(fetchedIssues => {
      setIssues(fetchedIssues);
    });
    return () => unsubscribe();
  }, []);

  // Quick milestone activation helper
  const handleOpenMilestone = (title: string, phase: string, desc: string) => {
    setSelectedMilestone({ title, phase, desc });
  };

  const handleOpenReportPlaceholder = () => {
    router.push('/citizen/report');
  };

  // Content rendering based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <CitizenFeed 
            onOpenReportPlaceholder={handleOpenReportPlaceholder}
            onOpenMilestone={handleOpenMilestone}
          />
        );
      case 'map':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 flex flex-col gap-6 h-[calc(100vh-160px)]"
          >
            <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-2 flex flex-col h-full">
              <div className="flex items-center justify-between p-4 pb-2 border-b border-slate-100">
                <h2 className="font-sans font-extrabold text-2xl text-brand-primary tracking-tight">
                  Civic Hub Map
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.push('/citizen/report')}
                    className="px-4 py-2 bg-brand-primary text-white font-mono text-[10px] font-bold uppercase rounded-xl hover:bg-brand-primary/90 transition-colors"
                  >
                    Report Issue Here
                  </button>
                </div>
              </div>
              <div className="flex-1 rounded-[24px] overflow-hidden m-2">
                <CivicMap
                  locationName="Citizen View"
                  categoryName="All"
                  interactive={true}
                  showLocateMe={true}
                  markers={issues.map(i => ({
                    id: i.id,
                    lat: i.coordinates?.lat || 40.7128 + ((parseInt(i.id.split('-')[1] || '0') % 100) / 100 - 0.5) * 0.05,
                    lng: i.coordinates?.lng || -74.0060 + ((parseInt(i.id.split('-')[1] || '0') % 50) / 50 - 0.5) * 0.05,
                    title: i.title,
                    urgency: i.urgency,
                    status: i.status,
                    onClick: () => router.push(`/citizen/issues/${i.id}`)
                  }))}
                  onClick={(e) => {
                    const lat = e.detail?.latLng?.lat;
                    const lng = e.detail?.latLng?.lng;
                    if (lat && lng) {
                      router.push(`/citizen/report?lat=${lat}&lng=${lng}`);
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        );
      case 'safety':
        const criticalSafetyIssues = [...issues]
          .filter(i => i.urgency === 'Critical' || i.urgency === 'High')
          .sort((a, b) => getSortScore(b) - getSortScore(a));
        return (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 bg-white rounded-[28px] border border-slate-150 p-6 md:p-8 shadow-sm flex flex-col gap-6 h-full min-h-[500px]"
          >
            <div>
              <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-1.5 rounded-full text-red-600 text-xs font-mono font-bold tracking-wider w-fit mb-4">
                <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                ACTIVE SAFETY CENTER
              </div>

              <h2 className="font-sans font-extrabold text-2xl text-brand-primary tracking-tight leading-tight">
                Neighborhood Safety Desk
              </h2>
              <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed mt-2 max-w-2xl">
                Real-time security audits, traffic advisories, and civic warnings generated from verified peer-to-peer reports in our active grid system.
              </p>

              {/* Dynamic Warning Alerts from real issues */}
              <div className="mt-6">
                <h3 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider font-mono mb-3">
                  Critical Warnings in Your Area ({criticalSafetyIssues.length})
                </h3>
                {criticalSafetyIssues.length === 0 ? (
                  <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-5 text-center flex flex-col items-center gap-2">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <div>
                      <h4 className="font-sans font-bold text-sm text-emerald-800">No Critical Safety Hazards</h4>
                      <p className="font-body text-xs text-emerald-600 mt-0.5">All local utilities, road networks, and public zones are currently operating within safe parameters.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[240px] overflow-y-auto pr-1">
                    {criticalSafetyIssues.map(issue => (
                      <div 
                        key={issue.id} 
                        onClick={() => router.push(`/citizen/issues/${issue.id}`)}
                        className="p-4 bg-red-50/30 border border-red-100 hover:border-red-200 rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-4"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                              {issue.urgency.toUpperCase()} ALERT
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{issue.location}</span>
                          </div>
                          <h4 className="font-sans font-bold text-sm text-brand-primary mt-1.5">{issue.title}</h4>
                          <p className="font-body text-xs text-brand-muted mt-1 line-clamp-1">{getIssueDescription(issue.description, issue.aiSummary)}</p>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 shrink-0">{issue.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Guidelines / Actionable content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <h4 className="font-sans font-bold text-sm text-brand-primary flex items-center gap-2">
                    <Activity className="w-4.5 h-4.5 text-brand-secondary" />
                    Civic Response Guide
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs font-body text-brand-muted">
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-secondary font-bold font-mono select-none">•</span>
                      <span><strong>Water & Utilities:</strong> Avoid contact with pooling water surrounding electrical junctions.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-brand-secondary font-bold font-mono select-none">•</span>
                      <span><strong>Roadway Potholes:</strong> Slow down to under 20mph when navigating mapped hazard zones.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <h4 className="font-sans font-bold text-sm text-brand-primary flex items-center gap-2">
                    <ShieldAlert className="w-4.5 h-4.5 text-brand-accent" />
                    Emergency Dispatch Channels
                  </h4>
                  <div className="mt-3 space-y-2 font-mono text-[11px] text-slate-600">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                      <span>MUNICIPAL HELPLINE</span>
                      <strong className="text-brand-primary">311 (ACTIVE)</strong>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                      <span>POWER & GRID OUTAGE</span>
                      <strong className="text-brand-primary">800-OUT-GRID</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="mt-4 px-6 py-3 bg-brand-primary text-white font-mono text-xs font-bold rounded-xl hover:bg-brand-primary/95 transition-all self-start shadow-md"
            >
              Return to Active Feed
            </button>
          </motion.div>
        );
      case 'alerts':
        const resolvedIssues = [...issues]
          .filter(i => i.status === 'Resolved')
          .sort((a, b) => getSortScore(b) - getSortScore(a));
        return (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 bg-white rounded-[28px] border border-slate-150 p-6 md:p-8 shadow-sm flex flex-col gap-6 h-full min-h-[500px]"
          >
            <div>
              <div className="flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/10 px-4 py-1.5 rounded-full text-brand-primary text-xs font-mono font-bold tracking-wider w-fit mb-4">
                <Bell className="w-4 h-4 text-brand-secondary animate-pulse" />
                CIVIC BULLETIN & DISPATCHES
              </div>

              <h2 className="font-sans font-extrabold text-2xl text-brand-primary tracking-tight leading-tight">
                Live Broadcast registry
              </h2>
              <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed mt-2 max-w-2xl">
                Stay informed with live action items, dispatch routing notifications, and recently resolved neighborhood fixes.
              </p>

              {/* Dynamic resolved list */}
              <div className="mt-6">
                <h3 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider font-mono mb-3">
                  Recently Resolved Actions ({resolvedIssues.length})
                </h3>
                {resolvedIssues.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center flex flex-col items-center gap-1">
                    <Activity className="w-7 h-7 text-brand-secondary animate-pulse" />
                    <h4 className="font-sans font-bold text-xs text-brand-primary">Waiting on Verification Reviews</h4>
                    <p className="font-body text-[11px] text-brand-muted mt-0.5">Municipal dispatches are currently in progress. Changes will stream here instantly.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto">
                    {resolvedIssues.map(issue => (
                      <div 
                        key={issue.id}
                        onClick={() => router.push(`/citizen/issues/${issue.id}`)}
                        className="p-4 bg-emerald-50/20 border border-emerald-100 hover:border-emerald-200 rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-4"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 w-fit">
                            RESOLVED
                          </span>
                          <h4 className="font-sans font-bold text-sm text-brand-primary mt-1.5">{issue.title}</h4>
                          <p className="font-body text-xs text-brand-muted mt-1 line-clamp-1">{getIssueDescription(issue.description, issue.aiSummary)}</p>
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-emerald-600 shrink-0">{issue.timestamp}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Interactive Subscription */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mt-6 flex flex-col gap-3">
                <div>
                  <h4 className="font-sans font-bold text-sm text-brand-primary flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-secondary" />
                    Subscribe to Instant Safety Broadcasts
                  </h4>
                  <p className="font-body text-xs text-brand-muted mt-1">Receive direct SMS notifications of emergency reroutes and priority hazard closures near you.</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter ZIP Code" 
                    className="flex-1 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-mono text-xs focus:outline-none focus:border-brand-primary"
                  />
                  <button 
                    onClick={() => alert("Successfully subscribed to alerts for your ZIP code!")}
                    className="px-5 py-2.5 bg-brand-primary text-white font-mono text-xs font-bold rounded-xl hover:bg-brand-primary/95 transition-colors shadow-sm"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="mt-4 px-6 py-3 bg-brand-primary text-white font-mono text-xs font-bold rounded-xl hover:bg-brand-primary/95 transition-all self-start shadow-md"
            >
              Return to Active Feed
            </button>
          </motion.div>
        );
      case 'search':
        return <GlobalSearch />;
      case 'notifications':
        return <NotificationCenter />;
      case 'passport':
        return <CivicPassport />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg relative pb-32 md:pb-12">
      {/* Light decorative blurs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-brand-secondary/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-brand-accent/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* TOP HEADER STATUS PANEL */}
      <header className="sticky top-0 z-30 bg-brand-bg/80 backdrop-blur-xl border-b border-slate-100/85">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2.5 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center text-brand-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-extrabold text-slate-400 tracking-wider">CIVICHERO PORTAL</span>
              <h1 className="font-sans font-extrabold text-sm text-brand-primary tracking-tight">Citizen Portal</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick status pill */}
            <div className="bg-emerald-50 border border-emerald-100/60 rounded-full px-3 py-1 flex items-center gap-1.5 text-[10px] font-mono font-bold text-brand-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>STABLE SYNC</span>
            </div>
          </div>
        </div>
      </header>

      {/* CORE SCREEN LAYOUT ENGINE */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex items-start gap-8">
        
        {/* Left Side: Bottom Nav on mobile / Vertical Sidebar on desktop */}
        <CitizenNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Center: Scrollable Dynamic Content Stage */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>

        {/* Right Side: Map/Stats Widget on Large Screen */}
        <IncidentsMapPreview />

      </main>

      {/* 1. MILESTONE PLACEHOLDER DIALOG MODAL */}
      <AnimatePresence>
        {selectedMilestone && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with 12px blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMilestone(null)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-[28px] border border-slate-100 max-w-md w-full p-6 shadow-2xl relative overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="font-mono text-[9px] font-extrabold text-brand-secondary bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  {selectedMilestone.phase} ACTIVE TARGET
                </span>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="font-sans font-extrabold text-xl text-brand-primary tracking-tight">
                  {selectedMilestone.title}
                </h3>
                <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed">
                  {selectedMilestone.desc}
                </p>
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/60 flex items-center gap-3 mt-2">
                  <div className="w-9 h-9 rounded-lg bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-secondary shrink-0">
                    <Sparkles className="w-4 h-4 text-brand-secondary" />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-xs text-brand-primary">Next Milestones Queued</h5>
                    <p className="font-body text-[10px] text-slate-400">Verifying immutable data models with Firestore.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedMilestone(null)}
                className="w-full mt-6 py-3.5 bg-brand-primary text-white font-mono text-xs font-bold rounded-2xl hover:bg-brand-primary-container transition-all shadow-md"
              >
                Acknowledge Protocol
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
