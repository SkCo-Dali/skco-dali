// API types for Commission Plans - matching the API response structure
export interface ApiCommissionPlan {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  assignment_type: 'all_users' | 'user' | 'role' | 'team';
  assignment_value?: string | null;
  status: 'published' | 'ready_to_approve' | 'draft' | 'rejected' | 'inactive';
  published_on?: string | null;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export interface ApiCommissionPlansListResponse {
  items: ApiCommissionPlan[];
  page: number;
  page_size: number;
  total: number;
}

export interface CreateCommissionPlanRequest {
  name: string;
  description: string;
  start_date: string; // ISO format: "2025-09-01T00:00:00"
  end_date: string;   // ISO format: "2025-12-31T23:59:59"
  assignment_type: 'all_users' | 'user' | 'role' | 'team';
  assignment_value?: string; // Only when assignment_type is user, role, or team
}

export interface UpdateCommissionPlanRequest {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  assignment_type?: 'all_users' | 'user' | 'role' | 'team';
  assignment_value?: string;
}

export interface DeleteCommissionPlanResponse {
  deleted: boolean;
  id: string;
}