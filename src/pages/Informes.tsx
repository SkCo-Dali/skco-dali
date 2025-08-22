
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileBarChart, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { InformesSearch } from '@/components/InformesSearch';
import { InformesViewControls } from '@/components/InformesViewControls';
import { InformesTable } from '@/components/InformesTable';

interface PowerBIReport {
  id: string;
  name: string;
  description?: string;
  embedUrl: string;
  reportId: string;
  workspaceId?: string;
  isAssigned: boolean;
  requiresRLS: boolean;
  roles?: string[];
}

export default function Informes() {
  const { user } = useAuth();
  const [reports, setReports] = useState<PowerBIReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<PowerBIReport | null>(null);
  const [embedToken, setEmbedToken] = useState<string | null>(null);
  const [loadingEmbed, setLoadingEmbed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  /**
   * CONFIGURACIÓN DE REPORTES POWER BI
   * ===================================
   * 
   * Para agregar un nuevo reporte, simplemente añade un objeto al array con:
   * 
   * - id: Identificador único del reporte
   * - name: Nombre descriptivo que verá el usuario
   * - description: Descripción del reporte (opcional)
   * - embedUrl: URL completa de embed de Power BI (obtén esto de tu workspace de Power BI)
   * - reportId: ID del reporte de Power BI
   * - workspaceId: ID del workspace donde está el reporte (opcional)
   * - isAssigned: true/false - si está asignado a usuarios
   * - requiresRLS: true/false - si requiere Row Level Security
   * - roles: Array de roles que pueden acceder al reporte
   * 
   * IMPORTANTE: El usuario autenticado se pasa automáticamente como parámetro UID
   * para que Power BI aplique las reglas de Row Level Security correspondientes.
   */
  const fetchReportsFromAPI = async (): Promise<PowerBIReport[]> => {
    try {
      // TODO: Replace with actual API call to get reports from admin system
      // const response = await fetch('/api/powerbi/user-reports', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
      // return await response.json();
      
      // Mock data that would come from the admin system
      return [
        {
          id: '1',
          name: 'Estado Pólizas',
          description: 'Reporte de estado de pólizas asignadas',
          embedUrl: '', // Configured by admin
          reportId: '', // Configured by admin
          workspaceId: '', // Configured by admin
          isAssigned: true,
          requiresRLS: true,
          roles: ['PolicyViewer']
        },
        {
          id: '2', 
          name: 'CRM DALI',
          description: 'Dashboard principal del CRM',
          embedUrl: 'https://app.powerbi.com/reportEmbed?reportId=0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9&groupId=9988790d-a5c3-459b-97cb-ee8103957bbc',
          reportId: '0c9aca2e-0a09-49cf-9e06-fbfe7fb62cf9',
          workspaceId: '9988790d-a5c3-459b-97cb-ee8103957bbc',
          isAssigned: true,
          requiresRLS: true,
          roles: ['CRMUser']
        },
        {
          id: '3',
          name: 'Transacciones Por Portafolios',
          description: 'Análisis de transacciones por portafolios',
          embedUrl: '', // Configured by admin
          reportId: '', // Configured by admin  
          workspaceId: '', // Configured by admin
          isAssigned: true,
          requiresRLS: true,
          roles: ['PortfolioAnalyst']
        },
        {
          id: '4',
          name: 'Consulta Clientes Ley 2300',
          description: 'Consulta especializada Ley 2300',
          embedUrl: '', // Configured by admin
          reportId: '', // Configured by admin
          workspaceId: '', // Configured by admin
          isAssigned: false,
          requiresRLS: true,
          roles: ['LegalConsultant']
        }
      ];
    } catch (error) {
      console.error('Error fetching reports:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchUserReports();
  }, [user]);

  const fetchUserReports = async () => {
    try {
      setLoading(true);
      
      // Get reports from admin-configured system
      const allReports = await fetchReportsFromAPI();
      
      // Filter reports based on user assignment and roles
      const assignedReports = allReports.filter(report => {
        // Check if report is active and assigned to user
        if (!report.isAssigned) return false;
        
        // TODO: Check if user is specifically assigned to this report
        // This would come from the admin assignment system
        // const userAssignments = await checkUserReportAssignments(user?.email, report.id);
        // if (!userAssignments.isAssigned) return false;
        
        // If RLS is required, check user roles (placeholder logic)
        if (report.requiresRLS && report.roles) {
          // TODO: Replace with actual user role check
          // return user?.roles?.some(role => report.roles?.includes(role));
          return true; // For now, allow all assigned reports
        }
        
        return true;
      });
      
      setReports(assignedReports);
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los informes disponibles",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportSelect = async (report: PowerBIReport) => {
    try {
      setLoadingEmbed(true);
      setSelectedReport(report);
      
      // TODO: Get embed token for the specific report with RLS
      // const tokenResponse = await fetch('/api/powerbi/embed-token', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     reportId: report.id,
      //     userId: user?.email,
      //     roles: user?.powerBIRoles || []
      //   })
      // });
      // const tokenData = await tokenResponse.json();
      // setEmbedToken(tokenData.token);
      
      // Mock embed token for now
      setEmbedToken('mock-embed-token');
      
    } catch (error) {
      console.error('Error getting embed token:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el informe seleccionado",
        variant: "destructive"
      });
    } finally {
      setLoadingEmbed(false);
    }
  };

  const handleBackToList = () => {
    setSelectedReport(null);
    setEmbedToken(null);
  };

  // Filter reports based on search term
  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-16">
        <div className="p-4">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#00c73d]" />
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
            <h1 className="text-3xl font-bold mb-1 tracking-tight text-[#00c73d]">
              Informes Power BI
            </h1>
            <p className="text-muted-foreground">
              Accede a los informes asignados a tu perfil
              {user?.role === 'admin' && (
                <> • <a href="/admin/reports" className="text-[#00c73d] hover:underline">Administrar reportes</a></>
              )}
            </p>
          </div>
          
          {selectedReport && (
            <Button 
              onClick={handleBackToList}
              variant="outline"
              className="text-[#00c73d] border-[#00c73d] hover:bg-[#00c73d] hover:text-white"
            >
              Volver a la lista
            </Button>
          )}
        </div>

        {!selectedReport ? (
          <>
            {/* Search and view controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <InformesSearch 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
              
              <InformesViewControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            {/* Reports list view */}
            {viewMode === "table" ? (
              <InformesTable 
                reports={filteredReports}
                onReportSelect={handleReportSelect}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredReports.length === 0 ? (
                  <div className="col-span-full">
                    <Card className="p-8 text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-medium mb-2">
                        {searchTerm ? 'No se encontraron informes' : 'No hay informes disponibles'}
                      </h3>
                      <p className="text-gray-500">
                        {searchTerm 
                          ? `No hay informes que coincidan con "${searchTerm}"`
                          : 'No tienes informes asignados en este momento. Contacta al administrador para solicitar acceso.'
                        }
                      </p>
                    </Card>
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <Card 
                      key={report.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-[#00c73d]"
                      onClick={() => handleReportSelect(report)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-[#00c73d]/10 rounded-lg">
                            <FileBarChart className="h-6 w-6 text-[#00c73d]" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{report.name}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">
                          {report.description || 'Informe de Power BI'}
                        </p>
                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Asignado
                          </span>
                          <Button 
                            size="sm" 
                            className="bg-[#00c73d] hover:bg-[#00c73d]/90"
                          >
                            Ver Informe
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          // Report embed view
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileBarChart className="h-5 w-5 text-[#00c73d]" />
                <span>{selectedReport.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEmbed ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#00c73d]" />
                  <span className="ml-2">Cargando informe...</span>
                </div>
              ) : (
                <div className="w-full" style={{ height: '600px' }}>
                  {selectedReport.embedUrl ? (
                    <iframe
                      title={`Power BI Report - ${selectedReport.name}`}
                      width="100%"
                      height="100%"
                      src={`${selectedReport.embedUrl}&autoAuth=true&filterPaneEnabled=true&navContentPaneEnabled=true&uid=${encodeURIComponent(user?.email || '')}`}
                      frameBorder="0"
                      allowFullScreen={true}
                      allow="fullscreen"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <FileBarChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">Configuración Pendiente</h3>
                        <p className="text-gray-500 mb-4">
                          La URL de embed para este informe no ha sido configurada.
                        </p>
                        <p className="text-sm text-gray-400">
                          Report ID: {selectedReport.reportId || 'No configurado'}
                        </p>
                        <p className="text-sm text-gray-400">
                          Workspace ID: {selectedReport.workspaceId || 'No configurado'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
