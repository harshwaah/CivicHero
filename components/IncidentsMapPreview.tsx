'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Users, Map, CheckCircle2, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';

export default function IncidentsMapPreview() {
  const recentActions = [
    { id: 1, title: 'Gas Leak Resolved', location: 'Upper West Side', time: '34m ago', status: 'Verified' },
    { id: 2, title: 'Streetlight Fixed', location: 'Elm St & 4th', time: '4h ago', status: 'Signed' },
    { id: 3, title: 'Pothole Filled', location: 'Oakwood Ave.', time: '1d ago', status: 'Completed' },
  ];

  return (
    <div className="hidden lg:flex flex-col w-80 sticky top-28 h-[calc(100vh-120px)] gap-6 z-30">
      {/* 1. Neighborhood Status Hub Card */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400">LEDGER INTEGRITY</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div>
          <h4 className="font-sans font-extrabold text-2xl text-brand-primary tracking-tight">100%</h4>
          <p className="font-sans font-bold text-xs text-brand-secondary uppercase tracking-wider mt-0.5">Unified District Trust</p>
          <p className="font-body text-[11px] text-brand-muted leading-relaxed mt-2">
            Every civic dispute and resolution in this area is verified via a tamper-proof cryptographic timeline.
          </p>
        </div>

        {/* Dynamic Metric Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/60">
            <span className="text-[10px] font-mono text-slate-400 font-bold block mb-1">CO-SIGNS</span>
            <span className="font-sans font-bold text-sm text-brand-primary">1,482</span>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100/60">
            <span className="text-[10px] font-mono text-slate-400 font-bold block mb-1">VELOCITY</span>
            <span className="font-sans font-bold text-sm text-brand-primary">12m response</span>
          </div>
        </div>
      </div>

      {/* 2. Compact Live Activity Log */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-sans font-bold text-xs text-brand-primary tracking-wider uppercase">Live Civic Activity</h4>
            <span className="font-mono text-[9px] font-bold text-brand-secondary bg-emerald-50 px-2 py-0.5 rounded-full">REALTIME</span>
          </div>

          {/* Simple ledger stream */}
          <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
            {recentActions.map((action, i) => (
              <motion.div 
                key={action.id} 
                className="flex items-start gap-3 text-left group cursor-pointer"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-brand-secondary shrink-0 border border-emerald-100/40 group-hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-sans font-bold text-xs text-brand-primary truncate group-hover:text-brand-secondary transition-colors">
                    {action.title}
                  </h5>
                  <p className="font-body text-[10px] text-brand-muted truncate mt-0.5">
                    {action.location} • {action.time}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 self-center group-hover:translate-x-1 transition-transform" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Minimalist interactive banner */}
        <div className="mt-4 pt-4 border-t border-slate-100 bg-gradient-to-r from-brand-primary/5 to-transparent rounded-2xl p-4 border border-brand-primary/10 flex items-center justify-between">
          <div>
            <h5 className="font-sans font-bold text-[11px] text-brand-primary">View Ledger Registry</h5>
            <p className="font-body text-[9px] text-brand-muted">Public, verifiable contract logs</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-brand-secondary" />
        </div>
      </div>
    </div>
  );
}
