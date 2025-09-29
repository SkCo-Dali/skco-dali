import { 
  getMyReports, 
  getFavorites, 
  addFavorite, 
  removeFavorite, 
  checkFavorite,
  checkEffectiveAccess,
  fetchReportPages,
  getAreas,
  getWorkspaces,
  getReports,
  getReportById,
  createArea,
  updateArea,
  deleteArea,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  createReport,
  updateReport,
  deleteReport,
  getWorkspaceAccess,
  grantWorkspaceAccess,
  revokeWorkspaceAccess,
  getReportAccess,
  grantReportAccess,
  revokeReportAccess,
  getEffectiveReportUsers,
  getReportAudit,
  PaginatedResponse
} from './powerbiApiService';
import { EffectiveReport, Area, Workspace, Report, ReportPage, UserAccess, AuditEvent } from '@/types/powerbi';

/**
 * Power BI Service - Wrapper around API calls with authentication
 */
class PowerBIService {
  // Effective Reports API
  async getMyReports(params?: {
    search?: string;
    areaId?: string;
    workspaceId?: string;
    page?: number;
    pageSize?: number;
  }, token?: string): Promise<EffectiveReport[]> {
    if (!token) throw new Error('Token is required');
    
    console.log('🔧 PowerBIService.getMyReports called with:', {
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 50) + '...',
      params
    });
    
    const response = await getMyReports(token, {
      onlyActive: true,
      ...params
    });
    
