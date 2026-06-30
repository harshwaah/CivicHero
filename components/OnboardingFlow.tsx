'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ArrowLeft, X, Check, Landmark, Terminal, Award, HelpCircle } from 'lucide-react';

interface OnboardingFlowProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  onComplete: () => void;
}

interface TourStep {
  title: string;
  tab: string;
  icon: any;
  description: string;
  targetArea: string;
}

export default function OnboardingFlow({ activeTab, setActiveTab, onComplete }: OnboardingFlowProps) {
  const [stepIndex, setStepIndex] = useState(-1); // -1 is Name input phase
  const [userName, setUserName] = useState('');
  const [inputError, setInputError] = useState('');

  // Define steps
  const steps: TourStep[] = [
    {
      title: 'Home & Community Feed',
      tab: 'home',
      icon: Sparkles,
      description: 'This is your active neighborhood hub. You can browse nearby public works, filter concerns by category (roads, water, utilities), and check real-time resolution logs.',
      targetArea: 'Home Feed'
    },
    {
      title: 'Civic Interactive Map',
      tab: 'map',
      icon: Sparkles,
      description: 'Tap on the MAP tab to view all reported issues pinned visually. You can click on pins to view details or click anywhere on the map to log a hazard at that exact GIS location.',
      targetArea: 'Interactive Map'
    },
    {
      title: 'Visual Evidence Logging',
      tab: 'home',
      icon: Sparkles,
      description: 'Use the floating Smiley button on the bottom right (or Report Issue on Map) to upload incident photos. The integrated AI automatically categorizes and prioritizes the dispatch ticket.',
      targetArea: 'Floating Report Button'
    },
    {
      title: 'Neighborhood Safety Center',
      tab: 'safety',
      icon: Sparkles,
      description: 'The SAFETY tab aggregates critical hazard alerts, active safety guides, and direct emergency dispatch phone channels for your region.',
      targetArea: 'Safety Dashboard'
    },
    {
      title: 'Live Alerts Registry',
      tab: 'alerts',
      icon: Sparkles,
      description: 'Check the ALERTS tab for recently resolved issues and official municipal broadcasts. Subscribe with your ZIP code to receive instant SMS hazard alerts.',
      targetArea: 'Regional Alerts'
    },
    {
      title: 'Personal Civic Passport',
      tab: 'passport',
      icon: Award,
      description: 'View your PASSPORT tab to inspect your unique Citizen Trust Score, co-signing stats, achievements, and earned badges as an active community steward.',
      targetArea: 'Civic Passport'
    },
    {
      title: 'Administrative Mission Control',
      tab: 'home',
      icon: Landmark,
      description: 'Admins have access to a separate "Administrator View" with deep intelligence tools, automated copilot ticket caching, and work progress logs.',
      targetArea: 'Admin Overview'
    },
    {
      title: 'System Diagnostics & Dev Settings',
      tab: 'settings',
      icon: Terminal,
      description: 'Developers and judges can enable Developer Mode in the SETTINGS tab to inspect real-time Firestore operations, or view the dedicated Diagnostics page for API key health checkups.',
      targetArea: 'Dev Settings & Diagnostics'
    }
  ];

  // Adjust active tab to match tour steps
  useEffect(() => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      const targetTab = steps[stepIndex].tab;
      if (activeTab !== targetTab) {
        setActiveTab(targetTab);
      }
    }
  }, [stepIndex]);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setInputError('Please enter a display name to get started.');
      return;
    }
    localStorage.setItem('civichero_display_name', userName.trim());
    setInputError('');
    setStepIndex(0); // Proceed to first tour step
  };

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const handleSkip = () => {
    if (!localStorage.getItem('civichero_display_name')) {
      localStorage.setItem('civichero_display_name', 'Guest Hero');
    }
    handleFinish();
  };

  const handleFinish = () => {
    localStorage.setItem('civichero_onboard_completed', 'true');
    onComplete();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop glassmorphism */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          onClick={handleSkip}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-[32px] border border-slate-100 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden z-10"
        >
          {/* Progress bar */}
          {stepIndex >= 0 && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
              <motion.div
                className="h-full bg-brand-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-5 right-5 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <AnimatePresence mode="wait">
            {stepIndex === -1 ? (
              /* Phase -1: Name Input */
              <motion.div
                key="name-input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 pt-2"
              >
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-brand-primary/5 border border-brand-primary/10 px-3 py-1 rounded-full text-brand-primary text-[10px] font-mono font-bold tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                    WELCOME TO CIVICHERO
                  </div>
                  <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-brand-primary tracking-tight leading-none">
                    What should we call you?
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed">
                    We only store your display name locally on your device to personalize your greetings, reports, notifications, and passport badges. No accounts or forms required.
                  </p>
                </div>

                <form onSubmit={handleSaveName} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="e.g. Captain Cooper, Sarah Jenkins"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setInputError('');
                      }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-brand-primary focus:bg-white px-4 py-3.5 rounded-2xl font-sans text-sm font-bold focus:outline-none transition-all placeholder:text-slate-400 shadow-inner"
                      autoFocus
                    />
                    {inputError && (
                      <p className="text-red-500 font-mono text-[10px] font-bold mt-1.5 pl-1">
                        ⚠️ {inputError}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSkip}
                      className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Skip Onboarding
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              /* Tour Guide Steps */
              <motion.div
                key={`step-${stepIndex}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6 pt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-secondary shrink-0">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                      TOUR STEP {stepIndex + 1} OF {steps.length} • {steps[stepIndex].targetArea.toUpperCase()}
                    </span>
                    <h3 className="font-sans font-extrabold text-xl text-brand-primary tracking-tight mt-0.5">
                      {steps[stepIndex].title}
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed">
                    {steps[stepIndex].description}
                  </p>
                </div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-3">
                  <div className="flex gap-1.5">
                    {steps.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setStepIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          idx === stepIndex ? 'bg-brand-primary w-4' : 'bg-slate-200 hover:bg-slate-300'
                        }`}
                        title={`Go to step ${idx + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    {stepIndex > 0 && (
                      <button
                        onClick={handlePrev}
                        className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors flex items-center gap-1"
                        title="Previous Step"
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={handleSkip}
                      className="px-4 py-3 hover:bg-slate-50 text-slate-400 hover:text-slate-600 font-mono text-[10px] font-bold uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Skip
                    </button>

                    <button
                      onClick={handleNext}
                      className="px-5 py-3 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>{stepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
