
import { Lead } from "@/types/crm";

interface FilterOptions {
  searchTerm: string;
  statusFilter: string;
  assignedToFilter: string;
  priorityFilter: string;
  stageFilter: string;
  productFilter: string;
  campaignFilter: string;
  portfolioFilter: string;
  [key: string]: string;
}

export const applyFilters = (leads: Lead[], filters: FilterOptions): Lead[] => {
  return leads.filter(lead => {
    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      const searchMatch = 
        lead.name.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        lead.phone.toLowerCase().includes(searchLower) ||
        (lead.company && lead.company.toLowerCase().includes(searchLower));
      
      if (!searchMatch) return false;
    }

    // Status filter
    if (filters.statusFilter && lead.status !== filters.statusFilter) {
      return false;
    }

    // Assigned to filter
    if (filters.assignedToFilter && lead.assignedTo !== filters.assignedToFilter) {
      return false;
    }

    // Priority filter
    if (filters.priorityFilter && lead.priority !== filters.priorityFilter) {
      return false;
    }

    // Stage filter
    if (filters.stageFilter && lead.stage !== filters.stageFilter) {
      return false;
    }

    // Product filter
    if (filters.productFilter && lead.product !== filters.productFilter) {
      return false;
    }

    // Campaign filter
    if (filters.campaignFilter && lead.campaign !== filters.campaignFilter) {
      return false;
    }

    // Portfolio filter
    if (filters.portfolioFilter && lead.portfolio !== filters.portfolioFilter) {
      return false;
    }

    return true;
  });
};
