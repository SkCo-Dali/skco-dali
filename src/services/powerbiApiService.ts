import { ENV } from '@/config/environment';
import { EffectiveReport, Area, Workspace, Report, ReportPage, UserAccess, AuditEvent } from '@/types/powerbi';

// API Request/Response Types
export interface EmbedInfoRequest {
  reportId: string;
  workspaceId: string;
}

export interface EmbedInfoResponse {
  embedUrl: string;
  embedToken: string;
  expiresAt: string;
  reportId: string;
  datasetId: string;
  workspaceId: string;
  rlsApplied: boolean;
}

export interface EffectiveAccessResponse {
  hasAccess: boolean;
  accessLevel?: 'view';
  message?: string;
}

export interface AuditRequest {
  reportId: string;
  action: 'view' | 'page_change' | 'refresh' | 'fullscreen' | 'export';
  source: 'portal';
  durationSec?: number;
  clientIp?: string;
  userAgent?: string;
  extra?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface FavoriteRequest {
  reportId: string;
}

export interface FavoriteResponse {
  id: string;
  userId: string;
  reportId: string;
  createdAt: string;
  reportName?: string;
  description?: string;
  hasRowLevelSecurity?: boolean;
  requireUserRole?: boolean;
  defaultPageName?: string;
  tags?: string;
  workspaceId?: string;
  workspaceName?: string;
  areaId?: string;
  areaName?: string;
}

export interface AccessGrantRequest {
  userId: string;
  accessLevel: 'view';
  expiresAt?: string;
}

export interface AccessRevokeRequest {
  userId: string;
}

// Power BI Embed API Functions
export async function fetchEmbedInfo(input: EmbedInfoRequest, token: string): Promise<EmbedInfoResponse> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/pbi/embed-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch embed info: ${errorText}`);
  }

  return response.json();
}

export async function fetchReportPages(reportId: string, workspaceId: string, token: string): Promise<ReportPage[]> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/pbi/reports/${reportId}/pages?workspace_id=${workspaceId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch report pages: ${errorText}`);
  }

  return response.json();
}

// Effective Access API Functions
export async function getMyReports(token: string, params?: {
  onlyActive?: boolean;
  areaId?: string;
  workspaceId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<EffectiveReport>> {
  const searchParams = new URLSearchParams();
  if (params?.onlyActive !== undefined) searchParams.set('only_active', params.onlyActive.toString());
  if (params?.areaId) searchParams.set('area_id', params.areaId);
  if (params?.workspaceId) searchParams.set('workspace_id', params.workspaceId);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/effective/my-reports?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch my reports: ${errorText}`);
  }

  return response.json();
}

export async function checkEffectiveAccess(reportId: string, token: string): Promise<boolean> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/effective/check?report_id=${reportId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to check access: ${errorText}`);
  }

  const data: EffectiveAccessResponse = await response.json();
  return data.hasAccess;
}

export async function getEffectiveReportUsers(reportId: string, token: string, params?: {
  onlyActiveUsers?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<UserAccess>> {
  const searchParams = new URLSearchParams();
  if (params?.onlyActiveUsers !== undefined) searchParams.set('only_active_users', params.onlyActiveUsers.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/effective/reports/${reportId}/users?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch effective report users: ${errorText}`);
  }

  return response.json();
}

// Favorites API Functions
export async function getFavorites(token: string, params?: {
  onlyActive?: boolean;
  areaId?: string;
  workspaceId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<FavoriteResponse>> {
  const searchParams = new URLSearchParams();
  if (params?.onlyActive !== undefined) searchParams.set('only_active', params.onlyActive.toString());
  if (params?.areaId) searchParams.set('area_id', params.areaId);
  if (params?.workspaceId) searchParams.set('workspace_id', params.workspaceId);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/favorites?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch favorites: ${errorText}`);
  }

  return response.json();
}

export async function addFavorite(reportId: string, token: string): Promise<FavoriteResponse> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ reportId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to add favorite: ${errorText}`);
  }

  return response.json();
}

export async function removeFavorite(reportId: string, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/favorites/${reportId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to remove favorite: ${errorText}`);
  }
}

