import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Report, Workspace } from '@/types/powerbi';
import { ENV } from '@/config/environment';
import { useMsal } from '@azure/msal-react';

interface PowerBIReport {
  id: string;
  name: string;
  datasetId: string;
  webUrl: string;
}

interface DatasetInfo {
  isEffectiveIdentityRequired: boolean;
  isEffectiveIdentityRolesRequired: boolean;
}

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => void;
  workspaces: Workspace[];
}

export function CreateReportDialog({ open, onOpenChange, onCreateReport, workspaces }: CreateReportDialogProps) {
  const { instance, accounts } = useMsal();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pbiReportId: '',
    workspaceId: '',
    isActive: true,
    hasRowLevelSecurity: false,
    pbiWorkspaceId: '',
    datasetId: '',
    webUrl: ''
  });
  
  const [pbiReports, setPbiReports] = useState<PowerBIReport[]>([]);
  const [datasetInfo, setDatasetInfo] = useState<DatasetInfo | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [loadingDataset, setLoadingDataset] = useState(false);

  // Fetch Power BI reports when workspace changes
  useEffect(() => {
    if (formData.pbiWorkspaceId) {
      fetchPowerBIReports(formData.pbiWorkspaceId);
    } else {
      setPbiReports([]);
      setDatasetInfo(null);
    }
  }, [formData.pbiWorkspaceId]);

  // Fetch dataset info when report changes
  useEffect(() => {
    if (formData.pbiReportId && formData.pbiWorkspaceId && formData.datasetId) {
      fetchDatasetInfo(formData.pbiWorkspaceId, formData.datasetId);
    } else {
      setDatasetInfo(null);
    }
  }, [formData.pbiReportId, formData.datasetId]);

  const fetchPowerBIReports = async (workspaceId: string) => {
    console.log('📡 Iniciando carga de reportes para workspace:', workspaceId);
    setLoadingReports(true);
    try {
      const tokens = await instance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: accounts[0]
      });

      const endpoint = `${ENV.CRM_API_BASE_URL}/api/pbi/workspaces/${workspaceId}/reports`;
      console.log('📡 Llamando a:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${tokens.idToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error('Error al obtener reportes de Power BI');
      }

      const data: PowerBIReport[] = await response.json();
      console.log('✅ Reportes obtenidos:', data);
      setPbiReports(data);
    } catch (error) {
      console.error('❌ Error fetching Power BI reports:', error);
      setPbiReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const fetchDatasetInfo = async (workspaceId: string, datasetId: string) => {
    setLoadingDataset(true);
    try {
      const tokens = await instance.acquireTokenSilent({
        scopes: ['User.Read'],
        account: accounts[0]
      });

      const response = await fetch(
        `${ENV.CRM_API_BASE_URL}/api/pbi/workspaces/${workspaceId}/datasets/${datasetId}`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Error al obtener información del dataset');

      const data: DatasetInfo = await response.json();
      setDatasetInfo(data);
      
      // Update hasRowLevelSecurity based on dataset info
      setFormData(prev => ({
        ...prev,
        hasRowLevelSecurity: data.isEffectiveIdentityRequired
      }));
    } catch (error) {
      console.error('Error fetching dataset info:', error);
      setDatasetInfo(null);
    } finally {
      setLoadingDataset(false);
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    const selectedWorkspace = workspaces.find(w => w.id === workspaceId);
    console.log('🔧 Workspace seleccionado:', {
      workspaceId,
      selectedWorkspace,
      pbiWorkspaceId: selectedWorkspace?.pbiWorkspaceId
    });
    setFormData(prev => ({
      ...prev,
      workspaceId,
      pbiWorkspaceId: selectedWorkspace?.pbiWorkspaceId || '',
      pbiReportId: '',
      datasetId: '',
      webUrl: '',
      name: ''
    }));
  };

  const handlePbiReportChange = (reportId: string) => {
    const selectedReport = pbiReports.find(r => r.id === reportId);
    if (selectedReport) {
      setFormData(prev => ({
        ...prev,
        pbiReportId: reportId,
        datasetId: selectedReport.datasetId,
        webUrl: selectedReport.webUrl,
        name: selectedReport.name // Auto-populate name
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.pbiReportId.trim() || !formData.workspaceId.trim()) {
      return;
    }

    onCreateReport(formData);
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      pbiReportId: '',
      workspaceId: '',
      isActive: true,
      hasRowLevelSecurity: false,
      pbiWorkspaceId: '',
      datasetId: '',
      webUrl: ''
    });
    setPbiReports([]);
    setDatasetInfo(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Reporte</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Workspace selector */}
          <div className="space-y-2">
            <Label htmlFor="workspace">Workspace *</Label>
            <Select value={formData.workspaceId} onValueChange={handleWorkspaceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.filter(w => w.isActive).map(workspace => (
                  <SelectItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Power BI Workspace ID (read-only) */}
          {formData.pbiWorkspaceId && (
            <div className="space-y-2">
              <Label>Power BI Workspace ID</Label>
              <Input
                value={formData.pbiWorkspaceId}
                readOnly
                className="bg-muted"
              />
            </div>
          )}

          {/* Power BI Report selector */}
          {formData.pbiWorkspaceId && (
            <div className="space-y-2">
              <Label htmlFor="pbiReport">Reporte de Power BI *</Label>
              <Select 
                value={formData.pbiReportId} 
                onValueChange={handlePbiReportChange}
                disabled={loadingReports}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingReports ? "Cargando reportes..." : "Selecciona un reporte"} />
                </SelectTrigger>
                <SelectContent>
                  {pbiReports.map(report => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom name */}
          {formData.pbiReportId && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Personalizado *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Dashboard Ventas"
                required
              />
              <p className="text-xs text-muted-foreground">
                Puedes personalizar el nombre que se mostrará a los usuarios
              </p>
            </div>
          )}

          {/* Description */}
          {formData.pbiReportId && (
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
          )}

          {/* Power BI Configuration indicators */}
          {datasetInfo && (
            <div className="space-y-3 p-4 border rounded-xl bg-muted/30">
              <Label className="text-base font-semibold">Configuración Power BI</Label>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">RLS detectado:</span>
                <Badge variant={datasetInfo.isEffectiveIdentityRequired ? "default" : "secondary"}>
                  {datasetInfo.isEffectiveIdentityRequired ? "Sí" : "No"}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Roles requeridos:</span>
                <Badge variant={datasetInfo.isEffectiveIdentityRolesRequired ? "default" : "secondary"}>
                  {datasetInfo.isEffectiveIdentityRolesRequired ? "Sí" : "No"}
                </Badge>
              </div>
            </div>
          )}

          {/* Active status toggle */}
          {formData.pbiReportId && (
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="space-y-1">
                <Label htmlFor="isActive">Reporte Activo</Label>
                <p className="text-sm text-muted-foreground">
                  El reporte estará disponible para los usuarios asignados
                </p>
              </div>
              <Badge variant={formData.isActive ? "default" : "secondary"}>
                {formData.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00C73D] hover:bg-[#00C73D]/90">
              Crear Reporte
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}