    return response.items;
  }

  // Backward compatibility methods
  async getAllAreas(params?: any, token?: string): Promise<Area[]> {
    return this.getAreas(params, token);
  }

  async getAllWorkspaces(params?: any, token?: string): Promise<Workspace[]> {
    return this.getWorkspaces(params, token);
  }

  async getUsers(search?: string, token?: string): Promise<any[]> {
    if (!token) throw new Error('Token is required');
    return [];
  }

  async getEffectiveReportAccess(reportId: string, params?: any, token?: string): Promise<UserAccess[]> {
    return this.getEffectiveReportUsers(reportId, params, token);
  }

  async getAuditEvents(params?: any, token?: string): Promise<AuditEvent[]> {
    if (!token) throw new Error('Token is required');
    if (params?.reportId) {
      const response = await this.getReportAudit(params.reportId, params, token);
      return response.items;
    }
    return [];
  }

  async checkReportAccess(reportId: string, token?: string): Promise<boolean> {
    if (!token) throw new Error('Token is required');
    return checkEffectiveAccess(reportId, token);
  }

  async getReportPages(reportId: string, workspaceId: string, token?: string): Promise<ReportPage[]> {
    if (!token) throw new Error('Token is required');
    return fetchReportPages(reportId, workspaceId, token);
  }

  async getFavorites(params?: any, token?: string): Promise<string[]> {
    if (!token) throw new Error('Token is required');
    const response = await getFavorites(token, { onlyActive: true, ...params });
    return response.items.map(fav => fav.reportId);
  }

  async toggleFavorite(reportId: string, token?: string): Promise<boolean> {
    if (!token) throw new Error('Token is required');
    try {
      const isFavorite = await checkFavorite(reportId, token);
      if (isFavorite) {
        await removeFavorite(reportId, token);
        return false;
      } else {
        await addFavorite(reportId, token);
        return true;
      }
    } catch (error) {
      throw new Error(`Failed to toggle favorite: ${error}`);
    }
  }

  async getAreas(params?: any, token?: string): Promise<Area[]> {
    if (!token) throw new Error('Token is required');
    const response = await getAreas(token, { onlyActive: true, ...params });
    return response.items;
  }

  async getWorkspaces(params?: any, token?: string): Promise<Workspace[]> {
    if (!token) throw new Error('Token is required');
    const response = await getWorkspaces(token, { onlyActive: true, ...params });
    return response.items;
  }

  async getReports(params?: any, token?: string): Promise<Report[]> {
    if (!token) throw new Error('Token is required');
    const response = await getReports(token, { onlyActive: true, ...params });
    return response.items;
  }

  async getReportById(reportId: string, token?: string): Promise<Report> {
    if (!token) throw new Error('Token is required');
    return getReportById(reportId, token);
  }

  async createArea(data: any, token?: string): Promise<Area> {
    if (!token) throw new Error('Token is required');
    return createArea(data, token);
  }

  async updateArea(id: string, data: any, token?: string): Promise<Area> {
    if (!token) throw new Error('Token is required');
    return updateArea(id, data, token);
  }

  async deleteArea(id: string, token?: string): Promise<void> {
    if (!token) throw new Error('Token is required');
    return deleteArea(id, token);
  }

  async createWorkspace(data: any, token?: string): Promise<Workspace> {
    if (!token) throw new Error('Token is required');
    return createWorkspace(data, token);
  }

  async updateWorkspace(id: string, data: any, token?: string): Promise<Workspace> {
    if (!token) throw new Error('Token is required');
    return updateWorkspace(id, data, token);
  }

  async deleteWorkspace(id: string, token?: string): Promise<void> {
    if (!token) throw new Error('Token is required');
    return deleteWorkspace(id, token);
  }

  async createReport(data: any, token?: string): Promise<Report> {
    if (!token) throw new Error('Token is required');
    return createReport(data, token);
  }

  async updateReport(id: string, data: any, token?: string): Promise<Report> {
    if (!token) throw new Error('Token is required');
    return updateReport(id, data, token);
  }

  async deleteReport(id: string, token?: string): Promise<void> {
    if (!token) throw new Error('Token is required');
    return deleteReport(id, token);
  }

  async getWorkspaceAccess(workspaceId: string, params?: any, token?: string): Promise<UserAccess[]> {
    if (!token) throw new Error('Token is required');
    const response = await getWorkspaceAccess(workspaceId, token, params);
    return response.items;
  }

  async grantWorkspaceAccess(workspaceId: string, userId: string, expiresAt?: string, token?: string): Promise<void> {
    if (!token) throw new Error('Token is required');
    return grantWorkspaceAccess(workspaceId, { userId, accessLevel: 'view', expiresAt }, token);
  }

  async revokeWorkspaceAccess(workspaceId: string, userId: string, token?: string): Promise<void> {
    if (!token) throw new Error('Token is required');
    return revokeWorkspaceAccess(workspaceId, { userId }, token);
  }

  async getReportAccess(reportId: string, params?: any, token?: string): Promise<UserAccess[]> {
    if (!token) throw new Error('Token is required');
    const response = await getReportAccess(reportId, token, params);
    return response.items;
  }

  async grantReportAccess(reportId: string, userId: string, expiresAt?: string, token?: string): Promise<void> {
    if (!token) throw new Error('Token is required');
    return grantReportAccess(reportId, { userId, accessLevel: 'view', expiresAt }, token);
  }

  async revokeReportAccess(reportId: string, userId: string, token?: string): Promise<void> {
    if (!token) throw new Error('Token is required');
    return revokeReportAccess(reportId, { userId }, token);
  }

  async getEffectiveReportUsers(reportId: string, params?: any, token?: string): Promise<UserAccess[]> {
    if (!token) throw new Error('Token is required');
    const response = await getEffectiveReportUsers(reportId, token, { onlyActiveUsers: true, ...params });
    return response.items;
  }

  async getReportAudit(reportId: string, params?: any, token?: string): Promise<PaginatedResponse<AuditEvent>> {
    if (!token) throw new Error('Token is required');
    return getReportAudit(reportId, token, params);
  }

  // Legacy methods
  async getEmbedInfo(reportId: string): Promise<any> {
    return null;
  }

  async logAudit(data: any): Promise<void> {
    return;
  }
}

export const powerbiService = new PowerBIService();