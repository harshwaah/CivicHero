'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Compass, 
  ShieldCheck, 
  Megaphone, 
  Search, 
  Bell, 
  User, 
  Settings, 
  Sparkles 
} from 'lucide-react';
import { NotificationRepository } from '../lib/repositories/notificationRepository';
import CivicLogo from './CivicLogo';

interface CitizenNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function CitizenNav({ activeTab, onTabChange }: CitizenNavProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NotificationRepository.subscribeByUserId('citizen-admin-1', (notifs) => {
      // Exclude archived and read ones
      const count = notifs.filter(n => !n.isRead && !n.isArchived).length;
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, []);

  const tabs = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'map', label: 'MAP', icon: Compass },
    { id: 'safety', label: 'SAFETY', icon: ShieldCheck },
    { id: 'alerts', label: 'ALERTS', icon: Megaphone },
    { id: 'search', label: 'SEARCH', icon: Search },
    { id: 'notifications', label: 'NOTIFS', icon: Bell, badge: true },
    { id: 'passport', label: 'PASSPORT', icon: User },
    { id: 'settings', label: 'SETTINGS', icon: Settings },
  ];

  return (
    <>
      {/* 1. MOBILE BOTTOM NAVIGATION (Horizontal swipe bar with blur) */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-40">
        <div className="bg-[#f8f9fa]/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-[28px] px-4 py-3 flex items-center gap-4 overflow-x-auto scrollbar-none snap-x">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-1.5 shrink-0 min-w-[56px] py-1 group focus:outline-none snap-center"
              >
                {/* Active indicator dot */}
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicatorMobile"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-brand-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-brand-primary' : 'text-slate-400'
                    }`}
                  />
                  {tab.badge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-bold text-[8px] h-4 w-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>

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
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <CivicLogo href="/" size="sm" showTagline={false} />
              <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-100/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ONLINE</span>
              </div>
            </div>

            {/* Navigation links */}
            <div className="flex flex-col gap-1.5 max-h-[420px] overflow-y-auto pr-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`relative w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl font-sans text-xs font-bold tracking-wider transition-all duration-200 group ${
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

                    <div className="relative">
                      <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      {tab.badge && unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-bold text-[8px] h-4.5 w-4.5 rounded-full flex items-center justify-center border border-white">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span>{tab.label === 'NOTIFS' ? 'NOTIFICATIONS' : tab.label}</span>
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
