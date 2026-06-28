import { NextRequest, NextResponse } from "next/server";
import { AIOrchestrator } from "../../../../lib/ai-server/orchestrator";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { issue } = await req.json();
    
    const schema = {
      type: Type.OBJECT,
      properties: {
        isVerified: { type: Type.BOOLEAN },
        confidenceScore: { type: Type.NUMBER },
        flags: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
        analysisSummary: { type: Type.STRING },
        languageTone: { type: Type.STRING }
      },
      required: ["isVerified", "confidenceScore", "flags", "analysisSummary", "languageTone"],
    };

    const prompt = `Analyze this civic issue report for community integrity and reporting quality:
Title: ${issue.title}
Description: ${issue.description}
Category: ${issue.category}

Validate authenticity, assess language tone, score confidence (0-100), and flag suspicious activity (like profanity or spam).`;

    const result = await AIOrchestrator.generateObject(prompt, schema);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    const message = error?.message || "Failed to process integrity request";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
