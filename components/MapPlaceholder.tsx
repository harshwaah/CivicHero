'use client';

import React from 'react';
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers } from 'lucide-react';
import { motion } from 'motion/react';

interface MapPlaceholderProps {
  locationName: string;
  categoryName: string;
}

export default function MapPlaceholder({ locationName, categoryName }: MapPlaceholderProps) {
  // Generate random markers for a realistic map appearance
  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[21/10] bg-[#f8fafc] rounded-[28px] overflow-hidden border border-slate-100 shadow-sm group">
      {/* Schematic Map Grid & Streets */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        {/* Subtle coordinate lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:40px_40px]" />
        
        {/* Fake roads */}
        <div className="absolute top-[30%] left-0 right-0 h-8 bg-white border-y border-slate-200/50 transform -rotate-2 flex items-center justify-center">
          <span className="font-mono text-[9px] text-slate-400 tracking-wider font-semibold">18TH STREET</span>
        </div>
        <div className="absolute top-0 bottom-0 left-[40%] w-8 bg-white border-x border-slate-200/50 transform rotate-12 flex items-center justify-center">
          <span className="font-mono text-[9px] text-slate-400 tracking-wider font-semibold transform rotate-90">VALENCIA STREET</span>
        </div>
        <div className="absolute top-[65%] left-0 right-0 h-6 bg-white border-y border-slate-200/50 transform rotate-3 flex items-center justify-center">
          <span className="font-mono text-[8px] text-slate-400 tracking-wider font-semibold">OAK AVENUE</span>
        </div>
        
        {/* Fake parks/green zones */}
        <div className="absolute top-[10%] left-[10%] w-24 h-20 bg-emerald-50/40 rounded-full blur-md" />
        <div className="absolute bottom-[15%] right-[15%] w-32 h-24 bg-emerald-50/50 rounded-[40px] transform -rotate-12" />
        
        {/* Fake water bodies */}
        <div className="absolute top-[75%] left-[65%] w-48 h-32 bg-sky-50/60 rounded-full blur-lg" />
      </div>

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <button className="p-2 rounded-xl bg-white/95 border border-slate-200/50 shadow-sm text-brand-primary hover:bg-slate-50 transition-colors flex items-center justify-center">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-xl bg-white/95 border border-slate-200/50 shadow-sm text-brand-primary hover:bg-slate-50 transition-colors flex items-center justify-center">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button className="p-2 rounded-xl bg-white/95 border border-slate-200/50 shadow-sm text-brand-primary hover:bg-slate-50 transition-colors flex items-center justify-center">
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Top Left Compass/Location HUD */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/40 shadow-sm">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-mono text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          GPS LOCK • ACTIVE CORRIDOR
        </span>
      </div>

      {/* Main pulsing incident marker */}
      <div className="absolute top-[48%] left-[44%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
        <motion.div 
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="relative flex items-center justify-center"
        >
          {/* Pulsing ring */}
          <span className="absolute inline-flex h-12 w-12 rounded-full bg-brand-primary/20 animate-ping opacity-75" />
          
          {/* SVG Map Pin Pinpoint */}
          <div className="relative w-10 h-10 bg-brand-primary rounded-full border-2 border-white shadow-md flex items-center justify-center text-white">
            <MapPin className="w-5 h-5 text-brand-secondary" />
          </div>
        </motion.div>
        
        {/* Floating tooltip with target label */}
        <motion.div 
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2.5 bg-slate-950/95 text-white text-[9px] font-mono font-extrabold tracking-widest uppercase py-1.5 px-3 rounded-lg border border-slate-800 shadow-lg whitespace-nowrap"
        >
          {categoryName.toUpperCase()} LOCATION
        </motion.div>
      </div>

      {/* Aesthetic bottom overlay - mimics a bottom sheet preview in maps */}
      <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-5 py-4 rounded-2xl border border-slate-100 shadow-md flex items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0">
            <Navigation className="w-5 h-5 text-brand-primary animate-pulse" />
          </div>
          <div>
            <h4 className="font-sans font-bold text-xs text-brand-primary leading-tight">
              {locationName}
            </h4>
            <span className="font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
              Target Incident Zone • Central Sector
            </span>
          </div>
        </div>
        <div className="px-3.5 py-1.5 rounded-xl border border-slate-100 bg-slate-50 text-[10px] font-mono text-slate-500 font-bold">
          45.1098° N, 122.6801° W
        </div>
      </div>
    </div>
  );
}
