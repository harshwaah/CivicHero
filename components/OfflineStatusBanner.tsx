'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OfflineStatusBanner() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  });

  const [showReconnectedBanner, setShowReconnectedBanner] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      const timer = setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.aside
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          role="status"
          aria-live="polite"
          className="fixed top-2 inset-x-4 max-w-xl mx-auto z-50 bg-slate-900/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-slate-700/80 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs">Offline Mode Active</span>
              <span className="font-body text-[11px] text-slate-300">
                Browsing cached local reports. New actions will sync when reconnected.
              </span>
            </div>
          </div>
          <span className="font-mono text-[9px] uppercase font-bold bg-white/10 px-2 py-0.5 rounded text-amber-300 shrink-0">
            Local Cache
          </span>
        </motion.aside>
      )}

      {showReconnectedBanner && (
        <motion.aside
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          role="status"
          aria-live="polite"
          className="fixed top-2 inset-x-4 max-w-xl mx-auto z-50 bg-emerald-950/95 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-sans font-bold text-xs text-emerald-200">Connection Restored</span>
              <span className="font-body text-[11px] text-emerald-300/90">
                Synchronizing with live municipal database...
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase font-bold bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 shrink-0">
            <RefreshCw className="w-2.5 h-2.5 animate-spin" aria-hidden="true" />
            <span>Syncing</span>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
