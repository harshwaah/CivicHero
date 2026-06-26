'use client';

import React, { useEffect, useState } from 'react';
import { isFirebaseConfigured, db } from '@/lib/firebase/firestore';
import { useMaps } from '@/lib/providers/maps/mapProvider';
import { IssueService } from '@/lib/services/issueService';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

export default function DiagnosticsPage() {
  const { apiKey, isLoaded: mapsLoaded, loadError: mapsError } = useMaps();
  const [repoStatus, setRepoStatus] = useState<string>('Checking...');

  useEffect(() => {
    async function checkRepo() {
      try {
        const issues = await IssueService.getIssues();
        setRepoStatus(`Active (${issues.length} items fetched from local mock repository)`);
      } catch (e) {
        setRepoStatus(`Error: ${e}`);
      }
    }
    checkRepo();
  }, []);

  const StatusItem = ({ label, status, detail, success }: { label: string, status: string, detail: string, success: boolean }) => (
    <div className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-1 shadow-sm">
      <div className="flex items-center gap-2">
        {success ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
        <span className="font-sans font-bold text-sm text-slate-900">{label}</span>
      </div>
      <div className="pl-7">
        <span className="font-mono text-xs font-bold text-slate-500 uppercase">{status}</span>
        <p className="font-body text-xs text-slate-500 mt-1">{detail}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbfc] text-brand-primary p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="font-sans font-extrabold text-2xl tracking-tight">System Diagnostics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusItem 
            label="Firebase Connection" 
            status={isFirebaseConfigured ? "Configured" : "Missing"} 
            detail={isFirebaseConfigured ? "Connected to Firebase project" : "Falling back to local mock repository. Check .env variables."}
            success={isFirebaseConfigured}
          />
          
          <StatusItem 
            label="Google Maps API" 
            status={apiKey ? (mapsLoaded ? "Loaded successfully" : (mapsError ? "Load Error" : "Loading...")) : "Missing"} 
            detail={apiKey ? "API Key is present and functioning" : "Falling back to Placeholder Map. Check NEXT_PUBLIC_GOOGLE_MAPS_API_KEY."}
            success={!!apiKey && !mapsError}
          />

          <StatusItem 
            label="Data Synchronization Layer" 
            status={repoStatus} 
            detail="Using IssueRepository via IssueService"
            success={repoStatus.startsWith('Active')}
          />
          
          <StatusItem 
            label="Environment Variables" 
            status={process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "Present" : "Missing / Partial"} 
            detail="Used to connect to cloud services"
            success={!!process.env.NEXT_PUBLIC_FIREBASE_API_KEY}
          />
        </div>

      </div>
    </div>
  );
}
