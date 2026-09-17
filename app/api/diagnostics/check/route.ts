import { NextRequest, NextResponse } from 'next/server';
import { firebaseConfig, validateEnvironment } from '@/lib/config';
import { aiMetrics } from '@/lib/ai-server/orchestrator';

export async function GET(req: NextRequest) {
  try {
    const diagnosticReport = validateEnvironment();
    const memory = typeof process !== 'undefined' ? process.memoryUsage() : null;

    return NextResponse.json({
      success: true,
      timestamp: diagnosticReport.timestamp,
      isFullyConfigured: diagnosticReport.isFullyConfigured,
      diagnostics: diagnosticReport,
      environment: {
        GEMINI_API_KEY_PRESENT: diagnosticReport.subsystems.geminiAI.status !== 'Missing',
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_PRESENT: diagnosticReport.subsystems.googleMaps.status !== 'Missing',
        NEXT_PUBLIC_FIREBASE_API_KEY_PRESENT: diagnosticReport.subsystems.firebase.status === 'Present',
        CENTRALIZED_CONFIG_ACTIVE: true,
        FIREBASE_APPLET_CONFIG_PRESENT: false, // Retired in Phase 8.2 in favor of centralized env variables
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      firebase: {
        projectId: firebaseConfig.projectId,
        databaseId: firebaseConfig.databaseId,
        authDomain: firebaseConfig.authDomain,
        isConfigured: firebaseConfig.isConfigured,
      },
      aiMetrics: {
        totalRequests: aiMetrics.totalRequests,
        totalLatency: aiMetrics.totalLatency,
        averageLatency: aiMetrics.totalRequests > 0 ? (aiMetrics.totalLatency / aiMetrics.totalRequests) : 0,
        totalTokens: aiMetrics.totalTokens,
        averageTokens: aiMetrics.totalRequests > 0 ? (aiMetrics.totalTokens / aiMetrics.totalRequests) : 0,
        cacheHits: aiMetrics.cacheHits,
        cacheMisses: aiMetrics.cacheMisses,
        fallbackCount: aiMetrics.fallbackCount,
        fallbackFrequency: aiMetrics.totalRequests > 0 ? (aiMetrics.fallbackCount / aiMetrics.totalRequests) : 0,
        requestHistory: aiMetrics.requestHistory
      },
      memoryUsage: memory ? {
        rss: Math.round(memory.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + ' MB',
        external: Math.round(memory.external / 1024 / 1024) + ' MB',
      } : null
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || String(err),
    }, { status: 500 });
  }
}
