'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft,
  LayoutDashboard,
  ListTodo,
  Activity,
  Bot,
  Map as MapIcon,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronRight,
  ShieldAlert,
  Zap,
  TrendingUp,
  BarChart,
  Target,
  Workflow,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { IssueService } from '../../lib/services/issueService';
import { formatTimestamp, getIssueDescription, getSortScore } from '../../lib/helpers';
import { AnalyticsService } from '../../lib/services/analyticsService';
import { TrustService } from '../../lib/services/trustService';
import { AdministratorCopilot } from '../../lib/providers/ai/administratorCopilot';
import { CommunityIntelligenceAgent } from '../../lib/providers/ai/communityIntelligenceAgent';
import { Issue, TrustMetrics } from '../../lib/models';
import IncidentsMapPreview from '../../components/IncidentsMapPreview';
import { CivicMap } from '../../lib/providers/maps/mapProvider';
import { CityAnalytics } from '../../lib/repositories/analyticsRepository';
import { Skeleton } from '../../components/Skeleton';
import { DEFAULT_MAP_CENTER } from '../../lib/config';
import { CopilotInsights } from '../../lib/providers/ai/administratorCopilot';

const CURRENT_TIME_VALUE = typeof window !== 'undefined' ? Date.now() : 1782729157000;

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // State
  const [issues, setIssues] = useState<Issue[]>([]);
  const [analytics, setAnalytics] = useState<CityAnalytics | null>(null);
  const [copilotInsights, setCopilotInsights] = useState<CopilotInsights | null>(null);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Smart state refs for Administrator Copilot caching
  const prevIssuesRef = useRef<Issue[]>([]);
  const hasLoadedCopilotRef = useRef<boolean>(false);
  
  useEffect(() => {
    let unsubscribe = () => {};

    const fetchData = async () => {
      setLoading(true);
      
      unsubscribe = IssueService.subscribe(async (fetchedIssues) => {
        const prevIssues = prevIssuesRef.current;
        prevIssuesRef.current = fetchedIssues;
        setIssues(fetchedIssues);

        if (fetchedIssues.length > 0) {
          const isInitialLoad = !hasLoadedCopilotRef.current;
          let shouldTriggerRegen = false;
          let regenReason = "";

          if (isInitialLoad) {
            hasLoadedCopilotRef.current = true;
            shouldTriggerRegen = true;
            regenReason = "Initial dashboard load (reading existing Firestore cache)";
          } else {
            // Check if a new report was created
            if (fetchedIssues.length > prevIssues.length) {
              shouldTriggerRegen = true;
              regenReason = "New report created";
            } else {
              // Check if any critical issue changed status
              for (const next of fetchedIssues) {
                const prev = prevIssues.find(p => p.id === next.id);
                if (prev) {
                  if (prev.status !== next.status) {
                    const wasCritical = prev.urgency === 'Critical';
                    const isNowCritical = next.urgency === 'Critical';
                    if (wasCritical || isNowCritical) {
                      shouldTriggerRegen = true;
                      regenReason = `Critical issue changed status from ${prev.status} to ${next.status}`;
                      break;
                    }
                  }
                }
              }
            }
          }

          if (shouldTriggerRegen) {
            try {
              console.log(`[COPILOT] Fetching insights. Reason: ${regenReason}`);
              const insights = await AdministratorCopilot.generateInsights(fetchedIssues, { 
                forceRefresh: !isInitialLoad 
              });
              setCopilotInsights(insights);
              setCopilotError(null);
            } catch (err: any) {
              console.error("Failed to generate copilot insights", err);
              setCopilotError(err?.message || "Failed to load copilot insights");
            }
          } else {
            console.log("[COPILOT] Subscription update. No invalidation criteria met (no new reports or critical state changes). Bypassing API request.");
          }
        }
      });

      const fetchedAnalytics = await AnalyticsService.getCityScorecard();
      
      setAnalytics(fetchedAnalytics);
      setLoading(false);
    };
    fetchData();

    return () => {
      unsubscribe();
    };
  }, [activeTab]);

  const handleRefreshBriefing = async () => {
    if (isRefreshing || issues.length === 0) return;
    setIsRefreshing(true);
    try {
      console.log('[COPILOT] Manual refresh requested by administrator.');
      const insights = await AdministratorCopilot.generateInsights(issues, { forceRefresh: true });
      setCopilotInsights(insights);
      setCopilotError(null);
    } catch (err: any) {
      console.error("Failed to manually refresh copilot insights", err);
      setCopilotError(err?.message || "Failed to refresh copilot insights");
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredIssues = React.useMemo(() => {
    let list = [...issues];

    // 1. Search filter: Title, Description, AI Summary, Address, Category, Department
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      list = list.filter(issue => {
        const titleMatch = issue.title?.toLowerCase().includes(lower);
        const descMatch = issue.description?.toLowerCase().includes(lower);
        const summaryMatch = issue.aiSummary?.summary?.toLowerCase().includes(lower);
        const locationMatch = issue.location?.toLowerCase().includes(lower);
        const categoryMatch = issue.category?.toLowerCase().includes(lower);
        const deptMatch = issue.routingDepartment?.toLowerCase().includes(lower);
        
        return titleMatch || descMatch || summaryMatch || locationMatch || categoryMatch || deptMatch;
      });
    }

    // 2. Severity Filter: Critical, High, Medium, Low
    if (severityFilter && severityFilter !== 'All') {
      list = list.filter(issue => issue.urgency?.toLowerCase() === severityFilter.toLowerCase());
    }

    // 3. Status Filter: Reported, Verified, Assigned, In Progress, Resolved
    if (statusFilter && statusFilter !== 'All') {
      list = list.filter(issue => {
        const status = issue.status?.toLowerCase();
        const filter = statusFilter.toLowerCase();
        if (filter === 'reported') {
          return status === 'reported' || status === 'live';
        }
        return status === filter;
      });
    }

    // 4. Department Filter: Roads, Utilities, Sanitation, Emergency
    if (departmentFilter && departmentFilter !== 'All') {
      list = list.filter(issue => {
        const dept = issue.routingDepartment || (
          issue.category === 'Safety' ? 'Emergency' : issue.category
        );
        return dept?.toLowerCase() === departmentFilter.toLowerCase();
      });
    }

    // 5. Date Filter: Today, Week, Month
    if (dateFilter && dateFilter !== 'All') {
      const now = CURRENT_TIME_VALUE;
      list = list.filter(issue => {
        const score = getSortScore(issue);
        if (score === 0) return true; // keep if unknown
        const ageMs = now - score;
        if (dateFilter === 'Today') {
          return ageMs <= 24 * 60 * 60 * 1000;
        }
        if (dateFilter === 'Week') {
          return ageMs <= 7 * 24 * 60 * 60 * 1000;
        }
        if (dateFilter === 'Month') {
          return ageMs <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
      });
    }

    // Sort: Newest first!
    list.sort((a, b) => getSortScore(b) - getSortScore(a));

    return list;
  }, [issues, searchQuery, severityFilter, statusFilter, departmentFilter, dateFilter]);

  const getPriorityColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Live': return 'bg-red-500 text-white';
      case 'In Progress': return 'bg-amber-500 text-white';
      case 'Resolved': return 'bg-emerald-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const renderDashboard = () => (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col gap-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-sm text-slate-800">Critical Issues</h3>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans font-extrabold text-3xl text-slate-900">
            {issues.filter(i => i.urgency === 'Critical' && i.status !== 'Resolved').length}
          </p>
          <p className="font-mono text-[10px] text-red-500 mt-2 font-bold uppercase tracking-wider">Requires immediate action</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-sm text-slate-800">In Progress</h3>
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans font-extrabold text-3xl text-slate-900">
            {issues.filter(i => i.status === 'In Progress').length}
          </p>
          <p className="font-mono text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Active operations</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-sans font-bold text-sm text-slate-800">Community Score</h3>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-sans font-extrabold text-3xl text-slate-900">
            {analytics?.averageResolutionDays || 0}
          </p>
          <p className="font-mono text-[10px] text-emerald-600 mt-2 font-bold uppercase tracking-wider">Avg Resolution Days</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-brand-primary" />
            <h3 className="font-sans font-bold text-sm text-brand-primary">Priority Queue</h3>
          </div>
          <button onClick={() => setActiveTab('queue')} className="text-xs font-mono font-bold text-brand-secondary hover:text-brand-primary transition-colors flex items-center gap-1">
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {[...issues]
            .filter(i => i.status !== 'Resolved')
            .sort((a, b) => {
              const urgencyOrder: Record<string, number> = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
              const pA = urgencyOrder[a.urgency] || 0;
              const pB = urgencyOrder[b.urgency] || 0;
              if (pB !== pA) return pB - pA;
              return getSortScore(b) - getSortScore(a);
            })
            .slice(0, 4)
            .map(issue => (
            <Link key={issue.id} href={`/admin/issues/${issue.id}`} className="flex items-start md:items-center justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-2 h-2 mt-2 rounded-full ${getStatusColor(issue.status)}`} />
                <div>
                  <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-brand-primary transition-colors">{issue.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="font-mono text-[10px] text-slate-500">{issue.location}</span>
                    <span className="font-mono text-[10px] text-slate-300">•</span>
                    <span className="font-mono text-[10px] text-slate-500">{issue.category}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 ml-4">
                <span className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${getPriorityColor(issue.urgency)}`}>
                  {issue.urgency}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{formatTimestamp(issue.timestamp)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderQueue = () => (
    <motion.div 
      key="queue"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col gap-6"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
        {/* Top bar: Search and Severity */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active issues..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            />
          </div>
          
          {/* Severity Pills */}
          <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 hide-scrollbar">
            <span className="text-xs font-mono font-bold text-slate-400 mr-2 uppercase tracking-wider">Severity:</span>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => {
              const isActive = severityFilter === f;
              return (
                <button 
                  key={f} 
                  onClick={() => setSeverityFilter(f)}
                  className={`px-3 py-1 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-brand-primary text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary filters: Status, Department, and Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
          {/* Status filter dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="Verified">Verified</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          {/* Department filter dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Department</label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
            >
              <option value="All">All Departments</option>
              <option value="Roads">Roads</option>
              <option value="Utilities">Utilities</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Date filter dropdown */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Date Logged</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-primary/20 cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="Today">Logged Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
            </select>
          </div>
        </div>

        {/* Active Filters Clear Indicator */}
        {(searchQuery || severityFilter !== 'All' || statusFilter !== 'All' || departmentFilter !== 'All' || dateFilter !== 'All') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-50">
            <p className="text-[11px] font-body text-slate-500">
              Showing <strong>{filteredIssues.length}</strong> matching reports.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSeverityFilter('All');
                setStatusFilter('All');
                setDepartmentFilter('All');
                setDateFilter('All');
              }}
              className="text-[10px] font-mono font-bold text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredIssues.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-sans font-medium text-sm text-slate-400">No issues match the selected filter criteria.</p>
            </div>
          ) : (
            filteredIssues.map(issue => (
              <Link key={issue.id} href={`/admin/issues/${issue.id}`} className="flex items-start justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors group">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${getPriorityColor(issue.urgency)}`}>
                    {issue.urgency}
                  </div>
                  <div>
                    <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-brand-primary transition-colors">{issue.title}</h4>
                    <p className="font-body text-xs text-slate-500 mt-1 line-clamp-1">
                      {getIssueDescription(issue.description, issue.aiSummary)}
                    </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="font-mono text-[10px] text-slate-500">{issue.location}</span>
                    <span className={`font-mono text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                    {issue.routingDepartment && (
                      <span className="font-mono text-[9px] text-brand-secondary font-bold uppercase bg-brand-secondary/10 px-2 py-0.5 rounded-md">
                        {issue.routingDepartment}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                <span className="font-mono text-[10px] text-slate-400">{formatTimestamp(issue.timestamp)}</span>
                <span className="font-mono text-[10px] text-brand-primary font-bold">{issue.upvotes} validations</span>
              </div>
            </Link>
          )))}
        </div>
      </div>
    </motion.div>
  );

  const renderCopilot = () => (
    <motion.div 
      key="copilot"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col gap-6"
    >
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/20 blur-3xl rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-secondary/20 flex items-center justify-center shrink-0 border border-brand-secondary/30">
              <Bot className="w-6 h-6 text-brand-secondary" />
            </div>
            <div className="flex-1">
              <h2 className="font-sans font-extrabold text-2xl tracking-tight mb-2">Administrator AI Copilot</h2>
              <p className="font-body text-sm text-slate-300 max-w-2xl leading-relaxed">
                {copilotInsights ? copilotInsights.operationalBriefing : 'Analyzing real-time incident data to generate operational insights...'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
              <span>
                Last briefing update: {copilotInsights?.updatedAt ? new Date(copilotInsights.updatedAt).toLocaleTimeString() : 'Never'}
              </span>
            </div>
            
            <button
              onClick={handleRefreshBriefing}
              disabled={isRefreshing}
              className="px-4 py-2 bg-brand-secondary hover:bg-brand-secondary/90 disabled:opacity-50 text-slate-900 rounded-xl font-sans font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all self-end sm:self-auto cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing Briefing...' : 'Refresh Briefing'}
            </button>
          </div>
        </div>
      </div>

      {copilotError && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-sm">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                AI Agent Requires Configuration
              </p>
              <div className="mt-1 text-xs text-amber-800 space-y-1 leading-relaxed">
                <p>
                  To enable live AI operational briefs, automated hotspots, and routing classifications, a dedicated Gemini API key is required.
                </p>
                <p className="font-bold">
                  Setup Instructions: Click &apos;Settings&apos; (top right or gear icon) &rarr; &apos;Secrets&apos; &rarr; Add <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-amber-900 text-[10px]">APP_GEMINI_API_KEY</code> with your Google AI Studio key.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="font-sans font-bold text-sm text-slate-900">Emerging Geographic Hotspots</h3>
          </div>
          <div className="space-y-4 flex-1">
            {copilotInsights?.emergingHotspots.map((h, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-orange-50 text-orange-600 border border-orange-200`}>
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-sans font-bold text-sm text-slate-900">{h.issueType}</h4>
                    <span className="font-mono text-[9px] font-bold text-slate-500 uppercase">{h.reportCount} Reports</span>
                  </div>
                  <p className="font-mono text-[9px] font-bold text-slate-400 mb-2 uppercase">{h.location}</p>
                  <p className="font-body text-xs text-slate-600 leading-relaxed mb-2">{h.description}</p>
                </div>
              </div>
            ))}
            {!copilotInsights && (
              <div className="space-y-4">
                 <Skeleton className="h-24 w-full rounded-xl" />
                 <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Workflow className="w-4 h-4 text-brand-primary" />
            <h3 className="font-sans font-bold text-sm text-slate-900">Department Recommendations</h3>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {copilotInsights?.departmentRecommendations.map((rec, i) => (
               <div key={i} className="p-4 border border-slate-100 rounded-xl bg-blue-50/50">
                 <h4 className="font-sans font-bold text-sm text-brand-primary">{rec.department}</h4>
                 <p className="font-body text-xs text-slate-600 mt-1">{rec.action}</p>
               </div>
            ))}
            {!copilotInsights && (
              <div className="space-y-4">
                 <Skeleton className="h-20 w-full rounded-xl" />
                 <Skeleton className="h-20 w-full rounded-xl" />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAnalytics = () => (
    <motion.div 
      key="analytics"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col gap-6"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="font-sans font-extrabold text-2xl tracking-tight text-slate-900 mb-1">Civic Trust Index</h2>
        <p className="font-body text-sm text-slate-500 mb-8">System-wide operational metrics and community engagement analytics.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-100">
            <p className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Total Issues</p>
            <p className="font-sans font-extrabold text-3xl text-slate-900">{analytics?.totalIssuesCount}</p>
          </div>
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="font-mono text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Resolved</p>
            <p className="font-sans font-extrabold text-3xl text-emerald-900">{analytics?.resolvedIssuesCount}</p>
          </div>
          <div className="p-5 rounded-xl bg-brand-primary/5 border border-brand-primary/10">
            <p className="font-mono text-[10px] font-bold text-brand-primary uppercase tracking-wider mb-2">Active Citizens</p>
            <p className="font-sans font-extrabold text-3xl text-brand-primary">{analytics?.activeCitizensCount}</p>
          </div>
          <div className="p-5 rounded-xl bg-brand-secondary/10 border border-brand-secondary/20">
            <p className="font-mono text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-2">Co-signings</p>
            <p className="font-sans font-extrabold text-3xl text-brand-secondary">{analytics?.communityCoSigningsCount}</p>
          </div>
        </div>

        <h3 className="font-sans font-bold text-sm text-slate-900 mb-4">Department Load Distribution</h3>
        <div className="space-y-4">
          {analytics?.categoryDistribution.map(cat => (
            <div key={cat.name}>
              <div className="flex justify-between text-xs font-mono font-bold text-slate-600 mb-1.5">
                <span>{cat.name}</span>
                <span>{cat.value}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-brand-primary rounded-full"
                  style={{ width: `${cat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderMap = () => (
    <motion.div 
      key="map"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex flex-col gap-6 h-[calc(100vh-160px)]"
    >
      <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm p-2 flex flex-col h-full">
        <div className="flex items-center justify-between p-4 pb-2 border-b border-slate-100">
          <h2 className="font-sans font-extrabold text-2xl text-slate-900 tracking-tight">
            Operational Map
          </h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold uppercase rounded-xl hover:bg-slate-200 transition-colors">
              Filter Area
            </button>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`px-4 py-2 font-mono text-[10px] font-bold uppercase rounded-xl transition-colors ${showHeatmap ? 'bg-brand-primary text-white hover:bg-brand-primary/90' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Toggle Heatmap
            </button>
          </div>
        </div>
        <div className="flex-1 rounded-[24px] overflow-hidden m-2">
          <CivicMap
            locationName="Admin Operational View"
            categoryName="All Issues"
            interactive={true}
            showLocateMe={true}
            mapId="ADMIN_MAP"
            heatmapData={showHeatmap && copilotInsights?.emergingHotspots ? copilotInsights.emergingHotspots.map(h => ({
              position: [h.longitude, h.latitude],
              weight: (h.reportCount || 1) * 10
            })) : []}
            markers={issues.map(i => ({
              id: i.id,
              lat: i.coordinates?.lat || DEFAULT_MAP_CENTER.lat + ((parseInt(i.id.split('-')[1] || '0') % 100) / 100 - 0.5) * 0.05,
              lng: i.coordinates?.lng || DEFAULT_MAP_CENTER.lng + ((parseInt(i.id.split('-')[1] || '0') % 50) / 50 - 0.5) * 0.05,
              title: i.title,
              urgency: i.urgency,
              status: i.status,
              onClick: () => router.push(`/admin/issues/${i.id}`)
            }))}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 relative pb-32 md:pb-12">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900 backdrop-blur-xl border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-extrabold text-brand-accent tracking-wider">CIVICHERO PORTAL</span>
              <h1 className="font-sans font-extrabold text-sm tracking-tight">Mission Control</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE DATA SYNC</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              <span className="font-sans font-bold text-xs">AD</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start gap-8">
        {/* Navigation */}
        <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full">
          {loading ? (
            <div className="flex flex-col gap-6 w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-32 rounded-2xl w-full" />
                ))}
              </div>
              <Skeleton className="h-[400px] rounded-2xl w-full" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'map' && renderMap()}
              {activeTab === 'queue' && renderQueue()}
              {activeTab === 'copilot' && renderCopilot()}
              {activeTab === 'analytics' && renderAnalytics()}
            </AnimatePresence>
          )}
        </div>
        
        {/* Map on Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="hidden xl:block w-80">
            <IncidentsMapPreview />
          </div>
        )}
      </main>
    </div>
  );
}
