'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Globe, ArrowUpRight, Menu, X, Landmark, User, ShieldAlert } from 'lucide-react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(3);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const notifications = [
    { id: 1, title: "Pothole Resolved", location: "West Hill", time: "10m ago" },
    { id: 2, title: "Streetlight Voted", location: "Parkside", time: "1h ago" },
    { id: 3, title: "Water Main Synced", location: "Downtown", time: "3h ago" }
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-4 bg-[#f8f9fa]/80 backdrop-blur-md shadow-sm border-b border-slate-100/50'
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo and Icon */}
        <motion.div
          className="flex items-center gap-2 cursor-pointer group"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-white shadow-md shadow-brand-primary/20 group-hover:bg-brand-secondary transition-colors duration-300">
            <Landmark className="w-5 h-5" />
          </div>
          <span className="font-sans font-bold text-xl tracking-tight text-brand-primary">
            Civic<span className="text-brand-secondary">Hero</span>
          </span>
        </motion.div>

        {/* Central Nav Links */}
        <nav className="hidden md:flex items-center gap-8 bg-slate-100/50 backdrop-blur-sm border border-slate-200/20 px-6 py-2 rounded-full">
          {['Mission', 'Insights', 'Trust Map'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="font-mono text-xs font-semibold text-brand-muted hover:text-brand-primary transition-colors duration-200 relative group py-1"
            >
              {item}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-brand-secondary scale-0 group-hover:scale-100 transition-transform duration-300" />
            </a>
          ))}
        </nav>

        {/* Right Nav Utilities */}
        <div className="flex items-center gap-4">
          {/* Notification Button */}
          <div className="relative">
            <motion.button
              className="p-2.5 rounded-xl border border-slate-200/50 bg-white shadow-sm text-brand-primary hover:bg-slate-50 transition-colors duration-200 relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowNotifDropdown(!showNotifDropdown);
                setNotifCount(0); // Mark as read
              }}
            >
              <Bell className="w-4 h-4" />
              {notifCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-error border-2 border-white animate-pulse" />
              )}
            </motion.button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifDropdown && (
                <motion.div
                  className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl p-4 z-50 origin-top-right"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                    <span className="font-sans font-bold text-xs text-brand-primary">Live Activity Feed</span>
                    <span className="font-mono text-[9px] bg-brand-secondary/15 text-brand-secondary px-1.5 py-0.5 rounded-md font-bold">MUTABLE LEDGER</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {notifications.map((n) => (
                      <div key={n.id} className="p-2 hover:bg-brand-warm rounded-lg transition-colors duration-150 flex justify-between items-start">
                        <div>
                          <p className="font-sans text-xs font-semibold text-brand-primary">{n.title}</p>
                          <p className="font-body text-[10px] text-brand-muted">{n.location} district</p>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">{n.time}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Citizen & Admin Quick Switches */}
          <a
            href="#citizen-section"
            className="hidden lg:flex items-center gap-1.5 font-mono text-xs font-bold text-brand-secondary border border-brand-secondary/20 hover:bg-brand-secondary/5 px-4 py-2 rounded-xl transition-all duration-200"
          >
            <Globe className="w-3.5 h-3.5" />
            Citizen Link
          </a>

          <a
            href="#admin-section"
            className="hidden lg:flex items-center gap-1.5 font-mono text-xs font-bold text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10 px-4 py-2 rounded-xl transition-all duration-200 border border-brand-primary/10"
          >
            <User className="w-3.5 h-3.5" />
            Admin Board
          </a>

          {/* Hamburger Mobile Menu Toggle */}
          <button
            className="p-2.5 rounded-xl border border-slate-200/50 bg-white text-brand-primary md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-x-0 top-[73px] bg-[#f8f9fa] border-b border-slate-200/80 p-6 shadow-lg md:hidden z-40"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col gap-4 mb-6">
              {['Mission', 'Insights', 'Trust Map'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="font-sans font-bold text-sm text-brand-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              <a
                href="#citizen-section"
                className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-brand-secondary border border-brand-secondary/30 py-3 rounded-xl hover:bg-brand-secondary/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Globe className="w-4 h-4" />
                Citizen Portal
              </a>
              <a
                href="#admin-section"
                className="flex items-center justify-center gap-2 font-mono text-xs font-bold text-white bg-brand-primary py-3 rounded-xl hover:bg-brand-primary-container"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Administrator Portal
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
