import { 
  Area, 
  Workspace, 
  Report, 
  EffectiveReport, 
  UserAccess, 
  AuditEvent,
  PowerBIWorkspace,
  PowerBIDataset,
  ReportPage,
  EmbedInfo,
  ReportsFilter,
  AuditFilter
} from '@/types/powerbi';

// Mock data
const mockAreas: Area[] = [
  { id: '1', name: 'Comercial', isActive: true },
  { id: '2', name: 'Operaciones', isActive: true },
  { id: '3', name: 'Marketing', isActive: true }
];

const mockWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'CRM Analytics',
    description: 'Workspace principal para reportes del CRM',
    areaId: '1',
    pbiWorkspaceId: '9988790d-a5c3-459b-97cb-ee8103957bbc',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Ventas y Comisiones',
    description: 'Reportes de ventas y sistema de comisiones',
    areaId: '1',
    pbiWorkspaceId: 'abc123-def456-ghi789',
    isActive: true,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  },
  {
    id: '3',
    name: 'Marketing Analytics',
    description: 'Workspace para reportes de marketing y campañas',
    areaId: '3',
    pbiWorkspaceId: 'marketing-workspace-123',
    isActive: true,
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z'
  }
];

const mockReports: Report[] = [
  {
    id: '1',
    name: 'Dashboard Principal CRM',
    description: 'Vista general del estado del CRM con KPIs principales',
    workspaceId: '1',
    hasRowLevelSecurity: true,
    requireUserRole: true,
    isActive: true,
    pbiWorkspaceId: '9988790d-a5c3-459b-97cb-ee8103957bbc',
    pbiReportId: '0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9',
    datasetId: 'dataset-123',
    webUrl: 'https://app.powerbi.com/groups/9988790d-a5c3-459b-97cb-ee8103957bbc/reports/0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Análisis de Leads',
    description: 'Seguimiento detallado del embudo de ventas y conversiones',
    workspaceId: '1',
    hasRowLevelSecurity: true,
    requireUserRole: false,
    isActive: true,
    pbiWorkspaceId: '9988790d-a5c3-459b-97cb-ee8103957bbc',
    pbiReportId: 'report-456',
    datasetId: 'dataset-456',
    webUrl: 'https://app.powerbi.com/groups/9988790d-a5c3-459b-97cb-ee8103957bbc/reports/report-456',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z'
  },
  {
    id: '3',
    name: 'Comisiones por Agente',
    description: 'Reporte de comisiones calculadas por agente y período',
    workspaceId: '2',
    hasRowLevelSecurity: true,
    requireUserRole: true,
    isActive: true,
    pbiWorkspaceId: 'abc123-def456-ghi789',
    pbiReportId: 'report-789',
    datasetId: 'dataset-789',
    webUrl: 'https://app.powerbi.com/groups/abc123-def456-ghi789/reports/report-789',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-01-20T10:00:00Z'
  }
];

const mockEffectiveReports: EffectiveReport[] = [
  {
    reportId: '1',
    reportName: 'Dashboard Principal CRM',
    workspaceId: '1',
    workspaceName: 'CRM Analytics',
    areaId: '1',
    areaName: 'Comercial',
    source: 'workspace',
    accessLevel: 'view',
    hasRowLevelSecurity: true,
    requireUserRole: true,
    tags: ['CRM', 'KPIs', 'Principal'],
    webUrl: 'https://app.powerbi.com/groups/9988790d-a5c3-459b-97cb-ee8103957bbc/reports/0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9',
    isFavorite: false
  },
  {
    reportId: '2',
    reportName: 'Análisis de Leads',
    workspaceId: '1',
    workspaceName: 'CRM Analytics',
    areaId: '1',
    areaName: 'Comercial',
    source: 'report',
    accessLevel: 'view',
    hasRowLevelSecurity: true,
    requireUserRole: false,
    tags: ['Leads', 'Conversión', 'Embudo'],
    webUrl: 'https://app.powerbi.com/groups/9988790d-a5c3-459b-97cb-ee8103957bbc/reports/report-456',
    isFavorite: true
  }
];

// Mock users for access management
const mockUsers = [
  { id: '1', name: 'Juan Pérez', email: 'juan.perez@skandia.com.co', role: 'gestor', isActive: true },
  { id: '2', name: 'María García', email: 'maria.garcia@skandia.com.co', role: 'supervisor', isActive: true },
  { id: '3', name: 'Carlos López', email: 'carlos.lopez@skandia.com.co', role: 'analista', isActive: true },
  { id: '4', name: 'Ana Martín', email: 'ana.martin@skandia.com.co', role: 'director', isActive: true }
];

