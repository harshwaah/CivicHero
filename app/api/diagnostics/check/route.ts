import { NextRequest, NextResponse } from 'next/server';
import { aiMetrics } from '../../../../lib/ai-server/orchestrator';

export async function GET(req: NextRequest) {
  try {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const hasMapsKey = !!mapsKey;
    
    // Check if Firebase is configured via environment variables
    const hasFirebaseEnv = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    // Server-side memory usage
    const memory = typeof process !== 'undefined' ? process.memoryUsage() : null;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        GEMINI_API_KEY_PRESENT: hasGeminiKey,
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_PRESENT: hasMapsKey,
        NEXT_PUBLIC_FIREBASE_API_KEY_PRESENT: hasFirebaseEnv,
        FIREBASE_APPLET_CONFIG_PRESENT: false,
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      firebase: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'missing',
        databaseId: 'default',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'missing',
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
