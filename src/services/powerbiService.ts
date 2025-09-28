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

// Service functions
export const powerbiService = {
  // Areas
  async getAreas(): Promise<Area[]> {
    // Simulate API delay
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

  // Workspaces
  async getWorkspaces(areaId?: string): Promise<Workspace[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return areaId 
      ? mockWorkspaces.filter(w => w.areaId === areaId)
      : mockWorkspaces;
  },

  // Reports
  async getReports(filter?: ReportsFilter): Promise<Report[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    let filtered = mockReports;
    
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

  // Effective Reports (user's accessible reports)
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

  // Favorites
  async getFavorites(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return ['2']; // Mock: report ID 2 is favorited
  },

  async toggleFavorite(reportId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const currentFavorites = await this.getFavorites();
    const isFavorite = currentFavorites.includes(reportId);
    
    // Update mock data
    const report = mockEffectiveReports.find(r => r.reportId === reportId);
    if (report) {
      report.isFavorite = !isFavorite;
    }
    
    return !isFavorite;
  },

  // Embed Info (placeholder)
  async getEmbedInfo(reportId: string): Promise<EmbedInfo | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // TODO: wire with actual backend
    const report = mockReports.find(r => r.id === reportId);
    if (!report || !report.webUrl) {
      return null;
    }
    
    // For now, return null to use webUrl fallback
    return null;
  },

  // Report Pages
  async getReportPages(reportId: string, workspaceId: string): Promise<ReportPage[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock pages
    return [
      { id: 'page1', name: 'Overview', displayName: 'Vista General', order: 1 },
      { id: 'page2', name: 'Details', displayName: 'Detalles', order: 2 },
      { id: 'page3', name: 'Analytics', displayName: 'Análisis', order: 3 }
    ];
  },

  // Access Check
  async checkReportAccess(reportId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Mock: user has access to all reports in mockEffectiveReports
    return mockEffectiveReports.some(r => r.reportId === reportId);
  },

  // Audit
  async logAudit(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Audit event logged:', event);
  },

  // Power BI API (placeholder)
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