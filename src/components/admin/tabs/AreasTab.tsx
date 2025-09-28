import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { powerbiService } from '@/services/powerbiService';
import { Area } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

// Validation schema
const areaSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido").max(100, "El nombre no puede exceder 100 caracteres")
});

interface AreaFormData {
  name: string;
  isActive: boolean;
}

export function AreasTab() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [formData, setFormData] = useState<AreaFormData>({
    name: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      setLoading(true);
      const data = await powerbiService.getAllAreas();
      setAreas(data);
    } catch (error) {
      console.error('Error fetching areas:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las áreas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    try {
      areaSchema.parse({ name: formData.name });
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
      
      if (editingArea) {
        await powerbiService.updateArea(editingArea.id, {
          name: formData.name,
          isActive: formData.isActive
        });
        toast({
          title: "Éxito",
          description: "Área actualizada correctamente"
        });
      } else {
        await powerbiService.createArea({
          name: formData.name,
          isActive: formData.isActive
        });
        toast({
          title: "Éxito",
          description: "Área creada correctamente"
        });
      }
      
      await fetchAreas();
      handleCloseDialog();
      
    } catch (error) {
      console.error('Error saving area:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el área",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (area: Area) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el área "${area.name}"?`)) {
      return;
    }

    try {
      await powerbiService.deleteArea(area.id);
      toast({
        title: "Éxito",
        description: "Área eliminada correctamente"
      });
      await fetchAreas();
    } catch (error) {
      console.error('Error deleting area:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el área",
        variant: "destructive"
      });
    }
  };

  const handleToggleStatus = async (area: Area) => {
    try {
      await powerbiService.updateArea(area.id, {
        isActive: !area.isActive
      });
      toast({
        title: "Éxito",
        description: `Área ${!area.isActive ? 'activada' : 'desactivada'} correctamente`
      });
      await fetchAreas();
    } catch (error) {
      console.error('Error toggling area status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del área",
        variant: "destructive"
      });
    }
  };

  const handleOpenDialog = (area?: Area) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        isActive: area.isActive
      });
    } else {
      setEditingArea(null);
      setFormData({
        name: '',
        isActive: true
      });
    }
    setFormErrors({});
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingArea(null);
    setFormData({ name: '', isActive: true });
    setFormErrors({});
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
          <h2 className="text-2xl font-semibold">Gestión de Áreas</h2>
          <p className="text-muted-foreground">
            Administra las áreas organizacionales para reportes
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Área
        </Button>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.length === 0 ? (
          <div className="col-span-full">
            <Card className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay áreas disponibles</h3>
              <p className="text-muted-foreground mb-4">
                Crea la primera área para organizar los workspaces y reportes
              </p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Área
              </Button>
            </Card>
          </div>
        ) : (
          areas.map((area) => (
            <Card key={area.id} className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{area.name}</CardTitle>
                      <CardDescription>
                        <Badge variant={area.isActive ? 'default' : 'secondary'}>
                          {area.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenDialog(area)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(area)}
                  >
                    {area.isActive ? (
                      <ToggleRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ToggleLeft className="h-3 w-3 mr-1" />
                    )}
                    {area.isActive ? 'Desactivar' : 'Activar'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(area)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingArea ? 'Editar Área' : 'Nueva Área'}
            </DialogTitle>
            <DialogDescription>
              {editingArea 
                ? 'Modifica los datos del área seleccionada'
                : 'Crea una nueva área para organizar workspaces y reportes'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Comercial, Operaciones, Marketing..."
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-destructive">{formErrors.name}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Área activa</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Guardando...' : (editingArea ? 'Actualizar' : 'Crear')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}