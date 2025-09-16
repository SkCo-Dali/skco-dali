// Types for Market Dali Opportunities API

export interface ApiOpportunity {
  OpportunityId: number;
  Priority: number;
  lead_count: number;
  Title: string;
  Subtitle: string;
  Description: string;
  Categories: string[];
}

export interface OpportunityFiltersApi {
  search?: string;
  priority?: number[];
  categories?: string[];
}

export interface OpportunityStatsApi {
  totalOpportunities: number;
  totalLeads: number;
  avgPriority: number;
  topCategories: Array<{
    name: string;
    count: number;
  }>;
}