'use client';

import React from 'react';
import { ShieldCheck, Check, Clock, EyeOff, AlertOctagon } from 'lucide-react';
import { motion } from 'motion/react';

interface VerificationBarProps {
  onVerify: (type: string, label: string) => void;
  confirmCount?: number;
  alreadyFixedCount?: number;
}

export default function VerificationBar({ 
  onVerify, 
  confirmCount = 24, 
  alreadyFixedCount = 3 
}: VerificationBarProps) {
  const actions = [
    {
      id: 'still_there',
      label: 'STILL THERE',
      sublabel: 'Active Hazard',
      icon: Check,
      color: 'bg-brand-primary text-white hover:bg-brand-primary/95 shadow-sm',
      borderColor: 'border-transparent',
      stats: confirmCount
    },
    {
      id: 'already_fixed',
      label: 'ALREADY FIXED',
      sublabel: 'Issue Cleared',
      icon: Clock,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/85',
      borderColor: 'border-emerald-100',
      stats: alreadyFixedCount
    },
    {
      id: 'not_found',
      label: 'NOT FOUND',
      sublabel: 'Could Not Locate',
      icon: EyeOff,
      color: 'bg-slate-50 text-slate-700 hover:bg-slate-100',
      borderColor: 'border-slate-200/60'
    },
    {
      id: 'spam',
      label: 'FLAG SPAM',
      sublabel: 'Invalid / Fake',
      icon: AlertOctagon,
      color: 'bg-red-50 text-red-700 hover:bg-red-100/70',
      borderColor: 'border-red-100'
    }
  ];

  return (
    <div className="bg-white rounded-[28px] border border-slate-100 p-6 sm:p-8 relative overflow-hidden shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-brand-primary mb-1">
            <ShieldCheck className="w-5 h-5 text-brand-secondary" />
            <h4 className="font-sans font-extrabold text-base tracking-tight">
              Community Crowd-Verify
            </h4>
          </div>
          <p className="font-body text-xs text-brand-muted leading-relaxed max-w-md">
            Help city maintenance verify if this issue is still active. Your real-time corroboration updates the priority queuing.
          </p>
        </div>

        {/* Short meta-stats badge */}
        <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3 self-start md:self-auto shrink-0">
          <div className="text-center">
            <span className="font-mono text-xs font-bold text-brand-primary block">{confirmCount}</span>
            <span className="font-mono text-[8px] text-slate-400 font-bold uppercase tracking-wider">Confirmed</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-center">
            <span className="font-mono text-xs font-bold text-emerald-600 block">{alreadyFixedCount}</span>
            <span className="font-mono text-[8px] text-slate-400 font-bold uppercase tracking-wider">Resolved</span>
          </div>
        </div>
      </div>

      {/* Touch targets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              onClick={() => onVerify(action.id, action.label)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${action.borderColor} ${action.color} text-center transition-all duration-200 group h-24`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-2 border border-white/10 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Icon className="w-4 h-4 shrink-0" />
              </div>
              <span className="font-mono text-[10px] font-extrabold tracking-wider block leading-tight">
                {action.label}
              </span>
              <span className="text-[9px] opacity-75 font-body mt-0.5 block leading-none">
                {action.sublabel}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
