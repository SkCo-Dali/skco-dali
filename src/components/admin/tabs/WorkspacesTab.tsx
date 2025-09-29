import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, FolderOpen, Filter } from 'lucide-react';
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
import { Area, Workspace } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { z } from 'zod';

// Validation schema
const workspaceSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres"),
  description: z.string().max(500, "La descripción no puede exceder 500 caracteres").optional(),
  areaId: z.string().min(1, "Debe seleccionar un área"),
  pbiWorkspaceId: z.string().max(100, "El ID de workspace no puede exceder 100 caracteres").optional()
});

interface WorkspaceFormData {
  name: string;
  description: string;
  areaId: string;
  pbiWorkspaceId: string;
  isActive: boolean;
}

interface PowerBIWorkspace {
  id: string;
  name: string;
  isOnDedicatedCapacity: boolean;
  capacityId: string;
}

export function WorkspacesTab() {
  const { getAccessToken } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [powerBIWorkspaces, setPowerBIWorkspaces] = useState<PowerBIWorkspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPBIWorkspaces, setLoadingPBIWorkspaces] = useState(false);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [formData, setFormData] = useState<WorkspaceFormData>({
    name: '',
    description: '',
    areaId: '',
    pbiWorkspaceId: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [selectedAreaFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🔐 === INICIANDO fetchData para WorkspacesTab ===');
      
      // Get access token - usar idToken para backend APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error('No se pudo obtener el token de identificación');
      }
      
      console.log('🔍 Token obtenido:', tokenData.idToken.substring(0, 50) + '...');
      
      const [areasData] = await Promise.all([
        powerbiService.getAreas({}, tokenData.idToken)
      ]);
      setAreas(areasData);
      await fetchWorkspaces();
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaces = async () => {
    try {
      console.log('🔐 === INICIANDO fetchWorkspaces ===');
      
      // Get access token - usar idToken para backend APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error('No se pudo obtener el token de identificación');
      }
      
      console.log('🔍 Token obtenido para workspaces:', tokenData.idToken.substring(0, 50) + '...');
      console.log('🔍 Filtro de área seleccionado:', selectedAreaFilter);
      
      const params = selectedAreaFilter === 'all' ? {} : { areaId: selectedAreaFilter };
      console.log('📋 Parámetros para getWorkspaces:', params);
      
      const data = await powerbiService.getWorkspaces(params, tokenData.idToken);
      console.log('✅ Workspaces obtenidos:', data.length);
      setWorkspaces(data);
    } catch (error) {
      console.error('❌ Error fetching workspaces:', error);
    }
  };

  const fetchPowerBIWorkspaces = async () => {
    try {
      setLoadingPBIWorkspaces(true);
      console.log('🔐 === INICIANDO fetchPowerBIWorkspaces ===');
      
      // Get access token - usar idToken para backend APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error('No se pudo obtener el token de identificación');
      }
      
      console.log('🔍 Token obtenido para PBI workspaces:', tokenData.idToken.substring(0, 50) + '...');
      
      // Make API call to Power BI workspaces endpoint
      const response = await fetch('/api/pbi/workspaces', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.idToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const pbiWorkspaces: PowerBIWorkspace[] = await response.json();
      console.log('✅ Power BI Workspaces obtenidos:', pbiWorkspaces.length);
      setPowerBIWorkspaces(pbiWorkspaces);
    } catch (error) {
      console.error('❌ Error fetching Power BI workspaces:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los workspaces de Power BI",
        variant: "destructive"
      });
    } finally {
      setLoadingPBIWorkspaces(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      workspaceSchema.parse({
        name: formData.name,
        description: formData.description || undefined,
        areaId: formData.areaId,
        pbiWorkspaceId: formData.pbiWorkspaceId || undefined
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
      
      console.log('🔐 === INICIANDO handleSave Workspace ===');
      
      // Get access token - usar idToken para backend APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error('No se pudo obtener el token de identificación');
      }
      
      console.log('🔍 Token obtenido para save:', tokenData.idToken.substring(0, 50) + '...');
      console.log('📝 Datos del formulario:', {
        ...formData,
        editingWorkspace: editingWorkspace?.id
      });
      
      if (editingWorkspace) {
        await powerbiService.updateWorkspace(editingWorkspace.id, {
          name: formData.name,
          description: formData.description,
          areaId: formData.areaId,
          pbiWorkspaceId: formData.pbiWorkspaceId,
          isActive: formData.isActive
        }, tokenData.idToken);
        toast({
          title: "Éxito",
          description: "Workspace actualizado correctamente"
        });
      } else {
        await powerbiService.createWorkspace({
          name: formData.name,
          description: formData.description,
          areaId: formData.areaId,
          pbiWorkspaceId: formData.pbiWorkspaceId,
          isActive: formData.isActive
        }, tokenData.idToken);
        toast({
          title: "Éxito",
          description: "Workspace creado correctamente"
        });
      }
      
      await fetchWorkspaces();
      handleCloseDialog();
      
    } catch (error) {
      console.error('❌ Error saving workspace:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el workspace",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (workspace: Workspace) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el workspace "${workspace.name}"?`)) {
      return;
    }

    try {
      console.log('🔐 === INICIANDO handleDelete Workspace ===');
      
      // Get access token - usar idToken para backend APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error('No se pudo obtener el token de identificación');
      }
      
      console.log('🔍 Token obtenido para delete:', tokenData.idToken.substring(0, 50) + '...');
      console.log('🗑️ Eliminando workspace:', workspace.id, workspace.name);

      await powerbiService.deleteWorkspace(workspace.id, tokenData.idToken);
      toast({
        title: "Éxito",
        description: "Workspace eliminado correctamente"
      });
      await fetchWorkspaces();
    } catch (error) {
      console.error('❌ Error deleting workspace:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el workspace",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (workspace: Workspace) => {
    try {
      console.log('🔐 === INICIANDO handleToggleStatus Workspace ===');
      
      // Get access token - usar idToken para backend APIs
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        throw new Error('No se pudo obtener el token de identificación');
      }
      
      console.log('🔍 Token obtenido para toggle:', tokenData.idToken.substring(0, 50) + '...');
      console.log('🔄 Cambiando estado de workspace:', workspace.id, 'de', workspace.isActive, 'a', !workspace.isActive);

      await powerbiService.updateWorkspace(workspace.id, {
        isActive: !workspace.isActive
      }, tokenData.idToken);
      toast({
        title: "Éxito",
        description: `Workspace ${!workspace.isActive ? 'activado' : 'desactivado'} correctamente`
      });
      await fetchWorkspaces();
    } catch (error) {
      console.error('❌ Error toggling workspace status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del workspace",
        variant: "destructive"
      });
    }
  };

  const handleOpenDialog = (workspace?: Workspace) => {
    if (workspace) {
      setEditingWorkspace(workspace);
      setFormData({
        name: workspace.name,
        description: workspace.description || '',
        areaId: workspace.areaId,
        pbiWorkspaceId: workspace.pbiWorkspaceId || '',
        isActive: workspace.isActive
      });
    } else {
      setEditingWorkspace(null);
      setFormData({
        name: '',
        description: '',
        areaId: '',
        pbiWorkspaceId: '',
        isActive: true
      });
    }
    setFormErrors({});
    // Fetch Power BI workspaces when dialog opens
    fetchPowerBIWorkspaces();
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingWorkspace(null);
    setFormData({
      name: '',
      description: '',
      areaId: '',
      pbiWorkspaceId: '',
      isActive: true
    });
    setFormErrors({});
  };

  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    return area ? area.name : 'Área no encontrada';
  };

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
          <h2 className="text-2xl font-semibold">Gestión de Workspaces</h2>
          <p className="text-muted-foreground">
            Administra los workspaces de Power BI organizados por área
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Workspace
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
        </div>
      </div>

      {/* Workspaces Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {workspaces.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">
                {selectedAreaFilter === 'all' 
                  ? 'No hay workspaces disponibles' 
                  : 'No hay workspaces en esta área'
                }
              </h3>
              <p className="text-muted-foreground mb-4">
                Los workspaces organizan los reportes de Power BI por área de trabajo
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Workspace
              </Button>
            </Card>
          </div>
        ) : (
          workspaces.map((workspace) => (
            <Card key={workspace.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{workspace.name}</CardTitle>
                      <CardDescription className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {getAreaName(workspace.areaId)}
                        </Badge>
                        <Badge variant={workspace.isActive ? 'default' : 'secondary'}>
                          {workspace.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {workspace.description || 'Sin descripción'}
                </p>
                
                {workspace.pbiWorkspaceId && (
                  <div className="text-xs text-muted-foreground mb-3 font-mono bg-muted p-2 rounded">
                    PBI ID: {workspace.pbiWorkspaceId}
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(workspace)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(workspace)}
                  >
                    {workspace.isActive ? (
                      <ToggleRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ToggleLeft className="h-3 w-3 mr-1" />
                    )}
                    {workspace.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(workspace)}
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingWorkspace ? 'Editar Workspace' : 'Nuevo Workspace'}
            </DialogTitle>
            <DialogDescription>
              {editingWorkspace 
                ? 'Modifica los datos del workspace seleccionado'
                : 'Crea un nuevo workspace para organizar reportes de Power BI'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: CRM Analytics, Ventas..."
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-destructive">{formErrors.name}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="areaId">Área *</Label>
                <Select value={formData.areaId} onValueChange={(value) => setFormData(prev => ({ ...prev, areaId: value }))}>
                  <SelectTrigger className={formErrors.areaId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Seleccionar área" />
                  </SelectTrigger>
                  <SelectContent>
                    {areas.filter(area => area.isActive).map((area) => (
                      <SelectItem key={area.id} value={area.id}>
                        {area.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.areaId && (
                  <p className="text-sm text-destructive">{formErrors.areaId}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe el propósito de este workspace..."
                className={formErrors.description ? 'border-destructive' : ''}
                rows={3}
              />
              {formErrors.description && (
                <p className="text-sm text-destructive">{formErrors.description}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pbiWorkspaceId">Power BI Workspace</Label>
              <Select 
                value={formData.pbiWorkspaceId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, pbiWorkspaceId: value }))}
                disabled={loadingPBIWorkspaces}
              >
                <SelectTrigger className={formErrors.pbiWorkspaceId ? 'border-destructive' : ''}>
                  <SelectValue placeholder={
                    loadingPBIWorkspaces 
                      ? "Cargando workspaces..." 
                      : "Seleccionar workspace de Power BI"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {powerBIWorkspaces.map((pbiWorkspace) => (
                    <SelectItem key={pbiWorkspace.id} value={pbiWorkspace.id}>
                      {pbiWorkspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.pbiWorkspaceId && (
                <p className="text-sm text-destructive">{formErrors.pbiWorkspaceId}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Selecciona el workspace de Power BI asociado (opcional)
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Workspace activo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : (editingWorkspace ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}