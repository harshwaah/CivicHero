'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  CheckCircle, 
  Edit, 
  ShieldCheck, 
  Info, 
  X,
  FileText,
  Trash2,
  Check,
  AlertOctagon,
  Eye,
  BookmarkCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import AISummaryCard from '@/components/AISummaryCard';

// 5 premium, realistic preset cases to allow a gorgeous simulated reporting experience
interface PresetOption {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: string;
  imageUrl: string;
  aiSummary: string;
  confidence: number;
  categoryMatch: string;
  severityMatch: string;
  routingTo: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'preset-pothole',
    title: 'Large expanding pothole in center lane',
    description: 'A deep, widening pothole has formed in the middle of the road. It is causing vehicles to swerve suddenly, which is extremely dangerous, especially for bicycles and motorcycles.',
    location: '842 Oak Ridge Drive, Site B',
    category: 'Roads',
    urgency: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Computer vision analysis confirms road surface cavitation. Deep crater measures ~35cm in diameter posing a structural tire hazard. Proximity to Oakwood school bus lane increases risk.',
    confidence: 96,
    categoryMatch: 'Road Surface Defect',
    severityMatch: 'High Priority Response',
    routingTo: 'Public Works - Road Maintenance'
  },
  {
    id: 'preset-tree',
    title: 'Collapsed tree limb blocking sidewalk',
    description: 'A massive branch from an oak tree has broken off and is completely blocking the sidewalk and bike lane. Pedestrians have to step into the street to get around it.',
    location: 'Cloverdale Road, near bridge',
    category: 'Roads',
    urgency: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Large deciduous tree branch collapsed across sidewalk and bike lane. Blocks transit flow. Forwarded to forestry division.',
    confidence: 92,
    categoryMatch: 'Debris & Tree Fall',
    severityMatch: 'Medium Priority Response',
    routingTo: 'Forestry & Parks Division'
  },
  {
    id: 'preset-water',
    title: 'Water main spraying onto walkway',
    description: 'Water is bubbling up rapidly from under the sidewalk pavement, creating a mini geyser and flooding the pedestrian walkway. Water is starting to flow into adjacent basements.',
    location: '142 Pine Crest Dr.',
    category: 'Water',
    urgency: 'Critical',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'High pressure hydraulic rupture creating sidewalk flooding. Liquid is clean water, indicative of potable water distribution line break. Critical priority dispatched.',
    confidence: 98,
    categoryMatch: 'Water Main Rupture',
    severityMatch: 'Critical Priority Response',
    routingTo: 'Water Safety & Utilities Dept'
  },
  {
    id: 'preset-streetlight',
    title: 'Broken streetlight lamp post',
    description: 'The streetlight post at the corner of Elm Street is completely dead. The entire intersection is pitch black at night, making it very unsafe for students walking home.',
    location: 'Elm St & 4th Avenue',
    category: 'Utilities',
    urgency: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Complete blackout of smart lighting terminal. Corresponds with local utility node voltage diagnostic failure. Routed to grid operations for microcontroller replacement.',
    confidence: 94,
    categoryMatch: 'Street Lighting Utility',
    severityMatch: 'Low Priority Response',
    routingTo: 'Smart Grid & Utilities Office'
  },
  {
    id: 'preset-trash',
    title: 'Overflowing park garbage bin',
    description: 'The public waste bins are overflowing with trash bags, loose plastics, and cardboard. Wind is spreading litter across the lawn and towards the storm drain.',
    location: 'Civic Plaza Boulevard',
    category: 'Environment',
    urgency: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Public street waste receptacle overflow. Loose plastics spreading into public storm drain. Recommended sanitation route dynamic collector redirect.',
    confidence: 89,
    categoryMatch: 'Sanitation / Waste Management',
    severityMatch: 'Medium Priority Response',
    routingTo: 'Sanitation & Waste Management'
  }
];

