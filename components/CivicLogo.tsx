'use client';

import React from 'react';
import Link from 'next/link';

interface CivicLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'wordmark';
  theme?: 'dark' | 'light' | 'emerald';
  className?: string;
  href?: string;
  showTagline?: boolean;
}

const sizeConfig = {
  xs: { icon: 22, text: 'text-sm', tagline: 'text-[7px]' },
  sm: { icon: 30, text: 'text-base', tagline: 'text-[8px]' },
  md: { icon: 38, text: 'text-xl', tagline: 'text-[9px]' },
  lg: { icon: 48, text: 'text-2xl', tagline: 'text-[10px]' },
  xl: { icon: 64, text: 'text-4xl', tagline: 'text-[12px]' },
};

export function CivicEmblem({ size = 38, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      <defs>
        {/* Primary Shield Gradient */}
        <linearGradient id="ch-shield-grad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>

        {/* Dynamic Vibrant Emerald Beam */}
        <linearGradient id="ch-emerald-grad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Star & Beacon Spark Gradient */}
        <linearGradient id="ch-spark-grad" x1="24" y1="6" x2="24" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Subtle drop shadow filter */}
        <filter id="ch-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#10b981" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Hex-Shield Shell */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#ch-shield-grad)"
        stroke="#334155"
        strokeWidth="1.5"
      />

      {/* Internal Civic Pillars (Interlocking Arch of Public Trust) */}
      <path
        d="M13 32V21C13 15.4772 17.4772 11 23 11H25C30.5228 11 35 15.4772 35 21V32"
        stroke="#475569"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Central Hero Pillar & Keystone (Emerald Ascending Node) */}
      <path
        d="M24 10L29 18H19L24 10Z"
        fill="url(#ch-spark-grad)"
        filter="url(#ch-glow)"
      />

      <path
        d="M24 18V36"
        stroke="url(#ch-emerald-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* Horizontal Bridge / Mutual Verification Bar */}
      <path
        d="M16 26H32"
        stroke="url(#ch-emerald-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Bottom Foundation Baseline */}
      <path
        d="M12 36H36"
        stroke="#64748b"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Radiant Apex Star Dot */}
      <circle cx="24" cy="7" r="1.75" fill="#38bdf8" />
    </svg>
  );
}

export function CivicWordmark({
  size = 'md',
  theme = 'light',
  showTagline = true,
  className = '',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'dark' | 'light' | 'emerald';
  showTagline?: boolean;
  className?: string;
}) {
  const current = sizeConfig[size];

  const primaryTextColor =
    theme === 'dark'
      ? 'text-white'
      : theme === 'emerald'
      ? 'text-emerald-950'
      : 'text-slate-900';

  const secondaryTextColor = 'text-emerald-600';

  const taglineColor =
    theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`flex flex-col leading-none select-none ${className}`}>
      <div className="flex items-baseline tracking-tight">
        <span className={`font-sans font-extrabold ${current.text} ${primaryTextColor}`}>
          Civic
        </span>
        <span className={`font-sans font-extrabold ${current.text} ${secondaryTextColor} ml-0.5`}>
          Hero
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1 mb-0.5" />
      </div>

      {showTagline && (
        <span
          className={`font-mono font-bold uppercase tracking-[0.2em] ${current.tagline} ${taglineColor} mt-1`}
        >
          Trust Ledger
        </span>
      )}
    </div>
  );
}

export default function CivicLogo({
  size = 'md',
  variant = 'full',
  theme = 'light',
  className = '',
  href,
  showTagline = true,
}: CivicLogoProps) {
  const current = sizeConfig[size];

  const content = (
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      {variant !== 'wordmark' && <CivicEmblem size={current.icon} />}
      {variant !== 'icon' && (
        <CivicWordmark size={size} theme={theme} showTagline={showTagline} />
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-xl">
        {content}
      </Link>
    );
  }

  return content;
}
