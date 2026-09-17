'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  CheckCheck, 
  Archive, 
  Info, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Inbox,
  ArrowRight
} from 'lucide-react';
import { NotificationRepository } from '../lib/repositories/notificationRepository';
import { Notification } from '../lib/models';
import { Skeleton } from './Skeleton';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = NotificationRepository.subscribeByUserId('citizen-admin-1', (notifs) => {
      // Filter out archived notifications
      const visible = notifs.filter(n => !n.isArchived);
      setNotifications(visible);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleMarkRead = async (id: string) => {
    await NotificationRepository.markAsRead(id);
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await NotificationRepository.archive(id);
  };

  const handleMarkAllRead = async () => {
    await NotificationRepository.markAllRead('citizen-admin-1');
  };

  // Grouping function
  const getGroup = (timestamp: string) => {
    const lower = timestamp.toLowerCase();
    if (lower.includes('now') || lower.includes('min') || lower.includes('hour') || lower.includes('today')) {
      return 'Today';
    }
    if (lower.includes('yesterday') || lower.includes('1 day')) {
      return 'Yesterday';
    }
    return 'Earlier';
  };

  const grouped = notifications.reduce((acc, notif) => {
    const grp = getGroup(notif.timestamp || 'Today');
    if (!acc[grp]) acc[grp] = [];
    acc[grp].push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  // Sorting order of groups
  const groupKeys = ['Today', 'Yesterday', 'Earlier'].filter(k => grouped[k] && grouped[k].length > 0);

  // Return priority styles and icon
  const getPriorityStyle = (notif: Notification) => {
    const type = notif.type || 'system';
    if (type === 'critical' || type === 'incident' || notif.title.toLowerCase().includes('critical') || notif.title.toLowerCase().includes('smoke')) {
      return {
        bg: 'bg-red-500/5 hover:bg-red-500/10 border-red-100',
        border: 'border-l-4 border-l-red-500',
        icon: ShieldAlert,
        iconColor: 'text-red-500 bg-red-50',
        badge: 'Critical Alert'
      };
    }
    if (type === 'status_update' || type === 'assignment') {
      return {
        bg: 'bg-amber-500/5 hover:bg-amber-500/10 border-amber-100',
        border: 'border-l-4 border-l-amber-500',
        icon: AlertTriangle,
        iconColor: 'text-amber-600 bg-amber-50',
        badge: 'Status Update'
      };
    }
    return {
      bg: 'bg-slate-50/50 hover:bg-slate-50 border-slate-100',
      border: 'border-l-4 border-l-slate-400',
      icon: Info,
      iconColor: 'text-slate-500 bg-slate-100',
      badge: 'System'
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[28px] border border-slate-150 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="flex-1 flex flex-col gap-6"
    >
      {/* Header bar */}
      <div className="bg-white rounded-[24px] border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans font-extrabold text-lg text-brand-primary tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-primary" />
            <span>Realtime Notifications</span>
          </h2>
          <p className="font-body text-xs text-brand-muted mt-1">
            Stay updated with nearby emergency dispatches and live resolution tracking.
          </p>
        </div>

        {notifications.some(n => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-sans font-bold text-xs rounded-xl transition-colors shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Main List */}
      {notifications.length === 0 ? (
        <div className="bg-white rounded-[28px] border border-slate-150 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Inbox className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-lg text-brand-primary">All Caught Up!</h3>
            <p className="font-body text-xs text-brand-muted max-w-sm mt-1">
              You are fully up-to-date. When public safety bulletins or resolution status changes occur, they will appear here in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {groupKeys.map((grpKey) => (
              <div key={grpKey} className="space-y-3">
                <h4 className="font-sans font-extrabold text-xs text-slate-400 uppercase tracking-wider font-mono px-1">
                  {grpKey}
                </h4>

                <div className="flex flex-col gap-3">
                  {grouped[grpKey].map((notif) => {
                    const style = getPriorityStyle(notif);
                    const Icon = style.icon;

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleMarkRead(notif.id)}
                        className={`group relative p-4 rounded-2xl border ${style.bg} ${style.border} transition-all duration-200 cursor-pointer flex gap-4 items-start`}
                      >
                        {/* Status Unread Dot Indicator */}
                        {!notif.isRead && (
                          <span className="absolute top-4.5 right-12 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        )}

                        {/* Left Icon badge */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Mid Content */}
                        <div className="flex-1 min-w-0 pr-8">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-white border border-slate-100 text-brand-muted">
                              {style.badge}
                            </span>
                            <span className="font-mono text-[9px] text-slate-400">
                              {notif.timestamp}
                            </span>
                          </div>

                          <h5 className={`font-sans font-extrabold text-sm tracking-tight ${
                            notif.isRead ? 'text-slate-600 font-medium' : 'text-brand-primary'
                          }`}>
                            {notif.title}
                          </h5>
                          
                          <p className="font-body text-xs text-brand-muted mt-1 leading-relaxed">
                            {notif.message}
                          </p>

                          {notif.relatedIssueId && (
                            <div className="flex items-center gap-1 mt-2 font-sans font-bold text-[10px] text-brand-secondary">
                              <span>Trace issue file</span>
                              <ArrowRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          {!notif.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead(notif.id);
                              }}
                              title="Mark as read"
                              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleArchive(notif.id, e)}
                            title="Archive"
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
