import type { AdvisorProvider } from "./provider";
import type { Advisor } from "@/core/api/dto";
import advisorsData from "@/mocks/advisors.json";

export const AdvisorMockProvider: AdvisorProvider = {
  async getAdvisorById(id: string): Promise<Advisor> {
    const advisor = (advisorsData as Advisor[]).find((a) => a.id === id);
    if (!advisor) {
      throw new Error(`Advisor ${id} not found`);
    }
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return advisor;
  },

  async getAdvisors(params): Promise<{ items: Advisor[]; total: number }> {
    let list = advisorsData as Advisor[];

    // Apply filters
    if (params.q) {
      const query = params.q.toLowerCase();
      list = list.filter(
        (a) =>
          a.nombre.toLowerCase().includes(query) ||
          a.doc.includes(query) ||
          a.id.toLowerCase().includes(query)
      );
    }
    if (params.region) {
      list = list.filter((a) => a.region === params.region);
    }
    if (params.zona) {
      list = list.filter((a) => a.zona === params.zona);
    }

    // Simulate pagination (10 per page)
    const page = params.page || 1;
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return { items, total: list.length };
  },
};
