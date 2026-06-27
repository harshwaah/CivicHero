'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Users, Map, CheckCircle2, ChevronRight, Activity, ArrowUpRight } from 'lucide-react';
import { CivicMap } from '@/lib/providers/maps/mapProvider';
import { IssueService } from '@/lib/services/issueService';
import { Issue } from '@/lib/models';
import { useRouter } from 'next/navigation';

export default function IncidentsMapPreview() {
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const unsubscribe = IssueService.subscribe(fetchedIssues => {
      setIssues(fetchedIssues);
    });
    return () => unsubscribe();
  }, []);

  const recentActions = issues.slice(0, 3).map(i => ({
    id: i.id,
    title: i.title,
    location: i.location,
    time: 'Recent',
    status: i.status
  }));

  return (
    <div className="hidden lg:flex flex-col w-80 sticky top-28 h-[calc(100vh-120px)] gap-6 z-30">
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-2 flex flex-col gap-2 h-64">
        <div className="flex-1 rounded-[24px] overflow-hidden">
          <CivicMap
            locationName="Preview"
            categoryName="All"
            interactive={true}
            mapId="PREVIEW_MAP"
            markers={issues.map(i => ({
              id: i.id,
              lat: i.coordinates?.lat || 40.7128 + ((parseInt(i.id.split('-')[1] || '0') % 100) / 100 - 0.5) * 0.05,
              lng: i.coordinates?.lng || -74.0060 + ((parseInt(i.id.split('-')[1] || '0') % 50) / 50 - 0.5) * 0.05,
              title: i.title,
              urgency: i.urgency,
              status: i.status,
              onClick: () => router.push(`/admin/issues/${i.id}`) // Defaults to admin route for preview clicks
            }))}
          />
        </div>
      </div>

      {/* 2. Compact Live Activity Log */}
      <div className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6 flex-1 flex flex-col justify-between overflow-hidden">
        <div className="flex flex-col gap-4 h-full">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-sans font-bold text-xs text-brand-primary tracking-wider uppercase">Live Civic Activity</h4>
            <span className="font-mono text-[9px] font-bold text-brand-secondary bg-emerald-50 px-2 py-0.5 rounded-full">REALTIME</span>
          </div>

          <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
            {recentActions.map((action, i) => (
              <motion.div 
                key={action.id} 
                className="flex items-start gap-3 text-left group cursor-pointer"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => router.push(`/admin/issues/${action.id}`)}
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-brand-secondary shrink-0 border border-emerald-100/40 group-hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-sans font-bold text-xs text-brand-primary truncate group-hover:text-brand-secondary transition-colors">
                    {action.title}
                  </h5>
                  <p className="font-body text-[10px] text-brand-muted truncate mt-0.5">
                    {action.location} • {action.time}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 self-center group-hover:translate-x-1 transition-transform" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
