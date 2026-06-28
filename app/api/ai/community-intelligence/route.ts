import { NextRequest, NextResponse } from "next/server";
import { AIOrchestrator } from "../../../../lib/ai-server/orchestrator";
import { Type } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { issue } = await req.json();
    
    const schema = {
      type: Type.OBJECT,
      properties: {
        categoryMatch: { type: Type.STRING },
        severityMatch: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
        routingTo: { type: Type.STRING },
        aiSummary: { type: Type.STRING },
        duplicateDetected: { type: Type.BOOLEAN },
      },
      required: ["categoryMatch", "severityMatch", "routingTo", "aiSummary", "duplicateDetected"],
    };

    const prompt = `Analyze this civic issue report:
Title: ${issue.title}
Description: ${issue.description}
Category: ${issue.category}
Location: ${issue.location}

Provide a structured analysis for urgency, category routing, and a brief summary.`;

    const result = await AIOrchestrator.generateObject(prompt, schema);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to process intelligence request" }, { status: 500 });
  }
}
