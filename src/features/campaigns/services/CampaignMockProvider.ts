import type { CampaignProvider } from "./provider";
import type { Campaign, CampaignPerf, CampaignAssignment } from "@/core/api/dto";
import campaignsData from "@/mocks/campaigns.json";
import assignmentsData from "@/mocks/campaignAssignments.json";
import perfsData from "@/mocks/campaignPerf.json";

export const CampaignMockProvider: CampaignProvider = {
  async getAdvisorCampaigns(advisorId, filters) {
    let list = campaignsData as Campaign[];

    // Apply filters
    if (filters?.estado) {
      list = list.filter((c) => c.estado === filters.estado);
    }
    if (filters?.producto) {
      list = list.filter((c) => c.producto === filters.producto);
    }
    if (filters?.canal) {
      list = list.filter((c) => c.canal === filters.canal);
    }
    if (filters?.periodo) {
      list = list.filter(
        (c) =>
          c.fechaInicio >= filters.periodo!.from &&
          c.fechaFin <= filters.periodo!.to
      );
    }

    // RLS: Only campaigns where the advisor has an assignment
    const myIds = (assignmentsData as CampaignAssignment[])
      .filter((a) => a.advisorId === advisorId)
      .map((a) => a.campaignId);
    
    const result = list.filter((c) => myIds.includes(c.campaignId));

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 350));
    
    return result;
  },

  async getAdvisorCampaignPerf(advisorId, campaignId) {
    const result = (perfsData as CampaignPerf[]).filter(
      (p) => p.advisorId === advisorId && p.campaignId === campaignId
    );
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    return result;
  },

  async getAdvisorCampaignAssignments(advisorId) {
    const result = (assignmentsData as CampaignAssignment[]).filter(
      (a) => a.advisorId === advisorId
    );
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 280));
    
    return result;
  },
};
