import type { Advisor } from "@/core/api/dto";

export interface AdvisorProvider {
  /**
   * Get a single advisor by ID
   * TODO: Backend endpoint GET /api/advisors/:id
   */
  getAdvisorById(id: string): Promise<Advisor>;
  
  /**
   * Get list of advisors with optional filters and pagination
   * TODO: Backend endpoint GET /api/advisors?q=&region=&zona=&page=
   */
  getAdvisors(params: {
    q?: string;
    region?: string;
    zona?: string;
    page?: number;
  }): Promise<{ items: Advisor[]; total: number }>;
}
