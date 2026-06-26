export interface WorkOrderDraft {
  title: string;
  assignedDepartment: string;
  recommendedCrewSize: number;
  safetyProtocols: string[];
  equipmentNeeded: string[];
  narrativeWorkOrder: string;
}

export const AdministratorCopilot = {
  /**
   * Drafts a clear, professional Work Order description for field technicians
   */
  async draftWorkOrder(issueId: string, issueTitle: string, description: string): Promise<WorkOrderDraft> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      title: `WO-${Date.now().toString().slice(-6)}: ${issueTitle}`,
      assignedDepartment: 'Road Maintenance - Division B',
      recommendedCrewSize: 3,
      safetyProtocols: [
        'Place highly visible fluorescent traffic cones 50m upstream.',
        'Wear Class 3 high-visibility safety vests at all times.',
        'Use electronic directional flashing arrows on dispatch vehicles.',
      ],
      equipmentNeeded: [
        'Cold-mix asphalt patch bags',
        'Vibratory plate compactor',
        'Heavy-duty paving shovels and rakes',
        'Thermoplastic line marking paint',
      ],
      narrativeWorkOrder: `Technicians are instructed to proceed to the site to address the following citizen concern: "${description}". Excavate loose asphalt, sweep dry clean sediment debris, fill with hot or cold-mix compounds, and compress firmly using a vibratory compactor plate. Re-stripe adjacent road safety markers if damaged.`,
    };
  },

  /**
   * Drafts a formal letter or email to notify the local neighborhood of public works progress
   */
  async draftCitizenNotification(issueTitle: string, status: string): Promise<string> {
    return (
      `Dear Resident,\n\n` +
      `This is an official update from the CivicHero Platform. Regarding the reported infrastructure concern: "${issueTitle}".\n\n` +
      `We are pleased to inform you that the issue status has transitioned to "${status}". Municipal crews are committed to neighborhood safety and are working diligently. Thank you for your active participation in co-signing and verifying local concerns.\n\n` +
      `Warm regards,\n` +
      `CivicHero Public Works Team`
    );
  },
};
