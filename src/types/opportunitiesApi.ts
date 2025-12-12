// Types for Market Dali Opportunities API

export interface ApiOpportunity {
  OpportunityId: number;
  Priority: string;
  lead_count: number;
  Title: string;
  Subtitle: string;
  Description: string;
  Categories: string[];
  Beggining: string;
  End: string;
  Type: string;
  IsActive: boolean;
  IsFavourite: boolean;
  ComisionPotencial: number;
  DaliPrompt?: string;
  LastCampaignName?: string | null;
  ImageUrl?: string | null;
  ImageUrlMobile?: string | null;
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
  id: string;
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

export interface UpdateFavouriteRequest {
  opportunity_id: number;
  is_favourite: boolean;
}

export interface UpdateFavouriteResponse {
  success: boolean;
  message?: string;
}

export interface PreviewLeadFromOpportunity {
  id: string | null;
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
  OpportunityId: number;
  LastCampaignName: string | null;
  AlreadyLoaded: boolean;
}