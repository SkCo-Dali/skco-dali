import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Report } from '@/types/powerbi';

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  areas: { id: string; name: string; isActive: boolean }[];
  workspaces: { id: string; name: string; areaId: string; isActive: boolean }[];
  onEditReport: (report: Report) => void;
}

export function EditReportDialog({ open, onOpenChange, report, areas, workspaces, onEditReport }: EditReportDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    areaId: '',
    pbiReportId: '',
    workspaceId: '',
    isActive: true,
    hasRowLevelSecurity: false
  });

  useEffect(() => {
    if (report) {
      const workspace = workspaces.find(w => w.id === report.workspaceId);
      setFormData({
        name: report.name,
        description: report.description || '',
        areaId: workspace?.areaId || '',
        pbiReportId: report.pbiReportId || '',
        workspaceId: report.workspaceId || '',
        isActive: report.isActive,
        hasRowLevelSecurity: report.hasRowLevelSecurity
      });
    }
  }, [report, workspaces]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.pbiReportId.trim() || !formData.workspaceId.trim() || !formData.areaId.trim()) {
      return;
    }

    onEditReport({
      ...report,
      ...formData
    });
  };

  const filteredWorkspaces = formData.areaId 
    ? workspaces.filter(w => w.areaId === formData.areaId && w.isActive)
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Reporte</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Reporte *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Dashboard Ventas"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pbiReportId">Power BI Report ID *</Label>
              <Input
                id="pbiReportId"
                value={formData.pbiReportId}
                onChange={(e) => setFormData(prev => ({ ...prev, pbiReportId: e.target.value }))}
                placeholder="GUID del reporte en Power BI"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="areaId">Área *</Label>
              <Select
                value={formData.areaId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, areaId: value, workspaceId: '' }))}
              >
                <SelectTrigger id="areaId">
                  <SelectValue placeholder="Selecciona un área" />
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

            <div className="space-y-2">
              <Label htmlFor="workspaceId">Workspace *</Label>
              <Select
                value={formData.workspaceId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, workspaceId: value }))}
                disabled={!formData.areaId}
              >
                <SelectTrigger id="workspaceId">
                  <SelectValue placeholder="Selecciona un workspace" />
                </SelectTrigger>
                <SelectContent>
                  {filteredWorkspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción del reporte..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-1">
              <Label htmlFor="isActive">Reporte Activo</Label>
              <p className="text-sm text-muted-foreground">
                El reporte estará disponible para los usuarios asignados
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-1">
              <Label htmlFor="hasRowLevelSecurity">Requiere Row Level Security</Label>
              <p className="text-sm text-muted-foreground">
                El reporte utiliza RLS para filtrar datos por usuario
              </p>
            </div>
            <Switch
              id="hasRowLevelSecurity"
              checked={formData.hasRowLevelSecurity}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasRowLevelSecurity: checked }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00C73D] hover:bg-[#00C73D]/90">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}