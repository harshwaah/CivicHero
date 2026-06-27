import { NextRequest, NextResponse } from 'next/server';
import firebaseConfig from '../../../../firebase-applet-config.json';

export async function GET(req: NextRequest) {
  try {
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    const hasMapsKey = !!mapsKey;
    
    // Check if Firebase is configured in config json or env
    const hasAppletConfig = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
    const hasFirebaseEnv = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        GEMINI_API_KEY_PRESENT: hasGeminiKey,
        NEXT_PUBLIC_GOOGLE_MAPS_API_KEY_PRESENT: hasMapsKey,
        NEXT_PUBLIC_FIREBASE_API_KEY_PRESENT: hasFirebaseEnv,
        FIREBASE_APPLET_CONFIG_PRESENT: hasAppletConfig,
        NODE_ENV: process.env.NODE_ENV || 'development',
      },
      firebase: {
        projectId: hasAppletConfig ? firebaseConfig.projectId : (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'missing'),
        databaseId: hasAppletConfig ? firebaseConfig.firestoreDatabaseId : 'default',
        authDomain: hasAppletConfig ? firebaseConfig.authDomain : (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'missing'),
      }
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || String(err),
    }, { status: 500 });
  }
}
