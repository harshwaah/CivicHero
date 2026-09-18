'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { Search, MapPin, Sparkles, SlidersHorizontal, ArrowRight, X, Smile } from 'lucide-react';
import EvidenceCard from './EvidenceCard';
import { IssueService } from '../lib/services/issueService';
import { Issue } from '../lib/models';
import { Skeleton } from './Skeleton';
import { getIssueDescription, getSortScore } from '@/lib/helpers';
import { safeImageUrl } from '@/lib/utils';

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
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Quick Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'All' | 'Open' | 'Resolved'>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [distanceFilter, setDistanceFilter] = useState<string>('All');
  const [sortOption, setSortOption] = useState<'Most Recent' | 'Highest Risk' | 'Most Confirmed'>('Most Recent');

  useEffect(() => {
    const unsubscribe = IssueService.subscribe((issues) => {
      setAllIssues(issues);
      setIsLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const reports = React.useMemo(() => {
    let list = [...allIssues];
    
    // 1. Category Filter
    if (activeCategory && activeCategory !== 'All Activity') {
      list = list.filter((item) => item.category.toLowerCase() === activeCategory.toLowerCase());
    }
    
    // 2. Search Query Filter
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(lower) ||
          item.description.toLowerCase().includes(lower) ||
          item.location.toLowerCase().includes(lower)
      );
    }

    // 3. Quick Filter (Status)
    if (quickFilter === 'Open') {
      list = list.filter(item => item.status !== 'Resolved');
    } else if (quickFilter === 'Resolved') {
      list = list.filter(item => item.status === 'Resolved');
    }

    // 4. Severity Filter
    if (severityFilter && severityFilter !== 'All') {
      list = list.filter(item => item.urgency?.toLowerCase() === severityFilter.toLowerCase());
    }

    // 5. Distance Filter
    if (distanceFilter === 'Nearby') {
      list = list.filter(item => {
        if (!item.distance) return true;
        const num = parseFloat(item.distance);
        return isNaN(num) || num <= 1.0;
      });
    } else if (distanceFilter === 'Further') {
      list = list.filter(item => {
        if (!item.distance) return false;
        const num = parseFloat(item.distance);
        return !isNaN(num) && num > 1.0;
      });
    }

    // 6. Sorting
    if (sortOption === 'Highest Risk') {
      const urgencyOrder: Record<string, number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      list.sort((a, b) => {
        const pA = urgencyOrder[a.urgency] || 0;
        const pB = urgencyOrder[b.urgency] || 0;
        if (pB !== pA) return pB - pA;
        return getSortScore(b) - getSortScore(a);
      });
    } else if (sortOption === 'Most Confirmed') {
      list.sort((a, b) => (b.verifiedByCount || 0) - (a.verifiedByCount || 0));
    } else {
      // Default: Most Recent
      list.sort((a, b) => getSortScore(b) - getSortScore(a));
    }

    return list;
  }, [allIssues, activeCategory, searchQuery, quickFilter, severityFilter, distanceFilter, sortOption]);

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
            className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center transition-colors text-brand-primary"
            onClick={() => setShowFilters(!showFilters)}
            title="Toggle Quick Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* QUICK FILTERS COLLAPSIBLE PANEL */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border border-slate-100 rounded-[24px] p-6 shadow-sm overflow-hidden flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-sans font-bold text-xs text-brand-primary uppercase tracking-wider">Quick Filters & Tuning</h4>
              <button 
                onClick={() => {
                  setQuickFilter('All');
                  setSeverityFilter('All');
                  setDistanceFilter('All');
                  setSortOption('Most Recent');
                }}
                className="font-mono text-[9px] text-brand-secondary hover:underline uppercase font-bold"
              >
                Reset Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* 1. Status Filter */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Status</span>
                <div className="flex gap-1">
                  {(['All', 'Open', 'Resolved'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setQuickFilter(f)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-sans text-[11px] font-semibold border transition-all ${quickFilter === f ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Severity Filter */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Urgency</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full py-1.5 px-3 bg-slate-50 border border-slate-100 rounded-lg font-sans text-[11px] font-semibold text-slate-600 focus:outline-none"
                >
                  <option value="All">All Levels</option>
                  <option value="Critical">Critical Only</option>
                  <option value="High">High Only</option>
                  <option value="Medium">Medium Only</option>
                  <option value="Low">Low Only</option>
                </select>
              </div>

              {/* 3. Distance Filter */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Distance</span>
                <div className="flex gap-1">
                  {(['All', 'Nearby', 'Further'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setDistanceFilter(f)}
                      className={`flex-1 py-1.5 px-2 rounded-lg font-sans text-[11px] font-semibold border transition-all ${distanceFilter === f ? 'bg-brand-primary text-white border-brand-primary' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-100'}`}
                    >
                      {f === 'Nearby' ? 'Nearby (<1mi)' : f}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Sorting Option */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Sort Order</span>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="w-full py-1.5 px-3 bg-slate-50 border border-slate-100 rounded-lg font-sans text-[11px] font-semibold text-slate-600 focus:outline-none"
                >
                  <option value="Most Recent">Most Recent</option>
                  <option value="Highest Risk">Highest Risk First</option>
                  <option value="Most Confirmed">Most Confirmed</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* 3. CIVIC LIVE BULLETIN SPOTLIGHT (Featured high-priority issue from real Firestore data) */}
      {(activeCategory === 'All Activity' || activeCategory === 'Safety') && !searchQuery && reports.length > 0 && (
        (() => {
          const featuredIssue = reports.find(r => r.urgency === 'Critical') || reports.find(r => r.urgency === 'High') || reports[0];
          if (!featuredIssue) return null;
          return (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[28px] overflow-hidden bg-slate-950 border border-slate-900 group"
            >
              <Link href={`/citizen/issues/${featuredIssue.id}`} className="block w-full h-full">
                {/* Hero background image */}
                <Image
                  src={safeImageUrl(featuredIssue.imageUrl, featuredIssue.category, featuredIssue.title, featuredIssue.description)}
                  alt={featuredIssue.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
                  className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                  priority
                />
                {/* Smooth color wash overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Live / Bulletin Label */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="font-mono text-[10px] font-extrabold text-white tracking-widest uppercase bg-red-600/90 backdrop-blur-md px-3 py-1 rounded-md border border-white/10">
                    CIVIC LIVE • {featuredIssue.urgency?.toUpperCase() || 'HIGH'} PRIORITY
                  </span>
                </div>

                {/* Broadcast Content */}
                <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div className="max-w-xl">
                    <span className="font-mono text-[10px] text-white/70">{featuredIssue.location?.toUpperCase() || 'NEIGHBORHOOD CORE'}</span>
                    <h2 className="font-sans font-extrabold text-lg sm:text-2xl text-white tracking-tight mt-1 line-clamp-1">
                      {featuredIssue.title}
                    </h2>
                    <p className="font-body text-xs text-slate-200 mt-2 leading-relaxed line-clamp-2">
                      {getIssueDescription(featuredIssue.description, featuredIssue.aiSummary)}
                    </p>
                  </div>

                  <div 
                    className="bg-white hover:bg-slate-100 text-brand-primary font-sans font-bold text-xs tracking-wider uppercase px-5 py-3 rounded-2xl flex items-center gap-1.5 shadow-md self-start md:self-auto transition-all shrink-0"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })()
      )}

      {/* 4. MAIN EVIDENCE FEED */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-sans font-extrabold text-lg text-brand-primary tracking-tight">
            Recent Nearby Updates
          </h3>
          <span className="font-mono text-[11px] font-bold text-slate-400">
            {reports.length} {reports.length === 1 ? 'Report' : 'Reports'} Found
          </span>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-[24px] border border-slate-100 p-4 h-[320px] flex flex-col gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
                <Skeleton className="w-full h-[140px] rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Link href={`/citizen/issues/${report.id}`} className="block h-full">
                  <EvidenceCard report={report} />
                </Link>
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