// Mock user access data
const mockWorkspaceAccess: UserAccess[] = [
  {
    userId: '1',
    userName: 'Juan Pérez',
    userEmail: 'juan.perez@skandia.com.co',
    accessLevel: 'view',
    grantedAt: '2024-01-15T10:00:00Z',
    grantedBy: 'admin'
  },
  {
    userId: '2',
    userName: 'María García',
    userEmail: 'maria.garcia@skandia.com.co',
    accessLevel: 'view',
    grantedAt: '2024-01-16T10:00:00Z',
    grantedBy: 'admin'
  }
];

// Mock audit events
const mockAuditEvents: AuditEvent[] = [
  {
    id: '1',
    reportId: '1',
    reportName: 'Dashboard Principal CRM',
    userId: '1',
    userName: 'Juan Pérez',
    userEmail: 'juan.perez@skandia.com.co',
    action: 'view',
    source: 'portal',
    durationSec: 45,
    timestamp: '2024-01-28T14:30:00Z'
  },
  {
    id: '2',
    reportId: '1',
    reportName: 'Dashboard Principal CRM',
    userId: '1',
    userName: 'Juan Pérez',
    userEmail: 'juan.perez@skandia.com.co',
    action: 'page_change',
    source: 'portal',
    extra: JSON.stringify({ previousPage: 'page1', newPage: 'page2' }),
    timestamp: '2024-01-28T14:31:00Z'
  },
  {
    id: '3',
    reportId: '2',
    reportName: 'Análisis de Leads',
    userId: '2',
    userName: 'María García',
    userEmail: 'maria.garcia@skandia.com.co',
    action: 'export',
    source: 'portal',
    extra: JSON.stringify({ format: 'pdf' }),
    timestamp: '2024-01-28T15:00:00Z'
  }
];

