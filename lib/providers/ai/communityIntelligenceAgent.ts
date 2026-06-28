export const CommunityIntelligenceAgent = {
  async analyzeReport(issue: any): Promise<any> {
    const response = await fetch('/api/ai/community-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue }),
    });
    if (!response.ok) throw new Error('Failed to analyze report');
    return response.json();
  }
};
