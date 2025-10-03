// Power BI Report Types
export interface Area {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  areaId: string;
  pbiWorkspaceId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  hasRowLevelSecurity: boolean;
  requireUserRole?: boolean;
  isActive: boolean;
  pbiWorkspaceId?: string;
  pbiReportId?: string;
  datasetId?: string;
  webUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EffectiveReport {
  reportId: string;
  reportName: string;
  workspaceId: string;
  workspaceName: string;
  areaId: string;
  areaName: string;
  source: 'workspace' | 'report';
  accessLevel: 'view';
  hasRowLevelSecurity: boolean;
  requireUserRole?: boolean;
  tags?: string[];
  webUrl?: string;
  isFavorite?: boolean;
}

export interface ReportPage {
  id: string;
  name: string;
  displayName: string;
  order: number;
  visibility?: number; // 0 = visible, 1 = hidden
}

export interface PowerBIWorkspace {
  id: string;
  name: string;
  isOnDedicatedCapacity: boolean;
  capacityId?: string;
}

export interface PowerBIDataset {
  id: string;
  name: string;
  addRowsAPIEnabled: boolean;
  configuredBy: string;
  isRefreshable: boolean;
}

export interface UserAccess {
  userId: string;
  userName?: string;
  userEmail?: string;
  accessLevel: 'view';
  expiresAt?: string;
  grantedAt: string;
  grantedBy: string;
}

export interface AuditEvent {
  id: string;
  reportId: string;
  reportName?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  action: 'view' | 'refresh' | 'page_change' | 'fullscreen' | 'export';
  source: 'portal';
  durationSec?: number;
  clientIp?: string;
  userAgent?: string;
  extra?: string;
  timestamp: string;
}

export interface EmbedInfo {
  embedUrl: string;
  accessToken: string;
  tokenType: 'Aad' | 'Embed';
  expiresAt: string;
}

// Filter types for API requests
export interface ReportsFilter {
  areaId?: string;
  workspaceId?: string;
  search?: string;
  onlyActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AuditFilter {
  reportId?: string;
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}