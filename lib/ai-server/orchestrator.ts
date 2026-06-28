import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const AIOrchestrator = {
  async generateObject(prompt: string, schema: any) {
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
    // For this prototype, we'll assume the imageUrl is a base64 string or public URL
    // If it's a base64 data URI, we could extract the parts, but for simplicity, we pass it in text for now
    const fullPrompt = `${prompt}\n\nImage reference: ${imageUrl}`;
    return this.generateObject(fullPrompt, schema);
  }
};
