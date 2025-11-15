import { create } from "zustand";
import type { Advisor } from "@/core/api/dto";

interface AdvisorState {
  // Current advisor being viewed
  currentAdvisor: Advisor | null;
  setCurrentAdvisor: (advisor: Advisor | null) => void;

  // List of advisors (for the leader home)
  advisors: Advisor[];
  setAdvisors: (advisors: Advisor[]) => void;

  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Filters
  filters: {
    q?: string;
    region?: string;
    zona?: string;
  };
  setFilters: (filters: AdvisorState["filters"]) => void;
  clearFilters: () => void;
}

export const useAdvisorStore = create<AdvisorState>((set) => ({
  currentAdvisor: null,
  setCurrentAdvisor: (advisor) => set({ currentAdvisor: advisor }),

  advisors: [],
  setAdvisors: (advisors) => set({ advisors }),

  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  filters: {},
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
