'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Globe, MapPin, Shield, CheckCircle, Heart, ArrowRight } from 'lucide-react';

export default function LivingCity() {
  const [activeSector, setActiveSector] = useState<number>(0);

  // Cycle the paper airplane's progress through 4 distinct zones
  // Zone 0: Left Hill (Entry & Awareness)
  // Zone 1: Mid-Left (Consensus & Verification)
  // Zone 2: Mid-Right (Administrative Action & Infrastructure)
  // Zone 3: Right (Transparency & Unified Trust)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSector((prev) => (prev + 1) % 4);
    }, 4500); // 4.5 seconds per sector to create a slow, serene rhythm
    return () => clearInterval(interval);
  }, []);

  const sectorLabels = [
    {
      title: "1. Preserving Hyperlocal Awareness",
      tag: "COMMUNITY AWARENESS",
      desc: "An unsafe road or damaged infrastructure is noticed. The system begins tracking with tamper-proof coordinates."
    },
    {
      title: "2. Democratic Civic Verification",
      tag: "MUTUAL CONSENSUS",
      desc: "Neighbors co-sign and verify the event. The community park glows as residents actively priority-rank."
    },
    {
      title: "3. Direct Administrative Action",
      tag: "MUNICIPAL WORK FLOW",
      desc: "Open-source work orders dispatch to city teams. Streetlights and crosswalks light up as repairs take place."
    },
    {
      title: "4. Trust Through Transparency",
      tag: "IMMEDIATE OPEN LEDGER",
      desc: "The final handshake. Residents sign off on resolutions, embedding unified trust into the public contract."
    }
  ];

  return (
    <div className="relative w-full aspect-[1.8/1] min-h-[380px] md:min-h-[460px] lg:min-h-[520px] rounded-[36px] overflow-hidden shadow-2xl border border-white/20 bg-[#0c122c] p-1 select-none">
      
      {/* Top Left Environment Status Overlay */}
      <div className="absolute top-6 left-6 z-30 flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm text-xs text-white">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono tracking-wider uppercase font-semibold text-[10px]">LIVING NEIGHBORHOOD MODEL</span>
      </div>

      {/* Top Right Legend Overlay */}
      <div className="absolute top-6 right-6 z-30 hidden md:flex items-center gap-4 text-white/70 text-[10px] font-mono bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Active Glide</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Verified Node</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Open Ledger</span>
        </div>
      </div>

      {/* THE PRIMARY SVG ENVIRONMENT */}
      <svg
        viewBox="0 0 1000 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover relative z-10"
      >
        {/* DEFINITIONS FOR LIGHT SHADERS, GLOW FILTERS AND GRADIENTS */}
        <defs>
          {/* Sunset sky gradient */}
          <linearGradient id="skySunset" x1="500" y1="0" x2="500" y2="550" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0c122c" />
            <stop offset="35%" stopColor="#1e1b4b" />
            <stop offset="65%" stopColor="#4c1d95" />
            <stop offset="85%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          {/* Golden sun flare radial gradient */}
          <radialGradient id="sunGlow" cx="220" cy="380" r="280" fx="220" fy="380" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#ec4899" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#311042" stopOpacity="0" />
          </radialGradient>

          {/* Soft blur glow filter for bloom elements */}
          <filter id="bloomGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.3" />
          </filter>

          {/* District 1 Garden/Green Active Gradient */}
          <linearGradient id="gardenActive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* House building gradients */}
          <linearGradient id="houseBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>

          {/* Streetlight light cone gradient */}
          <radialGradient id="streetlightCone" cx="50%" cy="0%" r="100%" fx="50%" fy="0%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#fef08a" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* LAYER 1: SKY AND GOLDEN SUNRISE/SUNSET BACKDROP */}
        <rect width="1000" height="550" fill="url(#skySunset)" />
        <circle cx="220" cy="380" r="280" fill="url(#sunGlow)" />

        {/* Ambient atmospheric sun beams */}
        <path d="M 220 380 L -100 100 L 0 50 Z" fill="#fef08a" fillOpacity="0.04" />
        <path d="M 220 380 L 400 -50 L 550 -50 Z" fill="#fef08a" fillOpacity="0.04" />
        <path d="M 220 380 L 900 150 L 950 220 Z" fill="#fef08a" fillOpacity="0.03" />

        {/* Slow Drifting Layered Clouds */}
        <g opacity="0.25">
          {/* Cloud Layer A */}
          <motion.path
            d="M 50 180 C 80 160, 140 160, 170 180 C 190 170, 240 170, 260 190 C 280 180, 320 180, 340 200 L 50 200 Z"
            fill="#ffffff"
            initial={{ x: -100 }}
            animate={{ x: 1050 }}
            transition={{ repeat: Infinity, duration: 55, ease: "linear" }}
          />
          {/* Cloud Layer B */}
          <motion.path
            d="M 600 120 C 625 105, 675 105, 700 120 C 715 110, 755 110, 770 125 C 785 115, 820 115, 835 130 L 600 130 Z"
            fill="#fbcfe8"
            initial={{ x: -200 }}
            animate={{ x: 1050 }}
            transition={{ repeat: Infinity, duration: 42, ease: "linear", delay: 10 }}
          />
        </g>

        {/* Birds soaring through the golden air */}
        <g opacity="0.4">
          <motion.path
            d="M 0 0 Q 15 -10 30 0 Q 45 -10 60 0"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ x: -50, y: 150, scale: 0.35 }}
            animate={{
              x: [100, 450, 950, 1050],
              y: [120, 180, 110, 100],
              scale: [0.35, 0.45, 0.35, 0.3]
            }}
            transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          />
          <motion.path
            d="M 0 0 Q 12 -8 24 0 Q 36 -8 48 0"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeLinecap="round"
            initial={{ x: -100, y: 130, scale: 0.25 }}
            animate={{
              x: [50, 380, 880, 1050],
              y: [140, 190, 130, 120],
              scale: [0.25, 0.35, 0.25, 0.2]
            }}
            transition={{ repeat: Infinity, duration: 28, ease: "easeInOut", delay: 3 }}
          />
        </g>

        {/* LAYER 2: DISTANT HILL SILHOUETTES */}
        {/* Soft back hills */}
        <path d="M 0 420 Q 250 350 500 410 T 1000 390 L 1000 550 L 0 550 Z" fill="#1e123c" opacity="0.8" />
        {/* Mid-distance hills */}
        <path d="M 0 440 Q 350 380 700 440 T 1000 430 L 1000 550 L 0 550 Z" fill="#160e2e" />

        {/* Distant skyline towers on active */}
        <g opacity="0.3" transform="translate(150, 360)">
          <rect x="0" y="30" width="18" height="60" rx="2" fill="#130121" />
          <rect x="24" y="10" width="22" height="80" rx="3" fill="#130121" />
          <rect x="52" y="40" width="16" height="50" rx="2" fill="#130121" />
        </g>


        {/* LAYER 3: THE COOPERATIVE NEIGHBORHOOD GRID */}

        {/* District 1 lawns - Left Hill Side */}
        <path d="M -50 480 Q 180 430 400 480 L 400 550 L -50 550 Z" fill="#111c3a" />
        <motion.path
          d="M -50 480 Q 180 430 400 480 L 400 550 L -50 550 Z"
          animate={{
            fill: (activeSector === 0 || activeSector === 3) ? "#0f2d3a" : "#111c3a",
          }}
          transition={{ duration: 1.2 }}
        />

        {/* District 2 Main Park area - Middle Flat */}
        <path d="M 380 480 Q 650 450 900 480 L 900 550 L 380 550 Z" fill="#0d1b32" />
        <motion.path
          d="M 380 480 Q 650 450 900 480 L 900 550 L 380 550 Z"
          animate={{
            fill: activeSector >= 1 ? "#064e3b" : "#0d1b32", // Illuminates to clean emerald green as the airplane glides
          }}
          transition={{ duration: 1.5 }}
        />

        {/* Right Innovation District Flat - Edge */}
        <path d="M 850 480 Q 950 470 1050 480 L 1050 550 L 850 550 Z" fill="#0c1328" />
        <motion.path
          d="M 850 480 Q 950 470 1050 480 L 1050 550 L 850 550 Z"
          animate={{
            fill: activeSector >= 2 ? "#002a54" : "#0c1328", // Illuminates deep municipal blue as the admin sector activates
          }}
          transition={{ duration: 1.5 }}
        />

        {/* Tree Rows lined up in background of houses (Swaying Gently) */}
        <g>
          {/* Tree group A */}
          <g transform="translate(120, 420)">
            <rect x="-1.5" y="0" width="3" height="15" fill="#451a03" />
            <motion.ellipse
              cx="0" cx-y="0" rx="10" ry="14"
              fill="#065f46"
              animate={{ rotate: [-2, 3, -2], skewX: [-1, 2, -1] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
              style={{ transformOrigin: "0px 15px" }}
            />
          </g>
          <g transform="translate(145, 415)">
            <rect x="-1.5" y="0" width="3" height="15" fill="#451a03" />
            <motion.ellipse
              cx="0" cx-y="0" rx="8" ry="12"
              fill="#065f46"
              animate={{ rotate: [2, -3, 2], skewX: [1, -2, 1] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
              style={{ transformOrigin: "0px 15px" }}
            />
          </g>

          {/* Tree group B (Behind the Park) */}
          <g transform="translate(520, 435)">
            <rect x="-2" y="0" width="4" height="20" fill="#451a03" />
            <motion.ellipse
              cx="0" cx-y="0" rx="14" ry="18"
              fill="#0f766e"
              animate={{
                fill: activeSector >= 1 ? "#10b981" : "#0f766e",
                rotate: [-1.5, 2.5, -1.5]
              }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ transformOrigin: "0px 20px" }}
            />
          </g>
          <g transform="translate(560, 440)">
            <rect x="-1.5" y="0" width="3" height="18" fill="#451a03" />
            <motion.ellipse
              cx="0" cx-y="0" rx="12" ry="15"
              fill="#0f766e"
              animate={{
                fill: activeSector >= 1 ? "#34d399" : "#0f766e",
                rotate: [2, -2, 2]
              }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.2 }}
              style={{ transformOrigin: "0px 18px" }}
            />
          </g>
        </g>

        {/* Stylized Modern Low-rise Houses (Premium architecture, rounded windows, gardens) */}
        <g>
          {/* House 1 (Left Hill) */}
          <g transform="translate(80, 410)">
            <rect x="0" y="20" width="50" height="40" rx="6" fill="url(#houseBody)" />
            <polygon points="25,0 -5,22 55,22" fill="#4338ca" />
            {/* Windows that glow dynamically as progress moves */}
            <motion.rect
              x="10" y="28" width="10" height="10" rx="2"
              animate={{
                fill: activeSector >= 0 ? "#fef08a" : "#1e1b4b",
                stroke: activeSector >= 0 ? "#f59e0b" : "transparent"
              }}
              transition={{ duration: 0.8 }}
            />
            <motion.rect
              x="30" y="28" width="10" height="10" rx="2"
              animate={{
                fill: activeSector >= 0 ? "#fef08a" : "#1e1b4b",
                stroke: activeSector >= 0 ? "#f59e0b" : "transparent"
              }}
              transition={{ duration: 0.8 }}
            />
          </g>

          {/* House 2: Modern Flat Roof with rooftop garden */}
          <g transform="translate(220, 420)">
            <rect x="0" y="10" width="70" height="45" rx="8" fill="#1e1b4b" stroke="#312e81" strokeWidth="1.5" />
            <rect x="8" y="0" width="54" height="10" rx="3" fill="#047857" />
            {/* Soft garden flower indicators on roof */}
            <circle cx="15" cy="-2" r="2" fill="#ec4899" className="animate-pulse" />
            <circle cx="35" cy="-4" r="1.5" fill="#fbbf24" />
            <circle cx="50" cy="-2" r="2.5" fill="#f87171" />

            {/* Glowing glass panel sliding door */}
            <motion.rect
              x="20" y="20" width="30" height="35" rx="4"
              animate={{
                fill: activeSector >= 0 ? "#ffe4e6" : "#0f172a",
                fillOpacity: activeSector >= 0 ? 0.9 : 0.4
              }}
              transition={{ duration: 0.8 }}
            />
          </g>

          {/* House 3: Traditional Gable Cottage */}
          <g transform="translate(640, 420)">
            <rect x="0" y="20" width="55" height="40" rx="4" fill="url(#houseBody)" />
            <polygon points="27.5,2 -4,22 59,22" fill="#881337" />
            <motion.rect
              x="18" y="32" width="18" height="16" rx="2"
              animate={{
                fill: activeSector >= 1 ? "#fef08a" : "#1e1b4b"
              }}
              transition={{ duration: 0.8 }}
            />
          </g>
        </g>

        {/* LAYER 4: STREET GRID, CENTRAL PARK FOUNTAIN & COMMUNITY PATHS */}
        <g>
          {/* Main central avenue (Slate road running across) */}
          <path d="M 0 520 L 1000 520" stroke="#0f172a" strokeWidth="24" strokeLinecap="round" />
          {/* Dotted center divider */}
          <path d="M 0 520 L 1000 520" stroke="#475569" strokeWidth="2" strokeDasharray="8 8" />

          {/* Dynamic Crosswalks that brighten as airplane is overhead */}
          <g transform="translate(340, 508)">
            <motion.rect x="0" y="0" width="6" height="24" rx="1" animate={{ fill: activeSector >= 1 ? "#ffffff" : "#334155" }} />
            <motion.rect x="12" y="0" width="6" height="24" rx="1" animate={{ fill: activeSector >= 1 ? "#ffffff" : "#334155" }} />
            <motion.rect x="24" y="0" width="6" height="24" rx="1" animate={{ fill: activeSector >= 1 ? "#ffffff" : "#334155" }} />
          </g>

          <g transform="translate(780, 508)">
            <motion.rect x="0" y="0" width="6" height="24" rx="1" animate={{ fill: activeSector >= 2 ? "#ffffff" : "#334155" }} />
            <motion.rect x="12" y="0" width="6" height="24" rx="1" animate={{ fill: activeSector >= 2 ? "#ffffff" : "#334155" }} />
            <motion.rect x="24" y="0" width="6" height="24" rx="1" animate={{ fill: activeSector >= 2 ? "#ffffff" : "#334155" }} />
          </g>

          {/* Park Fountain (Dynamic droplet emission, sparkles in Center Park) */}
          <g transform="translate(480, 465)">
            <ellipse cx="0" cy="15" rx="30" ry="8" fill="#1e293b" stroke="#334155" />
            <ellipse cx="0" cy="15" rx="22" ry="4" fill="#0284c7" fillOpacity="0.4" />
            <path d="M -4 14 L -1 2 L 1 2 L 4 14 Z" fill="#475569" />

            {/* Sprays */}
            <motion.circle cx="-6" cy="5" r="1.5" fill="#bae6fd" animate={{ y: [5, -12, 5], x: [-6, -10, -6] }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeOut" }} />
            <motion.circle cx="6" cy="3" r="1.5" fill="#bae6fd" animate={{ y: [3, -15, 3], x: [6, 11, 6] }} transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut", delay: 0.3 }} />
            <motion.circle cx="0" cy="0" r="2" fill="#ffffff" animate={{ y: [0, -22, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: "easeOut", delay: 0.1 }} />
          </g>
        </g>

        {/* LAYER 5: STREETLIGHTS (Lighting Up Cones of Soft Amber Light) */}
        <g>
          {/* Streetlight 1: Left */}
          <g transform="translate(180, 430)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="#334155" strokeWidth="3" />
            <path d="M -6 0 L 6 0 L 4 -6 L -4 -6 Z" fill="#1e293b" />
            {/* Glow Cone */}
            <motion.polygon
              points="0,0 -35,70 35,70"
              fill="url(#streetlightCone)"
              initial={{ opacity: 0 }}
              animate={{ opacity: activeSector >= 1 ? 0.9 : 0 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none"
            />
            {/* Lamp Bulb Bulb */}
            <motion.circle
              cx="0" cy="1" r="3.5"
              animate={{ fill: activeSector >= 1 ? "#fef08a" : "#475569" }}
            />
          </g>

          {/* Streetlight 2: Middle */}
          <g transform="translate(540, 420)">
            <line x1="0" y1="0" x2="0" y2="80" stroke="#334155" strokeWidth="3" />
            <path d="M -6 0 L 6 0 L 4 -6 L -4 -6 Z" fill="#1e293b" />
            {/* Glow Cone */}
            <motion.polygon
              points="0,0 -40,80 40,80"
              fill="url(#streetlightCone)"
              initial={{ opacity: 0 }}
              animate={{ opacity: activeSector >= 2 ? 0.95 : 0 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none"
            />
            <motion.circle
              cx="0" cy="1" r="3.5"
              animate={{ fill: activeSector >= 2 ? "#fef08a" : "#475569" }}
            />
          </g>

          {/* Streetlight 3: Right */}
          <g transform="translate(860, 430)">
            <line x1="0" y1="0" x2="0" y2="70" stroke="#334155" strokeWidth="3" />
            <path d="M -6 0 L 6 0 L 4 -6 L -4 -6 Z" fill="#1e293b" />
            {/* Glow Cone */}
            <motion.polygon
              points="0,0 -35,70 35,70"
              fill="url(#streetlightCone)"
              initial={{ opacity: 0 }}
              animate={{ opacity: activeSector >= 3 ? 0.9 : 0 }}
              transition={{ duration: 0.6 }}
              className="pointer-events-none"
            />
            <motion.circle
              cx="0" cy="1" r="3.5"
              animate={{ fill: activeSector >= 3 ? "#fef08a" : "#475569" }}
            />
          </g>
        </g>

        {/* LAYER 6: CYCLISTS & PEDESTRIANS GENTLY CROSSING */}
        <g>
          {/* Walker 1: In the park */}
          <motion.g
            initial={{ x: 400, y: 485 }}
            animate={{ x: [400, 480, 400] }}
            transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          >
            {/* Little styled vector dot figure */}
            <circle cx="0" cy="-8" r="3" fill="#f43f5e" />
            <line x1="0" y1="-5" x2="0" y2="1" stroke="#f43f5e" strokeWidth="2.5" />
            <line x1="-2" y1="2" x2="-2" y2="6" stroke="#f43f5e" strokeWidth="1.5" />
            <line x1="2" y1="2" x2="2" y2="6" stroke="#f43f5e" strokeWidth="1.5" />
          </motion.g>

          {/* Cyclist 2: Across the bike lane */}
          <motion.g
            initial={{ x: -20, y: 520 }}
            animate={{ x: 1040 }}
            transition={{ repeat: Infinity, duration: 22, ease: "linear", delay: 1 }}
          >
            <circle cx="0" cy="0" r="4.5" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <circle cx="12" cy="0" r="4.5" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="6" y2="-6" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="12" y1="0" x2="6" y2="-6" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="6" y1="-6" x2="10" y2="-12" stroke="#38bdf8" strokeWidth="1.5" />
            {/* Cyclist helmet */}
            <circle cx="10" cy="-14" r="2.5" fill="#fbbf24" />
          </motion.g>
        </g>

        {/* LAYER 7: SIGNATURE DYNAMIC CIVIC LOCATION MARKERS / PINS */}
        <g>
          {/* PIN 1: West Hill - Road Issue Flagged */}
          <motion.g
            transform="translate(140, 370)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: activeSector >= 0 ? 1 : 0,
              opacity: activeSector >= 0 ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 220, damping: 16 }}
          >
            <circle cx="0" cy="0" r="18" fill="none" stroke="#f59e0b" strokeWidth="1.5" className="animate-pulse" />
            <path d="M 0 0 C -8 -8 -8 -20 0 -20 C 8 -20 8 -8 0 0 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
            <circle cx="0" cy="-10" r="5" fill="#ffffff" />
            {/* Hammer / Wrench mini-representation */}
            <line x1="-2" y1="-12" x2="2" y2="-8" stroke="#f59e0b" strokeWidth="1.2" />
          </motion.g>

          {/* PIN 2: Central Park - Community Clean-up Vetted */}
          <motion.g
            transform="translate(480, 375)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: activeSector >= 1 ? 1 : 0,
              opacity: activeSector >= 1 ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.2 }}
          >
            <circle cx="0" cy="0" r="18" fill="none" stroke="#10b981" strokeWidth="1.5" className="animate-pulse" />
            <path d="M 0 0 C -8 -8 -8 -20 0 -20 C 8 -20 8 -8 0 0 Z" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
            <circle cx="0" cy="-10" r="5" fill="#ffffff" />
            <path d="M -2 -10 L -1 -9 L 2 -12" fill="none" stroke="#10b981" strokeWidth="1.2" strokeLinecap="round" />
          </motion.g>

          {/* PIN 3: Administrative Hub - Open Ledger Assigned */}
          <motion.g
            transform="translate(820, 355)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: activeSector >= 2 ? 1 : 0,
              opacity: activeSector >= 2 ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.4 }}
          >
            <circle cx="0" cy="0" r="18" fill="none" stroke="#3b82f6" strokeWidth="1.5" className="animate-pulse" />
            <path d="M 0 0 C -8 -8 -8 -20 0 -20 C 8 -20 8 -8 0 0 Z" fill="#3b82f6" stroke="#ffffff" strokeWidth="1" />
            <circle cx="0" cy="-10" r="5" fill="#ffffff" />
            {/* Small document representation */}
            <rect x="-1.5" y="-12" width="3" height="4" fill="#3b82f6" />
          </motion.g>
        </g>

        {/* FLIGHT SPLINE FOR THE PAPER AIRPLANE */}
        <path
          id="airplaneBezier"
          d="M -50 200 C 200 280, 420 180, 680 260 T 1050 220"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth="3"
          strokeDasharray="6 6"
        />

        {/* THE GLIDING PAPER AIRPLANE (Tracing gracefully in coordinate waves) */}
        {/* We animate coordinate states sequentially to simulate constant flight */}
        <motion.g
          animate={{
            x: [-50, 150, 420, 680, 920, 1050],
            y: [200, 240, 160, 230, 180, 190],
            rotate: [15, 8, -12, 18, -5, 10]
          }}
          transition={{
            repeat: Infinity,
            duration: 18, // Extra slow, peaceful glide speed
            ease: "easeInOut"
          }}
        >
          {/* Paper airplane polygons with subtle metallic shadow/glare values */}
          <polygon points="0,0 -18,-6 -14,4" fill="#ffffff" filter="url(#softShadow)" />
          <polygon points="0,0 -14,4 -18,9" fill="#cbd5e1" />
          <polygon points="0,0 -18,-6 -18,9" fill="#f8fafc" />

          {/* Sparkling tail dust following the glides */}
          <motion.circle cx="-22" cy="1" r="1.5" fill="#ffffff" animate={{ opacity: [1, 0], scale: [1, 0.2] }} transition={{ repeat: Infinity, duration: 0.9 }} />
          <motion.circle cx="-28" cy="-3" r="1" fill="#fef08a" animate={{ opacity: [1, 0], scale: [1, 0.2] }} transition={{ repeat: Infinity, duration: 1.1, delay: 0.1 }} />
        </motion.g>

        {/* Ambient floating sun dust/light particles */}
        <g opacity="0.45">
          <motion.circle cx="150" cy="280" r="1.5" fill="#ffffff" animate={{ y: [280, 260, 280], opacity: [0.3, 0.9, 0.3] }} transition={{ repeat: Infinity, duration: 6 }} />
          <motion.circle cx="320" cy="220" r="2" fill="#fef08a" animate={{ y: [220, 190, 220], opacity: [0.2, 0.8, 0.2] }} transition={{ repeat: Infinity, duration: 8, delay: 1 }} />
          <motion.circle cx="680" cy="290" r="1.5" fill="#ffffff" animate={{ y: [290, 310, 290], opacity: [0.4, 0.9, 0.4] }} transition={{ repeat: Infinity, duration: 7, delay: 2 }} />
          <motion.circle cx="850" cy="240" r="2.5" fill="#fef08a" animate={{ y: [240, 215, 240], opacity: [0.1, 0.7, 0.1] }} transition={{ repeat: Infinity, duration: 9, delay: 3.5 }} />
        </g>
      </svg>

      {/* FLOATING TEXT PANEL (Synchronized to explain the 4 active phases of CivicHero) */}
      <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-6 z-20 glass-panel p-5 rounded-[24px] max-w-full md:max-w-[340px] text-brand-primary shadow-lg border border-white/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSector}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold tracking-widest text-brand-secondary bg-brand-secondary/10 px-2 py-1 rounded-md">
                {sectorLabels[activeSector].tag}
              </span>
              <span className="font-mono text-[9px] font-bold text-slate-400">
                STAGE {activeSector + 1} OF 4
              </span>
            </div>

            <h3 className="font-sans font-bold text-sm text-brand-primary">
              {sectorLabels[activeSector].title}
            </h3>

            <p className="font-body text-xs text-brand-muted leading-relaxed">
              {sectorLabels[activeSector].desc}
            </p>

            {/* Seamless indicator track */}
            <div className="w-full h-[3px] bg-slate-100 rounded-full overflow-hidden mt-1">
              <motion.div
                className="h-full bg-brand-secondary rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 4.5, ease: "linear" }}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
