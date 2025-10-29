
// Tipos para las APIs de asignación de leads

export interface ReassignLeadRequest {
  lead_id: string;
  from_user_id: string;
  to_user_id: string;
  assigned_by: string;
  reason: string;
  notes: string;
  new_stage?: string;
}

export interface ReassignLeadResponse {
  message: string;
}

export interface LeadAssignmentHistory {
  id: string;
  lead_id: string;
  from_user_id: string;
  from_user_name: string;
  to_user_id: string;
  to_user_name: string;
  assigned_by: string;
  assigned_by_name: string;
  assignment_reason: string;
  previous_stage: string | null;
  current_stage: string | null;
  notes: string | null;
  assigned_at: string;
  is_active: boolean;
}

export interface ReassignableLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  document_number: number;
  company: string;
  source: string;
  campaign: string;
  stage: string;
  priority: string;
  value: number;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  additional_info?: Record<string, any> | null;
}

// Bulk Assignment Types
export interface BulkAssignLeadsRequest {
  leadIds: string[];
  toUserId: string;
  reason: string;
  notes?: string;
}

export interface BulkAssignmentSummary {
  total: number;
  success: number;
  skipped: number;
  failed: number;
}

export interface SkippedLead {
  leadId: string;
  reason: string;
}

export interface BulkAssignLeadsResponse {
  message: string;
  toUserId: string;
  reason: string;
  notes?: string;
  summary: BulkAssignmentSummary;
  successLeads: string[];
  skippedLeads: SkippedLead[];
  failedLeads: any[];
}
