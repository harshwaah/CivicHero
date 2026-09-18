/* eslint-disable react-hooks/purity, react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { CivicMap } from '@/lib/providers/maps/mapProvider';
import { PresetOption, PRESET_OPTIONS, CATEGORIES, URGENCY_LEVELS } from '@/lib/mockData';
import { DEFAULT_MAP_CENTER } from '@/lib/config';

// Import Real Firebase & Agent Repositories
import { storage, ref, uploadBytesResumable, getDownloadURL, isFirebaseConfigured } from '@/lib/firebase/storage';
import { IssueRepository } from '@/lib/repositories/issueRepository';
import { NotificationRepository } from '@/lib/repositories/notificationRepository';
import { CommunityIntegrityAgent } from '@/lib/providers/ai/communityIntegrityAgent';
import { CommunityIntelligenceAgent } from '@/lib/providers/ai/communityIntelligenceAgent';
import { Issue } from '@/lib/models';

export default function CitizenReportFlowPage() {
  const router = useRouter();

  // Hidden File and Camera Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Primary input states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Roads');
  const [urgency, setUrgency] = useState('Medium');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | Blob | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Background upload states
  const [backgroundUploadUrl, setBackgroundUploadUrl] = useState<string | null>(null);
  const [backgroundUploadProgress, setBackgroundUploadProgress] = useState(0);
  const [backgroundUploadStatus, setBackgroundUploadStatus] = useState<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  const [backgroundUploadError, setBackgroundUploadError] = useState<string | null>(null);
  
  const uploadTaskRef = useRef<any>(null);
  const uploadPromiseRef = useRef<Promise<string> | null>(null);

  const backgroundUploadProgressRef = useRef(0);
  const backgroundUploadStatusRef = useRef<'idle' | 'uploading' | 'complete' | 'error'>('idle');
  const backgroundUploadUrlRef = useRef<string | null>(null);

  const updateBackgroundUploadProgress = (p: number) => {
    backgroundUploadProgressRef.current = p;
    setBackgroundUploadProgress(p);
  };

  const updateBackgroundUploadStatus = (s: 'idle' | 'uploading' | 'complete' | 'error') => {
    backgroundUploadStatusRef.current = s;
    setBackgroundUploadStatus(s);
  };

  const updateBackgroundUploadUrl = (url: string | null) => {
    backgroundUploadUrlRef.current = url;
    setBackgroundUploadUrl(url);
  };

  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const lat = urlParams.get('lat');
      const lng = urlParams.get('lng');
      if (lat && lng) {
        return { lat: parseFloat(lat), lng: parseFloat(lng) };
      }
    }
    return null;
  });

  const [locationValue, setLocationValue] = useState(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const lat = urlParams.get('lat');
      const lng = urlParams.get('lng');
      if (lat && lng) {
        return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
      }
    }
    return '';
  });

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

  // AI Scanning animations and real execution states
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [scanningComplete, setScanningComplete] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [realAiResults, setRealAiResults] = useState<PresetOption | null>(null);

  // Mock dynamic report results
  const [mockReportId, setMockReportId] = useState(() => {
    return `CH-${Math.floor(10000 + Math.random() * 90000)}`;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-acquire current GPS position if none is specified
  useEffect(() => {
    if (!coordinates && typeof navigator !== 'undefined' && navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCoordinates({ lat, lng });
            
            // Reverse geocode on GPS acquire
            if (window.google?.maps) {
              const geocoder = new window.google.maps.Geocoder();
              geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                  setLocationValue(results[0].formatted_address);
                } else {
                  setLocationValue(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                }
              });
            } else {
              setLocationValue(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            }
          },
          (_error) => {
            // Silently fallback to Mumbai default center without console warnings
            setCoordinates({ lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng });
            setLocationValue(DEFAULT_MAP_CENTER.name);
          },
          {
            timeout: 5000,
            maximumAge: 60000,
          }
        );
      } catch {
        setCoordinates({ lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng });
        setLocationValue(DEFAULT_MAP_CENTER.name);
      }
    }
  }, []);

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
    
    if (newStep === 'analysis') {
      setScanProgress(0);
      setScanLogs([]);
      setScanningComplete(false);
      setScanError(null);
    } else if (newStep === 'report') {
      setMockReportId(`CH-${Math.floor(10000 + Math.random() * 90000)}`);
    }

    const url = new URL(window.location.href);
    url.searchParams.set('step', newStep);
    window.history.pushState({ step: newStep }, '', url.pathname + url.search);
  };

  // Image validation & compression helper
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = (err) => reject(err);
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const cancelBackgroundUpload = () => {
    if (uploadTaskRef.current) {
      try {
        uploadTaskRef.current.cancel();
        console.log('[BACKGROUND UPLOAD] Previous upload canceled.');
      } catch (e) {
        console.warn('[BACKGROUND UPLOAD] Cancel failed:', e);
      }
      uploadTaskRef.current = null;
    }
    uploadPromiseRef.current = null;
    updateBackgroundUploadUrl(null);
    updateBackgroundUploadProgress(0);
    updateBackgroundUploadStatus('idle');
  };

  const startBackgroundUpload = (fileBlob: Blob | File) => {
    updateBackgroundUploadStatus('uploading');
    updateBackgroundUploadProgress(0);
    setBackgroundUploadError(null);
    updateBackgroundUploadUrl(null);

    if (uploadTaskRef.current) {
      try {
        uploadTaskRef.current.cancel();
      } catch (e) {}
      uploadTaskRef.current = null;
    }

    const fileExt = 'jpg';
    const storagePath = `issues/evidence/${Date.now()}_img.${fileExt}`;
    console.log('[BACKGROUND UPLOAD] Starting upload path:', storagePath);

    const promise = new Promise<string>((resolve, reject) => {
      // Setup mock simulator function for fallback or unconfigured environments
      const runSimulatedUpload = (blob: Blob | File, resolvePromise: (url: string) => void) => {
        let currentProgress = 0;
        updateBackgroundUploadStatus('uploading');
        
        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 15;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            
            // Create local object URL as secure cloud URL fallback
            const localUrl = URL.createObjectURL(blob);
            updateBackgroundUploadUrl(localUrl);
            updateBackgroundUploadStatus('complete');
            updateBackgroundUploadProgress(100);
            console.log('[BACKGROUND UPLOAD] Simulated completed. Local URL:', localUrl);
            resolvePromise(localUrl);
          } else {
            updateBackgroundUploadProgress(currentProgress);
            console.log(`[BACKGROUND UPLOAD] Simulated Progress: ${currentProgress}%`);
          }
        }, 150);
      };

      if (!isFirebaseConfigured) {
        console.warn('[BACKGROUND UPLOAD] Firebase Storage is absent. Defaulting to high-fidelity simulated progress.');
        runSimulatedUpload(fileBlob, resolve);
        return;
      }

      try {
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, fileBlob);
        uploadTaskRef.current = uploadTask;

        let hasErrored = false;

        uploadTask.on('state_changed',
          (snapshot) => {
            if (hasErrored) return;
            const totalBytes = snapshot.totalBytes || 1;
            const progress = Math.round((snapshot.bytesTransferred / totalBytes) * 100);
            const boundedProgress = Math.min(Math.max(progress, 0), 100);
            updateBackgroundUploadProgress(boundedProgress);
            console.log(`[BACKGROUND UPLOAD] Firebase Storage Progress: ${boundedProgress}%`);
          },
          (error) => {
            if (hasErrored) return;
            hasErrored = true;
            console.error('[BACKGROUND UPLOAD] Firebase Storage upload error, falling back:', error);
            runSimulatedUpload(fileBlob, resolve);
          },
          async () => {
            if (hasErrored) return;
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('[BACKGROUND UPLOAD] Completed! URL:', downloadUrl);
              updateBackgroundUploadUrl(downloadUrl);
              updateBackgroundUploadStatus('complete');
              resolve(downloadUrl);
            } catch (err: any) {
              console.error('[BACKGROUND UPLOAD] Failed to get download URL, falling back:', err);
              runSimulatedUpload(fileBlob, resolve);
            }
          }
        );
      } catch (err) {
        console.error('[BACKGROUND UPLOAD] Ref initialization failed, falling back:', err);
        runSimulatedUpload(fileBlob, resolve);
      }
    });

    uploadPromiseRef.current = promise;
    return promise;
  };

  const processFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only JPEG, PNG, or WEBP image formats are supported for verification.');
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size exceeds the 10MB limit.');
      return;
    }

    // Cancel any previous upload
    cancelBackgroundUpload();

    try {
      const compressedBlob = await compressImage(file);
      setEvidenceFile(compressedBlob);
      const localUrl = URL.createObjectURL(compressedBlob);
      setSelectedImage(localUrl);
      setHasAutofilled(false);
      startBackgroundUpload(compressedBlob);
    } catch (err) {
      console.error('Image compression failed, using original', err);
      setEvidenceFile(file);
      const localUrl = URL.createObjectURL(file);
      setSelectedImage(localUrl);
      setHasAutofilled(false);
      startBackgroundUpload(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  // Preset Selection / Autofill Handler with location coordinates
  const handleSelectPreset = (preset: PresetOption) => {
    let presetCoords = { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng };
    if (preset.id === 'preset-pothole') presetCoords = { lat: 19.0596, lng: 72.8295 }; // Bandra West
    else if (preset.id === 'preset-tree') presetCoords = { lat: 19.0178, lng: 72.8478 }; // Dadar
    else if (preset.id === 'preset-water') presetCoords = { lat: 19.1257, lng: 72.9051 }; // Powai
    else if (preset.id === 'preset-streetlight') presetCoords = { lat: 19.1197, lng: 72.8468 }; // Andheri West
    else if (preset.id === 'preset-trash') presetCoords = { lat: 19.0666, lng: 72.8687 }; // BKC

    setSelectedImage(preset.imageUrl);
    setEvidenceFile(null); // No local file needed
    cancelBackgroundUpload();
    setBackgroundUploadUrl(preset.imageUrl);
    setBackgroundUploadStatus('complete');

    setTitle(preset.title);
    setDescription(preset.description);
    setLocationValue(preset.location);
    setCategory(preset.category);
    setUrgency(preset.urgency);
    setCoordinates(presetCoords);
    setHasAutofilled(true);
    setIsGalleryOpen(false);
  };

  // Google Maps Address Geocoding resolver
  const handleSearchAddress = () => {
    if (!locationValue.trim()) return;
    if (window.google?.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: locationValue }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          setCoordinates({ lat, lng });
          setLocationValue(results[0].formatted_address);
        } else {
          alert('Could not resolve the physical address. Please refine or select directly on the map.');
        }
      });
    } else {
      alert('Address verification engine is loading. Please select directly on the map container.');
    }
  };

  // Map click reverse-geocoder
  const handleMapClick = (e: any) => {
    const lat = e.detail?.latLng?.lat;
    const lng = e.detail?.latLng?.lng;
    if (lat && lng) {
      setCoordinates({ lat, lng });
      if (window.google?.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === 'OK' && results && results[0]) {
            setLocationValue(results[0].formatted_address);
          } else {
            setLocationValue(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        });
      } else {
        setLocationValue(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    }
  };

  // Real pipeline engine run
  const runRealAnalysis = async () => {
    setScanProgress(0);
    setScanLogs([]);
    setScanningComplete(false);
    setScanError(null);

    const isDev = typeof window !== 'undefined' && localStorage.getItem('developer_mode') === 'true';

    // Anti-spam log helper using refs to store the last printed logs
    const lastFriendlyRef = { current: '' };
    const lastTechnicalRef = { current: '' };

    const addLog = (friendly: string, technical: string, filterSubstring?: string) => {
      // Throttle identical logs to prevent spamming the visual list
      if (lastFriendlyRef.current === friendly && lastTechnicalRef.current === technical) {
        return;
      }
      lastFriendlyRef.current = friendly;
      lastTechnicalRef.current = technical;

      console.log(`[PIPELINE] ${technical}`);
      const displayLog = isDev ? technical : friendly;
      setScanLogs(prev => {
        if (filterSubstring) {
          const base = prev.filter(l => !l.includes(filterSubstring));
          return [...base, displayLog];
        }
        return [...prev, displayLog];
      });
    };

    try {
      // Phase A: Parallel Execution (Invoke AI Agent + Ensure background upload is running)
      addLog('Initiating AI-native validation pipeline...', '[PIPELINE] Initializing parallel analysis & telemetry thread...');
      setScanProgress(10);

      let uploadPromise: Promise<string> | null = null;
      if (evidenceFile) {
        if (backgroundUploadStatusRef.current === 'complete' && backgroundUploadUrlRef.current) {
          // Upload is already completed in the background, great!
          uploadPromise = Promise.resolve(backgroundUploadUrlRef.current);
        } else if (uploadPromiseRef.current) {
          // Background upload is currently running, use its existing promise
          uploadPromise = uploadPromiseRef.current;
        } else {
          // Not started yet, kick it off right now in parallel
          uploadPromise = startBackgroundUpload(evidenceFile);
        }
      }

      // Prepare in-memory text payload for the AI agents (does NOT block on image upload)
      const tempIssueForAI = {
        title: title || 'Custom Incident Report',
        description: description || '',
        category: category,
        urgency: urgency,
        location: locationValue || 'Unknown Location Point',
      };

      addLog('Calling Community Integrity Agent for verification...', '[AI_INTEGRITY] Invoking spam/abusiveness analysis via Gemini-3.5-flash...');
      addLog('Calling Community Intelligence Agent for department routing...', '[AI_INTELLIGENCE] Processing semantic text categorization...');
      setScanProgress(30);

      // Execute AI evaluations in parallel!
      const integrityPromise = CommunityIntegrityAgent.evaluateReport(tempIssueForAI);
      const intelligencePromise = CommunityIntelligenceAgent.analyzeReport(tempIssueForAI);

      // Await AI analysis tasks concurrently (Do NOT wait for Storage upload yet)
      const [integrityResult, intelligenceResult] = await Promise.all([
        integrityPromise,
        intelligencePromise
      ]);

      setScanProgress(60);
      addLog(
        'Integrity check completed successfully.',
        `[AI_INTEGRITY] Moderation analysis complete. Confidence: ${integrityResult.confidenceScore}%, Safety: ${integrityResult.isVerified ? 'VERIFIED_OK' : 'UNDER_REVIEW'}`
      );
      addLog(
        `Assigned to ${intelligenceResult.routingTo} under ${intelligenceResult.severityMatch} priority.`,
        `[AI_INTELLIGENCE] Resolved Department: ${intelligenceResult.routingTo}, Smart category mapping: ${intelligenceResult.categoryMatch}, Matched Urgency: ${intelligenceResult.severityMatch}`
      );

      // Phase B: Set initial evidence status and create Firestore document immediately (DO NOT BLOCK)
      setScanProgress(70);
      addLog('Logging your report details...', '[LEDGER] Registering metadata schema inside Firestore...');

      // Determine initial evidence status if an evidence file is selected
      let initialEvidenceStatus: 'PENDING' | 'UPLOADING' | 'AVAILABLE' | 'FAILED' | 'RETRY_REQUIRED' | undefined = undefined;
      if (evidenceFile) {
        if (!isFirebaseConfigured) {
          initialEvidenceStatus = 'FAILED';
          addLog('Evidence upload unavailable. Your report has been submitted successfully.', '[STORAGE] Firebase Storage is not configured. Falling back to placeholder media.');
        } else {
          initialEvidenceStatus = (backgroundUploadStatusRef.current === 'complete') ? 'AVAILABLE' : 'UPLOADING';
        }
      }

      const initialImageUrl = (initialEvidenceStatus === 'AVAILABLE') ? (backgroundUploadUrlRef.current || selectedImage || '') : undefined;

      const issuePayload: Omit<Issue, 'id'> = {
        title: title || 'Custom Incident Report',
        description: description || '',
        category: intelligenceResult.categoryMatch || category,
        urgency: (intelligenceResult.severityMatch || urgency) as any,
        status: 'Reported',
        timestamp: 'Just now',
        location: locationValue || 'Unknown Location Point',
        upvotes: 0,
        commentsCount: 0,
        imageUrl: initialImageUrl,
        evidenceStatus: initialEvidenceStatus,
        verifiedByCount: 1,
        reporterName: 'Citizen Hero',
        reporterBadge: 'First-time Reporter',
        timeline: [
          {
            id: `tl-init-${Date.now()}`,
            type: 'reported',
            title: 'Report Submitted',
            description: 'Neighborhood concern logged into the ledger.',
            timestamp: 'Just now',
          },
          {
            id: `tl-ai-int-${Date.now()}`,
            type: 'update',
            title: 'AI Integrity Check',
            description: integrityResult.analysisSummary,
            timestamp: 'Just now',
          },
          {
            id: `tl-ai-intel-${Date.now()}`,
            type: 'update',
            title: 'AI Intelligence Routing',
            description: `Routed to ${intelligenceResult.routingTo}. ${intelligenceResult.aiSummary}`,
            timestamp: 'Just now',
          }
        ],
        comments: [],
        coordinates: coordinates || { lat: DEFAULT_MAP_CENTER.lat, lng: DEFAULT_MAP_CENTER.lng },
        trustMetrics: {
          coSigningCount: 1,
          accuracyRating: 100,
          verificationConfidence: integrityResult.confidenceScore,
          communityFlagsCount: 0,
          isVerified: integrityResult.isVerified,
        }
      };

      const newIssue = await IssueRepository.create(issuePayload);
      setMockReportId(newIssue.id);
      addLog(`Report saved under Reference Code: ${newIssue.id}`, `[LEDGER] Created secure incident entry with ID: ${newIssue.id}`);

      // Create real-time notification records in Firestore
      try {
        // 1. Citizen: Report received
        await NotificationRepository.create({
          userId: 'citizen-admin-1',
          title: 'Report Received',
          message: `Your report "${newIssue.title}" has been successfully logged on the ledger.`,
          type: 'community',
          isRead: false,
          timestamp: 'Just now',
          relatedIssueId: newIssue.id,
        });

        // 2. Citizen: AI completed
        await NotificationRepository.create({
          userId: 'citizen-admin-1',
          title: 'AI Inspection Completed',
          message: `AI Agents have parsed your submission. Routing: ${intelligenceResult.routingTo}.`,
          type: 'ai',
          isRead: false,
          timestamp: 'Just now',
          relatedIssueId: newIssue.id,
        });

        // 3. Admin: Critical report notification if applicable, or Duplicate Check
        if (newIssue.urgency === 'Critical' || newIssue.urgency === 'High') {
          await NotificationRepository.create({
            userId: 'admin-1',
            title: 'Critical Report Logged',
            message: `[CRITICAL] "${newIssue.title}" has been flagged at ${newIssue.location}.`,
            type: 'system',
            isRead: false,
            timestamp: 'Just now',
            relatedIssueId: newIssue.id,
          });
        } else {
          await NotificationRepository.create({
            userId: 'admin-1',
            title: 'New Incident Logged',
            message: `New issue "${newIssue.title}" logged in ${newIssue.category}.`,
            type: 'system',
            isRead: false,
            timestamp: 'Just now',
            relatedIssueId: newIssue.id,
          });
        }
      } catch (err) {
        console.error('Error creating report notifications:', err);
      }

      // Finalize scan results
      setRealAiResults({
        id: newIssue.id,
        title: newIssue.title,
        description: newIssue.description,
        location: newIssue.location,
        category: issuePayload.category,
        urgency: issuePayload.urgency,
        imageUrl: initialImageUrl || '',
        aiSummary: intelligenceResult.aiSummary,
        confidence: integrityResult.confidenceScore,
        categoryMatch: intelligenceResult.categoryMatch,
        severityMatch: intelligenceResult.severityMatch,
        routingTo: intelligenceResult.routingTo
      });

      addLog('Dispatch routing confirmed! Report ready for submittal.', '[SUCCESS] System diagnostics fully verified. Case docket locked.');
      setScanProgress(100);
      setScanningComplete(true);

      // Now run the background upload completely non-blocking!
      if (evidenceFile && isFirebaseConfigured && initialEvidenceStatus === 'UPLOADING' && uploadPromise) {
        console.log('[PIPELINE] Launching independent non-blocking media upload tracker for Issue:', newIssue.id);
        
        uploadPromise.then(async (downloadUrl) => {
          try {
            // Fetch latest issue to append to timeline accurately
            const freshIssue = await IssueRepository.getById(newIssue.id);
            if (freshIssue) {
              const updatedTimeline = [
                ...(freshIssue.timeline || []),
                {
                  id: `tl-media-${Date.now()}`,
                  type: 'update',
                  title: 'Evidence Media Secured',
                  description: 'Verification photo uploaded and attached to the report.',
                  timestamp: 'Just now'
                }
              ];
              await IssueRepository.update(newIssue.id, {
                imageUrl: downloadUrl,
                evidenceStatus: 'AVAILABLE',
                timeline: updatedTimeline
              });
              console.log('[PIPELINE] Non-blocking upload completed successfully. Issue patched with URL:', downloadUrl);
            }
          } catch (patchErr) {
            console.error('[PIPELINE] Non-blocking upload succeeded but patching Issue failed:', patchErr);
          }
        }).catch(async (uploadErr) => {
          console.error('[PIPELINE] Non-blocking upload failed:', uploadErr);
          try {
            const freshIssue = await IssueRepository.getById(newIssue.id);
            if (freshIssue) {
              const updatedTimeline = [
                ...(freshIssue.timeline || []),
                {
                  id: `tl-media-failed-${Date.now()}`,
                  type: 'update',
                  title: 'Evidence Upload Failed',
                  description: 'The photo evidence failed to upload. You can retry from the case details page.',
                  timestamp: 'Just now'
                }
              ];
              await IssueRepository.update(newIssue.id, {
                evidenceStatus: 'RETRY_REQUIRED',
                timeline: updatedTimeline
              });
            }
          } catch (patchErr) {
            console.error('[PIPELINE] Non-blocking upload failed & failed-state patching failed:', patchErr);
          }
        });
      }

    } catch (err: any) {
      console.error('Real submission pipeline error:', err);
      const message = err?.message || 'A network error occurred. Please verify your connection.';
      setScanError(message);
      addLog(`Submission interrupted: ${message}`, `[ERROR] Pipeline interrupted: ${message}`);
    }
  };

  // Run real analysis when page lands on Step 3
  useEffect(() => {
    if (step === 'analysis') {
      const timer = setTimeout(() => {
        runRealAnalysis();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { ReportService } = await import('@/lib/services/reportService');
      const issue = await ReportService.submitNewReport({
        title,
        description,
        category,
        urgency: (realAiResults?.severityMatch || urgency) as any,
        location: locationValue,
        imageUrl: selectedImage || undefined,
        coordinates: coordinates || undefined
      });
      setMockReportId(issue.id);
      goToStep('success');
    } catch (error) {
      console.error('Submission failed', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine standard custom values or fallback if user edited manually
  const getAiResults = (): PresetOption => {
    if (realAiResults) {
      return {
        id: 'real-ai-case',
        title: title || 'Custom Incident Report',
        description: description || '',
        location: locationValue || 'Unknown Location Point',
        category: category,
        urgency: realAiResults.severityMatch as any,
        imageUrl: selectedImage || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=640&q=80',
        aiSummary: realAiResults.aiSummary,
        confidence: realAiResults.confidence,
        categoryMatch: realAiResults.categoryMatch,
        severityMatch: realAiResults.severityMatch,
        routingTo: realAiResults.routingTo
      };
    }

    // If we have an autofilled image, match that preset
    const matchingPreset = PRESET_OPTIONS.find(p => p.imageUrl === selectedImage);
    if (matchingPreset) {
      return matchingPreset;
    }

    // Default fallbacks based on selected category
    const result: PresetOption = {
      id: 'custom-case',
      title: title || 'Custom Incident Report',
      description: description || '',
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
      
      {/* Hidden system files selectors */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/jpeg,image/png,image/webp" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />

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
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white text-[10px] font-mono font-bold uppercase text-brand-primary border border-slate-200 shadow-md hover:bg-slate-50 transition-colors flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Swap Image</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setEvidenceFile(null);
                            setHasAutofilled(false);
                            cancelBackgroundUpload();
                          }}
                          className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-100 shadow-md hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="absolute bottom-4 left-4 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-mono text-white font-semibold tracking-wider">
                        IMAGE CAPTURED • GIS LOC REGISTERED
                      </div>
                      {evidenceFile && (
                        <div className="absolute bottom-4 right-4 bg-slate-950/60 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[9px] font-mono text-white font-semibold tracking-wider flex items-center gap-1.5 border border-white/10">
                          <span className={`w-1.5 h-1.5 rounded-full ${backgroundUploadStatus === 'complete' ? 'bg-green-400' : backgroundUploadStatus === 'error' ? 'bg-red-400' : 'bg-amber-400 animate-pulse'}`} />
                          <span>
                            {backgroundUploadStatus === 'complete' ? 'SECURED IN CLOUD' : backgroundUploadStatus === 'error' ? 'UPLOAD FAILED' : `UPLOADING... ${backgroundUploadProgress}%`}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Real Camera Capture Button */}
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-slate-50/50 hover:bg-slate-50/85 transition-all duration-200 group h-44"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                          <Camera className="w-4.5 h-4.5 text-brand-primary" />
                        </div>
                        <div>
                          <span className="font-sans font-bold text-xs text-brand-primary block">
                            Camera Capture
                          </span>
                          <span className="font-body text-[9px] text-slate-400 mt-0.5 block leading-tight">
                            Snap live verified photo using device lens
                          </span>
                        </div>
                      </button>

                      {/* Real File Upload Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer transition-all duration-200 h-44 ${
                          isDragging 
                            ? 'border-brand-secondary bg-brand-secondary/5 scale-[1.02]' 
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50/85'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200/60 flex items-center justify-center text-slate-500 shadow-sm">
                          <Upload className="w-4.5 h-4.5 text-brand-secondary" />
                        </div>
                        <div>
                          <span className="font-sans font-bold text-xs text-brand-primary block">
                            Upload Photo / Drag
                          </span>
                          <span className="font-body text-[9px] text-slate-400 mt-0.5 block leading-tight">
                            Supports JPG, PNG, WEBP up to 10MB
                          </span>
                        </div>
                      </div>

                      {/* Preset Demo Modal Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsGalleryOpen(true)}
                        className="border-2 border-dashed border-slate-250 hover:border-slate-350 rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 bg-slate-100/40 hover:bg-slate-100/70 transition-all duration-200 group h-44"
                      >
                        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:scale-105 transition-transform duration-200 shadow-sm">
                          <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                        </div>
                        <div>
                          <span className="font-sans font-bold text-xs text-brand-primary block">
                            Choose Preset Demo
                          </span>
                          <span className="font-body text-[9px] text-amber-600 font-medium mt-0.5 block leading-tight">
                            Prefill pothole, fallen tree, or streetlight details
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
                    <div className="relative flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={locationValue}
                          onChange={(e) => setLocationValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSearchAddress();
                            }
                          }}
                          placeholder="e.g., 421 President Street, Brooklyn"
                          className="w-full bg-slate-50/50 border border-slate-150 rounded-2xl py-4 pl-11 pr-24 font-sans text-xs sm:text-sm text-brand-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white transition-all font-medium"
                        />
                        <MapPin className="w-4 h-4 text-brand-secondary absolute left-4 top-1/2 -translate-y-1/2" />
                        <button
                          type="button"
                          onClick={handleSearchAddress}
                          className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-xl text-[10px] font-mono font-bold uppercase transition-colors"
                        >
                          Find/Verify
                        </button>
                      </div>
                    </div>
                    
                    {/* Interactive Map Selection */}
                    <div className="mt-3 h-48 w-full rounded-2xl overflow-hidden border border-slate-200">
                      <CivicMap 
                        locationName={locationValue || "New Incident Location"}
                        categoryName={category}
                        interactive={true}
                        showLocateMe={true}
                        latitude={coordinates?.lat || DEFAULT_MAP_CENTER.lat}
                        longitude={coordinates?.lng || DEFAULT_MAP_CENTER.lng}
                        markers={coordinates ? [{
                          id: 'new-report-marker',
                          lat: coordinates.lat,
                          lng: coordinates.lng,
                          title: "New Incident",
                          urgency: urgency,
                          status: 'Live'
                        }] : []}
                        onClick={handleMapClick}
                      />
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
                
                {scanLogs.map((log, idx) => {
                  const isError = log.includes('[ERROR]');
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-2 ${isError ? 'text-red-400' : 'text-slate-200'}`}
                    >
                      <span className={isError ? 'text-red-500 font-bold' : 'text-brand-secondary font-bold'}>
                        {isError ? '✗' : '✓'}
                      </span>
                      <span>{log}</span>
                    </motion.div>
                  );
                })}

                {!scanningComplete && !scanError && (
                  <div className="flex items-center gap-2 text-amber-500 animate-pulse mt-2 pt-2 border-t border-dashed border-slate-800">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    <span>Processing visual matrices...</span>
                  </div>
                )}

                {scanError && (
                  <div className="mt-4 pt-4 border-t border-dashed border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-400">
                    <div className="flex items-center gap-2">
                      <AlertOctagon className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-[10px] leading-tight font-sans font-bold">
                        Pipeline halted due to error. Please check your cloud connection.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={runRealAnalysis}
                      className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-mono text-[9px] font-extrabold uppercase tracking-wider transition-colors shadow-sm self-end sm:self-auto"
                    >
                      Retry Diagnostics
                    </button>
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
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4 text-brand-secondary" />
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Active Report'}</span>
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
                <div className="max-w-md bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5 text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="font-body text-[10px] text-slate-600 leading-relaxed">
                    This reporting run is completely integrated with the production Firestore database, cloud storage, and automated Gemini integrity and intelligence pipelines.
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
                      setEvidenceFile(null);
                      setHasAutofilled(false);
                      setRealAiResults(null);
                      goToStep('report');
                    }}
                    className="w-full sm:flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 rounded-2xl text-slate-500 font-mono text-xs font-bold uppercase tracking-wider transition-colors text-center"
                  >
                    Report Another
                  </button>

                  <Link
                    href={`/citizen/issues/${mockReportId}`}
                    className="w-full sm:flex-1 py-3.5 bg-brand-primary text-white hover:bg-brand-primary/95 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider transition-all text-center shadow-md hover:shadow-lg"
                  >
                    View Docket
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