export async function checkFavorite(reportId: string, token: string): Promise<boolean> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/favorites/check?report_id=${reportId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to check favorite: ${errorText}`);
  }

  const data = await response.json();
  return data.isFavorite;
}

// Audit API Functions
export async function auditReportEvent(
  token: string, 
  reportId: string, 
  action: 'view' | 'page_change' | 'refresh' | 'fullscreen' | 'export', 
  extra?: any
): Promise<void> {
  const auditData: AuditRequest = {
    reportId,
    action,
    source: 'portal',
    extra: extra ? JSON.stringify(extra) : undefined
  };

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/audit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(auditData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn(`Failed to log audit event: ${errorText}`);
    // Don't throw error for audit logging failures - just log warning
  }
}

export async function getReportAudit(reportId: string, token: string, params?: {
  action?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<AuditEvent>> {
  const searchParams = new URLSearchParams();
  if (params?.action) searchParams.set('action', params.action);
  if (params?.from) searchParams.set('from', params.from);
  if (params?.to) searchParams.set('to', params.to);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/audit/report/${reportId}?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch report audit: ${errorText}`);
  }

  return response.json();
}

// Metadata CRUD API Functions
export async function getAreas(token: string, params?: {
  onlyActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Area>> {
  const searchParams = new URLSearchParams();
  if (params?.onlyActive !== undefined) searchParams.set('only_active', params.onlyActive.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/areas?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch areas: ${errorText}`);
  }

  return response.json();
}

export async function createArea(data: Omit<Area, 'id'>, token: string): Promise<Area> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/areas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create area: ${errorText}`);
  }

  return response.json();
}

export async function updateArea(id: string, data: Partial<Area>, token: string): Promise<Area> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/areas/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update area: ${errorText}`);
  }

  return response.json();
}

export async function deleteArea(id: string, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/areas/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete area: ${errorText}`);
  }
}

export async function getWorkspaces(token: string, params?: {
  onlyActive?: boolean;
  areaId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Workspace>> {
  const searchParams = new URLSearchParams();
  if (params?.onlyActive !== undefined) searchParams.set('only_active', params.onlyActive.toString());
  if (params?.areaId) searchParams.set('area_id', params.areaId);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch workspaces: ${errorText}`);
  }

  return response.json();
}

export async function createWorkspace(data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Workspace> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create workspace: ${errorText}`);
  }

  return response.json();
}

export async function updateWorkspace(id: string, data: Partial<Workspace>, token: string): Promise<Workspace> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update workspace: ${errorText}`);
  }

  return response.json();
}

export async function deleteWorkspace(id: string, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete workspace: ${errorText}`);
  }
}

export async function getReports(token: string, params?: {
  onlyActive?: boolean;
  areaId?: string;
  workspaceId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<Report>> {
  const searchParams = new URLSearchParams();
  if (params?.onlyActive !== undefined) searchParams.set('only_active', params.onlyActive.toString());
  if (params?.areaId) searchParams.set('area_id', params.areaId);
  if (params?.workspaceId) searchParams.set('workspace_id', params.workspaceId);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/reports?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch reports: ${errorText}`);
  }

  return response.json();
}

export async function createReport(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Report> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create report: ${errorText}`);
  }

  return response.json();
}

export async function updateReport(id: string, data: Partial<Report>, token: string): Promise<Report> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/reports/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update report: ${errorText}`);
  }

  return response.json();
}

export async function deleteReport(id: string, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/reports/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete report: ${errorText}`);
  }
}

// Access Management API Functions
export async function getWorkspaceAccess(workspaceId: string, token: string, params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<UserAccess>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${workspaceId}/access?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch workspace access: ${errorText}`);
  }

  return response.json();
}

export async function grantWorkspaceAccess(workspaceId: string, data: AccessGrantRequest, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${workspaceId}/access/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to grant workspace access: ${errorText}`);
  }
}

export async function revokeWorkspaceAccess(workspaceId: string, data: AccessRevokeRequest, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${workspaceId}/access/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to revoke workspace access: ${errorText}`);
  }
}

export async function getReportAccess(reportId: string, token: string, params?: {
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResponse<UserAccess>> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.pageSize) searchParams.set('page_size', params.pageSize.toString());

  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/reports/${reportId}/access?${searchParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch report access: ${errorText}`);
  }

  return response.json();
}

export async function grantReportAccess(reportId: string, data: AccessGrantRequest, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/reports/${reportId}/access/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to grant report access: ${errorText}`);
  }
}

export async function revokeReportAccess(reportId: string, data: AccessRevokeRequest, token: string): Promise<void> {
  const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/reports/reports/${reportId}/access/revoke`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to revoke report access: ${errorText}`);
  }
}