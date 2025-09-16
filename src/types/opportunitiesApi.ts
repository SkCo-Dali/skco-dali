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

export interface LoadLeadsFromOpportunityRequest {
  OpportunityId: number;
}

export interface LoadLeadsFromOpportunityResponse {
  CreatedBy: string;
  name: string;
  email: string;
  phone: string;
  documentNumber: number;
  company: string | null;
  source: string;
  campaign: string | null;
  product: any[];
  stage: string;
  priority: string;
  value: number;
  assignedTo: string;
  nextFollowUp: string | null;
  notes: string | null;
  tags: any[];
  DocumentType: string;
  SelectedPortfolios: any[];
  CampaignOwnerName: string | null;
  Age: number;
  Gender: string;
  PreferredContactChannel: string | null;
  AdditionalInfo: Record<string, any>;
}