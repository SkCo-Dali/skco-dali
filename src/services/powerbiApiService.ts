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
  const url = `${ENV.CRM_API_BASE_URL}/api/pbi/embed-info`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify(input);

  console.log('🔄 [PowerBI API] fetchEmbedInfo Request:', {
    url,
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: input
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] fetchEmbedInfo Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] fetchEmbedInfo Error:', errorText);
    throw new Error(`Failed to fetch embed info: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] fetchEmbedInfo Success:', result);
  return result;
}

export async function fetchReportPages(reportId: string, workspaceId: string, token: string): Promise<ReportPage[]> {
  const url = `${ENV.CRM_API_BASE_URL}/api/pbi/reports/${reportId}/pages?workspace_id=${workspaceId}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] fetchReportPages Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    reportId,
    workspaceId
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] fetchReportPages Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] fetchReportPages Error:', errorText);
    throw new Error(`Failed to fetch report pages: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] fetchReportPages Success:', result);
  return result;
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/effective/my-reports?${searchParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getMyReports Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    params
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getMyReports Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getMyReports Error:', errorText);
    throw new Error(`Failed to fetch my reports: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getMyReports Success:', result);
  return result;
}

export async function checkEffectiveAccess(reportId: string, token: string): Promise<boolean> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/effective/check?report_id=${reportId}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] checkEffectiveAccess Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    reportId
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] checkEffectiveAccess Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] checkEffectiveAccess Error:', errorText);
    throw new Error(`Failed to check access: ${errorText}`);
  }

  const data: EffectiveAccessResponse = await response.json();
  console.log('✅ [PowerBI API] checkEffectiveAccess Success:', data);
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/effective/reports/${reportId}/users?${searchParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getEffectiveReportUsers Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    reportId,
    params
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getEffectiveReportUsers Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getEffectiveReportUsers Error:', errorText);
    throw new Error(`Failed to fetch effective report users: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getEffectiveReportUsers Success:', result);
  return result;
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/favorites?${searchParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getFavorites Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    params
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getFavorites Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getFavorites Error:', errorText);
    throw new Error(`Failed to fetch favorites: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getFavorites Success:', result);
  return result;
}

export async function addFavorite(reportId: string, token: string): Promise<FavoriteResponse> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/favorites`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify({ reportId });

  console.log('🔄 [PowerBI API] addFavorite Request:', {
    url,
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: { reportId }
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] addFavorite Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] addFavorite Error:', errorText);
    throw new Error(`Failed to add favorite: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] addFavorite Success:', result);
  return result;
}

export async function removeFavorite(reportId: string, token: string): Promise<void> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/favorites/${reportId}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] removeFavorite Request:', {
    url,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    reportId
  });

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  console.log('📡 [PowerBI API] removeFavorite Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] removeFavorite Error:', errorText);
    throw new Error(`Failed to remove favorite: ${errorText}`);
  }

  console.log('✅ [PowerBI API] removeFavorite Success');
}

