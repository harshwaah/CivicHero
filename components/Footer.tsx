'use client';

import React from 'react';
import { Landmark, Globe, Twitter, Github, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 py-16 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white">
              <Landmark className="w-4 h-4" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight text-brand-primary">
              Civic<span className="text-brand-secondary">Hero</span>
            </span>
          </div>
          <p className="font-body text-xs text-brand-muted leading-relaxed max-w-sm mb-6">
            Pioneering the next generation of civic participation. We believe that transparent infrastructure is the prerequisite of durable community trust.
          </p>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-brand-primary transition-all duration-200">
              <Twitter className="w-4 h-4 text-brand-muted" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-brand-primary transition-all duration-200">
              <Github className="w-4 h-4 text-brand-muted" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-brand-primary transition-all duration-200">
              <Globe className="w-4 h-4 text-brand-muted" />
            </a>
          </div>
        </div>

        {/* Column 1: Platform */}
        <div>
          <h4 className="font-sans font-bold text-xs tracking-wider text-brand-primary uppercase mb-4">
            Platform
          </h4>
          <ul className="flex flex-col gap-3 font-body text-xs text-brand-muted">
            <li>
              <a href="#citizen-section" className="hover:text-brand-secondary transition-colors">Citizen App</a>
            </li>
            <li>
              <a href="#admin-section" className="hover:text-brand-primary transition-colors">Admin Dashboard</a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-primary transition-colors flex items-center gap-1.5">
                Open Data API
                <span className="font-mono text-[8px] bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded-md font-bold">LIVE</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 2: Company */}
        <div>
          <h4 className="font-sans font-bold text-xs tracking-wider text-brand-primary uppercase mb-4">
            Company
          </h4>
          <ul className="flex flex-col gap-3 font-body text-xs text-brand-muted">
            <li>
              <a href="#mission" className="hover:text-brand-primary transition-colors">Our Mission</a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-primary transition-colors">Privacy Policy</a>
            </li>
            <li>
              <a href="#" className="hover:text-brand-primary transition-colors">Contact</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-400">
        <div>
          © 2026 CivicHero. Built for better, stronger communities.
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-brand-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-brand-primary transition-colors">Cookie Settings</a>
        </div>
      </div>
    </footer>
  );
}
