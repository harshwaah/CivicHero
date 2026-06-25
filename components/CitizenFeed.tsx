'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, SlidersHorizontal, Plus, ArrowRight, ShieldCheck, X, Smile, Star, ArrowUpRight } from 'lucide-react';
import EvidenceCard, { CivicReport } from './EvidenceCard';
import { mockReports } from '../lib/mockReports';

interface CitizenFeedProps {
  onOpenReportPlaceholder: () => void;
  onOpenMilestone: (title: string, phase: string, desc: string) => void;
}

const CATEGORIES = [
  'All Activity',
  'Roads',
  'Utilities',
  'Water',
  'Safety',
  'Environment',
  'Animals',
];

export default function CitizenFeed({ onOpenReportPlaceholder, onOpenMilestone }: CitizenFeedProps) {
  const [activeCategory, setActiveCategory] = useState('All Activity');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  // Simple elegant filter
  const filteredReports = mockReports.filter((report) => {
    const matchesCategory =
      activeCategory === 'All Activity' ||
      report.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col gap-6">
      
      {/* 1. TOP PREMIUM BAR */}
      <div className="flex items-center justify-between bg-white px-6 py-4 rounded-[24px] border border-slate-100 shadow-sm gap-4">
        {/* Profile info / Location selection */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-sans font-extrabold text-brand-primary">
              JD
            </div>
            {/* Online/Verified badge */}
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onOpenMilestone('Location Editor', 'Phase 1.5', 'This allows users to change their active coverage zone.')}>
              <span className="font-sans font-bold text-xs text-brand-primary">Park Slope, Brooklyn</span>
              <MapPin className="w-3.5 h-3.5 text-brand-secondary" />
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[9px] font-bold text-brand-secondary uppercase tracking-wider">SECURE AREA</span>
            </div>
          </div>
        </div>

        {/* Action Widgets (Search, Filter) */}
        <div className="flex items-center gap-2">
          {/* Elegant expandable Search Bar */}
          <div className="relative flex items-center">
            <AnimatePresence>
              {isSearchExpanded && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  placeholder="Search local reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-100 rounded-full py-1.5 pl-4 pr-8 text-xs font-sans text-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary focus:bg-white"
                />
              )}
            </AnimatePresence>
            <button
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center transition-colors text-brand-primary"
            >
              {isSearchExpanded ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
            </button>
          </div>

          <button 
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center transition-colors text-brand-primary md:flex hidden"
            onClick={() => onOpenMilestone('Advanced Filters', 'Phase 1.2', 'Configure custom distance ranges, category hierarchies, and sorting metrics.')}
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. HORIZONTAL CATEGORY NAVIGATION */}
      <div className="w-full">
        {/* Scrollable Container */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`snap-center shrink-0 px-4 py-2.5 rounded-full font-mono text-[10px] font-bold tracking-wider uppercase transition-all duration-200 border ${
                  isActive
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:text-brand-primary'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. CIVIC HERO BROADCAST SPOTLIGHT (Urgent/Live Hero card if "All Activity" or "Safety" is selected) */}
      {(activeCategory === 'All Activity' || activeCategory === 'Safety') && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[28px] overflow-hidden bg-slate-950 border border-slate-900 group"
        >
          {/* Hero background image */}
          <img
            src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80"
            alt="Safety Area Broadcast"
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          {/* Smooth color wash overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Broadcast labels */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-mono text-[10px] font-extrabold text-white tracking-widest uppercase bg-red-600/90 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
              CRITICAL EMERGENCY
            </span>
          </div>

          {/* Broadcast Content */}
          <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="font-mono text-[10px] text-white/70">5TH AVE METRO TERMINAL • ACTIVE CORRIDOR</span>
              <h2 className="font-sans font-extrabold text-lg sm:text-2xl text-white tracking-tight mt-1">
                Downtown Corridor Smoke Report Under Control
              </h2>
              <p className="font-body text-xs text-slate-200 mt-2 leading-relaxed">
                Emergency crews have established a safety parameter. Evacuations completed. Follow public bulletins for live route deviations.
              </p>
            </div>

            <button 
              onClick={() => onOpenMilestone('Live Stream Broadcast', 'Phase 1.3', 'Access realtime dispatch streams and authorized telemetry logs directly.')}
              className="bg-white hover:bg-slate-100 text-brand-primary font-sans font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-2xl flex items-center gap-1.5 shadow-md self-start md:self-auto transition-all shrink-0"
            >
              <span>Tune In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. MAIN EVIDENCE FEED */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sans font-extrabold text-lg text-brand-primary tracking-tight">
            Recent Nearby Updates
          </h3>
          <span className="font-mono text-[11px] font-bold text-slate-400">
            {filteredReports.length} {filteredReports.length === 1 ? 'Report' : 'Reports'} Found
          </span>
        </div>

        {filteredReports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <EvidenceCard report={report} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[28px] border border-slate-100 p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h4 className="font-sans font-bold text-base text-brand-primary">No Matching Records</h4>
              <p className="font-body text-xs text-brand-muted mt-1 max-w-sm">
                We couldn&apos;t find any reports matching &quot;{searchQuery}&quot; under &quot;{activeCategory}&quot;. Try adjusting your criteria.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. FLOATING ACTION BUTTON (Mobile FAB & Desktop Bottom-Right Overlay) */}
      <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-40">
        <motion.button
          onClick={onOpenReportPlaceholder}
          className="w-14 h-14 rounded-full bg-brand-primary text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-shadow border border-white/20 hover:bg-brand-primary/95 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut",
          }}
        >
          {/* Smiley representation of the customizable FAB */}
          <Smile className="w-6 h-6 transition-transform group-hover:rotate-12" />
          <span className="absolute right-0 top-0 w-3.5 h-3.5 bg-brand-secondary border-2 border-white rounded-full" />
        </motion.button>
      </div>
    </div>
  );
}
