import { GoogleGenAI, Type } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.APP_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("APP_GEMINI_API_KEY environment variable is not defined. Please add it via the Settings > Secrets menu in AI Studio.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

export const AIOrchestrator = {
  async generateObject(prompt: string, schema: any) {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Failed to generate AI response");
  },

  async evaluateImage(prompt: string, imageUrl: string, schema: any) {
    const fullPrompt = `${prompt}\n\nImage reference: ${imageUrl}`;
    return this.generateObject(fullPrompt, schema);
  }
};
