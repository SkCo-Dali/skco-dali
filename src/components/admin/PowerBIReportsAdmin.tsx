import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Users, 
  Shield, 
  FileBarChart,
  Settings,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { CreateReportDialog } from './CreateReportDialog';
import { EditReportDialog } from './EditReportDialog';
import { ManageReportRolesDialog } from './ManageReportRolesDialog';
import { ManageReportAssignmentsDialog } from './ManageReportAssignmentsDialog';

export interface PowerBIReport {
  id: string;
  name: string;
  description?: string;
  embedUrl: string;
  reportId: string;
  workspaceId?: string;
  isActive: boolean;
  requiresRLS: boolean;
  roles?: string[];
  assignedUsers?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export default function PowerBIReportsAdmin() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PowerBIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<PowerBIReport | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRolesDialog, setShowRolesDialog] = useState(false);
  const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
    }
  }, [isAdmin]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/powerbi/reports');
      // const data = await response.json();
      
      // Mock data for now
      const mockReports: PowerBIReport[] = [
        {
          id: '1',
          name: 'Estado Pólizas',
          description: 'Reporte de estado de pólizas asignadas',
          embedUrl: '',
          reportId: '',
          workspaceId: '',
          isActive: true,
          requiresRLS: true,
          roles: ['PolicyViewer'],
          assignedUsers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'CRM DALI',
          description: 'Dashboard principal del CRM',
          embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9&groupId=9988790d-a5c3-459b-97cb-ee8103957bbc',
          reportId: '0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9',
          workspaceId: '9988790d-a5c3-459b-97cb-ee8103957bbc',
          isActive: true,
          requiresRLS: true,
          roles: ['CRMUser'],
          assignedUsers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setReports(mockReports);
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async (reportData: Omit<PowerBIReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // TODO: Replace with actual API call
      const newReport: PowerBIReport = {
        ...reportData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setReports(prev => [...prev, newReport]);
      setShowCreateDialog(false);
      
      toast({
        title: "Éxito",
        description: "Reporte creado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el reporte",
        variant: "destructive"
      });
    }
  };

  const handleEditReport = async (reportData: PowerBIReport) => {
    try {
      // TODO: Replace with actual API call
      setReports(prev => prev.map(r => 
        r.id === reportData.id 
          ? { ...reportData, updatedAt: new Date() }
          : r
      ));
      setShowEditDialog(false);
      setSelectedReport(null);
      
      toast({
        title: "Éxito",
        description: "Reporte actualizado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el reporte",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este reporte?')) {
      return;
    }

    try {
      // TODO: Replace with actual API call
      setReports(prev => prev.filter(r => r.id !== reportId));
      
      toast({
        title: "Éxito",
        description: "Reporte eliminado correctamente"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el reporte",
        variant: "destructive"
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-0">
        <div className="p-4">
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-medium mb-2">Acceso Denegado</h3>
            <p className="text-gray-500">
              No tienes permisos para acceder a esta sección.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-0">
        <div className="p-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00C73D]"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-0">
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1 tracking-tight text-[#00C73D]">
              Administrar Reportes Power BI
            </h1>
            <p className="text-muted-foreground">
              Gestiona reportes, roles y asignaciones
            </p>
          </div>
          
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-[#00C73D] hover:bg-[#00C73D]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Reporte
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report.id} className="border-l-4 border-l-[#00C73D]">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#00C73D]/10 rounded-lg">
                      <FileBarChart className="h-5 w-5 text-[#00C73D]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant={report.isActive ? "default" : "secondary"}>
                          {report.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {report.requiresRLS && (
                          <Badge variant="outline">RLS</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  {report.description || 'Sin descripción'}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    Roles: {report.roles?.length || 0}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Shield className="h-3 w-3 mr-1" />
                    Usuarios: {report.assignedUsers?.length || 0}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowEditDialog(true);
                    }}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowRolesDialog(true);
                    }}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Roles
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowAssignmentsDialog(true);
                    }}
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Usuarios
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteReport(report.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialogs */}
        <CreateReportDialog 
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onCreateReport={handleCreateReport}
        />
        
        {selectedReport && (
          <>
            <EditReportDialog 
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              report={selectedReport}
              onEditReport={handleEditReport}
            />
            
            <ManageReportRolesDialog 
              open={showRolesDialog}
              onOpenChange={setShowRolesDialog}
              report={selectedReport}
              onUpdateRoles={(roles) => {
                setReports(prev => prev.map(r => 
                  r.id === selectedReport.id 
                    ? { ...r, roles, updatedAt: new Date() }
                    : r
                ));
                setShowRolesDialog(false);
              }}
            />
            
            <ManageReportAssignmentsDialog 
              open={showAssignmentsDialog}
              onOpenChange={setShowAssignmentsDialog}
              report={selectedReport}
              onUpdateAssignments={(assignedUsers) => {
                setReports(prev => prev.map(r => 
                  r.id === selectedReport.id 
                    ? { ...r, assignedUsers, updatedAt: new Date() }
                    : r
                ));
                setShowAssignmentsDialog(false);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}