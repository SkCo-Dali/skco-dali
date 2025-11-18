import type { Campaign, CampaignPerf, CampaignAssignment } from "@/core/api/dto";

export interface CampaignProvider {
  /**
   * Get campaigns assigned to an advisor with optional filters
   * TODO: Backend endpoint GET /api/advisors/:advisorId/campaigns
   */
  getAdvisorCampaigns(
    advisorId: string,
    filters?: {
      estado?: string;
      producto?: string;
      canal?: string;
      periodo?: { from: string; to: string };
    }
  ): Promise<Campaign[]>;

  /**
   * Get performance data for a specific campaign and advisor
   * TODO: Backend endpoint GET /api/advisors/:advisorId/campaigns/:campaignId/performance
   */
  getAdvisorCampaignPerf(advisorId: string, campaignId: string): Promise<CampaignPerf[]>;

  /**
   * Get campaign assignments for an advisor
   * TODO: Backend endpoint GET /api/advisors/:advisorId/campaign-assignments
   */
  getAdvisorCampaignAssignments(advisorId: string): Promise<CampaignAssignment[]>;
}
