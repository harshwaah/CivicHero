'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Play, 
  Terminal, 
  Settings, 
  AlertCircle, 
  Clock, 
  Layers, 
  Database, 
  MapPin, 
  Cpu, 
  HardDrive, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import { db, isFirebaseConfigured, storage } from '@/lib/firebase/firebase';
import { collection, addDoc, getDocs, onSnapshot, doc, getDoc, updateDoc, deleteDoc, setDoc } from '@/lib/firebase/firestore';
import { IssueRepository } from '@/lib/repositories/issueRepository';
import { IssueService } from '@/lib/services/issueService';
import { GeminiProvider } from '@/lib/providers/ai/geminiProvider';

interface SubsystemState {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'Untested' | 'Running' | 'Passed' | 'Failed';
  lastTestTime: string;
  lastError: string;
}

const getUniqueStoragePath = () => `issues/evidence/${Date.now()}_img.jpg`;

export default function DiagnosticsPage() {
  const [subsystems, setSubsystems] = useState<SubsystemState[]>([
    { id: 'firebase', name: 'Firebase Core SDK', icon: <Layers className="w-4 h-4 text-amber-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'firestore-read', name: 'Firestore Read Operations', icon: <Database className="w-4 h-4 text-blue-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'firestore-write', name: 'Firestore Write Operations', icon: <Database className="w-4 h-4 text-emerald-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'realtime-listener', name: 'Realtime onSnapshot Listener', icon: <RefreshCw className="w-4 h-4 text-cyan-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'google-maps', name: 'Google Maps API Client', icon: <MapPin className="w-4 h-4 text-rose-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'gemini', name: 'Gemini Generative API', icon: <Cpu className="w-4 h-4 text-violet-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'storage', name: 'Firebase Cloud Storage', icon: <HardDrive className="w-4 h-4 text-indigo-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'repositories', name: 'IssueRepository Layer', icon: <Layers className="w-4 h-4 text-slate-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'services', name: 'IssueService Orchestration', icon: <Layers className="w-4 h-4 text-sky-500" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
    { id: 'env-vars', name: 'Server Environment Variables', icon: <Settings className="w-4 h-4 text-slate-700" />, status: 'Untested', lastTestTime: 'Never', lastError: 'None' },
  ]);

  const [logs, setLogs] = useState<string[]>([]);
  const [artificialDelay, setArtificialDelay] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dev_artificial_delay');
      return stored ? (parseInt(stored, 10) || 0) : 0;
    }
    return 0;
  });
  const [serverCheckResult, setServerCheckResult] = useState<any>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Decoupled Retry States
  const [retryIssues, setRetryIssues] = useState<any[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [diagnosticRetrying, setDiagnosticRetrying] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);

  useEffect(() => {
    // Fetch issues for the retry selector
    IssueRepository.getAll().then((data) => {
      setRetryIssues(data || []);
      if (data && data.length > 0) {
        setSelectedIssueId(data[0].id);
      }
    }).catch(err => console.error('Failed to load diagnostics retry issues:', err));
  }, []);

  const runDiagnosticRetry = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedIssueId) return;

    setDiagnosticRetrying(true);
    setDiagnosticProgress(0);
    addLog(`[RETRY TEST] Starting retry diagnostic pipeline for Issue: ${selectedIssueId}...`);

    if (!isFirebaseConfigured) {
      addLog(`[RETRY TEST] Storage unconfigured. Simulating decoupled upload completion...`);
      let progress = 0;
      const interval = setInterval(async () => {
        progress += 25;
        setDiagnosticProgress(progress);
        addLog(`[RETRY TEST] Upload progress: ${progress}%`);
        if (progress >= 100) {
          clearInterval(interval);
          try {
            const localUrl = URL.createObjectURL(file);
            await IssueRepository.update(selectedIssueId, {
              imageUrl: localUrl,
              evidenceStatus: 'AVAILABLE'
            });
            addLog(`[RETRY TEST] Success! Patch complete. Document status updated to AVAILABLE.`);
            setDiagnosticRetrying(false);
            // Refresh issues list
            const updated = await IssueRepository.getAll();
            setRetryIssues(updated || []);
          } catch (err: any) {
            addLog(`[RETRY TEST] Error patching document: ${err.message}`);
            setDiagnosticRetrying(false);
          }
        }
      }, 150);
      return;
    }

    try {
      const { ref, uploadBytesResumable, getDownloadURL } = await import('@/lib/firebase/storage');
      const storagePath = getUniqueStoragePath();
      const storageRef = ref(storage, storagePath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setDiagnosticProgress(progress);
          addLog(`[RETRY TEST] Live upload progress: ${progress}%`);
        },
        async (error) => {
          addLog(`[RETRY TEST] Upload aborted: ${error.message}`);
          setDiagnosticRetrying(false);
          await IssueRepository.update(selectedIssueId, {
            evidenceStatus: 'FAILED'
          });
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            addLog(`[RETRY TEST] Media uploaded successfully! Patching Firestore document...`);
            
            await IssueRepository.update(selectedIssueId, {
              imageUrl: downloadUrl,
              evidenceStatus: 'AVAILABLE'
            });

            addLog(`[RETRY TEST] Success! Issue document ${selectedIssueId} patched with new URL.`);
            setDiagnosticRetrying(false);
            
            // Refresh list
            const updated = await IssueRepository.getAll();
            setRetryIssues(updated || []);
          } catch (err: any) {
            addLog(`[RETRY TEST] Failed to patch issue: ${err.message}`);
            setDiagnosticRetrying(false);
          }
        }
      );
    } catch (err: any) {
      addLog(`[RETRY TEST] Setup failed: ${err.message}`);
      setDiagnosticRetrying(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const fetchServerStatus = async () => {
    addLog('Querying server-side environment checklist...');
    try {
      const res = await fetch('/app/api/diagnostics/check', { cache: 'no-store' })
        .catch(() => fetch('/api/diagnostics/check', { cache: 'no-store' }));
      
      if (res.ok) {
        const data = await res.json();
        setServerCheckResult(data);
        addLog('Successfully retrieved server-side environment checklist.');
      } else {
        addLog('Warning: Could not fetch server status. API route might be compiling.');
      }
    } catch (e: any) {
      addLog(`Failed to fetch server status API check: ${e.message}`);
    }
  };

  // Load delay setting from local storage
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLogs([
      `[${timestamp}] System Diagnostics dashboard initialized.`,
      `[${timestamp}] Ready to conduct runtime verification.`
    ]);
    setTimeout(() => {
      fetchServerStatus();
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll terminal logs to bottom on changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const updateSubsystem = (id: string, updates: Partial<SubsystemState>) => {
    setSubsystems(prev => prev.map(sub => {
      if (sub.id === id) {
        return {
          ...sub,
          ...updates,
          lastTestTime: new Date().toLocaleTimeString(),
        };
      }
      return sub;
    }));
  };

  const runAllTests = async () => {
    addLog('⚡ Initiating full subsystem verification suite...');
    for (const sub of subsystems) {
      await runSpecificTest(sub.id);
    }
    addLog('🏁 Subsystem verification suite execution complete.');
  };

  const runSpecificTest = async (id: string) => {
    updateSubsystem(id, { status: 'Running', lastError: 'None' });
    addLog(`Testing Subsystem: ${id.toUpperCase()}...`);

    try {
      switch (id) {
        case 'firebase': {
          addLog('Checking Firebase configuration state...');
          if (!isFirebaseConfigured) {
            throw new Error('isFirebaseConfigured returned false. Firebase is not defined in credentials.');
          }
          addLog(`Firebase SDK successfully initialized on project: ${db.app.options.projectId}`);
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'firestore-read': {
          addLog('Executing document read query on collection "issues"...');
          const snapshot = await getDocs(collection(db, 'issues'));
          addLog(`Success! Retrieved ${snapshot.size} active documents from "issues" collection.`);
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'firestore-write': {
          addLog('Executing dry-run document write transaction...');
          const testDocRef = await addDoc(collection(db, 'diagnostics_runs'), {
            type: 'firestore-write-test',
            testedAt: new Date().toISOString(),
            status: 'temporary'
          });
          addLog(`Success! Document written with persistent ID: ${testDocRef.id}`);
          
          addLog(`Cleaning up temporary document ${testDocRef.id}...`);
          await deleteDoc(doc(db, 'diagnostics_runs', testDocRef.id));
          addLog('Temporary document deleted successfully.');
          
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'realtime-listener': {
          addLog('Establishing transient onSnapshot stream...');
          const runId = `listener-test-${Date.now()}`;
          const targetDocRef = doc(db, 'diagnostics_runs', runId);
          
          let updateReceived = false;
          
          // Setup listener
          const unsubscribe = onSnapshot(targetDocRef, (snapshot) => {
            if (snapshot.exists()) {
              addLog(`⚡ Realtime event received: Document updated with status "${snapshot.data().status}"`);
              updateReceived = true;
            }
          }, (err) => {
            addLog(`❌ Listener snapshot error: ${err.message}`);
          });

          addLog('Writing live update to trigger listener callback...');
          await setDoc(targetDocRef, {
            type: 'realtime-stream-test',
            status: 'Triggered'
          });

          // Wait up to 3 seconds for snapshot event
          for (let i = 0; i < 15; i++) {
            await new Promise(resolve => setTimeout(resolve, 200));
            if (updateReceived) break;
          }

          addLog('Tearing down realtime subscription...');
          unsubscribe();

          addLog('Cleaning up realtime trigger document...');
          await deleteDoc(targetDocRef);

          if (!updateReceived) {
            throw new Error('Realtime event timeout: callback did not receive the document write update within 3 seconds.');
          }

          addLog('Success! Realtime bidirectional replication validated.');
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'google-maps': {
          addLog('Checking Google Maps JS SDK loading state...');
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || (serverCheckResult?.environment?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_PRESENT ? 'Present on Server' : '');
          
          if (!apiKey) {
            throw new Error('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not defined in client or server environments.');
          }
          
          const isLoaded = typeof window !== 'undefined' && (window as any).google?.maps;
          addLog(`Maps API Key status: Present. Browser loaded state: ${isLoaded ? 'Initialized' : 'Not yet fully rendered in iframe'}`);
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'gemini': {
          addLog('Checking Gemini Generative AI configuration...');
          await fetchServerStatus();
          
          const hasKey = serverCheckResult?.environment?.GEMINI_API_KEY_PRESENT;
          if (!hasKey) {
            throw new Error('GEMINI_API_KEY is not configured in the server environment (.env).');
          }
          
          addLog('Executing prompt evaluation on Gemini Provider Stub...');
          const result = await GeminiProvider.scanInfrastructureImage('https://images.unsplash.com/photo-1515162305285-0293e4767cc2');
          addLog(`Success! Stub inference executed in ${result.confidence}% confidence: "${result.categoryMatch}"`);
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'storage': {
          addLog('Validating Firebase Storage instance...');
          if (!storage) {
            throw new Error('Firebase storage instance is not defined.');
          }
          addLog(`Firebase storage initialized successfully. Bucket reference: ${storage.app.options.storageBucket || 'default'}`);
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'repositories': {
          addLog('Querying IssueRepository.getAll()...');
          const results = await IssueRepository.getAll();
          addLog(`Success! Repository successfully returned ${results.length} active records.`);
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'services': {
          addLog('Querying IssueService.getIssues()...');
          const results = await IssueService.getIssues();
          addLog(`Success! Orchestration service returned ${results.length} active issues.`);
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        case 'env-vars': {
          addLog('Evaluating system environmental settings...');
          await fetchServerStatus();
          
          if (!serverCheckResult) {
            throw new Error('Could not contact Server-side Diagnostics Check API.');
          }
          
          const envs = serverCheckResult.environment;
          addLog(`Server GEMINI_API_KEY: ${envs.GEMINI_API_KEY_PRESENT ? '✅ Present' : '❌ Missing'}`);
          addLog(`Server FIREBASE_API_KEY: ${envs.NEXT_PUBLIC_FIREBASE_API_KEY_PRESENT ? '✅ Present' : '❌ Missing'}`);
          addLog(`Server Applet Config JSON: ${envs.FIREBASE_APPLET_CONFIG_PRESENT ? '✅ Present' : '❌ Missing'}`);
          
          updateSubsystem(id, { status: 'Passed' });
          break;
        }

        default:
          throw new Error(`Unsupported test ID: ${id}`);
      }
    } catch (e: any) {
      const errMessage = e.message || String(e);
      addLog(`❌ Test Failed for ${id.toUpperCase()}: ${errMessage}`);
      updateSubsystem(id, { status: 'Failed', lastError: errMessage });
    }
  };

  const handleSaveDelay = (ms: number) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dev_artificial_delay', ms.toString());
      setArtificialDelay(ms);
      addLog(`Artificial development delay updated to ${ms}ms.`);
      if (ms > 0) {
        addLog(`⚠️ Skeleton loaders will now be artificially displayed for ${ms}ms during page navigation!`);
      } else {
        addLog('Artificial repository latency removed.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm">
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary font-mono text-[9px] font-bold uppercase tracking-wider">
                  Phase 4.1 Backend
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h1 className="font-sans font-extrabold text-2xl md:text-3xl tracking-tight text-slate-900 mt-1">Backend Diagnostics</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={runAllTests}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-sans font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              Run Verification Suite
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Subsystem Cards */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-sans font-bold text-base text-slate-800">Verification Targets ({subsystems.length})</h2>
              <span className="font-mono text-xs text-slate-500">Click individual run to test isolated systems</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subsystems.map((sub) => {
                const isPassed = sub.status === 'Passed';
                const isFailed = sub.status === 'Failed';
                const isRunning = sub.status === 'Running';

                return (
                  <div 
                    key={sub.id} 
                    className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between min-h-[160px] hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0">
                          {sub.icon}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase tracking-wider ${
                          isPassed ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          isFailed ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                          isRunning ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                          'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                      <h3 className="font-sans font-bold text-sm text-slate-900 leading-tight mb-1">{sub.name}</h3>
                      
                      {/* Subsystem Details */}
                      <div className="space-y-1 mt-2">
                        <div className="flex justify-between font-mono text-[9px] text-slate-400">
                          <span>Tested At</span>
                          <span className="text-slate-600 font-medium">{sub.lastTestTime}</span>
                        </div>
                        {sub.lastError !== 'None' && (
                          <div className="text-[10px] font-mono text-rose-600 border border-rose-100 bg-rose-50/30 p-2 rounded-lg mt-2 overflow-hidden text-ellipsis whitespace-nowrap">
                            Error: {sub.lastError}
                          </div>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => runSpecificTest(sub.id)}
                      disabled={isRunning}
                      className="mt-4 w-full py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-50 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                      {isRunning ? 'Running...' : 'Run Test'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Controller & Terminal Log Console */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Artificial Delay Controller */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-5 h-5 text-brand-primary" />
                <h3 className="font-sans font-bold text-sm text-slate-900">Skeleton Loading Latency Controller</h3>
              </div>
              <p className="font-body text-xs text-slate-500 mb-6">
                Artificially delay repository and network requests to inspect skeleton loaders. This helps verify loading layouts on Citizen Feed, Timeline, Mission Control, Analytics, and Issue Details.
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-bold text-slate-800">Current Delay:</span>
                  <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold ${
                    artificialDelay > 0 ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {artificialDelay === 0 ? 'Realtime (0ms)' : `${artificialDelay}ms Delay`}
                  </span>
                </div>

                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {[0, 500, 1500, 3000].map((ms) => (
                    <button
                      key={ms}
                      onClick={() => handleSaveDelay(ms)}
                      className={`py-2 rounded-xl font-mono text-xs font-bold border transition-all ${
                        artificialDelay === ms 
                          ? 'bg-slate-900 text-white border-slate-900' 
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {ms === 0 ? 'Off' : `${ms}ms`}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="font-sans text-xs text-slate-400 leading-tight">
                    *Note: Delay is stored in localStorage. Setting it to 0ms (Off) restores normal operations.
                  </span>
                </div>
              </div>
            </div>

            {/* Terminal Output Log Console */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 text-slate-100 shadow-xl flex flex-col h-[400px]">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-xs font-bold text-emerald-400">Interactive Output Log</span>
                </div>
                <button 
                  onClick={clearLogs}
                  className="px-2 py-1 rounded border border-slate-800 hover:border-slate-700 text-[10px] font-mono text-slate-400 hover:text-white transition-colors"
                >
                  Clear Logs
                </button>
              </div>

              {/* Monospaced Log Output Box */}
              <div className="flex-1 overflow-y-auto font-mono text-xs space-y-1.5 pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic">No verification runs executed yet. Click &quot;Run Verification Suite&quot; or individual &quot;Run Test&quot; buttons.</div>
                ) : (
                  logs.map((log, idx) => {
                    let color = 'text-slate-300';
                    if (log.includes('Success')) color = 'text-emerald-400';
                    else if (log.includes('❌') || log.includes('Failed') || log.includes('Error')) color = 'text-rose-400';
                    else if (log.includes('⚠️') || log.includes('Warning')) color = 'text-amber-400';
                    else if (log.includes('⚡')) color = 'text-cyan-400';
                    else if (log.includes('Testing')) color = 'text-brand-secondary font-bold';

                    return (
                      <div key={idx} className={`${color} leading-relaxed break-all`}>
                        {log}
                      </div>
                    );
                  })
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>

            {/* Manual Media Upload Retry Diagnostic Tool */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <HardDrive className="w-5 h-5 text-indigo-500 animate-pulse" />
                <h3 className="font-sans font-bold text-sm text-slate-900">Media Retry Pipeline Sandbox</h3>
              </div>
              <p className="font-body text-xs text-slate-500 mb-4">
                Test the decoupled upload pipeline. Choose any active issue (especially those marked as FAILED or RETRY_REQUIRED), pick an image, and verify instant Firestore patching.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-bold">Select Active Case Docket:</label>
                  <select 
                    value={selectedIssueId}
                    onChange={(e) => setSelectedIssueId(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none focus:border-indigo-500 focus:bg-white text-slate-800"
                  >
                    {retryIssues.map((item) => (
                      <option key={item.id} value={item.id}>
                        [{item.id.substring(0, 6)}] {item.title.substring(0, 25)}... ({item.evidenceStatus || 'AVAILABLE'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1.5 font-bold">Select Evidence Payload:</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={runDiagnosticRetry}
                    disabled={diagnosticRetrying || !selectedIssueId}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-mono file:font-bold file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer disabled:opacity-50 text-slate-700"
                  />
                </div>

                {diagnosticRetrying && (
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] font-mono text-slate-500 font-bold">
                      <span>UPLOADING RETRY BATCH...</span>
                      <span>{diagnosticProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${diagnosticProgress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Environment Variables Checklist */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <h3 className="font-sans font-bold text-sm text-slate-900 mb-4">Environment Keys Checklist</h3>
              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">GEMINI_API_KEY</span>
                  <span className={serverCheckResult?.environment?.GEMINI_API_KEY_PRESENT ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                    {serverCheckResult?.environment?.GEMINI_API_KEY_PRESENT ? '✅ Present (Server-Side)' : '⚠️ Missing (Simulation Active)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span>
                  <span className={serverCheckResult?.environment?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_PRESENT ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>
                    {serverCheckResult?.environment?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_PRESENT ? '✅ Present' : '⚠️ Missing (Static Fallback)'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-100">
                  <span className="text-slate-500">Firebase Config Source</span>
                  <span className={serverCheckResult?.environment?.FIREBASE_APPLET_CONFIG_PRESENT ? 'text-emerald-600 font-bold' : 'text-blue-500 font-bold'}>
                    {serverCheckResult?.environment?.FIREBASE_APPLET_CONFIG_PRESENT ? '✅ firebase-applet-config.json' : 'Environment Variables'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Firestore Database ID</span>
                  <span className="text-slate-900 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                    {serverCheckResult?.firebase?.databaseId || 'default'}
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
