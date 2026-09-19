'use client';

import React from 'react';
import { 
  Database, 
  HardDrive, 
  MapPin, 
  Cpu, 
  WifiOff, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export type RecoverySubsystem = 
  | 'firestore' 
  | 'storage' 
  | 'maps' 
  | 'gemini' 
  | 'network'
  | 'generic';

interface RecoveryStateProps {
  subsystem: RecoverySubsystem;
  onRetry?: () => void;
  onAlternativeAction?: () => void;
  alternativeActionLabel?: string;
  customTitle?: string;
  customDescription?: string;
  isCompact?: boolean;
}

const RECOVERY_CONFIGS: Record<RecoverySubsystem, {
  icon: React.ElementType;
  badge: string;
  title: string;
  description: string;
  primaryAction: string;
  iconBg: string;
  iconColor: string;
}> = {
  firestore: {
    icon: Database,
    badge: 'Database Connection',
    title: 'Civic Database Temporarily Offline',
    description: 'We are currently unable to reach the cloud database. Previously loaded community reports are safely preserved in your local session.',
    primaryAction: 'Reconnect Database',
    iconBg: 'bg-amber-50 border-amber-200/80',
    iconColor: 'text-amber-600',
  },
  storage: {
    icon: HardDrive,
    badge: 'Photo Storage',
    title: 'Media Storage Temporarily Unavailable',
    description: 'Cloud photo uploads are experiencing a brief delay. You can continue submitting written issue descriptions, and images will synchronize when restored.',
    primaryAction: 'Retry Media Upload',
    iconBg: 'bg-blue-50 border-blue-200/80',
    iconColor: 'text-blue-600',
  },
  maps: {
    icon: MapPin,
    badge: 'Map Services',
    title: 'Interactive Map Offline',
    description: 'The map display service is temporarily unreachable. Incident locations, street addresses, and coordinates are fully accessible in list view.',
    primaryAction: 'Reload Map View',
    iconBg: 'bg-rose-50 border-rose-200/80',
    iconColor: 'text-rose-600',
  },
  gemini: {
    icon: Cpu,
    badge: 'Automated Triage',
    title: 'Automated Analysis Offline',
    description: 'Automated photo classification is momentarily taking longer than usual. Your report will be routed directly to municipal staff for prompt review.',
    primaryAction: 'Retry Analysis',
    iconBg: 'bg-violet-50 border-violet-200/80',
    iconColor: 'text-violet-600',
  },
  network: {
    icon: WifiOff,
    badge: 'Offline Mode',
    title: 'Internet Connection Unavailable',
    description: 'You are currently offline. You can continue browsing previously loaded neighborhood reports. New submissions will queue until connectivity returns.',
    primaryAction: 'Check Connection',
    iconBg: 'bg-slate-100 border-slate-200',
    iconColor: 'text-slate-600',
  },
  generic: {
    icon: AlertTriangle,
    badge: 'Civic Service',
    title: 'Service Temporarily Paused',
    description: 'We encountered an unexpected pause in this civic service. No data was lost, and municipal operations remain active.',
    primaryAction: 'Retry Operation',
    iconBg: 'bg-amber-50 border-amber-200/80',
    iconColor: 'text-amber-600',
  },
};

export default function RecoveryState({
  subsystem,
  onRetry,
  onAlternativeAction,
  alternativeActionLabel,
  customTitle,
  customDescription,
  isCompact = false,
}: RecoveryStateProps) {
  const config = RECOVERY_CONFIGS[subsystem] || RECOVERY_CONFIGS.generic;
  const IconComponent = config.icon;

  if (isCompact) {
    return (
      <div 
        role="status" 
        className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${config.iconBg} border flex items-center justify-center ${config.iconColor} shrink-0`}>
            <IconComponent className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-xs text-slate-800">
              {customTitle || config.title}
            </h4>
            <p className="font-body text-[11px] text-slate-600 line-clamp-1">
              {customDescription || config.description}
            </p>
          </div>
        </div>

        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-bold text-xs rounded-lg transition-colors shrink-0 flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:outline-none"
            aria-label={config.primaryAction}
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            <span>Retry</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="w-full bg-white rounded-[24px] border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col items-center text-center my-4 transition-all"
    >
      <div className={`w-14 h-14 rounded-2xl ${config.iconBg} border flex items-center justify-center ${config.iconColor} mb-4 shadow-xs shrink-0`}>
        <IconComponent className="w-7 h-7" aria-hidden="true" />
      </div>

      <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-0.5 rounded-full uppercase tracking-wider mb-2">
        {config.badge}
      </span>

      <h3 className="font-sans font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight max-w-lg">
        {customTitle || config.title}
      </h3>

      <p className="font-body text-xs sm:text-sm text-slate-600 max-w-md mt-2 leading-relaxed">
        {customDescription || config.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 bg-brand-primary text-white font-sans font-bold text-xs rounded-xl shadow-xs hover:bg-brand-primary-container transition-all flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-brand-secondary focus-visible:outline-none"
            aria-label={config.primaryAction}
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{config.primaryAction}</span>
          </button>
        )}

        {onAlternativeAction && alternativeActionLabel && (
          <button
            onClick={onAlternativeAction}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-sans font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none"
          >
            <span>{alternativeActionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-sans text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
        <span>Your data and drafts are safeguarded locally by CivicHero security.</span>
      </div>
    </div>
  );
}
