import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PowerBIReport } from './PowerBIReportsAdmin';

interface EditReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: PowerBIReport;
  onEditReport: (report: PowerBIReport) => void;
}

export function EditReportDialog({ open, onOpenChange, report, onEditReport }: EditReportDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    embedUrl: '',
    reportId: '',
    workspaceId: '',
    isActive: true,
    requiresRLS: false
  });

  useEffect(() => {
    if (report) {
      setFormData({
        name: report.name,
        description: report.description || '',
        embedUrl: report.embedUrl,
        reportId: report.reportId,
        workspaceId: report.workspaceId || '',
        isActive: report.isActive,
        requiresRLS: report.requiresRLS
      });
    }
  }, [report]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.reportId.trim()) {
      return;
    }

    onEditReport({
      ...report,
      ...formData
    });
  };

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
              <Label htmlFor="reportId">Report ID *</Label>
              <Input
                id="reportId"
                value={formData.reportId}
                onChange={(e) => setFormData(prev => ({ ...prev, reportId: e.target.value }))}
                placeholder="GUID del reporte en Power BI"
                required
              />
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

          <div className="space-y-2">
            <Label htmlFor="embedUrl">URL de Embed</Label>
            <Input
              id="embedUrl"
              value={formData.embedUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, embedUrl: e.target.value }))}
              placeholder="https://app.powerbi.com/reportEmbed?reportId=..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspaceId">Workspace ID</Label>
            <Input
              id="workspaceId"
              value={formData.workspaceId}
              onChange={(e) => setFormData(prev => ({ ...prev, workspaceId: e.target.value }))}
              placeholder="GUID del workspace en Power BI"
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
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

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="requiresRLS">Requiere Row Level Security</Label>
              <p className="text-sm text-muted-foreground">
                El reporte utiliza RLS para filtrar datos por usuario
              </p>
            </div>
            <Switch
              id="requiresRLS"
              checked={formData.requiresRLS}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requiresRLS: checked }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00c83c] hover:bg-[#00c83c]/90">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}