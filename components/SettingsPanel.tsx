'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Terminal, 
  Eye, 
  BellRing, 
  Lock, 
  Palette, 
  Languages, 
  HelpCircle, 
  Activity, 
  ExternalLink,
  ShieldCheck,
  Check,
  Database,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { Skeleton } from './Skeleton';
import { firebaseConfig } from '@/lib/config';

export default function SettingsPanel() {
  const [loading] = useState(false);

  // Core Settings States initialized from localStorage
  const [developerMode, setDeveloperMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('civichero_dev_mode') === 'true';
  });
  const [highContrast, setHighContrast] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('civichero_high_contrast') === 'true';
  });
  const [largeText, setLargeText] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('civichero_large_text') === 'true';
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('civichero_reduced_motion') === 'true';
  });

  // Notification states
  const [smsAlerts, setSmsAlerts] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('civichero_sms_alerts') !== 'false';
  });
  const [emailSummaries, setEmailSummaries] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('civichero_email_summaries') === 'true';
  });
  const [pushNotifs, setPushNotifs] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('civichero_push_notifs') !== 'false';
  });

  // Privacy states
  const [anonymousReports, setAnonymousReports] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('civichero_anonymous_reports') === 'true';
  });
  const [preciseLocation, setPreciseLocation] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('civichero_precise_location') !== 'false';
  });

  // Theme & Language states
  const [activeTheme, setActiveTheme] = useState(() => {
    if (typeof window === 'undefined') return 'slate';
    return localStorage.getItem('civichero_theme_preset') || 'slate';
  });
  const [activeLang, setActiveLang] = useState(() => {
    if (typeof window === 'undefined') return 'en';
    return localStorage.getItem('civichero_language_selection') || 'en';
  });

  // Simulated DB Metrics
  const [dbReads] = useState(142);
  const [dbWrites] = useState(38);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [resetFeedback, setResetFeedback] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState<string | null>(null);

  const confirmAndResetDemoState = () => {
    setShowResetConfirm(false);
    if (typeof window === 'undefined') return;

    // Keys to clear without deleting Firestore database data
    const keysToReset = [
      'civichero_onboarding_completed',
      'civichero_onboarding',
      'civichero_recent_searches',
      'civichero_high_contrast',
      'civichero_large_text',
      'civichero_reduced_motion',
      'civichero_sms_alerts',
      'civichero_email_summaries',
      'civichero_push_notifs',
      'civichero_anonymous_reports',
      'civichero_precise_location',
      'civichero_theme_preset',
      'civichero_language_selection',
      'dev_artificial_delay',
      'copilot_briefing_invalidated',
      'civichero_draft_report'
    ];

    keysToReset.forEach(k => localStorage.removeItem(k));

    // Reset local states to default
    setHighContrast(false);
    setLargeText(false);
    setReducedMotion(false);
    setSmsAlerts(true);
    setEmailSummaries(false);
    setPushNotifs(true);
    setAnonymousReports(false);
    setPreciseLocation(true);
    setActiveTheme('slate');
    setActiveLang('en');
    document.body.classList.remove('high-contrast');

    setResetFeedback('Demo state reset successfully. Onboarding, caches, search history, and preferences have been restored to defaults. Cloud database records remain preserved.');
    setTimeout(() => {
      setResetFeedback(null);
    }, 6000);
  };

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    setSyncStatus(`Initiating sync to ${firebaseConfig.projectId}...`);
    try {
      const res = await fetch('/api/sync-new-db', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(`Sync executed: ${data.details.syncedIssues}/${data.details.totalIssues} issues, ${data.details.syncedUsers}/${data.details.totalUsers} citizens, ${data.details.syncedNotifications}/${data.details.totalNotifications} notifications.`);
      } else {
        setSyncStatus(`Sync status: ${data.error || 'Pending database creation'}`);
      }
    } catch (err: any) {
      setSyncStatus(`Sync result: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Apply high contrast on mount if active
  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    }
  }, [highContrast]);

  // 2. State Toggles & Persist functions
  const saveSetting = (key: string, val: string | boolean) => {
    localStorage.setItem(key, String(val));
  };

  const handleDevToggle = () => {
    const next = !developerMode;
    setDeveloperMode(next);
    saveSetting('civichero_dev_mode', next);
  };

  const handleContrastToggle = () => {
    const next = !highContrast;
    setHighContrast(next);
    saveSetting('civichero_high_contrast', next);
    // Apply contrast class globally to body or layout
    if (next) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  };

  const handleTextToggle = () => {
    const next = !largeText;
    setLargeText(next);
    saveSetting('civichero_large_text', next);
  };

  const handleMotionToggle = () => {
    const next = !reducedMotion;
    setReducedMotion(next);
    saveSetting('civichero_reduced_motion', next);
  };

  const handleThemeChange = (themeName: string) => {
    setActiveTheme(themeName);
    saveSetting('civichero_theme_preset', themeName);
  };

  const handleLangChange = (langCode: string) => {
    setActiveLang(langCode);
    saveSetting('civichero_language_selection', langCode);
  };

  // Onboarding replay
  const handleReplayOnboarding = () => {
    localStorage.removeItem('civichero_onboarding_completed');
    localStorage.removeItem('civichero_onboarding');
    setMaintenanceNotice('Onboarding tips re-initialized! Return to the Home feed to view welcome tooltips.');
    setTimeout(() => setMaintenanceNotice(null), 5000);
  };

  const themes = [
    { id: 'slate', name: 'Slate Gray', color: 'bg-slate-700' },
    { id: 'emerald', name: 'Emerald', color: 'bg-emerald-600' },
    { id: 'cobalt', name: 'Cobalt', color: 'bg-blue-600' },
    { id: 'rose', name: 'Rose', color: 'bg-rose-500' }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-slate-150 p-6 shadow-sm space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className={`flex-1 flex flex-col gap-6 ${largeText ? 'text-lg' : 'text-sm'}`}
    >
      {/* 1. SECTION: DEVELOPER MODE METRICS */}
      <div className="bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-brand-primary" />
            <div>
              <h3 className="font-sans font-extrabold text-sm text-brand-primary uppercase tracking-wider font-mono">
                Developer Mode Settings
              </h3>
              <p className="font-body text-xs text-brand-muted">
                Inspect live database operations and system indicators.
              </p>
            </div>
          </div>
          
          {/* Custom Switch toggle */}
          <button 
            onClick={handleDevToggle}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
              developerMode ? 'bg-brand-primary' : 'bg-slate-200'
            }`}
          >
            <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
              developerMode ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>

        {developerMode && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-brand-muted"
          >
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Firestore Reads</span>
              <span className="font-sans font-extrabold text-lg text-brand-primary">{dbReads} hits</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Firestore Writes</span>
              <span className="font-sans font-extrabold text-lg text-brand-primary">{dbWrites} actions</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col gap-1.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Dev Delay Overhead</span>
              <span className="font-sans font-extrabold text-lg text-brand-primary">150ms simulated</span>
            </div>

            {/* Target Firestore Database Connection */}
            <div className="md:col-span-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Database className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-xs text-brand-primary">Target Firestore Project:</span>
                    <code className="text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200 text-brand-primary font-mono font-semibold">{firebaseConfig.projectId}</code>
                  </div>
                  <p className="font-body text-[11px] text-slate-500 mt-0.5">
                    Configured with 20 issues, 3 citizens, and 18 notifications ready to sync.
                  </p>
                  {syncStatus && (
                    <p className="font-mono text-[10px] text-emerald-700 mt-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                      {syncStatus}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSyncDatabase}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-brand-primary text-white text-xs font-sans font-bold rounded-lg hover:bg-brand-primary-container disabled:opacity-50 transition-colors shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Push Data to New DB'}</span>
              </button>
            </div>

            {/* Curated Demo State Reset */}
            <div className="md:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700 shrink-0 mt-0.5">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-xs text-brand-primary">Reset Demo State</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-sans font-medium">Safe Local Reset</span>
                  </div>
                  <p className="font-body text-[11px] text-slate-500 mt-0.5 max-w-xl leading-relaxed">
                    Resets tutorial onboarding flags, local storage caches, search history, and UI preferences. Firestore database records remain untouched and preserved.
                  </p>
                  {resetFeedback && (
                    <p className="font-sans text-xs text-emerald-800 font-semibold mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                      {resetFeedback}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-sans font-bold rounded-xl hover:bg-slate-800 transition-colors shrink-0 shadow-sm"
                aria-haspopup="dialog"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo State</span>
              </button>
            </div>

            {/* Confirmation Dialog */}
            {showResetConfirm && (
              <div 
                className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="reset-dialog-title"
              >
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 id="reset-dialog-title" className="font-sans font-bold text-base text-slate-900">
                        Reset Local Demo State?
                      </h3>
                      <p className="font-body text-xs text-slate-600 mt-1 leading-relaxed">
                        This action will restore default tutorial onboarding, clear cached search queries, and reset local accessibility preferences.
                      </p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-800 font-medium">
                    Cloud Invariant: All municipal reports, users, and audit logs stored in Google Cloud Firestore remain untouched.
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 text-xs font-sans font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmAndResetDemoState}
                      className="px-4 py-2 text-xs font-sans font-bold bg-amber-700 hover:bg-amber-800 text-white rounded-xl transition-colors shadow-sm"
                    >
                      Confirm &amp; Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 2. SECTION: ACCESSIBILITY PREFERENCES */}
      <div className="bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm space-y-4">
        <h3 className="font-sans font-extrabold text-base text-brand-primary tracking-tight flex items-center gap-2">
          <Eye className="w-5 h-5 text-slate-400" />
          <span>Accessibility Preferences</span>
        </h3>
        
        <div className="flex flex-col gap-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-sans font-bold text-xs text-brand-primary">High Contrast Mode</h4>
              <p className="font-body text-[11px] text-brand-muted">Elevate content color ratios for strict readability.</p>
            </div>
            <button 
              onClick={handleContrastToggle}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                highContrast ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                highContrast ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Larger Font */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div>
              <h4 className="font-sans font-bold text-xs text-brand-primary">Larger Layout Font Sizes</h4>
              <p className="font-body text-[11px] text-brand-muted">Increase typography scale across modules for comfortable viewing.</p>
            </div>
            <button 
              onClick={handleTextToggle}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                largeText ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                largeText ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div>
              <h4 className="font-sans font-bold text-xs text-brand-primary">Reduced Animation Motion</h4>
              <p className="font-body text-[11px] text-brand-muted">Simplify slide-in and spring transitions to minimize scrolling motion.</p>
            </div>
            <button 
              onClick={handleMotionToggle}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                reducedMotion ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                reducedMotion ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. SECTION: NOTIFICATIONS CHANNELS */}
      <div className="bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm space-y-4">
        <h3 className="font-sans font-extrabold text-base text-brand-primary tracking-tight flex items-center gap-2">
          <BellRing className="w-5 h-5 text-slate-400" />
          <span>Notification Channel Subscriptions</span>
        </h3>
        
        <div className="flex flex-col gap-4">
          {/* SMS Alerts */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-sans font-bold text-xs text-brand-primary">SMS Broadcast Alerts</h4>
              <p className="font-body text-[11px] text-brand-muted">Receive rapid text notifications for critical nearby safety incidents.</p>
            </div>
            <button 
              onClick={() => { setSmsAlerts(!smsAlerts); saveSetting('civichero_sms_alerts', !smsAlerts); }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                smsAlerts ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                smsAlerts ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Email Summaries */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <div>
              <h4 className="font-sans font-bold text-xs text-brand-primary">Weekly Infrastructure Digest</h4>
              <p className="font-body text-[11px] text-brand-muted">Periodic emails showing resolved reports and social trust updates.</p>
            </div>
            <button 
              onClick={() => { setEmailSummaries(!emailSummaries); saveSetting('civichero_email_summaries', !emailSummaries); }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                emailSummaries ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                emailSummaries ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. SECTION: PRIVACY CONTROLS */}
      <div className="bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm space-y-4">
        <h3 className="font-sans font-extrabold text-base text-brand-primary tracking-tight flex items-center gap-2">
          <Lock className="w-5 h-5 text-slate-400" />
          <span>Privacy & Identity Filters</span>
        </h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-sans font-bold text-xs text-brand-primary">Anonymous Reporting</h4>
              <p className="font-body text-[11px] text-brand-muted">Conceal your citizen passport handle on public map feeds.</p>
            </div>
            <button 
              onClick={() => { setAnonymousReports(!anonymousReports); saveSetting('civichero_anonymous_reports', !anonymousReports); }}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors focus:outline-none ${
                anonymousReports ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                anonymousReports ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. SECTION: VISUALS, THEMES, LANGUAGES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Theme select */}
        <div className="bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm space-y-4">
          <h3 className="font-sans font-extrabold text-sm text-brand-primary tracking-tight flex items-center gap-2">
            <Palette className="w-4.5 h-4.5 text-slate-400" />
            <span>Theme Preset Styling</span>
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`flex items-center justify-between px-3.5 py-2 rounded-xl border font-sans font-bold text-xs transition-all ${
                  activeTheme === t.id 
                    ? 'border-brand-primary bg-slate-50' 
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3.5 h-3.5 rounded-full ${t.color}`} />
                  <span>{t.name}</span>
                </div>
                {activeTheme === t.id && <Check className="w-4 h-4 text-brand-primary shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Language dropdown select */}
        <div className="bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm space-y-4">
          <h3 className="font-sans font-extrabold text-sm text-brand-primary tracking-tight flex items-center gap-2">
            <Languages className="w-4.5 h-4.5 text-slate-400" />
            <span>Regional Language</span>
          </h3>

          <select
            value={activeLang}
            onChange={(e) => handleLangChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-150 px-4 py-2 rounded-xl font-sans text-xs font-bold text-brand-primary focus:outline-none"
          >
            <option value="en">English (US Standard)</option>
            <option value="es">Español (Regional Translation)</option>
            <option value="zh">繁體中文 (Traditional Standard)</option>
            <option value="ar">العربية (Localized layout)</option>
          </select>
          <p className="font-body text-[10px] text-brand-muted">
            Selecting a prepared dialect automatically restructures primary dispatches.
          </p>
        </div>

      </div>

      {/* 6. UTILITIES, ONBOARDING REPLAY, DIAGNOSTICS */}
      <div className="bg-white rounded-[24px] border border-slate-150 p-6 shadow-sm space-y-4">
        <h3 className="font-sans font-extrabold text-base text-brand-primary tracking-tight flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-400" />
          <span>System Maintenance & Guidance</span>
        </h3>
        
        {maintenanceNotice && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
            {maintenanceNotice}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleReplayOnboarding}
            className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-sans font-bold text-xs rounded-xl border border-slate-150 transition-colors"
          >
            Replay Tutorial Onboarding
          </button>
          
          <a
            href="/diagnostics"
            target="_blank"
            className="w-full px-4 py-2.5 bg-brand-primary hover:bg-brand-primary-container text-white font-sans font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Diagnostics Console</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 7. ABOUT & VERSION */}
      <div className="bg-slate-50 rounded-[24px] border border-slate-150 p-6 text-center space-y-3">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
        <div>
          <h4 className="font-sans font-extrabold text-sm text-brand-primary tracking-tight">CivicHero Enterprise</h4>
          <p className="font-mono text-[9px] text-slate-400 font-bold uppercase mt-1">Version 1.10.0 • Connected to Civic Services</p>
        </div>
        <p className="font-body text-xs text-brand-muted max-w-md mx-auto leading-relaxed">
          Driving municipal accountability, transparent dispatch flows, and crowd-verified neighborhood stabilization systems globally. Licensed under the Open Civic Alliance.
        </p>
      </div>
    </motion.div>
  );
}