const CATEGORIES = ['Roads', 'Utilities', 'Water', 'Safety', 'Environment', 'Animals'];
const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export default function CitizenReportFlowPage() {
  const router = useRouter();

  // Primary input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [category, setCategory] = useState('Roads');
  const [urgency, setUrgency] = useState('Medium');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Flow State
  // Flow State (report | review | analysis | submit | success)
  const [step, setStep] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('step') || 'report';
    }
    return 'report';
  });
  
  // Custom camera selection modal
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [hasAutofilled, setHasAutofilled] = useState(false);

  // AI Scanning animations states
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanningComplete, setScanningComplete] = useState(false);

  // Mock dynamic report results
  const [mockReportId, setMockReportId] = useState(() => {
    return `CH-${Math.floor(10000 + Math.random() * 90000)}`;
  });

  // Synchronize state with search query for deep-linked browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.step) {
        setStep(event.state.step);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const urlStep = urlParams.get('step') || 'report';
        setStep(urlStep);
      }
    };

    // Ensure we replace state on mount so history back-navigation contains valid states
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlStep = urlParams.get('step') || 'report';
      window.history.replaceState({ step: urlStep }, '', window.location.pathname + window.location.search);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToStep = (newStep: string) => {
    setStep(newStep);
    
    // Clear scanning states when triggering new AI diagnostics
    if (newStep === 'analysis') {
      setScanProgress(0);
      setScanLogs([]);
      setScanningComplete(false);
    } else if (newStep === 'report') {
      // Regenerate dynamic mock case ID
      setMockReportId(`CH-${Math.floor(10000 + Math.random() * 90000)}`);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('step', newStep);
    window.history.pushState({ step: newStep }, '', url.pathname + url.search);
  };

  // Preset Selection / Autofill Handler
  const handleSelectPreset = (preset: PresetOption) => {
    setSelectedImage(preset.imageUrl);
    setTitle(preset.title);
    setDescription(preset.description);
    setLocationValue(preset.location);
    setCategory(preset.category);
    setUrgency(preset.urgency);
    setHasAutofilled(true);
    setIsGalleryOpen(false);
  };

  // AI scan simulation logic - runs ONLY when active step is 'analysis'
  useEffect(() => {
    if (step !== 'analysis') {
      return;
    }

    const logs = [
      '[SECURE] Initializing hardware-accelerated telemetry...',
      '[IMAGE] Running Convolutional Neural Network edge classification...',
      '[GEOPROOF] Resolving GIS coordinates on municipal grid...',
      '[DUPLICATE] Querying nearby spatial cluster registers...',
      '[CLASSIFY] Automatic category and severity routing finalized.'
    ];

    let progress = 0;
    let logIndex = 0;

    const interval = setInterval(() => {
      progress += 5;
      if (progress > 100) progress = 100;
      setScanProgress(progress);

      // Add logs dynamically as progress advances
      if (progress >= 20 && logIndex === 0) {
        setScanLogs(prev => [...prev, logs[0]]);
        logIndex++;
      } else if (progress >= 40 && logIndex === 1) {
        setScanLogs(prev => [...prev, logs[1]]);
        logIndex++;
      } else if (progress >= 60 && logIndex === 2) {
        setScanLogs(prev => [...prev, logs[2]]);
        logIndex++;
      } else if (progress >= 85 && logIndex === 3) {
        setScanLogs(prev => [...prev, logs[3]]);
        logIndex++;
      } else if (progress === 100 && logIndex === 4) {
        setScanLogs(prev => [...prev, logs[4]]);
        logIndex++;
        setScanningComplete(true);
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [step]);

  // Determine standard custom values or fallback if user edited manually
  const getAiResults = (): PresetOption => {
    // If we have an autofilled image, match that preset
    const matchingPreset = PRESET_OPTIONS.find(p => p.imageUrl === selectedImage);
    if (matchingPreset) {
      return matchingPreset;
    }

    // Default fallbacks based on selected category
    const result: PresetOption = {
      id: 'custom-case',
      title: title || 'Custom Incident Report',
      description: description || 'No secondary details provided.',
      location: locationValue || 'Unknown Location Point',
      category: category,
      urgency: urgency,
      imageUrl: selectedImage || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=640&q=80',
      aiSummary: `Visual classification evaluated a generic ${category.toLowerCase()} report. Severity prioritized to match the ${urgency.toLowerCase()} urgency standard.`,
      confidence: 90,
      categoryMatch: `${category} Issue`,
      severityMatch: `${urgency} Priority Response`,
      routingTo: category === 'Roads' ? 'Public Works - Roads' :
                 category === 'Water' ? 'Water Safety & Utilities' :
                 category === 'Utilities' ? 'Smart Grid & Lighting Office' :
                 category === 'Safety' ? 'Emergency Dispatch Central' :
                 category === 'Environment' ? 'Sanitation & Waste' : 'Civic Safety Commission'
    };

    return result;
  };

  const aiResults = getAiResults();

  // Status Classes helper
  const getUrgencyBadgeColor = (urg: string) => {
    switch (urg) {
      case 'Critical': return 'bg-red-500 text-white border-red-600';
      case 'High': return 'bg-orange-500 text-white border-orange-600';
      case 'Medium': return 'bg-amber-500 text-white border-amber-600';
      default: return 'bg-blue-500 text-white border-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-brand-primary pb-24 relative selection:bg-brand-secondary selection:text-brand-primary">
      
      {/* GLOBAL GLASS HEADER BAR */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (step === 'report') {
                  router.push('/citizen');
                } else if (step === 'review') {
                  goToStep('report');
                } else if (step === 'analysis') {
                  goToStep('review');
                } else if (step === 'submit') {
                  goToStep('report');
                } else if (step === 'success') {
                  router.push('/citizen');
                }
              }}
              className="p-2.5 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors flex items-center justify-center text-brand-primary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="font-mono text-[9px] font-extrabold text-slate-400 tracking-wider uppercase">SECURE REPORT REGISTRY</span>
              <h1 className="font-sans font-extrabold text-sm text-brand-primary tracking-tight">
                {step === 'report' && 'Initiate Case File'}
                {step === 'review' && 'Review Evidence'}
                {step === 'analysis' && 'Cognitive Machine Analysis'}
                {step === 'submit' && 'Final Verification Ledger'}
                {step === 'success' && 'Ledger Entry Anchored'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              STEP {step === 'report' ? '1' : step === 'review' ? '2' : step === 'analysis' ? '3' : step === 'submit' ? '4' : '5'} OF 5
            </span>
          </div>
        </div>
      </header>

      {/* CORE DISPLAY STAGE */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          
          {/* ================= STEP 1: REPORT SCREEN ================= */}
          {step === 'report' && (
            <motion.div
              key="step-report"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                
                {/* Intro block */}
                <div>
                  <h2 className="font-sans font-extrabold text-xl sm:text-2xl tracking-tight text-brand-primary">
                    Capture & Geoproof Neighbor Incidents
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed mt-1">
                    Describe the neighborhood concern and provide photographic proof. The CivicHero AI engine will automatically scan structural integrity and map it to dispatch queues.
                  </p>
                </div>

                {/* Simulated File upload & camera card */}
                <div>
                  <label className="block font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2">
                    EVIDENCE PHOTO ATTACHMENT
                  </label>
                  
                  {selectedImage ? (
                    <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-200 group">
                      <Image
                        src={selectedImage}
                        alt="Evidence Preview"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/30 transition-colors" />
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsGalleryOpen(true)}
                          className="px-3 py-1.5 rounded-xl bg-white text-[10px] font-mono font-bold uppercase text-brand-primary border border-slate-200 shadow-md hover:bg-slate-50 transition-colors flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Swap Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setHasAutofilled(false);
                          }}
                          className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-mono text-white font-semibold tracking-wider">
                        IMAGE CAPTURED • GIS LOC REGISTERED
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Fake camera button */}
                      <button
                        type="button"
                        onClick={() => setIsGalleryOpen(true)}
                        className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 hover:bg-slate-50/85 transition-all duration-200 group h-44"
                      >
                        <div className="w-11 h-11 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                          <Camera className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div>
                          <span className="font-sans font-bold text-xs text-brand-primary block">
                            Simulate Camera Capture
                          </span>
                          <span className="font-body text-[10px] text-slate-400 mt-1 block leading-tight">
                            Leverage standard device lens parameters
                          </span>
                        </div>
                      </button>

                      {/* Fake upload button */}
                      <button
                        type="button"
                        onClick={() => setIsGalleryOpen(true)}
                        className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 bg-slate-50/50 hover:bg-slate-50/85 transition-all duration-200 group h-44"
                      >
                        <div className="w-11 h-11 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                          <Upload className="w-5 h-5 text-brand-secondary" />
                        </div>
                        <div>
                          <span className="font-sans font-bold text-xs text-brand-primary block">
                            Upload Local Evidence
                          </span>
                          <span className="font-body text-[10px] text-slate-400 mt-1 block leading-tight">
                            Select PNG, JPG, or cellular video logs
                          </span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                {/* Form fields */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  
                  {/* Issue Title */}
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      ISSUE TITLE
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Collapsed sewer grate near intersection"
                      className="w-full bg-slate-50/50 border border-slate-150 rounded-2xl p-4 font-sans text-xs sm:text-sm text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Narrative Description */}
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      NARRATIVE DESCRIPTION
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Provide secondary visual identifiers, depth, width, impact on vehicles or local safety, or context..."
                      className="w-full min-h-[110px] bg-slate-50/50 border border-slate-150 rounded-2xl p-4 font-body text-xs sm:text-sm text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Location field */}
                  <div>
                    <label className="block font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                      GEOSPATIAL LOCATION / ADDRESS
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={locationValue}
                        onChange={(e) => setLocationValue(e.target.value)}
                        placeholder="e.g., 421 President Street, Brooklyn"
                        className="w-full bg-slate-50/50 border border-slate-150 rounded-2xl py-4 pl-11 pr-4 font-sans text-xs sm:text-sm text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all font-medium"
                      />
                      <MapPin className="w-4 h-4 text-brand-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Urgency and Category selectors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    
                    {/* Category Selector */}
                    <div>
                      <label className="block font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        REPORT CATEGORY
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className={`py-2 rounded-xl border font-mono text-[9px] font-bold uppercase tracking-wider transition-all text-center ${
                              category === cat
                                ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                                : 'bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100 hover:text-brand-primary'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Urgency Selector */}
                    <div>
                      <label className="block font-mono text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        URGENCY INDEX
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {URGENCY_LEVELS.map((level) => {
                          const isActive = urgency === level;
                          let activeColors = 'bg-slate-800 text-white border-slate-800';
                          if (level === 'Critical') activeColors = 'bg-red-600 text-white border-red-600';
                          if (level === 'High') activeColors = 'bg-orange-500 text-white border-orange-500';
                          if (level === 'Medium') activeColors = 'bg-amber-500 text-white border-amber-500';
                          if (level === 'Low') activeColors = 'bg-blue-600 text-white border-blue-600';

                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => setUrgency(level)}
                              className={`py-2 rounded-xl border font-mono text-[9px] font-bold uppercase tracking-wider transition-all text-center ${
                                isActive
                                  ? `${activeColors} shadow-sm`
                                  : 'bg-slate-50 text-slate-500 border-slate-150 hover:bg-slate-100'
                              }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                </div>

                {/* Sticky Submitting area */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="font-mono text-[9px] text-slate-400 font-bold">PRE-SUBMISSION SANITIZER</span>
                    <span className="font-sans text-[10px] text-slate-500 block mt-0.5">
                      Clears metadata and registers local coordinates.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!title.trim()) {
                        alert('Please enter an issue title.');
                        return;
                      }
                      if (!selectedImage) {
                        alert('Please attach an evidence photo. Tip: Use "Simulate Camera Capture" to choose a preset.');
                        return;
                      }
                      goToStep('review');
                    }}
                    className={`px-6 py-3.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md ${
                      title.trim() && selectedImage
                        ? 'bg-brand-primary text-white hover:bg-brand-primary/95 hover:shadow-lg'
                        : 'bg-slate-100 text-slate-400 border border-slate-200/40 cursor-not-allowed'
                    }`}
                  >
                    <span>Analyze Evidence</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: REVIEW EVIDENCE SCREEN ================= */}
          {step === 'review' && (
            <motion.div
              key="step-review"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                
                {/* Intro block */}
                <div>
                  <h2 className="font-sans font-extrabold text-xl sm:text-2xl tracking-tight text-brand-primary">
                    Review Case Evidence
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed mt-1">
                    Confirm your submitted incident details before running the machine categorization model. Ensuring high precision builds public trust.
                  </p>
                </div>

                {/* Evidence Card Photo Review */}
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-150">
                  {selectedImage && (
                    <Image
                      src={selectedImage}
                      alt="Captured evidence"
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="font-mono text-[9px] font-bold uppercase text-brand-secondary bg-white px-2 py-0.5 rounded mr-2">
                      CAPTURED
                    </span>
                    <span className="font-sans font-bold text-xs drop-shadow-md">
                      {locationValue || 'Unmapped Location Point'}
                    </span>
                  </div>
                </div>

                {/* Key Information Details Stack */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">CASE TITLE</span>
                      <span className="font-sans font-bold text-sm text-brand-primary block mt-1">
                        {title}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">CATEGORY</span>
                        <span className="inline-block mt-1 font-mono text-[10px] font-bold text-brand-primary bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">
                          {category}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">URGENCY INDEX</span>
                        <span className={`inline-block mt-1 font-mono text-[10px] font-bold px-2.5 py-1 border rounded-md ${getUrgencyBadgeColor(urgency)}`}>
                          {urgency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">LOCATION COORDINATES</span>
                    <div className="flex items-center gap-1.5 text-brand-primary text-xs font-semibold mt-1">
                      <MapPin className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                      <span>{locationValue || 'No location point selected.'}</span>
                    </div>
                  </div>

                  <div>
                    <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">NARRATIVE</span>
                    <p className="font-body text-xs sm:text-sm text-brand-muted mt-1 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                      {description || 'No descriptive narrative written. The AI classifier will process visual proof directly.'}
                    </p>
                  </div>

                </div>

                {/* Review Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => goToStep('report')}
                    className="px-5 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep('analysis')}
                    className="px-6 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <Sparkles className="w-4 h-4 text-brand-secondary" />
                    <span>Run AI Diagnostics</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: AI ANALYSIS (DIAGNOSTICS SCREEN) ================= */}
          {step === 'analysis' && (
            <motion.div
              key="step-analysis"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              
              {/* Header Label block */}
              <div className="text-center py-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full font-mono text-[9px] font-bold text-amber-700 uppercase tracking-widest animate-pulse">
                  <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                  AI Analyzing
                </span>
                <h2 className="font-sans font-extrabold text-2xl tracking-tight text-brand-primary mt-2">
                  Reviewing Evidence
                </h2>
                <p className="font-body text-xs sm:text-sm text-brand-muted mt-1">
                  Processing image and text narrative for automated categorization and priority routing.
                </p>
              </div>

              {/* Laser Scanning Image Grid */}
              <div className="relative aspect-[16/10] sm:aspect-[21/10] w-full rounded-[28px] overflow-hidden border border-slate-100 shadow-lg group">
                {selectedImage && (
                  <Image
                    src={selectedImage}
                    alt="Scanning"
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                )}
                
                {/* Simulated laser scan overlay line */}
                {!scanningComplete && (
                  <>
                    <div className="absolute inset-x-0 h-1 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-10 animate-[bounce_3s_infinite_ease-in-out]" />
                    <div className="absolute inset-0 bg-amber-500/5 animate-pulse pointer-events-none" />
                  </>
                )}

                {/* Dark overlay with telemetry texts */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/20" />
                
                {/* Corner HUD labels */}
                <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 z-20">
                  <span className="font-mono text-[9px] font-bold text-brand-secondary uppercase tracking-widest block">
                    NEURAL CLASSIFIER v3.4
                  </span>
                </div>

                <div className="absolute top-4 right-4 bg-slate-950/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 z-20 font-mono text-[10px] text-white font-bold">
                  {scanProgress}% Processed
                </div>

                {/* Bottom Overlay displaying dynamic location check */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-20 bg-slate-950/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-secondary shrink-0" />
                    <div>
                      <span className="font-mono text-[8px] text-slate-400 font-bold block uppercase leading-none">LOCATION DETECTED</span>
                      <span className="font-sans font-bold text-[11px] text-white leading-tight mt-0.5 block">
                        {locationValue || 'Resolving GPS grid...'}
                      </span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>

              {/* Progress Terminal log list */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-inner font-mono text-[10px] text-slate-300 space-y-2.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block border-b border-slate-850 pb-2 mb-3">
                  SYSTEM DIAGNOSTIC LEDGER
                </span>
                
                {scanLogs.length === 0 && (
                  <span className="text-slate-500 italic">Starting machine intelligence pipelines...</span>
                )}
                
                {scanLogs.map((log, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2 text-slate-200"
                  >
                    <span className="text-brand-secondary font-bold">✓</span>
                    <span>{log}</span>
                  </motion.div>
                ))}

                {!scanningComplete && (
                  <div className="flex items-center gap-2 text-amber-500 animate-pulse mt-2 pt-2 border-t border-dashed border-slate-800">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    <span>Processing visual matrices...</span>
                  </div>
                )}
              </div>

              {/* Reveal result once processing finishes */}
              <AnimatePresence>
                {scanningComplete && (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                    className="space-y-6 pt-2"
                  >
                    {/* Render standard AISummaryCard */}
                    <AISummaryCard
                      summary={aiResults.aiSummary}
                      confidence={aiResults.confidence}
                      categoryMatch={aiResults.categoryMatch}
                      severityMatch={aiResults.severityMatch}
                      routingTo={aiResults.routingTo}
                    />

                    {/* Meta indicator row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Duplicate check card */}
                      <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100/40 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-xs text-brand-primary">Spatial Duplicate Check</h4>
                          <span className="font-mono text-[9px] text-emerald-800 font-extrabold block mt-0.5 uppercase">
                            No duplicates nearby
                          </span>
                          <p className="font-body text-[10px] text-brand-muted mt-1 leading-snug">
                            No reports referencing this hazard exist within a 150m geofence. Creating new unique docket file.
                          </p>
                        </div>
                      </div>

                      {/* AI Confidence tracker */}
                      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                          <Info className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-xs text-brand-primary">AI Classifier Metrics</h4>
                          <span className="font-mono text-[9px] text-slate-500 font-bold block mt-0.5 uppercase">
                            {aiResults.confidence}% MATCH RATING
                          </span>
                          <p className="font-body text-[10px] text-brand-muted mt-1 leading-snug">
                            High matching score validates visual cues against our neural model, removing human triage delays.
                          </p>
                        </div>
                      </div>

                    </div>

                    {/* Footer Actions */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                      <button
                        type="button"
                        onClick={() => goToStep('report')}
                        className="px-5 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Edit Details
                      </button>

                      <button
                        type="button"
                        onClick={() => goToStep('submit')}
                        className="px-6 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <span>Review Final Docket</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* ================= STEP 4: SUBMIT PREVIEW SCREEN ================= */}
          {step === 'submit' && (
            <motion.div
              key="step-submit"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[28px] border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
                
                {/* Intro block */}
                <div>
                  <h2 className="font-sans font-extrabold text-xl sm:text-2xl tracking-tight text-brand-primary">
                    Consolidated Civic Docket
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-brand-muted leading-relaxed mt-1">
                    Please perform a final verification check. Tapping Submit will lock this report on the immutable city ledger and dispatch notifications directly to the target public works department.
                  </p>
                </div>

                {/* Left image, right primary data row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2 border-t border-slate-100">
                  
                  {/* Photo Thumbnail */}
                  <div className="md:col-span-5 relative aspect-[16/10] md:aspect-auto md:h-full rounded-xl overflow-hidden border border-slate-150 bg-slate-50 min-h-[140px]">
                    {selectedImage && (
                      <Image
                        src={selectedImage}
                        alt="Evidence submission"
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute bottom-3 left-3 bg-slate-950/60 backdrop-blur-sm px-2.5 py-1 rounded text-[8px] font-mono text-white uppercase tracking-widest font-bold border border-white/5">
                      LEDGER PROOF
                    </div>
                  </div>

                  {/* Core Details metadata */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">CASE DOCKET SUBJECT</span>
                      <h3 className="font-sans font-bold text-sm text-brand-primary leading-tight mt-0.5">
                        {title}
                      </h3>
                    </div>

                    <div>
                      <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">COORDINATES & SECTOR</span>
                      <div className="flex items-center gap-1 mt-0.5 font-sans font-semibold text-xs text-brand-primary">
                        <MapPin className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                        <span>{locationValue}</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">CATEGORY DETECTED</span>
                        <span className="inline-block mt-0.5 font-mono text-[10px] font-bold text-brand-primary bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded">
                          {aiResults.categoryMatch}
                        </span>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block">CONFIDENCE</span>
                        <span className="inline-block mt-0.5 font-mono text-[10px] font-bold text-brand-secondary bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded">
                          {aiResults.confidence}% MATCH
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Original Description */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block mb-1">ORIGINAL CITIZEN DESCRIPTION</span>
                  <p className="font-body text-xs text-brand-muted leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                    {description || 'No descriptive text provided.'}
                  </p>
                </div>

                {/* AI Summary and routing section */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="font-mono text-[9px] text-slate-400 font-bold uppercase block mb-2">INTELLIGENT SUMMARY & ROUTING TARGET</span>
                  
                  {/* Minified Summary highlight */}
                  <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-4 flex gap-3.5 items-start">
                    <div className="w-8 h-8 rounded-lg bg-amber-100/50 flex items-center justify-center text-amber-600 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-body text-xs text-brand-primary leading-relaxed italic">
                        &ldquo;{aiResults.aiSummary}&rdquo;
                      </p>
                      <div className="mt-3 pt-3 border-t border-amber-200/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="font-mono text-[8px] text-slate-400 font-bold uppercase block leading-none">TARGET DEPARTMENT</span>
                          <span className="font-sans font-bold text-xs text-brand-primary block mt-1">
                            {aiResults.routingTo}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-[8px] text-slate-400 font-bold uppercase block leading-none">SEVERITY PRIORITY</span>
                          <span className="font-sans font-bold text-xs text-brand-primary block mt-1">
                            {aiResults.severityMatch}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => goToStep('report')}
                    className="px-5 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    Edit Case
                  </button>

                  <button
                    type="button"
                    onClick={() => goToStep('success')}
                    className="px-6 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-brand-secondary" />
                    <span>Submit Active Report</span>
                  </button>
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= STEP 5: SUCCESS CONFIRMATION SCREEN ================= */}
          {step === 'success' && (
            <motion.div
              key="step-success"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[32px] border border-slate-100 p-8 sm:p-12 shadow-md flex flex-col items-center text-center gap-6">
                
                {/* Glowing check animation */}
                <div className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-20 w-20 rounded-full bg-emerald-100/50 animate-ping opacity-75" />
                  <div className="relative w-16 h-16 rounded-full bg-emerald-500 border-4 border-white shadow-lg flex items-center justify-center text-white">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                </div>

                {/* Primary Messages */}
                <div className="space-y-2 max-w-md">
                  <span className="font-mono text-[10px] font-bold text-brand-secondary bg-emerald-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                    Ledger Registered
                  </span>
                  <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-brand-primary tracking-tight leading-none pt-1">
                    Report Anchored Successfully
                  </h2>
                  <p className="font-body text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Case file entry <span className="font-mono font-bold text-brand-primary">{mockReportId}</span> has been securely created and locked into the neighborhood feed.
                  </p>
                </div>

                {/* Progress Roadmap Timeline list */}
                <div className="w-full max-w-md bg-slate-50/50 border border-slate-100 rounded-2xl p-5 text-left space-y-4">
                  <h4 className="font-sans font-extrabold text-xs text-brand-primary uppercase tracking-wider pb-2.5 border-b border-slate-100">
                    EXPECTED DISPATCH PROCESS
                  </h4>
                  
                  <div className="relative pl-5 border-l-2 border-slate-200/80 space-y-4 ml-1">
                    
                    <div>
                      <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-brand-primary ring-4 ring-slate-100" />
                      <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase leading-none">PHASE 1: SECURED ROUTING</span>
                      <p className="font-body text-[11px] text-brand-muted mt-1 leading-normal">
                        Digital ticket dispatched and received by <span className="font-sans font-semibold text-brand-primary">{aiResults.routingTo}</span> dispatch queues.
                      </p>
                    </div>

                    <div>
                      <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-slate-300" />
                      <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase leading-none">PHASE 2: COMMUNITY CROWD-VETTING</span>
                      <p className="font-body text-[11px] text-slate-400 mt-1 leading-normal">
                        Nearby verified residents can corroborate or clear this hazard, upgrading its dispatch queue speed dynamically.
                      </p>
                    </div>

                    <div>
                      <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-slate-300" />
                      <span className="font-mono text-[9px] text-slate-400 font-bold block uppercase leading-none">PHASE 3: REPAIR WORKLOCK</span>
                      <p className="font-body text-[11px] text-slate-400 mt-1 leading-normal">
                        Municipal maintenance crews record chronological status, and upload verified photos to close the immutable docket.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Quick Info Disclaimer */}
                <div className="max-w-md bg-blue-50/30 border border-blue-100/50 rounded-xl p-3 flex items-start gap-2.5 text-left">
                  <Info className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
                  <p className="font-body text-[10px] text-slate-500 leading-relaxed">
                    This reporting run is simulated in frontend client state. The next phase roadmap will fully integrate this journey with Firestore and Gemini API models.
                  </p>
                </div>

                {/* Final Navigation Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mt-2 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      // Reset states
                      setTitle('');
                      setDescription('');
                      setLocationValue('');
                      setSelectedImage(null);
                      setHasAutofilled(false);
                      goToStep('report');
                    }}
                    className="w-full sm:flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center"
                  >
                    Report Another
                  </button>

                  <Link
                    href="/citizen"
                    className="w-full sm:flex-1 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all text-center shadow-md hover:shadow-lg"
                  >
                    Return to Feed
                  </Link>
                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ================= SIMULATED PHOTO GALLERY / CAMERA MODAL ================= */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Glass Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGalleryOpen(false)}
              className="absolute inset-0 bg-slate-950/45 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-white rounded-[32px] border border-slate-100 max-w-xl w-full p-6 shadow-2xl relative overflow-hidden z-10"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500">
                    <Camera className="w-4 h-4 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-sans font-extrabold text-sm text-brand-primary uppercase tracking-wider">
                      Simulate Capture / Upload
                    </h3>
                    <span className="font-mono text-[8px] text-slate-400 font-bold block uppercase tracking-widest">
                      CIVIC DATA PRESETS
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-body text-xs text-brand-muted leading-relaxed">
                  Select an incident preset below to simulate a high-resolution camera capture or evidence upload. Clicking a preset can also <strong>auto-fill</strong> the corresponding case narrative!
                </p>

                {/* Preset cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[340px] overflow-y-auto pr-1">
                  {PRESET_OPTIONS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="group border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 rounded-2xl p-3 flex gap-3 text-left transition-all relative h-28 items-center"
                    >
                      <div className="relative aspect-square w-20 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-150 shrink-0">
                        <Image
                          src={preset.imageUrl}
                          alt={preset.title}
                          fill
                          className="object-cover group-hover:scale-103 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          sizes="80px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[8px] text-brand-secondary font-extrabold uppercase tracking-widest block leading-none">
                          {preset.category}
                        </span>
                        <h4 className="font-sans font-bold text-xs text-brand-primary leading-tight mt-1 group-hover:text-brand-secondary transition-colors block truncate">
                          {preset.title}
                        </h4>
                        <span className="font-mono text-[7px] text-slate-400 block mt-0.5 uppercase">
                          LOC: {preset.location}
                        </span>
                        <span className="inline-block mt-2 font-mono text-[7px] font-extrabold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded leading-none">
                          AUTO-FILL READY
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom input override note */}
                <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100/60 font-sans text-[10px] text-slate-500 leading-normal">
                  Pro Tip: Choosing a preset populates real high-fidelity details so you can review the AI diagnostics step with completely accurate categorization data!
                </div>

              </div>

              {/* Close Button */}
              <div className="pt-4 border-t border-slate-100 mt-5">
                <button
                  type="button"
                  onClick={() => setIsGalleryOpen(false)}
                  className="w-full py-3 bg-slate-50 border border-slate-150 hover:bg-slate-100 rounded-xl text-slate-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center"
                >
                  Cancel
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
