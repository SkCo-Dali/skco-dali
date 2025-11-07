import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, FileBarChart, Filter, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreateReportDialog } from '@/components/admin/CreateReportDialog';
import { powerbiService } from '@/services/powerbiService';
import { Area, Workspace, Report } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

// Power BI Report interface for API responses
interface PowerBIReport {
  id: string;
  name: string;
  datasetId: string;
  webUrl: string;
}

// Validation schema
const reportSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  workspaceId: z.string().min(1, "Debe seleccionar un workspace"),
  pbiWorkspaceId: z.string().max(100, "El ID de workspace no puede exceder 100 caracteres").optional(),
  pbiReportId: z.string().max(100, "El ID de reporte no puede exceder 100 caracteres").optional(),
  datasetId: z.string().max(100, "El ID de dataset no puede exceder 100 caracteres").optional(),
  webUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal(''))
});

interface ReportFormData {
  name: string;
  description: string;
  areaId: string;
  workspaceId: string;
  hasRowLevelSecurity: boolean;
  requireUserRole: boolean;
  isActive: boolean;
  pbiWorkspaceId: string;
  pbiReportId: string;
  datasetId: string;
  webUrl: string;
}

export function ReportsTab() {
  const { getAccessToken } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState<ReportFormData>({
    name: '',
    description: '',
    areaId: '',
    workspaceId: '',
    hasRowLevelSecurity: false,
    requireUserRole: false,
    isActive: true,
    pbiWorkspaceId: '',
    pbiReportId: '',
    datasetId: '',
    webUrl: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [currentIdToken, setCurrentIdToken] = useState<string>('');
  
  // Power BI Reports state
  const [pbiReports, setPbiReports] = useState<PowerBIReport[]>([]);
  const [loadingPbiReports, setLoadingPbiReports] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedAreaFilter, selectedWorkspaceFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('🔐 [ReportsTab] Obteniendo token para cargar datos iniciales...');
      const tokenData = await getAccessToken();
      
      console.log('📡 [ReportsTab] Cargando áreas y workspaces...');
      const [areasData, workspacesData] = await Promise.all([
        powerbiService.getAllAreas({}, tokenData.idToken),
        powerbiService.getAllWorkspaces({}, tokenData.idToken)
      ]);
      
      console.log('✅ [ReportsTab] Datos cargados:', { areas: areasData.length, workspaces: workspacesData.length });
      setAreas(areasData);
      setWorkspaces(workspacesData);
      await fetchReports();
    } catch (error) {
      console.error('❌ [ReportsTab] Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      console.log('🔐 [ReportsTab] Obteniendo token para cargar reportes...');
      const tokenData = await getAccessToken();
      
      const workspaceId = selectedWorkspaceFilter === 'all' ? undefined : selectedWorkspaceFilter;
      console.log('📡 [ReportsTab] Cargando reportes con filtros:', { workspaceId });
      
      // Fetch all reports (active and inactive) for admin management
      const data = await powerbiService.getReports({ workspaceId, onlyActive: false }, tokenData.idToken);
      console.log('✅ [ReportsTab] Reportes cargados:', data.length);
      setReports(data);
    } catch (error) {
      console.error('❌ [ReportsTab] Error fetching reports:', error);
    }
  };

  const validateForm = (): boolean => {
    try {
      reportSchema.parse({
        name: formData.name,
        description: formData.description || undefined,
        workspaceId: formData.workspaceId,
        pbiWorkspaceId: formData.pbiWorkspaceId || undefined,
        pbiReportId: formData.pbiReportId || undefined,
        datasetId: formData.datasetId || undefined,
        webUrl: formData.webUrl || undefined
      });
      setFormErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            errors[err.path[0].toString()] = err.message;
          }
        });
        setFormErrors(errors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      console.log('🔐 [ReportsTab] Obteniendo token para guardar reporte...');
      const tokenData = await getAccessToken();
      
      const reportData = {
        name: formData.name,
        description: formData.description,
        areaId: formData.areaId,
        workspaceId: formData.workspaceId,
        hasRowLevelSecurity: formData.hasRowLevelSecurity,
        requireUserRole: formData.requireUserRole,
        isActive: formData.isActive,
        pbiWorkspaceId: formData.pbiWorkspaceId,
        pbiReportId: formData.pbiReportId,
        datasetId: formData.datasetId,
        webUrl: formData.webUrl
      };
      
      if (editingReport) {
        console.log('📡 [ReportsTab] Actualizando reporte:', { id: editingReport.id, data: reportData });
        await powerbiService.updateReport(editingReport.id, reportData, tokenData.idToken);
        console.log('✅ [ReportsTab] Reporte actualizado exitosamente');
        toast({
          title: "Éxito",
          description: "Reporte actualizado correctamente"
        });
      } else {
        console.log('📡 [ReportsTab] Creando nuevo reporte:', reportData);
        await powerbiService.createReport(reportData, tokenData.idToken);
        console.log('✅ [ReportsTab] Reporte creado exitosamente');
        toast({
          title: "Éxito",
          description: "Reporte creado correctamente"
        });
      }
      
      await fetchReports();
      handleCloseDialog();
      
    } catch (error) {
      console.error('❌ [ReportsTab] Error saving report:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el reporte",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (report: Report) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el reporte "${report.name}"?`)) {
      return;
    }

    try {
      console.log('🔐 [ReportsTab] Obteniendo token para eliminar reporte...');
      const tokenData = await getAccessToken();
      
      console.log('📡 [ReportsTab] Eliminando reporte:', { id: report.id, name: report.name });
      await powerbiService.deleteReport(report.id, tokenData.idToken);
      console.log('✅ [ReportsTab] Reporte eliminado exitosamente');
      
      toast({
        title: "Éxito",
        description: "Reporte eliminado correctamente"
      });
      await fetchReports();
    } catch (error) {
      console.error('❌ [ReportsTab] Error deleting report:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (report: Report) => {
    try {
      console.log('🔐 [ReportsTab] Obteniendo token para cambiar estado del reporte...');
      const tokenData = await getAccessToken();
      
      const newStatus = !report.isActive;
      console.log('📡 [ReportsTab] Cambiando estado del reporte:', { id: report.id, name: report.name, newStatus });
      
      await powerbiService.updateReport(report.id, {
        isActive: newStatus
      }, tokenData.idToken);
      
      console.log('✅ [ReportsTab] Estado del reporte actualizado exitosamente');
      toast({
        title: "Éxito",
        description: `Reporte ${newStatus ? 'activado' : 'desactivado'} correctamente`
      });
      await fetchReports();
    } catch (error) {
      console.error('❌ [ReportsTab] Error toggling report status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reporte",
        variant: "destructive"
      });
    }
  };

  // Fetch Power BI reports when workspace changes
  const fetchPowerBIReports = async (pbiWorkspaceId: string) => {
    if (!pbiWorkspaceId) {
      setPbiReports([]);
      return;
    }

    try {
      setLoadingPbiReports(true);
      console.log('🔐 [ReportsTab] Obteniendo token para cargar reportes de Power BI...');
      const tokenData = await getAccessToken();
      
      // Construir URL completa del API
      const baseUrl = import.meta.env.VITE_CRM_API_BASE_URL || 'https://skcodalilmdev.azurewebsites.net';
      const apiUrl = `${baseUrl}/api/pbi/workspaces/${pbiWorkspaceId}/reports`;
      
      console.log('📡 [ReportsTab] Cargando reportes de Power BI:', { pbiWorkspaceId, apiUrl });
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const pbiReportsData: PowerBIReport[] = await response.json();
      console.log('✅ [ReportsTab] Reportes de Power BI cargados:', pbiReportsData.length);
      setPbiReports(pbiReportsData);
    } catch (error) {
      console.error('❌ [ReportsTab] Error fetching Power BI reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes de Power BI",
        variant: "destructive"
      });
      setPbiReports([]);
    } finally {
      setLoadingPbiReports(false);
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    const selectedWorkspace = workspaces.find(w => w.id === workspaceId);
    const newFormData = {
      ...formData,
      workspaceId,
      pbiWorkspaceId: selectedWorkspace?.pbiWorkspaceId || '',
      pbiReportId: '', // Reset report selection
      datasetId: '', // Reset dependent fields
      webUrl: ''
    };
    
    setFormData(newFormData);
    
    // Fetch Power BI reports if workspace has pbiWorkspaceId
    if (selectedWorkspace?.pbiWorkspaceId) {
      fetchPowerBIReports(selectedWorkspace.pbiWorkspaceId);
    } else {
      setPbiReports([]);
    }
  };

  const handlePbiReportChange = (reportId: string) => {
    const selectedReport = pbiReports.find(r => r.id === reportId);
    setFormData(prev => ({
      ...prev,
      pbiReportId: reportId,
      datasetId: selectedReport?.datasetId || '',
      webUrl: selectedReport?.webUrl || ''
    }));
  };

  const handleOpenDialog = async (report?: Report) => {
    if (report) {
      setEditingReport(report);
      const workspace = workspaces.find(w => w.id === report.workspaceId);
      setFormData({
        name: report.name,
        description: report.description || '',
        areaId: workspace?.areaId || '',
        workspaceId: report.workspaceId,
        hasRowLevelSecurity: report.hasRowLevelSecurity,
        requireUserRole: report.requireUserRole || false,
        isActive: report.isActive,
        pbiWorkspaceId: report.pbiWorkspaceId || '',
        pbiReportId: report.pbiReportId || '',
        datasetId: report.datasetId || '',
        webUrl: report.webUrl || ''
      });
      
      // Load Power BI reports if editing and workspace has pbiWorkspaceId
      if (report.pbiWorkspaceId) {
        fetchPowerBIReports(report.pbiWorkspaceId);
      }
      setFormErrors({});
      setShowEditDialog(true);
    } else {
      console.log('🔐 [ReportsTab] Obteniendo token para diálogo de creación...');
      const tokenData = await getAccessToken();
      setCurrentIdToken(tokenData.idToken);
      setShowCreateDialog(true);
    }
  };

  const handleCloseDialog = () => {
    setShowEditDialog(false);
    setEditingReport(null);
    setFormData({
      name: '',
      description: '',
      areaId: '',
      workspaceId: '',
      hasRowLevelSecurity: false,
      requireUserRole: false,
      isActive: true,
      pbiWorkspaceId: '',
      pbiReportId: '',
      datasetId: '',
      webUrl: ''
    });
    setFormErrors({});
  };

  const handleCreateReport = async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const tokenData = await getAccessToken();
      await powerbiService.createReport(reportData, tokenData.idToken);
      
      toast({
        title: "Reporte creado",
        description: "El reporte se ha creado correctamente"
      });
      
      setShowCreateDialog(false);
      await fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el reporte",
        variant: "destructive"
      });
    }
  };

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace ? workspace.name : 'Workspace no encontrado';
  };

  const getAreaName = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    if (!workspace) return '';
    const area = areas.find(a => a.id === workspace.areaId);
    return area ? area.name : '';
  };

  const filteredWorkspaces = selectedAreaFilter === 'all' 
    ? workspaces.filter(w => w.isActive)
    : workspaces.filter(w => w.areaId === selectedAreaFilter && w.isActive);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Gestión de Reportes</h2>
          <p className="text-muted-foreground">
            Administra los reportes de Power BI y su configuración
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Reporte
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedAreaFilter} onValueChange={setSelectedAreaFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {areas.filter(area => area.isActive).map((area) => (
                <SelectItem key={area.id} value={area.id}>
                  {area.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={selectedWorkspaceFilter} 
            onValueChange={setSelectedWorkspaceFilter}
            disabled={selectedAreaFilter === 'all'}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los workspaces</SelectItem>
              {filteredWorkspaces.map((workspace) => (
                <SelectItem key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <FileBarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay reportes disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Los reportes conectan con Power BI para mostrar datos a los usuarios
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Reporte
              </Button>
            </Card>
          </div>
        ) : (
          reports.map((report) => (
            <Card key={report.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileBarChart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{report.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getWorkspaceName(report.workspaceId)}
                        </Badge>
                        <Badge variant={report.isActive ? 'default' : 'secondary'}>
                          {report.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {report.hasRowLevelSecurity && (
                          <Badge variant="outline" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            RLS
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {report.description || 'Sin descripción'}
                </p>
                
                <div className="space-y-2 mb-3">
                  {report.pbiReportId && (
                    <div className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                      Report ID: {report.pbiReportId}
                    </div>
                  )}
                  {report.webUrl && (
                    <div className="text-xs text-muted-foreground">
                      ✓ URL configurada
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(report)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(report)}
                  >
                    {report.isActive ? (
                      <ToggleRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ToggleLeft className="h-3 w-3 mr-1" />
                    )}
                    {report.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(report)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && currentIdToken && (
        <CreateReportDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateReport={handleCreateReport}
          areas={areas}
          workspaces={workspaces}
          idToken={currentIdToken}
        />
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReport ? 'Editar Reporte' : 'Nuevo Reporte'}
            </DialogTitle>
            <DialogDescription>
              {editingReport 
                ? 'Modifica la configuración del reporte seleccionado'
                : 'Crea un nuevo reporte de Power BI y configura su acceso'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Dashboard CRM, Análisis Ventas..."
                    className={formErrors.name ? 'border-destructive' : ''}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-destructive">{formErrors.name}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="areaId">Área *</Label>
                  <Select 
                    value={formData.areaId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, areaId: value, workspaceId: '', pbiWorkspaceId: '', pbiReportId: '', datasetId: '', webUrl: '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.filter(a => a.isActive).map((area) => (
                        <SelectItem key={area.id} value={area.id}>
                          {area.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workspaceId">Workspace *</Label>
                <Select 
                  value={formData.workspaceId} 
                  onValueChange={handleWorkspaceChange}
                  disabled={!formData.areaId}
                >
                  <SelectTrigger className={formErrors.workspaceId ? 'border-destructive' : ''}>
                    <SelectValue placeholder={!formData.areaId ? "Selecciona un área primero" : "Seleccionar workspace"} />
                  </SelectTrigger>
                  <SelectContent>
                    {workspaces.filter(w => w.isActive && w.areaId === formData.areaId).map((workspace) => (
                      <SelectItem key={workspace.id} value={workspace.id}>
                        {workspace.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.workspaceId && (
                  <p className="text-sm text-destructive">{formErrors.workspaceId}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el propósito y contenido del reporte..."
                  className={formErrors.description ? 'border-destructive' : ''}
                  rows={3}
                />
                {formErrors.description && (
                  <p className="text-sm text-destructive">{formErrors.description}</p>
                )}
              </div>
            </div>

            {/* Power BI Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración Power BI</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pbiWorkspaceId">Power BI Workspace ID</Label>
                  <Input
                    id="pbiWorkspaceId"
                    value={formData.pbiWorkspaceId}
                    placeholder="Se rellena automáticamente al seleccionar workspace"
                    className={`bg-muted ${formErrors.pbiWorkspaceId ? 'border-destructive' : ''}`}
                    disabled
                    readOnly
                  />
                  {formErrors.pbiWorkspaceId && (
                    <p className="text-sm text-destructive">{formErrors.pbiWorkspaceId}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pbiReportId">Power BI Report ID</Label>
                  <Select 
                    value={formData.pbiReportId} 
                    onValueChange={handlePbiReportChange}
                    disabled={!formData.pbiWorkspaceId || loadingPbiReports}
                  >
                    <SelectTrigger className={formErrors.pbiReportId ? 'border-destructive' : ''}>
                      <SelectValue placeholder={
                        loadingPbiReports 
                          ? "Cargando reportes..." 
                          : !formData.pbiWorkspaceId 
                            ? "Selecciona un workspace primero"
                            : pbiReports.length === 0
                              ? "No hay reportes disponibles"
                              : "Seleccionar reporte"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {pbiReports.map((report) => (
                        <SelectItem key={report.id} value={report.id}>
                          {report.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.pbiReportId && (
                    <p className="text-sm text-destructive">{formErrors.pbiReportId}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security & Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Seguridad y Estado</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hasRowLevelSecurity"
                    checked={formData.hasRowLevelSecurity}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasRowLevelSecurity: checked }))}
                  />
                  <Label htmlFor="hasRowLevelSecurity">Row Level Security (RLS)</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requireUserRole"
                    checked={formData.requireUserRole}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requireUserRole: checked }))}
                  />
                  <Label htmlFor="requireUserRole">Requiere rol específico</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Reporte activo</Label>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : (editingReport ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}