// Service functions
export const powerbiService = {
  // Areas CRUD
  async getAreas(): Promise<Area[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAreas.filter(area => area.isActive);
  },

  async getAllAreas(): Promise<Area[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAreas;
  },

  async createArea(area: Omit<Area, 'id'>): Promise<Area> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newArea: Area = {
      ...area,
      id: Date.now().toString()
    };
    mockAreas.push(newArea);
    return newArea;
  },

  async updateArea(id: string, updates: Partial<Area>): Promise<Area> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockAreas.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Área no encontrada');
    
    mockAreas[index] = { ...mockAreas[index], ...updates };
    return mockAreas[index];
  },

  async deleteArea(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockAreas.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Área no encontrada');
    
    // Set as inactive instead of deleting
    mockAreas[index].isActive = false;
  },

  // Workspaces CRUD
  async getWorkspaces(areaId?: string): Promise<Workspace[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = mockWorkspaces.filter(w => w.isActive);
    return areaId ? filtered.filter(w => w.areaId === areaId) : filtered;
  },

  async getAllWorkspaces(areaId?: string): Promise<Workspace[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return areaId 
      ? mockWorkspaces.filter(w => w.areaId === areaId)
      : mockWorkspaces;
  },

  async createWorkspace(workspace: Omit<Workspace, 'id' | 'createdAt' | 'updatedAt'>): Promise<Workspace> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const now = new Date().toISOString();
    const newWorkspace: Workspace = {
      ...workspace,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    mockWorkspaces.push(newWorkspace);
    return newWorkspace;
  },

  async updateWorkspace(id: string, updates: Partial<Workspace>): Promise<Workspace> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockWorkspaces.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workspace no encontrado');
    
    mockWorkspaces[index] = { 
      ...mockWorkspaces[index], 
      ...updates, 
      updatedAt: new Date().toISOString()
    };
    return mockWorkspaces[index];
  },

  async deleteWorkspace(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockWorkspaces.findIndex(w => w.id === id);
    if (index === -1) throw new Error('Workspace no encontrado');
    
    mockWorkspaces[index].isActive = false;
  },

  // Reports CRUD
  async getReports(filter?: ReportsFilter): Promise<Report[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = mockReports;
    
    if (filter?.onlyActive) {
      filtered = filtered.filter(r => r.isActive);
    }
    
    if (filter?.workspaceId) {
      filtered = filtered.filter(r => r.workspaceId === filter.workspaceId);
    }
    
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  },

  async createReport(report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>): Promise<Report> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const now = new Date().toISOString();
    const newReport: Report = {
      ...report,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now
    };
    mockReports.push(newReport);
    return newReport;
  },

  async updateReport(id: string, updates: Partial<Report>): Promise<Report> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reporte no encontrado');
    
    mockReports[index] = { 
      ...mockReports[index], 
      ...updates, 
      updatedAt: new Date().toISOString()
    };
    return mockReports[index];
  },

  async deleteReport(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockReports.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Reporte no encontrado');
    
    mockReports[index].isActive = false;
  },

  // Access Management
  async getWorkspaceAccess(workspaceId: string): Promise<UserAccess[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockWorkspaceAccess;
  },

  async grantWorkspaceAccess(workspaceId: string, userId: string, accessLevel: 'view' = 'view'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user = mockUsers.find(u => u.id === userId);
    if (!user) throw new Error('Usuario no encontrado');
    
    const existingAccess = mockWorkspaceAccess.find(a => a.userId === userId);
    if (existingAccess) {
      throw new Error('El usuario ya tiene acceso a este workspace');
    }
    
    mockWorkspaceAccess.push({
      userId,
      userName: user.name,
      userEmail: user.email,
      accessLevel,
      grantedAt: new Date().toISOString(),
      grantedBy: 'admin'
    });
  },

  async revokeWorkspaceAccess(workspaceId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockWorkspaceAccess.findIndex(a => a.userId === userId);
    if (index === -1) throw new Error('Acceso no encontrado');
    
    mockWorkspaceAccess.splice(index, 1);
  },

  async getReportAccess(reportId: string): Promise<UserAccess[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return a subset for report-specific access
    return mockWorkspaceAccess.slice(0, 1);
  },

  async grantReportAccess(reportId: string, userId: string, accessLevel: 'view' = 'view'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Granted ${accessLevel} access to report ${reportId} for user ${userId}`);
  },

  async revokeReportAccess(reportId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log(`Revoked access to report ${reportId} for user ${userId}`);
  },

  // Users for access management
  async getUsers(search?: string): Promise<typeof mockUsers> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (search) {
      const searchLower = search.toLowerCase();
      return mockUsers.filter(u => 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
      );
    }
    return mockUsers;
  },

  // Effective access queries
  async getEffectiveReportAccess(reportId: string): Promise<UserAccess[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockWorkspaceAccess.map(access => ({
      ...access,
      accessLevel: 'view' as const
    }));
  },

  // Audit
  async getAuditEvents(filter?: AuditFilter): Promise<AuditEvent[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = mockAuditEvents;
    
    if (filter?.reportId) {
      filtered = filtered.filter(e => e.reportId === filter.reportId);
    }
    
    if (filter?.userId) {
      filtered = filtered.filter(e => e.userId === filter.userId);
    }
    
    if (filter?.action) {
      filtered = filtered.filter(e => e.action === filter.action);
    }
    
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(e => 
        e.reportName?.toLowerCase().includes(searchLower) ||
        e.userName?.toLowerCase().includes(searchLower) ||
        e.userEmail?.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Existing methods
  async getMyReports(filter?: ReportsFilter): Promise<EffectiveReport[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    let filtered = mockEffectiveReports;
    
    if (filter?.areaId) {
      filtered = filtered.filter(r => r.areaId === filter.areaId);
    }
    
    if (filter?.workspaceId) {
      filtered = filtered.filter(r => r.workspaceId === filter.workspaceId);
    }
    
    if (filter?.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.reportName.toLowerCase().includes(searchLower) ||
        r.workspaceName.toLowerCase().includes(searchLower) ||
        r.areaName.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  },

  async getFavorites(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return ['2'];
  },

  async toggleFavorite(reportId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const currentFavorites = await this.getFavorites();
    const isFavorite = currentFavorites.includes(reportId);
    
    const report = mockEffectiveReports.find(r => r.reportId === reportId);
    if (report) {
      report.isFavorite = !isFavorite;
    }
    
    return !isFavorite;
  },

  async getEmbedInfo(reportId: string): Promise<EmbedInfo | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const report = mockReports.find(r => r.id === reportId);
    if (!report || !report.webUrl) {
      return null;
    }
    return null;
  },

  async getReportPages(reportId: string, workspaceId: string): Promise<ReportPage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      { id: 'page1', name: 'Overview', displayName: 'Vista General', order: 1 },
      { id: 'page2', name: 'Details', displayName: 'Detalles', order: 2 },
      { id: 'page3', name: 'Analytics', displayName: 'Análisis', order: 3 }
    ];
  },

  async checkReportAccess(reportId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockEffectiveReports.some(r => r.reportId === reportId);
  },

  async logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newEvent: AuditEvent = {
      ...event,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    mockAuditEvents.unshift(newEvent);
    console.log('Audit event logged:', newEvent);
  },

  async getPowerBIWorkspaces(): Promise<PowerBIWorkspace[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [
      {
        id: '9988790d-a5c3-459b-97cb-ee8103957bbc',
        name: 'CRM Analytics Workspace',
        isOnDedicatedCapacity: true,
        capacityId: 'capacity-123'
      }
    ];
  }
};