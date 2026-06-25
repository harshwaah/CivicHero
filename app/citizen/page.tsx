'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  ShieldAlert, 
  Bell, 
  MapPin, 
  ArrowLeft, 
  CheckCircle, 
  Sparkles, 
  X, 
  Layers, 
  Camera, 
  Map, 
  Activity, 
  Smile 
} from 'lucide-react';
import CitizenNav from '../../components/CitizenNav';
import CitizenFeed from '../../components/CitizenFeed';
import IncidentsMapPreview from '../../components/IncidentsMapPreview';

export default function CitizenPage() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedMilestone, setSelectedMilestone] = useState<{
    title: string;
    phase: string;
    desc: string;
  } | null>(null);

  const [isReportingOpen, setIsReportingOpen] = useState(false);

  // Quick milestone activation helper
  const handleOpenMilestone = (title: string, phase: string, desc: string) => {
    setSelectedMilestone({ title, phase, desc });
  };

  const handleOpenReportPlaceholder = () => {
    setIsReportingOpen(true);
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
            className="flex-1 bg-white rounded-[28px] border border-slate-100 p-8 md:p-12 shadow-sm flex flex-col justify-between h-full min-h-[500px]"
          >
            <div>
              <div className="flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/10 px-4 py-1.5 rounded-full text-brand-primary text-xs font-mono font-bold tracking-wider w-fit mb-6">
                <Compass className="w-4 h-4 text-brand-secondary animate-pulse" />
                PHASE 1.2 ROADMAP MILESTONE
              </div>

              <h2 className="font-sans font-extrabold text-3xl text-brand-primary tracking-tight leading-tight">
                Interactive Geospatial Map Canvas
              </h2>
              <p className="font-body text-sm text-brand-muted leading-relaxed mt-3 max-w-2xl">
                The high-performance map interface is scheduled for deployment in Phase 1.2. This view will incorporate real-time vector maps, customizable area polygons, distance-filtered incident alerts, and direct coordinates validation.
              </p>

              {/* Mock map graphic representation */}
              <div className="relative w-full aspect-[2/1] bg-slate-950 rounded-2xl overflow-hidden mt-8 border border-slate-900 group">
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/40 border border-brand-primary/30 flex items-center justify-center mb-3">
                    <Map className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <h4 className="font-sans font-bold text-sm text-white">Geoproof Registry Module</h4>
                  <p className="font-mono text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
                    INTEGRATING GOOGLE MAPS PLATFORM • OFFLINE QUEUE READY
                  </p>
                </div>
              </div>

              {/* Bullet list of upcoming features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-brand-secondary shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-xs text-brand-primary">Precision Geofencing</h5>
                    <p className="font-body text-[11px] text-slate-500 mt-0.5">Track and filter issues within 1.5 miles of your verified location.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100/60 flex items-center justify-center text-brand-secondary shrink-0 mt-0.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-xs text-brand-primary">Heatmap Metrics</h5>
                    <p className="font-body text-[11px] text-slate-500 mt-0.5">Identify cluster zones where infrastructure demands priority paving.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="mt-8 px-6 py-3.5 bg-brand-primary text-white font-mono text-xs font-bold rounded-2xl hover:bg-brand-primary-container transition-all self-start shadow-md"
            >
              Return to Active Feed
            </button>
          </motion.div>
        );
      case 'safety':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 bg-white rounded-[28px] border border-slate-100 p-8 md:p-12 shadow-sm flex flex-col justify-between h-full min-h-[500px]"
          >
            <div>
              <div className="flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/10 px-4 py-1.5 rounded-full text-brand-primary text-xs font-mono font-bold tracking-wider w-fit mb-6">
                <ShieldAlert className="w-4 h-4 text-brand-secondary animate-pulse" />
                PHASE 1.3 ROADMAP MILESTONE
              </div>

              <h2 className="font-sans font-extrabold text-3xl text-brand-primary tracking-tight leading-tight">
                Unified Safety Beacons
              </h2>
              <p className="font-body text-sm text-brand-muted leading-relaxed mt-3 max-w-2xl">
                The personal safety module launches in Phase 1.3. This panel will display local sirens, real-time safety advisories, community watchdog rosters, and instant SOS alerts with verified responder coordinates.
              </p>

              {/* abstract safety display */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-5 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  </div>
                  <h5 className="font-sans font-bold text-xs text-brand-primary">Panic Beacon</h5>
                  <span className="font-mono text-[9px] text-slate-400 mt-1 uppercase block">SECURE CHANNEL</span>
                </div>

                <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-5 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-brand-accent" />
                  </div>
                  <h5 className="font-sans font-bold text-xs text-brand-primary">Area Audio Feed</h5>
                  <span className="font-mono text-[9px] text-slate-400 mt-1 uppercase block">RESCUE STREAM</span>
                </div>

                <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-5 text-center flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                    <CheckCircle className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <h5 className="font-sans font-bold text-xs text-brand-primary">Local Watchdog</h5>
                  <span className="font-mono text-[9px] text-slate-400 mt-1 uppercase block">COMMUNITY VETTED</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="mt-8 px-6 py-3.5 bg-brand-primary text-white font-mono text-xs font-bold rounded-2xl hover:bg-brand-primary-container transition-all self-start shadow-md"
            >
              Return to Active Feed
            </button>
          </motion.div>
        );
      case 'alerts':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="flex-1 bg-white rounded-[28px] border border-slate-100 p-8 md:p-12 shadow-sm flex flex-col justify-between h-full min-h-[500px]"
          >
            <div>
              <div className="flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/10 px-4 py-1.5 rounded-full text-brand-primary text-xs font-mono font-bold tracking-wider w-fit mb-6">
                <Bell className="w-4 h-4 text-brand-secondary animate-pulse" />
                PHASE 1.4 ROADMAP MILESTONE
              </div>

              <h2 className="font-sans font-extrabold text-3xl text-brand-primary tracking-tight leading-tight">
                Live Broadcast Alert Registry
              </h2>
              <p className="font-body text-sm text-brand-muted leading-relaxed mt-3 max-w-2xl">
                The broadcast registry launches in Phase 1.4, connecting verified emergency dispatch streams with real-time SMS, email, and push notification modules.
              </p>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100/60 mt-8 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                  <Sparkles className="w-5 h-5 text-brand-secondary" />
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-brand-primary">Dynamic Smart Summaries</h4>
                  <p className="font-body text-xs text-brand-muted mt-1 leading-relaxed">
                    Our server-side AI model will auto-aggregate chaotic multi-source incident reports into human-friendly action guidelines.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('home')}
              className="mt-8 px-6 py-3.5 bg-brand-primary text-white font-mono text-xs font-bold rounded-2xl hover:bg-brand-primary-container transition-all self-start shadow-md"
            >
              Return to Active Feed
            </button>
          </motion.div>
        );
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

      {/* 2. "REPORT INCIDENT" FAB DOCK PANEL MODAL */}
      <AnimatePresence>
        {isReportingOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with 12px blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportingOpen(false)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="bg-white rounded-[28px] border border-slate-100 max-w-lg w-full p-6 shadow-2xl relative overflow-hidden z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <span className="font-mono text-[9px] font-extrabold text-brand-secondary bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  PHASE 1.2 PREVIEW
                </span>
                <button
                  onClick={() => setIsReportingOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Camera className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-lg text-brand-primary tracking-tight">
                      Unified Report Canvas
                    </h3>
                    <p className="font-body text-xs text-brand-muted mt-0.5">Capture, Geoproof & Co-sign Issues</p>
                  </div>
                </div>

                {/* Simulated reporting wizard layout to look extremely real and premium */}
                <div className="space-y-3 mt-2">
                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                    <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1">Incident Category</label>
                    <div className="flex flex-wrap gap-2">
                      {['Roads', 'Utilities', 'Water', 'Safety', 'Environment'].map((cat, i) => (
                        <span key={cat} className={`px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold uppercase ${i === 0 ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-slate-400 border-slate-100'}`}>
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                    <label className="block text-[10px] font-mono text-slate-400 font-bold uppercase mb-1">Narrative Description</label>
                    <textarea 
                      disabled
                      placeholder="e.g., Unsafe pothole expanding near the high school entrance..." 
                      className="w-full bg-white border border-slate-100 rounded-xl p-3 text-xs font-sans text-slate-400 h-20 resize-none outline-none cursor-not-allowed"
                    />
                  </div>

                  <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span className="font-sans text-xs text-slate-400">Attach verification image</span>
                    </div>
                    <span className="font-mono text-[9px] text-brand-secondary bg-emerald-50 px-2 py-0.5 rounded-full">RECOMMENDED</span>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/60 flex items-start gap-3 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-amber-100/40 flex items-center justify-center text-brand-accent shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-sans font-bold text-xs text-brand-primary">Immutable Timeline Integration</h5>
                    <p className="font-body text-[10px] text-brand-muted leading-relaxed mt-0.5">
                      Submitting issues will automatically run metadata sanitization and anchor a geoproof token on Firestore during Phase 1.2.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => setIsReportingOpen(false)}
                  className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-500 font-mono text-xs font-bold rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  disabled
                  className="flex-1 py-3.5 bg-brand-primary/45 text-white/80 font-mono text-xs font-bold rounded-2xl cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  <span>Submit Active Log</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
