'use client';

import React, { useState, useEffect } from 'react';
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
  Workflow
} from 'lucide-react';
import AdminNav from '../../components/AdminNav';
import { IssueService } from '../../lib/services/issueService';
import { formatTimestamp } from '../../lib/helpers';
import { AnalyticsService } from '../../lib/services/analyticsService';
import { TrustService } from '../../lib/services/trustService';
import { AdministratorCopilot } from '../../lib/providers/ai/administratorCopilot';
import { CommunityIntelligenceAgent } from '../../lib/providers/ai/communityIntelligenceAgent';
import { Issue, TrustMetrics } from '../../lib/models';
import IncidentsMapPreview from '../../components/IncidentsMapPreview';
import { CivicMap } from '../../lib/providers/maps/mapProvider';
import { CityAnalytics } from '../../lib/repositories/analyticsRepository';
import { Skeleton } from '../../components/Skeleton';
import { CopilotInsights } from '../../lib/providers/ai/administratorCopilot';

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
  
  useEffect(() => {
    let unsubscribe = () => {};

    const fetchData = async () => {
      setLoading(true);
      
      unsubscribe = IssueService.subscribe(async (fetchedIssues) => {
        setIssues(fetchedIssues);
        if (fetchedIssues.length > 0) {
          try {
             const insights = await AdministratorCopilot.generateInsights(fetchedIssues);
             setCopilotInsights(insights);
             setCopilotError(null);
          } catch(err: any) {
             console.error("Failed to generate copilot insights", err);
             setCopilotError(err?.message || "Failed to load copilot insights");
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
          {issues.filter(i => i.status !== 'Resolved').slice(0, 4).map(issue => (
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
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search active issues..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(f => (
            <button key={f} className={`px-4 py-1.5 rounded-lg font-mono text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${f === 'All' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {issues.map(issue => (
            <Link key={issue.id} href={`/admin/issues/${issue.id}`} className="flex items-start justify-between p-4 md:p-6 hover:bg-slate-50 transition-colors group">
              <div className="flex items-start gap-4 flex-1">
                <div className={`px-2 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${getPriorityColor(issue.urgency)}`}>
                  {issue.urgency}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm text-slate-900 group-hover:text-brand-primary transition-colors">{issue.title}</h4>
                  <p className="font-body text-xs text-slate-500 mt-1 line-clamp-1">{issue.description}</p>
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
          ))}
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
        <div className="relative z-10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-secondary/20 flex items-center justify-center shrink-0 border border-brand-secondary/30">
            <Bot className="w-6 h-6 text-brand-secondary" />
          </div>
          <div>
            <h2 className="font-sans font-extrabold text-2xl tracking-tight mb-2">Administrator AI Copilot</h2>
            <p className="font-body text-sm text-slate-300 max-w-2xl leading-relaxed">
              {copilotInsights ? copilotInsights.operationalBriefing : 'Analyzing real-time incident data to generate operational insights...'}
            </p>
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
              lat: i.coordinates?.lat || 40.7128 + ((parseInt(i.id.split('-')[1] || '0') % 100) / 100 - 0.5) * 0.05,
              lng: i.coordinates?.lng || -74.0060 + ((parseInt(i.id.split('-')[1] || '0') % 50) / 50 - 0.5) * 0.05,
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
