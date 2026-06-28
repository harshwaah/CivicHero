export const CommunityIntegrityAgent = {
  async evaluateReport(issue: any): Promise<any> {
    const response = await fetch('/api/ai/community-integrity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issue }),
    });
    if (!response.ok) throw new Error('Failed to evaluate report');
    return response.json();
  }
};
