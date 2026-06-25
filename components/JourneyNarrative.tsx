'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Eye,
  Camera,
  Users,
  Cpu,
  Wrench,
  ThumbsUp,
  Heart,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Layers
} from 'lucide-react';

interface Step {
  id: number;
  label: string;
  subLabel: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  bgGlow: string;
}

export default function JourneyNarrative() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps: Step[] = [
    {
      id: 1,
      label: "SEE AN ISSUE",
      subLabel: "PRESENCE",
      title: "Hyperlocal Awareness",
      description: "A community member encounters a critical civic issue—a damaged street, faulty signal, waste block, or safety hazard.",
      icon: <Eye className="w-5 h-5 text-brand-text" />,
      colorClass: "bg-amber-100 text-amber-900 border-amber-200",
      bgGlow: "from-amber-500/10 to-transparent",
    },
    {
      id: 2,
      label: "REPORT",
      subLabel: "INTAKE",
      title: "Verifiable Capture",
      description: "A 10-second capture creates a tamper-proof geotagged submission, establishing indisputable digital evidence.",
      icon: <Camera className="w-5 h-5 text-brand-text" />,
      colorClass: "bg-blue-100 text-blue-900 border-blue-200",
      bgGlow: "from-blue-500/10 to-transparent",
    },
    {
      id: 3,
      label: "COMMUNITY VERIFICATION",
      subLabel: "CONSENSUS",
      title: "Democratic Consensus",
      description: "Local residents review and upvote reports, vetting accuracy and ranking communal priorities in real time.",
      icon: <Users className="w-5 h-5 text-brand-text" />,
      colorClass: "bg-emerald-100 text-emerald-900 border-emerald-200",
      bgGlow: "from-emerald-500/10 to-transparent",
    },
    {
      id: 4,
      label: "AI UNDERSTANDING",
      subLabel: "CLASSIFICATION",
      title: "Semantic Routing",
      description: "Under the hood, intelligent categorizers map issues, gauge emergency risks, and stream tasks to correct municipal channels.",
      icon: <Cpu className="w-5 h-5 text-brand-text" />,
      colorClass: "bg-purple-100 text-purple-900 border-purple-200",
      bgGlow: "from-purple-500/10 to-transparent",
    },
    {
      id: 5,
      label: "ADMINISTRATIVE ACTION",
      subLabel: "RESOLUTION",
      title: "Public Accountability",
      description: "City administrators and field technicians are assigned transparent work orders with open, publicly trackable repair logs.",
      icon: <Wrench className="w-5 h-5 text-brand-text" />,
      colorClass: "bg-orange-100 text-orange-900 border-orange-200",
      bgGlow: "from-orange-500/10 to-transparent",
    },
    {
      id: 6,
      label: "COMMUNITY CONFIRMATION",
      subLabel: "SIGN-OFF",
      title: "The Final Handshake",
      description: "Repairs are validated directly by the original reporter and community before being officially closed out.",
      icon: <ThumbsUp className="w-5 h-5 text-brand-text" />,
      colorClass: "bg-teal-100 text-teal-900 border-teal-200",
      bgGlow: "from-teal-500/10 to-transparent",
    },
    {
      id: 7,
      label: "TRUST THROUGH TRANSPARENCY",
      subLabel: "LEGACY",
      title: "Durable Civic Cohesion",
      description: "An open ledger of collaborative actions nurtures long-term transparency and strengthens the civic contract.",
      icon: <Heart className="w-5 h-5 text-white" />,
      colorClass: "bg-brand-secondary text-white border-brand-secondary-container",
      bgGlow: "from-brand-secondary/20 to-transparent",
    }
  ];

  return (
    <div className="w-full">
      {/* Decorative background gradients for the section */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-4/5 h-96 bg-gradient-to-tr from-brand-secondary/5 via-brand-primary/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Structured Journey Columns */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6 z-10">
        {steps.map((step, index) => {
          const isHovered = hoveredStep === step.id;
          const isNextHovered = hoveredStep === step.id + 1;
          const isPrevHovered = hoveredStep === step.id - 1;

          return (
            <motion.div
              key={step.id}
              className="relative flex flex-col h-full group"
              onMouseEnter={() => setHoveredStep(step.id)}
              onMouseLeave={() => setHoveredStep(null)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Connector line on desktop */}
              {index < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(100%-8px)] right-[-16px] h-[2px] hidden lg:block z-0 pointer-events-none">
                  <svg className="w-full h-full overflow-visible">
                    <line
                      x1="0"
                      y1="0"
                      x2="24"
                      y2="0"
                      stroke={isHovered || isNextHovered ? "var(--color-brand-secondary)" : "#e2e8f0"}
                      strokeWidth={isHovered || isNextHovered ? "3" : "1.5"}
                      strokeDasharray={(isHovered || isNextHovered) ? "none" : "4 4"}
                      className="transition-all duration-300"
                    />
                    {(isHovered || isNextHovered) && (
                      <motion.circle
                        cx="0"
                        cy="0"
                        r="3"
                        fill="var(--color-brand-secondary)"
                        animate={{ cx: [0, 24] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                    )}
                  </svg>
                </div>
              )}

              {/* Step Card */}
              <div
                className={`flex-1 flex flex-col p-6 rounded-3xl transition-all duration-300 relative z-10 h-full border ${
                  isHovered
                    ? 'border-brand-primary/30 shadow-xl -translate-y-2 bg-white'
                    : 'border-slate-100 shadow-sm bg-brand-warm/60 backdrop-blur-sm'
                }`}
              >
                {/* Micro Ambient Glow behind step icon on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none`} />

                {/* Header Tag / Phase index */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-brand-muted">
                    PHASE {index + 1}
                  </span>
                  <div className={`w-3 h-3 rounded-full flex items-center justify-center ${isHovered ? 'bg-brand-secondary scale-110' : 'bg-slate-200'} transition-all duration-300`}>
                    {isHovered && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                  </div>
                </div>

                {/* Elegant Circular Icon container */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 border transition-all duration-300 ${
                  isHovered ? 'scale-110 bg-brand-primary/5 border-brand-primary/10' : 'bg-white border-slate-100'
                }`}>
                  {step.icon}
                </div>

                {/* Titles */}
                <div className="mb-3">
                  <h4 className="font-sans font-bold text-xs tracking-wider text-brand-secondary uppercase mb-1">
                    {step.label}
                  </h4>
                  <p className="font-sans font-semibold text-sm text-brand-primary leading-tight">
                    {step.title}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-slate-100 my-3" />

                {/* Decriptive Paragraph */}
                <p className="font-body text-xs text-brand-muted leading-relaxed">
                  {step.description}
                </p>

                {/* Meta sub-label at footer of card */}
                <div className="mt-auto pt-4 flex items-center gap-1.5">
                  <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 bg-slate-50 border border-slate-100/50 px-2 py-0.5 rounded">
                    {step.subLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Call to action connecting to community philosophy */}
      <motion.div
        className="mt-12 p-8 rounded-[2rem] border border-white/50 glass-panel max-w-3xl mx-auto text-center z-10 relative shadow-sm"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <span className="inline-flex items-center gap-1.5 bg-brand-secondary/10 px-3 py-1 rounded-full text-brand-secondary text-xs font-semibold tracking-wider mb-4">
          <Layers className="w-3.5 h-3.5" /> DECENTRALIZED INFRASTRUCTURE
        </span>
        <h3 className="font-sans font-bold text-xl text-brand-primary mb-3">
          A Shared Ledger of Local Progress
        </h3>
        <p className="font-body text-sm text-brand-muted leading-relaxed max-w-2xl mx-auto">
          By structuring civic actions into an immutable, verifiable progression, we completely eliminate municipal opacity. Citizens gain visibility into exact schedules, while administrators earn trusted proof of work.
        </p>
      </motion.div>
    </div>
  );
}
