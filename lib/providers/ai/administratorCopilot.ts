export interface CopilotInsights {
  operationalBriefing: string;
  priorityQueue: string[];
  departmentRecommendations: { department: string; action: string }[];
  emergingHotspots: { location: string; latitude: number; longitude: number; issueType: string; description: string; reportCount: number }[];
}

export const AdministratorCopilot = {
  async generateInsights(issues: any[]): Promise<CopilotInsights> {
    const response = await fetch('/api/ai/administrator-copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issues }),
    });
    if (!response.ok) throw new Error('Failed to generate insights');
    return response.json();
  }
};
