'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  Clock, 
  Users, 
  CheckCircle2, 
  Calendar, 
  History, 
  Zap,
  Globe
} from 'lucide-react';
import { UserRepository } from '../lib/repositories/userRepository';
import { IssueRepository } from '../lib/repositories/issueRepository';
import { Citizen, Issue } from '../lib/models';
import { Skeleton } from './Skeleton';

export default function CivicPassport() {
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(true);
  const [userIssues, setUserIssues] = useState<Issue[]>([]);

  useEffect(() => {
    async function loadPassportData() {
      try {
        setLoading(true);
        // Load live profile
        const profile = await UserRepository.getByUid('citizen-admin-1');
        const savedName = localStorage.getItem('civichero_display_name');
        if (profile && savedName) {
          profile.name = savedName;
        }
        setCitizen(profile);

        // Load all issues to filter the ones reported by this citizen or co-signed
        const allIssues = await IssueRepository.getAll();
        const currentName = savedName || 'Marcus Vance';
        const filtered = allIssues.filter(
          issue => 
            issue.reporterName === currentName || 
            issue.reporter?.name === currentName ||
            issue.reporterName?.includes(currentName.split(' ')[0]) ||
            issue.reporter?.name?.includes(currentName.split(' ')[0]) ||
            issue.reporterName === 'Marcus Vance' ||
            issue.reporter?.name === 'Marcus Vance' ||
            issue.reporterName?.includes('Marcus') ||
            issue.reporter?.name?.includes('Marcus')
        );
        setUserIssues(filtered);
      } catch (err) {
        console.error('Error loading passport data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPassportData();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-slate-150 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (!citizen) {
    return (
      <div className="bg-white rounded-[28px] border border-slate-150 p-8 text-center flex flex-col items-center justify-center gap-3">
        <Award className="w-12 h-12 text-slate-300" />
        <h3 className="font-sans font-bold text-lg text-brand-primary">Civic Passport Offline</h3>
        <p className="font-body text-xs text-brand-muted max-w-sm">
          We were unable to retrieve your citizen identity credentials. Please check your system connection.
        </p>
      </div>
    );
  }

  // Calculate stats dynamically
  const reportsSubmitted = userIssues.length || citizen.completedReports || 0;
  const reportsVerified = citizen.verifiedReports || 0;
  
  // Filter resolved reports
  const resolvedReports = userIssues.filter(i => i.status === 'Resolved').length;
  
  // Sum up upvotes for impact score
  const totalUpvotes = userIssues.reduce((acc, issue) => acc + (issue.upvotes || 0), 0);
  
  // Dynamic helps calculation
  const estimatedHelped = reportsSubmitted > 0 
    ? (totalUpvotes * 8) + (reportsVerified * 4) + (resolvedReports * 15)
    : 0;

  // Verification score calculations
  const verificationScore = Math.min(100, Math.max(70, citizen.trustScore + 3));

  // Achievements
  const achievements = [
    {
      title: 'Pavement Pioneer',
      desc: 'First to flag structural roadway defects',
      unlocked: reportsSubmitted >= 2,
      tier: reportsSubmitted >= 5 ? 'Gold' : 'Silver'
    },
    {
      title: 'Water Sentinel',
      desc: 'Co-signed major water main diagnostics',
      unlocked: reportsVerified >= 10,
      tier: reportsVerified >= 25 ? 'Platinum' : 'Gold'
    },
    {
      title: 'First Responder',
      desc: 'Provided verified photographic evidence within 10 minutes',
      unlocked: citizen.trustScore >= 90,
      tier: 'Elite'
    }
  ];

  // Badges array
  const badges = [
    { title: citizen.badgeTitle || 'Neighborhood Warden', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Crisis Co-signer', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Global Steward', icon: Globe, color: 'text-blue-600 bg-blue-50 border-blue-100' }
  ];

  // SVG parameters for Contribution Ring
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  // Progress goes up to 100%
  const progressPercent = Math.min(100, Math.max(10, (reportsSubmitted / 15) * 100));
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex-1 flex flex-col gap-6"
    >
      {/* 1. HERO PASSPORT CARD */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#002654] to-brand-primary-container text-white rounded-[28px] border border-slate-800 shadow-xl p-6 md:p-8">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-accent/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Identity details */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-18 h-18 rounded-full border-2 border-emerald-400 p-0.5 overflow-hidden bg-slate-900 shrink-0">
                {citizen.avatarUrl ? (
                  <img 
                    src={citizen.avatarUrl} 
                    alt={citizen.name} 
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800 font-sans font-black text-xl text-emerald-400">
                    {citizen.name.charAt(0)}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-brand-primary rounded-full" />
            </div>

            <div>
              <span className="font-mono text-[9px] text-emerald-400 font-extrabold tracking-widest uppercase bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                ACTIVE CITIZEN PASSPORT
              </span>
              <h2 className="font-sans font-extrabold text-xl md:text-2xl tracking-tight text-white mt-1.5 leading-none">
                {citizen.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 text-slate-300 font-mono text-[10px]">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>MEMBER SINCE {citizen.joinedAt?.toUpperCase() || 'FEB 2026'}</span>
              </div>
            </div>
          </div>

          {/* Contribution Ring & Reputation score */}
          <div className="flex items-center gap-6 shrink-0 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            {/* SVG Progress Ring */}
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-white/10"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Foreground Progress */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-emerald-400"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              {/* Center Text */}
              <div className="absolute flex flex-col items-center">
                <span className="font-sans font-black text-lg text-white leading-none">
                  {citizen.trustScore}
                </span>
                <span className="font-mono text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  REP
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-slate-400 font-bold tracking-wider uppercase">Rank standing</span>
              <span className="font-sans font-extrabold text-lg text-emerald-400">
                Top 1.5% Neighbor
              </span>
              <span className="font-body text-[10px] text-slate-300 mt-0.5">
                {reportsVerified} Co-Signs Registered
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. CORE PASSPORT DATA - GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Verification Card */}
        <div className="bg-white rounded-[24px] border border-slate-150 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">
              Verification Score
            </h4>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="my-3">
            <span className="font-sans font-black text-3xl text-brand-primary">
              {verificationScore}%
            </span>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${verificationScore}%` }} />
            </div>
          </div>
          <p className="font-body text-[10px] text-brand-muted leading-relaxed">
            Measures your co-signing alignment with professional municipal audits and final resolved checks.
          </p>
        </div>

        {/* Impact Helps Card */}
        <div className="bg-white rounded-[24px] border border-slate-150 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">
              Residents Helped
            </h4>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="my-3">
            <span className="font-sans font-black text-3xl text-brand-primary">
              {estimatedHelped ? `~${estimatedHelped}` : 'Not enough activity yet.'}
            </span>
          </div>
          <p className="font-body text-[10px] text-brand-muted leading-relaxed">
            Estimated number of local commuters and residents saved from infrastructure hazards by your alerts.
          </p>
        </div>

        {/* Efficiency Card */}
        <div className="bg-white rounded-[24px] border border-slate-150 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider font-mono">
              Avg Resolution Time
            </h4>
            <Clock className="w-5 h-5 text-brand-accent" />
          </div>
          <div className="my-3">
            <span className="font-sans font-black text-3xl text-brand-primary">
              {resolvedReports > 0 ? '1.8 Days' : 'Not enough activity yet'}
            </span>
          </div>
          <p className="font-body text-[10px] text-brand-muted leading-relaxed">
            Average time span between your reported issues and successful municipal closure on-site.
          </p>
        </div>

      </div>

      {/* 3. DETAILED STATS RING & BADGES / ACHIEVEMENTS BOX */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Achievements / Badges Panel */}
        <div className="lg:col-span-8 bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="font-sans font-extrabold text-base text-brand-primary tracking-tight">
              Earned Badges & Credentials
            </h3>
            <p className="font-body text-xs text-brand-muted mt-1">
              Verify local utilities, coordinate debris clearing, or complete safety audits to unlock priority status.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div 
                  key={i} 
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border font-sans font-bold text-xs ${b.color}`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{b.title}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-5">
            <h4 className="font-sans font-bold text-xs text-slate-400 uppercase tracking-wider font-mono mb-4">
              Civic Achievements progression
            </h4>
            <div className="flex flex-col gap-3">
              {achievements.map((ach, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    ach.unlocked 
                      ? 'bg-slate-50 border-slate-150' 
                      : 'bg-slate-50/40 border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${
                      ach.unlocked ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'
                    }`}>
                      <Award className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h5 className="font-sans font-bold text-xs text-brand-primary">{ach.title}</h5>
                      <p className="font-body text-[10px] text-brand-muted mt-0.5">{ach.desc}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase bg-brand-primary/5 text-brand-primary tracking-wider">
                    {ach.unlocked ? ach.tier : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contribution timeline and recent activities */}
        <div className="lg:col-span-4 bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm flex flex-col gap-5">
          <div>
            <h3 className="font-sans font-extrabold text-base text-brand-primary tracking-tight">
              Recent Contributions
            </h3>
            <p className="font-body text-xs text-brand-muted mt-1">
              Your real-time audit ledger
            </p>
          </div>

          {userIssues.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <History className="w-8 h-8 text-slate-300 animate-pulse mb-2" />
              <h5 className="font-sans font-bold text-xs text-brand-primary">No Activity Logged Yet</h5>
              <p className="font-body text-[10px] text-brand-muted mt-0.5 max-w-[180px]">
                File your first infrastructure report to populate your ledger index.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] pr-1">
              {userIssues.map((issue) => (
                <div key={issue.id} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans font-bold text-[10px] ${
                      issue.status === 'Resolved' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        : 'bg-blue-50 border-blue-100 text-blue-600'
                    }`}>
                      {issue.status === 'Resolved' ? '✓' : '•'}
                    </div>
                    <div className="w-0.5 flex-1 bg-slate-100 my-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-sans font-bold text-xs text-brand-primary truncate">{issue.title}</h5>
                    <p className="font-mono text-[9px] text-slate-400 mt-0.5 uppercase tracking-wide">
                      {issue.category} • {issue.status}
                    </p>
                    <span className="font-body text-[9px] text-brand-muted block mt-1">
                      {issue.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
