import { GoogleGenAI } from '@google/genai';

export interface GeminiScanResult {
  categoryMatch: string;
  severityMatch: 'Low' | 'Medium' | 'High' | 'Critical';
  confidence: number;
  routingTo: string;
  aiSummary: string;
}

const isGeminiConfigured = !!process.env.GEMINI_API_KEY;

// Lazy initialization pattern to prevent crashes if GEMINI_API_KEY is missing
let aiClient: any = null;

function getGeminiClient() {
  if (!aiClient && isGeminiConfigured) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI client:', err);
    }
  }
  return aiClient;
}

export const GeminiProvider = {
  isConfigured(): boolean {
    return isGeminiConfigured;
  },

  /**
   * Stub for scanning an image and categorizing an incident
   */
  async scanInfrastructureImage(imageBufferUrl: string, prompt?: string): Promise<GeminiScanResult> {
    console.log('GeminiProvider.scanInfrastructureImage called');
    
    if (isGeminiConfigured) {
      const client = getGeminiClient();
      if (client) {
        console.log('Gemini API is configured. Preparing server-side prompt proxy pipeline...');
        // In the next phase, we would execute:
        // const response = await client.models.generateContent({ ... });
      }
    } else {
      console.warn('⚠️ GEMINI_API_KEY is not defined. Returning pre-compiled simulation results.');
    }

    // Simulate model inference latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      categoryMatch: 'Road Surface Defect',
      severityMatch: 'High',
      confidence: 94,
      routingTo: 'Public Works - Road Maintenance',
      aiSummary: 'Image scanning detects road pavement degradation with clear signs of edge cracking and deep core cavitation (~10-15cm depth). High risk for vehicles, buses, and cyclists. Recommended priority: High.',
    };
  },

  /**
   * Stub for general conversational guidance regarding public reports
   */
  async generateGuidance(prompt: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return `[Gemini Guidance Stub] Received prompt of size ${prompt.length}. Real implementation will query gemini-2.5-flash with custom system instructions.`;
  },
};
