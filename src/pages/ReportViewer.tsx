import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  FileBarChart,
  ExternalLink,
  RefreshCw,
  Maximize,
  Download,
  Loader2,
  AlertCircle,
  Shield,
  Eye,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { checkEffectiveAccess } from '@/services/powerbiApiService';
import { usePowerBIReport } from '@/hooks/usePowerBIReport';
import { powerbiService } from '@/services/powerbiService';
import { EffectiveReport, ReportPage, Report } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ReportViewer() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user, getAccessToken } = useAuth();
  
  const [report, setReport] = useState<EffectiveReport | null>(null);
  const [reportDetail, setReportDetail] = useState<Report | null>(null);
  const [pages, setPages] = useState<ReportPage[]>([]);
  const [activePage, setActivePage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [idToken, setIdToken] = useState<string>('');

  // Power BI hook for embedding (only initialize when we have access and token)
  const powerBIHook = usePowerBIReport({
    reportId: reportDetail?.pbiReportId || '',
    workspaceId: reportDetail?.pbiWorkspaceId || '',
    internalReportId: reportId, // Use internal ID for audit logging
    token: idToken,
    onError: (error) => {
      console.error('Power BI Error:', error);
      toast({
        title: "Error en el reporte",
        description: "Ha ocurrido un error al cargar el reporte Power BI",
        variant: "destructive"
      });
    }
  });

  // Only use Power BI hook if we have access and all required data
  const shouldUsePowerBI = hasAccess && idToken && reportDetail?.pbiReportId && reportDetail?.pbiWorkspaceId;

  // Fetch report data and validate access
  useEffect(() => {
    if (!reportId) {
      navigate('/informes');
      return;
    }
    
    fetchReportData();
  }, [reportId]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Get access token first
      const tokenData = await getAccessToken();
      if (!tokenData?.idToken) {
        toast({
          title: "Error de autenticación",
          description: "No se pudo obtener el token de acceso",
          variant: "destructive"
        });
        navigate('/informes');
        return;
      }

      setIdToken(tokenData.idToken);

      // Check if user has access to this report using internal ID (using idToken for Reports APIs)
      const hasAccessResult = await checkEffectiveAccess(reportId!, tokenData.idToken);
      setHasAccess(hasAccessResult);

      if (!hasAccessResult) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para ver este reporte",
          variant: "destructive"
        });
        return;
      }

      // Get report details from API - this gives us both internal and Power BI IDs
      const myReports = await powerbiService.getMyReports({}, tokenData.idToken);
      const reportDetails = myReports.find(r => r.reportId === reportId);
      
      if (!reportDetails) {
        toast({
          title: "Reporte no encontrado",
          description: "El reporte solicitado no existe o no tienes acceso",
          variant: "destructive"
        });
        navigate('/informes');
        return;
      }

      setReport(reportDetails);

      // Get full report details including Power BI IDs
      const fullReportDetail = await powerbiService.getReportById(reportId!, tokenData.idToken);
      setReportDetail(fullReportDetail);

      // Get report pages using Power BI IDs
      if (fullReportDetail.pbiReportId && fullReportDetail.pbiWorkspaceId) {
        const pagesData = await powerbiService.getReportPages(
          fullReportDetail.pbiReportId, 
          fullReportDetail.pbiWorkspaceId, 
          tokenData.idToken
        );
        setPages(pagesData);
        if (pagesData.length > 0) {
          setActivePage(pagesData[0].id);
        }
      }

    } catch (error) {
      console.error('Error fetching report data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el reporte",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = async (pageId: string, pageName: string) => {
    setActivePage(pageId);
    setSidebarOpen(false);
    
    toast({
      title: "Página cambiada",
      description: `Navegando a: ${pageName}`,
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (shouldUsePowerBI) {
      await powerBIHook.refreshReport();
    }
    
    toast({
      title: "Reporte actualizado",
      description: "Los datos del reporte han sido refrescados",
    });
  };

  // Handle fullscreen toggle
  const handleFullscreen = async () => {
    if (shouldUsePowerBI) {
      await powerBIHook.toggleFullscreen();
    } else {
      // Fallback for non-Power BI reports
      const newFullscreenState = !isFullscreen;
      setIsFullscreen(newFullscreenState);

      if (newFullscreenState) {
        if (document.documentElement.requestFullscreen) {
          try {
            await document.documentElement.requestFullscreen();
          } catch (error) {
            console.log('Fullscreen API not available or denied');
          }
        }
        
        toast({
          title: "Pantalla completa activada",
          description: "Presiona ESC para salir",
        });
      } else {
        if (document.exitFullscreen) {
          try {
            await document.exitFullscreen();
          } catch (error) {
            console.log('Exit fullscreen API not available');
          }
        }
        
        toast({
          title: "Pantalla completa desactivada",
        });
      }
    }
  };

  // Handle export
  const handleExport = async () => {
    if (shouldUsePowerBI) {
      await powerBIHook.exportReport();
    }
    
    toast({
      title: "Exportación iniciada",
      description: "El reporte se está preparando para descarga",
    });
  };

  // Handle ESC key for fullscreen exit
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        handleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando reporte...</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (hasAccess === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground mb-4">
            No tienes permisos para ver este reporte.
          </p>
          <Button onClick={() => navigate('/informes')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Informes
          </Button>
        </Card>
      </div>
    );
  }

  // Report not found state
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Reporte no encontrado</h3>
          <p className="text-muted-foreground mb-4">
            El reporte solicitado no existe o no tienes acceso.
          </p>
          <Button onClick={() => navigate('/informes')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Informes
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : 'pt-0'}`}>
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!isFullscreen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/informes')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Informes
                </Button>
              )}
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileBarChart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{report.reportName}</h1>
                  <p className="text-sm text-muted-foreground">
                    {report.workspaceName} • {report.areaName}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Status badges */}
              <Badge variant="default">
                <Eye className="h-3 w-3 mr-1" />
                Activo
              </Badge>
              {report.hasRowLevelSecurity && (
                <Badge variant="outline">
                  <Shield className="h-3 w-3 mr-1" />
                  RLS
                </Badge>
              )}

              {/* Action buttons */}
              <Button size="sm" variant="outline" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              
              <Button size="sm" variant="outline" onClick={handleFullscreen}>
                <Maximize className="h-4 w-4 mr-2" />
                {isFullscreen ? 'Salir' : 'Pantalla completa'}
              </Button>
              
              <Button size="sm" variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>

              {report.webUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(report.webUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en Power BI
                </Button>
              )}

              {/* Mobile pages menu */}
              {pages.length > 0 && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline" className="md:hidden">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="py-4">
                      <h3 className="font-semibold mb-4">Páginas del Reporte</h3>
                      <div className="space-y-2">
                        {pages.map((page) => (
                          <Button
                            key={page.id}
                            variant={activePage === page.id ? 'default' : 'ghost'}
                            className="w-full justify-start"
                            onClick={() => handlePageChange(page.id, page.displayName)}
                          >
                            {page.displayName}
                            {activePage === page.id && (
                              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                            )}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar for pages (desktop) */}
        {pages.length > 0 && !isFullscreen && (
          <div className="hidden md:block w-64 border-r bg-muted/20">
            <div className="p-4">
              <h3 className="font-semibold mb-4">Páginas del Reporte</h3>
              <div className="space-y-2">
                {pages.map((page) => (
                  <Button
                    key={page.id}
                    variant={activePage === page.id ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => handlePageChange(page.id, page.displayName)}
                  >
                    {page.displayName}
                    {activePage === page.id && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main content area */}
        <div className="flex-1 p-4">
          <Card className="w-full h-full">
            <CardContent className="p-0 h-full">
              <div className="w-full h-full">
                {shouldUsePowerBI ? (
                  // Real Power BI embedded report
                  <div className="w-full h-full">
                    {powerBIHook.status === 'loading' && (
                      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                          <p className="text-muted-foreground">Cargando reporte Power BI...</p>
                        </div>
                      </div>
                    )}
                    
                    {powerBIHook.status === 'error' && (
                      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-destructive/20">
                        <div className="text-center">
                          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                          <h3 className="text-lg font-medium mb-2">Error al cargar el reporte</h3>
                          <p className="text-muted-foreground mb-4">
                            {powerBIHook.error?.message || 'Ha ocurrido un error inesperado'}
                          </p>
                          <Button onClick={powerBIHook.reinitialize} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reintentar
                          </Button>
                        </div>
                      </div>
                    )}

                    {powerBIHook.status === 'expired' && (
                      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-muted-foreground/20">
                        <div className="text-center">
                          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">Sesión expirada</h3>
                          <p className="text-muted-foreground mb-4">
                            La sesión de Power BI ha expirado. Recarga la página para continuar.
                          </p>
                          <Button onClick={() => window.location.reload()} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Recargar página
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Power BI Container */}
                    <div 
                      ref={powerBIHook.containerRef} 
                      className="w-full h-full rounded-lg overflow-hidden"
                      style={{ 
                        minHeight: '600px',
                        display: powerBIHook.status === 'ready' ? 'block' : 'none'
                      }}
                    />
                  </div>
                ) : report?.webUrl ? (
                  // Placeholder with web URL option (fallback)
                  <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <FileBarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Configurando conexión</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        Estableciendo conexión con Power BI. Si el problema persiste, 
                        puedes abrir el reporte en una nueva pestaña.
                      </p>
                      <Button
                        onClick={() => window.open(report.webUrl, '_blank')}
                        className="mb-4"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir en nueva pestaña
                      </Button>
                      {activePage && (
                        <div className="text-sm text-muted-foreground">
                          Página activa: {pages.find(p => p.id === activePage)?.displayName}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // No URL available
                  <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Configuración Pendiente</h3>
                      <p className="text-muted-foreground mb-4">
                        La URL de este informe no ha sido configurada.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Contacta al administrador para completar la configuración.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}