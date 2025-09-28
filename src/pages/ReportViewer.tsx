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
import { powerbiService } from '@/services/powerbiService';
import { EffectiveReport, ReportPage, EmbedInfo } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function ReportViewer() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [report, setReport] = useState<EffectiveReport | null>(null);
  const [pages, setPages] = useState<ReportPage[]>([]);
  const [activePage, setActivePage] = useState<string>('');
  const [embedInfo, setEmbedInfo] = useState<EmbedInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      // First check if user has access to this report
      const accessCheck = await powerbiService.checkReportAccess(reportId!);
      setHasAccess(accessCheck);

      if (!accessCheck) {
        toast({
          title: "Acceso denegado",
          description: "No tienes permisos para ver este reporte",
          variant: "destructive"
        });
        return;
      }

      // Get report details from user's effective reports
      const myReports = await powerbiService.getMyReports();
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

      // Get report pages
      const pagesData = await powerbiService.getReportPages(reportId!, reportDetails.workspaceId);
      setPages(pagesData);
      if (pagesData.length > 0) {
        setActivePage(pagesData[0].id);
      }

      // Try to get embed info
      const embedData = await powerbiService.getEmbedInfo(reportId!);
      setEmbedInfo(embedData);

      // Log audit event for viewing the report
      await logAuditEvent('view');

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

  // Log audit events
  const logAuditEvent = async (action: 'view' | 'refresh' | 'page_change' | 'fullscreen' | 'export', extra?: any) => {
    if (!report || !user) return;

    try {
      await powerbiService.logAudit({
        reportId: report.reportId,
        reportName: report.reportName,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        action,
        source: 'portal',
        extra: extra ? JSON.stringify(extra) : undefined
      });
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  // Handle page change
  const handlePageChange = async (pageId: string, pageName: string) => {
    setActivePage(pageId);
    setSidebarOpen(false);
    
    await logAuditEvent('page_change', { 
      previousPage: activePage, 
      newPage: pageId,
      pageName
    });
    
    toast({
      title: "Página cambiada",
      description: `Navegando a: ${pageName}`,
    });
  };

  // Handle refresh
  const handleRefresh = async () => {
    await logAuditEvent('refresh');
    
    toast({
      title: "Reporte actualizado",
      description: "Los datos del reporte han sido refrescados",
    });
  };

  // Handle fullscreen toggle
  const handleFullscreen = async () => {
    const newFullscreenState = !isFullscreen;
    setIsFullscreen(newFullscreenState);
    
    await logAuditEvent('fullscreen', { 
      action: newFullscreenState ? 'enter' : 'exit' 
    });

    if (newFullscreenState) {
      // Request fullscreen API if available
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
      // Exit fullscreen API if available
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
  };

  // Handle export
  const handleExport = async () => {
    await logAuditEvent('export', { 
      format: 'pdf',
      activePage 
    });
    
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
                {embedInfo && embedInfo.embedUrl ? (
                  // TODO: Replace with actual Power BI embedded component
                  <iframe
                    title={`${report.reportName} - ${pages.find(p => p.id === activePage)?.displayName || 'Vista Principal'}`}
                    width="100%"
                    height="100%"
                    src={`${embedInfo.embedUrl}&pageId=${activePage}&uid=${encodeURIComponent(user?.email || '')}`}
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="fullscreen"
                    className="rounded-lg"
                  />
                ) : report.webUrl ? (
                  // Placeholder with web URL option
                  <div className="w-full h-full bg-muted/20 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/20">
                    <div className="text-center">
                      <FileBarChart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium mb-2">Próximamente integración Embedded</h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        Por ahora, puedes abrir el reporte en una nueva pestaña. 
                        La integración de Power BI Embedded estará disponible pronto.
                      </p>
                      <Button
                        onClick={() => window.open(report.webUrl, '_blank')}
                        className="mb-4"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir en nueva pestaña (temporal)
                      </Button>
                      {activePage && (
                        <div className="text-sm text-muted-foreground">
                          Página activa: {pages.find(p => p.id === activePage)?.displayName}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground mt-4 space-y-1">
                        <p>Report ID: {report.reportId}</p>
                        <p>Workspace: {report.workspaceId}</p>
                        <p>Usuario: {user?.email}</p>
                      </div>
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