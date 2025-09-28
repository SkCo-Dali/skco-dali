import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { Report } from '@/types/powerbi';
import { roles } from '@/utils/userRoleUtils';

interface ManageReportRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: PowerBIReport;
  onUpdateRoles: (roles: string[]) => void;
}

export function ManageReportRolesDialog({ 
  open, 
  onOpenChange, 
  report, 
  onUpdateRoles 
}: ManageReportRolesDialogProps) {
  const [reportRoles, setReportRoles] = useState<string[]>([]);
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    if (report) {
      setReportRoles(report.roles || []);
    }
  }, [report]);

  const addRole = () => {
    if (newRole.trim() && !reportRoles.includes(newRole.trim())) {
      setReportRoles(prev => [...prev, newRole.trim()]);
      setNewRole('');
    }
  };

  const removeRole = (roleToRemove: string) => {
    setReportRoles(prev => prev.filter(role => role !== roleToRemove));
  };

  const addSystemRole = (roleValue: string) => {
    if (!reportRoles.includes(roleValue)) {
      setReportRoles(prev => [...prev, roleValue]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateRoles(reportRoles);
  };

  const availableSystemRoles = roles.filter(role => !reportRoles.includes(role.value));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gestionar Roles - {report?.name}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Roles Asignados</Label>
            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
              {reportRoles.length === 0 ? (
                <span className="text-sm text-muted-foreground">No hay roles asignados</span>
              ) : (
                reportRoles.map((role) => (
                  <Badge key={role} variant="secondary" className="flex items-center gap-1">
                    {roles.find(r => r.value === role)?.label || role}
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeRole(role)}
                    />
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Roles del Sistema Disponibles</Label>
            <div className="flex flex-wrap gap-2">
              {availableSystemRoles.map((role) => (
                <Button
                  key={role.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addSystemRole(role.value)}
                  className="text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {role.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newRole">Agregar Rol Personalizado</Label>
            <div className="flex gap-2">
              <Input
                id="newRole"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="Nombre del rol..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
              />
              <Button type="button" onClick={addRole} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Los roles personalizados deben coincidir con los definidos en Power BI RLS
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00C73D] hover:bg-[#00C73D]/90">
              Guardar Roles
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}