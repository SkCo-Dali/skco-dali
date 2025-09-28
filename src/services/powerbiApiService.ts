import { ENV } from '@/config/environment';

// API Types
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
  extra?: string;
}

// API Client Functions
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