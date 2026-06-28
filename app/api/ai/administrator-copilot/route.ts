import { NextRequest, NextResponse } from "next/server";
import { AIOrchestrator } from "../../../../lib/ai-server/orchestrator";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { issues } = await req.json();
    
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
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Failed to process copilot request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
