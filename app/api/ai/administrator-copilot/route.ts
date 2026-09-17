import { NextRequest, NextResponse } from "next/server";
import { AIOrchestrator, aiMetrics } from "../../../../lib/ai-server/orchestrator";
import { Type } from "@google/genai";
import { db, isFirebaseConfigured, doc, getDoc, setDoc } from "../../../../lib/firebase/firestore";
import { serverAiConfig } from "../../../../lib/config";

// Server memory fallback cache if Firebase is not active
let serverMemoryCache: any = null;
let serverMemoryCacheTime = 0;
let serverMemoryInvalidated = false;

export async function POST(req: NextRequest) {
  try {
    const { issues, forceRefresh } = await req.json();
    
    // Configurable TTL in milliseconds (from centralized config, default 15 minutes)
    const TTL_MS = serverAiConfig.copilotTtlMs;

    let useCache = false;
    let cacheData: any = null;
    let cacheMissReason = "no_cache";

    if (forceRefresh) {
      cacheMissReason = "explicit_refresh";
    } else {
      if (isFirebaseConfigured) {
        try {
          const briefingRef = doc(db, "copilot_briefings", "latest");
          const briefingSnap = await getDoc(briefingRef);
          
          if (briefingSnap.exists()) {
            const data = briefingSnap.data();
            const age = Date.now() - (data.updatedAt || 0);
            const isExpired = age > TTL_MS;
            const isInvalidated = data.invalidated === true;

            if (isInvalidated) {
              cacheMissReason = "invalidated_by_event";
            } else if (isExpired) {
              cacheMissReason = "expired_ttl";
            } else {
              useCache = true;
              cacheData = data;
              aiMetrics.cacheHits += 1;
              const remainingSec = Math.max(0, Math.round((TTL_MS - age) / 1000));
              console.log(`[COPILOT CACHE] Cache Hit (Firestore). Returning cached briefing. TTL remaining: ${remainingSec}s. Event-invalidated: false`);
            }
          } else {
            cacheMissReason = "missing_cache_doc";
          }
        } catch (err) {
          console.warn("[COPILOT CACHE] Failed to read from Firestore cache, falling back to memory/AI:", err);
          cacheMissReason = "firestore_read_error";
        }
      } else {
        // Local memory fallback cache
        if (serverMemoryCache) {
          const age = Date.now() - serverMemoryCacheTime;
          const isExpired = age > TTL_MS;
          const isInvalidated = serverMemoryInvalidated;

          if (isInvalidated) {
            cacheMissReason = "invalidated_by_event";
          } else if (isExpired) {
            cacheMissReason = "expired_ttl";
          } else {
            useCache = true;
            cacheData = serverMemoryCache;
            aiMetrics.cacheHits += 1;
            const remainingSec = Math.max(0, Math.round((TTL_MS - age) / 1000));
            console.log(`[COPILOT CACHE] Cache Hit (Server Memory). Returning cached briefing. TTL remaining: ${remainingSec}s.`);
          }
        } else {
          cacheMissReason = "missing_memory_cache";
        }
      }
    }

    if (useCache && cacheData) {
      return NextResponse.json(cacheData);
    }

    // Cache miss - log the reason
    aiMetrics.cacheMisses += 1;
    console.log(`[COPILOT CACHE] Cache Miss. Reason: ${cacheMissReason}. Generating new briefing using AI Router...`);

    const schema = {
      type: Type.OBJECT,
      properties: {
        operationalBriefing: { type: Type.STRING },
        priorityQueue: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
        departmentRecommendations: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT,
            properties: {
              department: { type: Type.STRING },
              action: { type: Type.STRING }
            }
          } 
        },
        emergingHotspots: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER },
              issueType: { type: Type.STRING },
              description: { type: Type.STRING },
              reportCount: { type: Type.NUMBER }
            }
          } 
        }
      },
      required: ["operationalBriefing", "priorityQueue", "departmentRecommendations", "emergingHotspots"],
    };

    const prompt = `Act as an Administrator Copilot for a city's public works department.
Analyze these recent civic issues:
${JSON.stringify(issues.map((i: any) => ({
  id: i.id,
  title: i.title,
  category: i.category,
  urgency: i.urgency,
  status: i.status,
  location: i.location,
  coordinates: i.coordinates
}))).slice(0, 5000)}

Provide a concise operational briefing, priority queue recommendations, department recommendations, and identify any emerging geographic hotspots (include estimated center latitude and longitude for the hotspots).`;

    const result = await AIOrchestrator.generateObject(prompt, schema);
    
    // Append tracking metadata
    const enrichedResult = {
      ...result,
      updatedAt: Date.now(),
      invalidated: false
    };

    // Save to Cache
    if (isFirebaseConfigured) {
      try {
        const briefingRef = doc(db, "copilot_briefings", "latest");
        await setDoc(briefingRef, enrichedResult);
        console.log("[COPILOT CACHE] Successfully saved newly generated briefing to Firestore cache.");
      } catch (err) {
        console.warn("[COPILOT CACHE] Failed to save newly generated briefing to Firestore cache:", err);
      }
    } else {
      serverMemoryCache = enrichedResult;
      serverMemoryCacheTime = Date.now();
      serverMemoryInvalidated = false;
      console.log("[COPILOT CACHE] Successfully saved newly generated briefing to Server Memory fallback.");
    }

    return NextResponse.json(enrichedResult);
  } catch (error: any) {
    console.error("[COPILOT CACHE] Error processing administrator-copilot route:", error);
    const message = error?.message || "Failed to process copilot request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
