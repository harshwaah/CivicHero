'use client';

import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface AISummaryProps {
  summary?: string;
  confidence?: number;
  categoryMatch?: string;
  severityMatch?: string;
  routingTo?: string;
}

export default function AISummaryCard({
  summary = 'Analysis of visual evidence suggests a structural hazard. Priority routed for immediate dispatch to municipal team.',
  confidence = 94,
  categoryMatch = 'Infrastructure Maintenance',
  severityMatch = 'High Priority Response',
  routingTo = 'Public Works Department'
}: AISummaryProps) {
  return (
    <div className="bg-gradient-to-br from-amber-50/40 via-white to-slate-50/50 rounded-[28px] border border-amber-100/60 p-6 md:p-8 relative overflow-hidden shadow-sm">
      {/* Decorative top-right abstract backdrop glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-amber-100/20 blur-2xl pointer-events-none" />

      {/* Header with Sparks */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/50 flex items-center justify-center text-amber-600 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-xs text-brand-primary uppercase tracking-wider">
              AI Summary & Routing
            </h4>
            <span className="font-mono text-[9px] text-slate-400 font-bold block">
              COGNITIVE CLASSIFIER v3.4
            </span>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100/40 border border-amber-200/40 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span className="font-mono text-[10px] font-bold text-amber-800">
            {confidence}% Match
          </span>
        </div>
      </div>

      {/* Main Quote Box */}
      <blockquote className="border-l-2 border-amber-300 pl-4 py-1 leading-relaxed text-brand-primary text-xs sm:text-sm font-sans mb-6 italic">
        &ldquo;{summary}&rdquo;
      </blockquote>

      {/* Routing Grid Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 border-t border-slate-100">
        <div>
          <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
            Target Department
          </span>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-5 h-5 rounded bg-slate-50 border border-slate-100 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <span className="font-sans font-bold text-xs text-brand-primary">
              {routingTo}
            </span>
          </div>
        </div>

        <div>
          <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
            Automatic Classification
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2.5 py-0.5 rounded-md bg-slate-100/80 border border-slate-200/30 text-[9px] font-mono font-bold text-slate-600 uppercase">
              {categoryMatch}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-100/40 border border-amber-200/20 text-[9px] font-mono font-bold text-amber-800 uppercase">
              {severityMatch}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
