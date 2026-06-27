'use client';

import React from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, ListTodo, Activity, Bot, MapIcon } from 'lucide-react';

interface AdminNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function AdminNav({ activeTab, onTabChange }: AdminNavProps) {
  const tabs = [
    { id: 'dashboard', label: 'MISSION CONTROL', icon: LayoutDashboard },
    { id: 'map', label: 'OPERATIONAL MAP', icon: MapIcon },
    { id: 'queue', label: 'ISSUE QUEUE', icon: ListTodo },
    { id: 'analytics', label: 'CIVIC TRUST', icon: Activity },
    { id: 'copilot', label: 'AI COPILOT', icon: Bot },
  ];

  return (
    <>
      {/* 1. MOBILE BOTTOM NAVIGATION (Persistent Floating Glassmorphic bar) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-[#1e293b]/90 backdrop-blur-xl border border-slate-700/40 shadow-xl rounded-[28px] px-6 py-3 flex items-center justify-between">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-1.5 flex-1 py-1 group focus:outline-none"
              >
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicatorMobileAdmin"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-brand-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-brand-accent' : 'text-slate-400'
                  }`}
                />

                <span
                  className={`text-[9px] font-mono font-bold tracking-wider transition-colors duration-200 ${
                    isActive ? 'text-brand-accent' : 'text-slate-400'
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
        <div className="bg-slate-900 rounded-[28px] border border-slate-800 shadow-xl p-6 flex flex-col justify-between flex-1">
          <div className="flex flex-col gap-6">
            {/* Minimal Brand Profile Section */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 font-bold font-sans text-white">
                MC
              </div>
              <div>
                <h4 className="font-sans font-bold text-sm text-white">Mission Control</h4>
                <div className="flex items-center gap-1 text-[10px] font-mono text-brand-accent font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SYSTEM ONLINE</span>
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
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTabIndicatorDesktopAdmin"
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
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/60">
            <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[9px] font-bold tracking-widest uppercase mb-1.5">
              <Bot className="w-3.5 h-3.5 text-brand-accent" />
              <span>COPILOT ACTIVE</span>
            </div>
            <h5 className="font-sans font-bold text-xs text-white mb-1">Operational Oversight</h5>
            <p className="font-body text-[11px] text-slate-400 leading-relaxed">
              Real-time synchronization with citizen reports. Monitor, assign, and resolve civic issues.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
