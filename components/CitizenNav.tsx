'use client';

import React from 'react';
import { motion } from 'motion/react';
import { Home, Compass, ShieldCheck, Bell, User, MapPin, Search, ChevronRight, Sparkles } from 'lucide-react';

interface CitizenNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function CitizenNav({ activeTab, onTabChange }: CitizenNavProps) {
  const tabs = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'map', label: 'MAP', icon: Compass },
    { id: 'safety', label: 'SAFETY', icon: ShieldCheck },
    { id: 'alerts', label: 'ALERTS', icon: Bell },
  ];

  return (
    <>
      {/* 1. MOBILE BOTTOM NAVIGATION (Persistent Floating Glassmorphic bar) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-[#f8f9fa]/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-[28px] px-6 py-3 flex items-center justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-1.5 flex-1 py-1 group focus:outline-none"
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicatorMobile"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-brand-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-brand-primary' : 'text-slate-400'
                  }`}
                />

                <span
                  className={`text-[9px] font-mono font-bold tracking-wider transition-colors duration-200 ${
                    isActive ? 'text-brand-primary' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. DESKTOP SIDE NAVIGATION (Elegant left side rail) */}
      <div className="hidden md:flex flex-col w-72 h-[calc(100vh-120px)] sticky top-28 gap-6 z-30">
        {/* Main Nav Container */}
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 flex flex-col justify-between flex-1">
          <div className="flex flex-col gap-6">
            {/* Minimal Brand Profile Section */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center border border-brand-primary/10 font-bold font-sans text-brand-primary">
                CH
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-brand-primary">Citizen Hub</h4>
                <div className="flex items-center gap-1 text-[10px] font-mono text-brand-secondary font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SECURE NODE ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex flex-col gap-1.5">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-sans text-xs font-bold tracking-wider transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-primary text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-brand-primary'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicatorDesktop"
                        className="absolute inset-0 bg-brand-primary rounded-2xl -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Context Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/60">
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[9px] font-bold tracking-widest uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
              <span>AI COMPANION</span>
            </div>
            <h5 className="font-sans font-bold text-xs text-brand-primary mb-1">Empowering Local Agency</h5>
            <p className="font-body text-[11px] text-brand-muted leading-relaxed">
              Your feedback fuels real-time public works. Each vetted sign-off accelerates nearby repairs.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
