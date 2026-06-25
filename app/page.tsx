'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Camera,
  Cpu,
  Users,
  Clock,
  Landmark,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import Header from '../components/Header';
import LivingCity from '../components/LivingCity';
import JourneyNarrative from '../components/JourneyNarrative';
import Footer from '../components/Footer';

export default function Page() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Dynamic light blur elements to establish high-end depth */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-brand-secondary/10 via-brand-primary/5 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[400px] left-0 w-[400px] h-[400px] bg-gradient-to-tr from-brand-accent/5 via-brand-primary/5 to-transparent blur-3xl rounded-full pointer-events-none -z-10" />

      {/* Header component */}
      <Header />

      {/* Hero Section */}
      <main className="pt-28 md:pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <motion.div
          className="text-center max-w-4xl mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Subtle branding label */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-1.5 bg-brand-primary/5 border border-brand-primary/10 px-4 py-1.5 rounded-full text-brand-primary text-xs font-mono font-bold tracking-wider mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-secondary animate-pulse-slow" />
            REDEFINING HYPERLOCAL INFRASTRUCTURE
          </motion.div>

          {/* Primary Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-sans font-extrabold text-4xl sm:text-5xl md:text-6xl text-brand-primary tracking-tight leading-[1.1] mb-6"
          >
            Communities become stronger when{' '}
            <span className="text-gradient font-black relative">
              every voice is visible.
            </span>
          </motion.h1>

          {/* Supporting paragraph */}
          <motion.p
            variants={itemVariants}
            className="font-body text-base sm:text-lg text-brand-muted leading-relaxed max-w-3xl mx-auto mb-10"
          >
            CivicHero is a transparent civic operating system built on trust and evidence. We connect citizens directly with city administration to coordinate on repairs, verify resolution, and build public trust. Together, we identify and resolve <strong>unsafe roads</strong>, <strong>damaged public infrastructure</strong>, <strong>water leakage</strong>, <strong>waste management</strong>, and <strong>public safety hazards</strong> with absolute visibility.
          </motion.p>

          {/* Action buttons with custom routes */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <motion.a
              href="/citizen"
              className="w-full sm:w-auto px-8 py-4 bg-brand-primary hover:bg-brand-primary-container text-white font-mono text-xs font-bold rounded-2xl shadow-lg shadow-brand-primary/20 flex items-center justify-center gap-2 group transition-all duration-300 border border-brand-primary/10"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Enter as Citizen
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </motion.a>

            <motion.a
              href="/admin"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-brand-warm text-brand-primary font-mono text-xs font-bold rounded-2xl shadow-sm hover:shadow-md border border-slate-200/60 flex items-center justify-center gap-2 group transition-all duration-300"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Shield className="w-4 h-4 text-brand-secondary group-hover:rotate-12 transition-transform duration-300" />
              Enter as Administrator
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Living city illustration stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, type: 'spring', stiffness: 60 }}
          className="w-full"
        >
          <LivingCity />
        </motion.div>
      </main>

      {/* Visual Narrative section (The Journey) */}
      <section id="mission" className="py-24 bg-gradient-to-b from-transparent to-brand-warm/60 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="font-mono text-xs font-bold tracking-widest text-brand-secondary bg-brand-secondary/10 px-3 py-1 rounded-full uppercase">
              JOURNEY ENGINE
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-brand-primary mt-4 mb-4 tracking-tight">
              The Lifecycle of a Civic Action
            </h2>
            <p className="font-body text-sm text-brand-muted leading-relaxed">
              A seamless journey from initial observation to verified community trust. Experience how we process each issue with immutable clarity.
            </p>
          </div>

          {/* Connected timeline steps flow */}
          <JourneyNarrative />
        </div>
      </section>

      {/* System Capabilities Section */}
      <section id="insights" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="font-mono text-xs font-bold tracking-widest text-brand-primary bg-brand-primary/5 px-3 py-1 rounded-full uppercase">
              SYSTEM CAPABILITIES
            </span>
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-brand-primary mt-4 mb-4 tracking-tight">
              Empowering the Future of Governance
            </h2>
            <p className="font-body text-sm text-brand-muted leading-relaxed">
              Advanced technology meets human-centric design to create a more resilient, responsive community.
            </p>
          </div>

          {/* Grid layout with soft card styles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Visual Reporting Card */}
            <motion.div
              className="rounded-[2.5rem] p-8 bg-brand-warm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:border-brand-primary/10 transition-all duration-300 relative group overflow-hidden"
              whileHover={{ y: -6 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-secondary/5 to-transparent blur-xl rounded-full" />
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-slate-100/50 group-hover:scale-110 transition-transform duration-300">
                  <Camera className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-sans font-bold text-xl text-brand-primary mb-3">
                  Visual Evidence Logging
                </h3>
                <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed">
                  Avoid vague paper forms. Submission includes cryptographic geoproofs and tamper-resistant timestamps directly from our smart mobile camera, delivering immediate verifiable truth.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-brand-secondary font-mono text-xs font-bold cursor-pointer">
                <span>View evidence ledger</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* AI Understanding Card */}
            <motion.div
              className="rounded-[2.5rem] p-8 bg-brand-primary text-white flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              whileHover={{ y: -6 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 blur-2xl rounded-full" />
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-sans font-bold text-xl text-white mb-3">
                  Intelligent Direct Dispatching
                </h3>
                <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Decentralized classification logic automatically parses photos to evaluate structural severity, predict traffic bottlenecks, and route requests instantly to matching civil engineering queues.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-white/80 hover:text-white font-mono text-xs font-bold cursor-pointer">
                <span>Explore classification model</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Community Consensus Verification */}
            <motion.div
              className="rounded-[2.5rem] p-8 bg-brand-secondary text-white flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
              whileHover={{ y: -6 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-white/5 blur-2xl rounded-full" />
              <div>
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-sans font-bold text-xl text-white mb-3">
                  Vibrant Mutual Consensus
                </h3>
                <p className="font-body text-xs sm:text-sm text-emerald-100 leading-relaxed">
                  Prevent spam and priority manipulation. Other residents co-sign local issues, creating democratic demand scores. The administrative priority queue updates purely in response to consensus.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-white/80 hover:text-white font-mono text-xs font-bold cursor-pointer">
                <span>Review consensus guidelines</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>

            {/* Transparent Timeline Ledger */}
            <motion.div
              className="rounded-[2.5rem] p-8 bg-brand-warm border border-slate-100 flex flex-col justify-between hover:shadow-xl hover:border-brand-primary/10 transition-all duration-300 relative group overflow-hidden"
              whileHover={{ y: -6 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-primary/5 to-transparent blur-xl rounded-full" />
              <div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 border border-slate-100/50 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-5 h-5 text-brand-primary" />
                </div>
                <h3 className="font-sans font-bold text-xl text-brand-primary mb-3">
                  Immutable Timeline Ledgers
                </h3>
                <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed">
                  Every comment, work invoice, schedule adjustment, and final photo verification is etched onto a transparent audit log. No closed-door decisions, no forgotten reports. Complete accountability.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-brand-secondary font-mono text-xs font-bold cursor-pointer">
                <span>Audit open timeline records</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Map Segment / Closing Call to Action */}
      <section id="trust-map" className="py-24 bg-brand-warm/30 relative">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <Compass className="w-10 h-10 text-brand-secondary mx-auto mb-6 animate-float" />
            <h2 className="font-sans font-extrabold text-3xl sm:text-4xl text-brand-primary tracking-tight mb-4">
              Restoring the Social Contract
            </h2>
            <p className="font-body text-sm sm:text-base text-brand-muted leading-relaxed">
              We believe a town becomes a community when citizens can see their contributions matter. Join CivicHero as we lay the foundation of a modern, open-source city governance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.a
              href="/citizen"
              className="w-full sm:w-auto px-8 py-4 bg-brand-secondary hover:bg-[#005c3d] text-white font-mono text-xs font-bold rounded-2xl shadow-lg shadow-brand-secondary/15 flex items-center justify-center gap-2 group transition-all duration-300 border border-brand-secondary/10"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Started as Citizen
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
            </motion.a>
          </div>
        </div>
      </section>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
