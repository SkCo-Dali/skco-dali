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
import { powerbiService } from '@/services/powerbiService';
import { Area, Workspace, Report } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

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
  const [reports, setReports] = useState<Report[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [selectedWorkspaceFilter, setSelectedWorkspaceFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [formData, setFormData] = useState<ReportFormData>({
    name: '',
    description: '',
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [selectedAreaFilter, selectedWorkspaceFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [areasData, workspacesData] = await Promise.all([
        powerbiService.getAllAreas(),
        powerbiService.getAllWorkspaces()
      ]);
      setAreas(areasData);
      setWorkspaces(workspacesData);
      await fetchReports();
    } catch (error) {
      console.error('Error fetching data:', error);
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
      const workspaceId = selectedWorkspaceFilter === 'all' ? undefined : selectedWorkspaceFilter;
      const data = await powerbiService.getReports({ workspaceId });
      setReports(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
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
      
      if (editingReport) {
        await powerbiService.updateReport(editingReport.id, {
          name: formData.name,
          description: formData.description,
          workspaceId: formData.workspaceId,
          hasRowLevelSecurity: formData.hasRowLevelSecurity,
          requireUserRole: formData.requireUserRole,
          isActive: formData.isActive,
          pbiWorkspaceId: formData.pbiWorkspaceId,
          pbiReportId: formData.pbiReportId,
          datasetId: formData.datasetId,
          webUrl: formData.webUrl
        });
        toast({
          title: "Éxito",
          description: "Reporte actualizado correctamente"
        });
      } else {
        await powerbiService.createReport({
          name: formData.name,
          description: formData.description,
          workspaceId: formData.workspaceId,
          hasRowLevelSecurity: formData.hasRowLevelSecurity,
          requireUserRole: formData.requireUserRole,
          isActive: formData.isActive,
          pbiWorkspaceId: formData.pbiWorkspaceId,
          pbiReportId: formData.pbiReportId,
          datasetId: formData.datasetId,
          webUrl: formData.webUrl
        });
        toast({
          title: "Éxito",
          description: "Reporte creado correctamente"
        });
      }
      
      await fetchReports();
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving report:', error);
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
      await powerbiService.deleteReport(report.id);
      toast({
        title: "Éxito",
        description: "Reporte eliminado correctamente"
      });
      await fetchReports();
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (report: Report) => {
    try {
      await powerbiService.updateReport(report.id, {
        isActive: !report.isActive
      });
      toast({
        title: "Éxito",
        description: `Reporte ${!report.isActive ? 'activado' : 'desactivado'} correctamente`
      });
      await fetchReports();
    } catch (error) {
      console.error('Error toggling report status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del reporte",
        variant: "destructive"
      });
    }
  };

  const handleOpenDialog = (report?: Report) => {
    if (report) {
      setEditingReport(report);
      setFormData({
        name: report.name,
        description: report.description || '',
        workspaceId: report.workspaceId,
        hasRowLevelSecurity: report.hasRowLevelSecurity,
        requireUserRole: report.requireUserRole || false,
        isActive: report.isActive,
        pbiWorkspaceId: report.pbiWorkspaceId || '',
        pbiReportId: report.pbiReportId || '',
        datasetId: report.datasetId || '',
        webUrl: report.webUrl || ''
      });
    } else {
      setEditingReport(null);
      setFormData({
        name: '',
        description: '',
        workspaceId: '',
        hasRowLevelSecurity: false,
        requireUserRole: false,
        isActive: true,
        pbiWorkspaceId: '',
        pbiReportId: '',
        datasetId: '',
        webUrl: ''
      });
    }
    setFormErrors({});
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingReport(null);
    setFormData({
      name: '',
      description: '',
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

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
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
                  <Label htmlFor="workspaceId">Workspace *</Label>
                  <Select 
                    value={formData.workspaceId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, workspaceId: value }))}
                  >
                    <SelectTrigger className={formErrors.workspaceId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Seleccionar workspace" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspaces.filter(w => w.isActive).map((workspace) => (
                        <SelectItem key={workspace.id} value={workspace.id}>
                          {workspace.name} ({getAreaName(workspace.id)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.workspaceId && (
                    <p className="text-sm text-destructive">{formErrors.workspaceId}</p>
                  )}
                </div>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, pbiWorkspaceId: e.target.value }))}
                    placeholder="9988790d-a5c3-459b-97cb-ee8103957bbc"
                    className={formErrors.pbiWorkspaceId ? 'border-destructive' : ''}
                  />
                  {formErrors.pbiWorkspaceId && (
                    <p className="text-sm text-destructive">{formErrors.pbiWorkspaceId}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pbiReportId">Power BI Report ID</Label>
                  <Input
                    id="pbiReportId"
                    value={formData.pbiReportId}
                    onChange={(e) => setFormData(prev => ({ ...prev, pbiReportId: e.target.value }))}
                    placeholder="0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9"
                    className={formErrors.pbiReportId ? 'border-destructive' : ''}
                  />
                  {formErrors.pbiReportId && (
                    <p className="text-sm text-destructive">{formErrors.pbiReportId}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="datasetId">Dataset ID</Label>
                  <Input
                    id="datasetId"
                    value={formData.datasetId}
                    onChange={(e) => setFormData(prev => ({ ...prev, datasetId: e.target.value }))}
                    placeholder="dataset-123"
                    className={formErrors.datasetId ? 'border-destructive' : ''}
                  />
                  {formErrors.datasetId && (
                    <p className="text-sm text-destructive">{formErrors.datasetId}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webUrl">Web URL</Label>
                  <Input
                    id="webUrl"
                    value={formData.webUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, webUrl: e.target.value }))}
                    placeholder="https://app.powerbi.com/groups/..."
                    className={formErrors.webUrl ? 'border-destructive' : ''}
                  />
                  {formErrors.webUrl && (
                    <p className="text-sm text-destructive">{formErrors.webUrl}</p>
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