export async function checkFavorite(reportId: string, token: string): Promise<boolean> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/favorites/check?report_id=${reportId}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] checkFavorite Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    reportId
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] checkFavorite Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] checkFavorite Error:', errorText);
    throw new Error(`Failed to check favorite: ${errorText}`);
  }

  const data = await response.json();
  console.log('✅ [PowerBI API] checkFavorite Success:', data);
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/audit`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify(auditData);

  console.log('🔄 [PowerBI API] auditReportEvent Request:', {
    url,
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: auditData
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] auditReportEvent Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.warn('⚠️ [PowerBI API] auditReportEvent Warning:', errorText);
    // Don't throw error for audit logging failures - just log warning
  } else {
    console.log('✅ [PowerBI API] auditReportEvent Success');
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/audit/report/${reportId}?${searchParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getReportAudit Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    reportId,
    params
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getReportAudit Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getReportAudit Error:', errorText);
    throw new Error(`Failed to fetch report audit: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getReportAudit Success:', result);
  return result;
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/areas?${searchParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getAreas Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    params
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getAreas Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getAreas Error:', errorText);
    throw new Error(`Failed to fetch areas: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getAreas Success:', result);
  return result;
}

export async function createArea(data: Omit<Area, 'id'>, token: string): Promise<Area> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/areas`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify(data);

  console.log('🔄 [PowerBI API] createArea Request:', {
    url,
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: data
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] createArea Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] createArea Error:', errorText);
    throw new Error(`Failed to create area: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] createArea Success:', result);
  return result;
}

export async function updateArea(id: string, data: Partial<Area>, token: string): Promise<Area> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/areas/${id}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify(data);

  console.log('🔄 [PowerBI API] updateArea Request:', {
    url,
    method: 'PUT',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: data,
    id
  });

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] updateArea Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] updateArea Error:', errorText);
    throw new Error(`Failed to update area: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] updateArea Success:', result);
  return result;
}

export async function deleteArea(id: string, token: string): Promise<void> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/areas/${id}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] deleteArea Request:', {
    url,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    id
  });

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  console.log('📡 [PowerBI API] deleteArea Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] deleteArea Error:', errorText);
    throw new Error(`Failed to delete area: ${errorText}`);
  }

  console.log('✅ [PowerBI API] deleteArea Success');
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/workspaces?${searchParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getWorkspaces Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    params
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getWorkspaces Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getWorkspaces Error:', errorText);
    throw new Error(`Failed to fetch workspaces: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getWorkspaces Success:', result);
  return result;
}

export async function createWorkspace(data: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Workspace> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/workspaces`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify(data);

  console.log('🔄 [PowerBI API] createWorkspace Request:', {
    url,
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: data
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] createWorkspace Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] createWorkspace Error:', errorText);
    throw new Error(`Failed to create workspace: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] createWorkspace Success:', result);
  return result;
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

  const url = `${ENV.CRM_API_BASE_URL}/api/reports/reports?${searchParams}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getReports Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    params
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getReports Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getReports Error:', errorText);
    throw new Error(`Failed to fetch reports: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getReports Success:', result);
  return result;
}

export async function getReportById(reportId: string, token: string): Promise<Report> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/reports/${reportId}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] getReportById Request:', {
    url,
    method: 'GET',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    reportId
  });

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  console.log('📡 [PowerBI API] getReportById Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] getReportById Error:', errorText);
    throw new Error(`Failed to fetch report: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] getReportById Success:', result);
  return result;
}

export async function createReport(data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Report> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/reports`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify(data);

  console.log('🔄 [PowerBI API] createReport Request:', {
    url,
    method: 'POST',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: data
  });

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] createReport Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] createReport Error:', errorText);
    throw new Error(`Failed to create report: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] createReport Success:', result);
  return result;
}

export async function updateReport(id: string, data: Partial<Report>, token: string): Promise<Report> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/reports/${id}`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify(data);

  console.log('🔄 [PowerBI API] updateReport Request:', {
    url,
    method: 'PUT',
    headers: { ...headers, Authorization: `Bearer ${token.substring(0, 20)}...` },
    body: data,
    id
  });

  const response = await fetch(url, {
    method: 'PUT',
    headers,
    body,
  });

  console.log('📡 [PowerBI API] updateReport Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] updateReport Error:', errorText);
    throw new Error(`Failed to update report: ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ [PowerBI API] updateReport Success:', result);
  return result;
}

export async function deleteReport(id: string, token: string): Promise<void> {
  const url = `${ENV.CRM_API_BASE_URL}/api/reports/reports/${id}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };

  console.log('🔄 [PowerBI API] deleteReport Request:', {
    url,
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token.substring(0, 20)}...` },
    id
  });

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  console.log('📡 [PowerBI API] deleteReport Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [PowerBI API] deleteReport Error:', errorText);
    throw new Error(`Failed to delete report: ${errorText}`);
  }

  console.log('✅ [PowerBI API] deleteReport Success');
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