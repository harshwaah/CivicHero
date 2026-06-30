'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Clock, 
  X, 
  MapPin, 
  FileText, 
  ShieldAlert, 
  ChevronRight, 
  Activity, 
  Sparkles,
  Command
} from 'lucide-react';
import { IssueRepository } from '../lib/repositories/issueRepository';
import { Issue } from '../lib/models';
import { Skeleton } from './Skeleton';

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('civichero_recent_searches');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Save query to recent list
  const saveSearchToHistory = React.useCallback((searchQuery: string) => {
    const clean = searchQuery.trim();
    if (!clean) return;
    
    let updated = [clean, ...recentSearches.filter(q => q !== clean)];
    updated = updated.slice(0, 5); // Max 5 items
    setRecentSearches(updated);
    localStorage.setItem('civichero_recent_searches', JSON.stringify(updated));
  }, [recentSearches]);

  const triggerSelectIssue = React.useCallback((issue: Issue) => {
    setSelectedIssue(issue);
    saveSearchToHistory(query || issue.category);
  }, [query, saveSearchToHistory]);

  // 1. Load initial issues and search history
  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const data = await IssueRepository.getAll();
        setIssues(data);
      } catch (err) {
        console.error('Error fetching search indices:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  // 2. Perform search matches dynamically using useMemo (avoiding setState in effect)
  const results = React.useMemo(() => {
    if (!query.trim()) {
      return [];
    }

    const lower = query.toLowerCase();
    return issues.filter(issue => {
      const matchTitle = issue.title.toLowerCase().includes(lower);
      const matchSummary = issue.aiSummary?.summary?.toLowerCase().includes(lower) || false;
      const matchCategory = issue.category.toLowerCase().includes(lower);
      const matchDept = issue.routingDepartment?.toLowerCase().includes(lower) || 
                        issue.aiSummary?.routingTo?.toLowerCase().includes(lower) || false;
      const matchLocation = issue.location.toLowerCase().includes(lower);
      const matchUrgency = issue.urgency?.toLowerCase().includes(lower) || false;

      return matchTitle || matchSummary || matchCategory || matchDept || matchLocation || matchUrgency;
    });
  }, [query, issues]);

  // Sync selected index when query / results change
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setSelectedIndex(results.length > 0 ? 0 : -1);
  }

  // 3. Handle Keyboard Navigation (Up, Down, Enter, Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          triggerSelectIssue(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        setSelectedIssue(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, triggerSelectIssue]);

  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('civichero_recent_searches');
  };

  // Group matched results by category
  const groupedResults = results.reduce((acc, issue) => {
    const cat = issue.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(issue);
    return acc;
  }, {} as Record<string, Issue[]>);

  const categoriesKeys = Object.keys(groupedResults);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex-1 flex flex-col gap-6"
    >
      {/* Search Input Box */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm flex flex-col gap-4">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                saveSearchToHistory(query);
              }
            }}
            placeholder="Search reports by title, category, department, address, or severity..."
            className="w-full bg-slate-50 border border-slate-150 pl-12 pr-12 py-3.5 rounded-2xl font-sans text-sm font-medium text-brand-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
          
          <div className="absolute right-4 flex items-center gap-2">
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[10px] text-slate-400 font-mono font-bold uppercase">
              <Command className="w-3 h-3" />
              <span>Enter</span>
            </div>
          </div>
        </div>

        {/* Recent searches history */}
        {recentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-50 pt-3">
            <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-2">
              <Clock className="w-3 h-3" />
              <span>Recent Searches:</span>
            </span>
            {recentSearches.map((search, i) => (
              <button
                key={i}
                onClick={() => setQuery(search)}
                className="px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-full font-sans text-[11px] font-bold text-slate-600 transition-all"
              >
                {search}
              </button>
            ))}
            <button
              onClick={handleClearHistory}
              className="text-[10px] font-sans font-bold text-red-600 hover:underline ml-auto"
            >
              Clear history
            </button>
          </div>
        )}
      </div>

      {/* Results Content Area */}
      {loading ? (
        <div className="space-y-4 bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 rounded-xl" />
          <Skeleton className="h-12 rounded-xl" />
        </div>
      ) : query.trim() === '' ? (
        /* Standard Empty / Intro Screen */
        <div className="bg-white rounded-[28px] border border-slate-150 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-primary/5 flex items-center justify-center text-brand-primary">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-brand-primary">Explore Civic Index</h3>
            <p className="font-body text-xs text-brand-muted max-w-sm mt-1">
              Search the live city grid database. Try looking up <span className="font-bold text-brand-primary">&quot;pothole&quot;</span>, <span className="font-bold text-brand-primary">&quot;Broadway&quot;</span>, or specific sectors like <span className="font-bold text-brand-primary">&quot;Utilities&quot;</span> or <span className="font-bold text-brand-primary">&quot;Safety&quot;</span>.
            </p>
          </div>
        </div>
      ) : results.length === 0 ? (
        /* Empty results state */
        <div className="bg-white rounded-[28px] border border-slate-150 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-brand-primary">No Matching Records Found</h3>
            <p className="font-body text-xs text-brand-muted max-w-sm mt-1">
              Your query <span className="font-mono bg-slate-50 border border-slate-100 px-1 rounded">&quot;{query}&quot;</span> did not return any matches. Try adjusting spelling or using broader terms like &quot;Roads&quot; or &quot;Water&quot;.
            </p>
          </div>
        </div>
      ) : (
        /* Categorized matching list */
        <div className="flex flex-col gap-6">
          {categoriesKeys.map((catKey) => (
            <div key={catKey} className="space-y-3">
              <h3 className="font-sans font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono px-1">
                {catKey} INFRASTRUCTURE
              </h3>

              <div className="flex flex-col gap-3">
                {groupedResults[catKey].map((issue) => {
                  const globalIdx = results.findIndex(item => item.id === issue.id);
                  const isHighlighted = globalIdx === selectedIndex;

                  return (
                    <div
                      key={issue.id}
                      onClick={() => triggerSelectIssue(issue)}
                      className={`group p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                        isHighlighted 
                          ? 'bg-brand-primary text-white border-brand-primary shadow-md'
                          : 'bg-white hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      {/* Category icon */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isHighlighted ? 'bg-white/15 text-white' : 'bg-brand-primary/5 text-brand-primary'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-mono text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                            isHighlighted ? 'bg-white/10 text-white' : 'bg-slate-100 text-brand-muted'
                          }`}>
                            {issue.urgency}
                          </span>
                          <span className={`font-mono text-[9px] ${
                            isHighlighted ? 'text-slate-300' : 'text-slate-400'
                          }`}>
                            {issue.timestamp}
                          </span>
                        </div>

                        <h4 className={`font-sans font-extrabold text-sm tracking-tight ${
                          isHighlighted ? 'text-white' : 'text-brand-primary'
                        }`}>
                          {issue.title}
                        </h4>

                        <p className={`font-body text-xs mt-1 leading-relaxed truncate ${
                          isHighlighted ? 'text-slate-200' : 'text-brand-muted'
                        }`}>
                          {issue.description}
                        </p>

                        <div className="flex items-center gap-1 mt-2.5">
                          <MapPin className="w-3.5 h-3.5 opacity-60" />
                          <span className="font-body text-[10px] opacity-80">{issue.location}</span>
                        </div>
                      </div>

                      {/* Navigation indicator */}
                      <ChevronRight className={`w-5 h-5 mt-3 self-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isHighlighted ? 'text-white' : 'text-slate-400'
                      }`} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. MODAL / BOTTOM SLIDE-OUT DETAIL DRAWER (Premium interaction) */}
      <AnimatePresence>
        {selectedIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
            {/* Click backdrop to close */}
            <div className="absolute inset-0" onClick={() => setSelectedIssue(null)} />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col justify-between z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    Live Incident Report Detail
                  </span>
                  <h3 className="font-sans font-extrabold text-base text-brand-primary tracking-tight mt-1">
                    {selectedIssue.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Media Image if available */}
                {selectedIssue.imageUrl && (
                  <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-inner border border-slate-100 shrink-0">
                    <img
                      src={selectedIssue.imageUrl}
                      alt={selectedIssue.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">
                    Incident Description
                  </h4>
                  <p className="font-body text-xs text-brand-muted mt-2 leading-relaxed">
                    {selectedIssue.description}
                  </p>
                </div>

                {/* Metadata details */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">Category</span>
                    <span className="font-sans font-bold text-xs text-brand-primary">{selectedIssue.category}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">Urgency</span>
                    <span className="font-sans font-bold text-xs text-brand-primary">{selectedIssue.urgency}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">Status</span>
                    <span className="font-sans font-bold text-xs text-brand-primary">{selectedIssue.status}</span>
                  </div>
                  <div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">Report Location</span>
                    <span className="font-sans font-bold text-xs text-brand-primary">{selectedIssue.location}</span>
                  </div>
                </div>

                {/* AI Copilot Routing Summary */}
                {selectedIssue.aiSummary && (
                  <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 font-mono text-[10px] text-brand-secondary font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>CO-PILOT DISPATCH ROUTING</span>
                    </div>
                    <p className="font-body text-xs text-brand-muted leading-relaxed">
                      {selectedIssue.aiSummary.summary}
                    </p>
                    <div className="pt-2 border-t border-brand-primary/5 flex items-center justify-between text-[11px] font-sans">
                      <span className="text-slate-400">Assigned Department:</span>
                      <span className="font-bold text-brand-primary">
                        {selectedIssue.aiSummary.routingTo || selectedIssue.routingDepartment || 'Pending Dispatch'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setSelectedIssue(null)}
                  className="w-full py-2.5 text-center bg-brand-primary text-white font-sans font-bold text-xs rounded-xl hover:bg-brand-primary-container transition-colors focus:outline-none"
                >
                  Close Detail Review
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
