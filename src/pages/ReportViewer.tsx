import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  
  const [report, setReport] = useState<EffectiveReport | null>(null);
  const [reportDetail, setReportDetail] = useState<Report | null>(null);
  const [pages, setPages] = useState<ReportPage[]>([]);
  const [activePage, setActivePage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [idToken, setIdToken] = useState<string>('');
  
  // Diagnostic mode: skip RLS if ?no_rls=1
  const skipRls = searchParams.get('no_rls') === '1';

  // Power BI hook for embedding (only initialize when we have access and token)
  const powerBIHook = usePowerBIReport({
    reportId: reportDetail?.pbiReportId || '',
    workspaceId: reportDetail?.pbiWorkspaceId || '',
    internalReportId: reportId, // Use internal ID for audit logging
    datasetId: reportDetail?.datasetId,
    token: idToken,
    skipRls,
    onError: (error) => {
      console.error('Power BI Error:', error);
      toast({
        title: "Error en el reporte",
        description: error?.message || "Ha ocurrido un error al cargar el reporte Power BI",
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
      console.log('🔑 Token obtenido correctamente');

      // Check if user has access to this report using internal ID (using idToken for Reports APIs)
      const hasAccessResult = await checkEffectiveAccess(reportId!, tokenData.idToken);
      setHasAccess(hasAccessResult);
      console.log('✅ Verificación de acceso:', hasAccessResult);

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
      console.log('📄 Detalles del reporte (efectivo):', reportDetails);

      // Get full report details including Power BI IDs
      let fullReportDetail = await powerbiService.getReportById(reportId!, tokenData.idToken);
      console.log('📊 Detalle completo del reporte:', {
        internalId: fullReportDetail.id,
        workspaceId: fullReportDetail.workspaceId,
        pbiReportId: fullReportDetail.pbiReportId,
        pbiWorkspaceId: fullReportDetail.pbiWorkspaceId,
        datasetId: fullReportDetail.datasetId,
        webUrl: fullReportDetail.webUrl
      });

      // If pbiWorkspaceId is missing, try to get it from the workspace
      if (!fullReportDetail.pbiWorkspaceId && fullReportDetail.workspaceId) {
        console.log('⚠️ pbiWorkspaceId faltante, obteniendo desde workspace...');
        try {
          const workspace = await powerbiService.getWorkspaceById(
            fullReportDetail.workspaceId, 
            tokenData.idToken
          );
          console.log('📦 Workspace obtenido:', {
            id: workspace.id,
            name: workspace.name,
            pbiWorkspaceId: workspace.pbiWorkspaceId
          });

          if (workspace.pbiWorkspaceId) {
            // Update the report detail with the resolved pbiWorkspaceId
            fullReportDetail = {
              ...fullReportDetail,
              pbiWorkspaceId: workspace.pbiWorkspaceId
            };
            console.log('✅ pbiWorkspaceId resuelto desde workspace:', workspace.pbiWorkspaceId);
          }
        } catch (error) {
          console.error('❌ Error obteniendo workspace:', error);
        }
      }

      setReportDetail(fullReportDetail);

      // Validate Power BI configuration
      if (!fullReportDetail.pbiReportId || !fullReportDetail.pbiWorkspaceId) {
        console.warn('⚠️ Faltan IDs de Power BI después de resolución:', {
          pbiReportId: fullReportDetail.pbiReportId || 'FALTA',
          pbiWorkspaceId: fullReportDetail.pbiWorkspaceId || 'FALTA'
        });
        return; // Will show "Configuración Pendiente" screen
      }

      // Get report pages using Power BI IDs
      console.log('📑 Obteniendo páginas del reporte...');
      const pagesData = await powerbiService.getReportPages(
        fullReportDetail.pbiReportId, 
        fullReportDetail.pbiWorkspaceId, 
        tokenData.idToken
      );
      setPages(pagesData);
      console.log('📑 Páginas obtenidas:', pagesData.length);
      
      if (pagesData.length > 0) {
        setActivePage(pagesData[0].id);
      }

    } catch (error) {
      console.error('❌ Error fetching report data:', error);
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
    
    // Change page in Power BI embedded report
    if (shouldUsePowerBI && powerBIHook.report) {
      await powerBIHook.changePage(pageId);
    }
    
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
              {skipRls && (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Diagnóstico: Sin RLS
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
                      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg border-2 border-dashed border-destructive/20 p-6">
                        <div className="text-center max-w-2xl">
                          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
                          <h3 className="text-lg font-semibold mb-2">No fue posible cargar el modelo del informe</h3>
                          
                          {/* Error message */}
                          <p className="text-sm text-muted-foreground mb-3">
                            {powerBIHook.error?.detailedMessage || powerBIHook.error?.message || 'Ha ocurrido un error inesperado'}
                          </p>
                          
                          {/* Technical details card */}
                          <div className="bg-muted/50 rounded-lg p-4 mb-4 text-left">
                            <p className="text-xs font-semibold mb-2 text-muted-foreground">Detalles técnicos:</p>
                            <div className="space-y-1 text-xs font-mono">
                              {powerBIHook.error?.requestId && (
                                <p><span className="text-muted-foreground">Request ID:</span> {powerBIHook.error.requestId}</p>
                              )}
                              {powerBIHook.error?.errorCode && (
                                <p><span className="text-muted-foreground">Error Code:</span> {powerBIHook.error.errorCode}</p>
                              )}
                              <p><span className="text-muted-foreground">Modo:</span> {powerBIHook.error?.diagnosticMode || 'Desconocido'}</p>
                              {powerBIHook.error?.timestamp && (
                                <p><span className="text-muted-foreground">Timestamp:</span> {powerBIHook.error.timestamp}</p>
                              )}
                            </div>
                          </div>
                          
                          {/* Diagnostic tip */}
                          {!skipRls && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4">
                              <p className="text-xs text-amber-700 dark:text-amber-400">
                                💡 <strong>Diagnóstico:</strong> Intenta agregar <code className="bg-amber-500/20 px-1 rounded">?no_rls=1</code> a la URL para probar sin RLS
                              </p>
                            </div>
                          )}
                          
                          <Button onClick={powerBIHook.reinitialize} variant="outline" size="sm">
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
                ) : (
                  // Missing Power BI configuration
                  <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center max-w-md">
                      <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Configuración Pendiente</h3>
                      <p className="text-muted-foreground mb-4">
                        Este reporte no tiene configurados los identificadores de Power BI necesarios para mostrarlo.
                      </p>
                      
                      <div className="text-left bg-muted/50 rounded-lg p-4 mb-4">
                        <p className="text-sm font-medium mb-2">Campos requeridos:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li className="flex items-center">
                            {reportDetail?.pbiReportId ? '✅' : '❌'} ID del Reporte Power BI (pbiReportId)
                          </li>
                          <li className="flex items-center">
                            {reportDetail?.pbiWorkspaceId ? '✅' : '❌'} ID del Workspace Power BI (pbiWorkspaceId)
                          </li>
                          <li className="flex items-center text-muted-foreground/70">
                            ℹ️ URL Web (opcional, solo para botón "Abrir en Power BI")
                          </li>
                        </ul>
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Contacta al administrador para completar la configuración en el módulo de administración de reportes.
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