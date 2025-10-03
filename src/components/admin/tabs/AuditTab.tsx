import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Search, Clock, User, FileBarChart, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { powerbiService } from '@/services/powerbiService';
import { AuditEvent, Report } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/contexts/AuthContext';

export function AuditTab() {
  const { getAccessToken } = useAuth();
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAuditEvents();
  }, [searchTerm, selectedReport, selectedAction, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const tokenData = await getAccessToken();
      const [reportsData] = await Promise.all([
        powerbiService.getReports({}, tokenData.idToken)
      ]);
      
      setReports(reportsData.filter(r => r.isActive));
      await fetchAuditEvents();
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditEvents = async () => {
    try {
      const tokenData = await getAccessToken();
      const filter = {
        reportId: selectedReport === 'all' ? undefined : selectedReport,
        action: selectedAction === 'all' ? undefined : selectedAction,
        search: searchTerm || undefined,
        from: dateRange?.from?.toISOString(),
        to: dateRange?.to?.toISOString()
      };

      const events = await powerbiService.getAuditEvents(filter, tokenData.idToken);
      setAuditEvents(events);
    } catch (error) {
      console.error('Error fetching audit events:', error);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      
      // Create CSV content
      const headers = [
        'Fecha',
        'Usuario',
        'Email',
        'Reporte',
        'Acción',
        'Duración (seg)',
        'Detalles'
      ];
      
      const csvContent = [
        headers.join(','),
        ...auditEvents.map(event => [
          new Date(event.timestamp).toLocaleString(),
          event.userName || '',
          event.userEmail || '',
          event.reportName || '',
          event.action,
          event.durationSec?.toString() || '',
          event.extra ? `"${event.extra.replace(/"/g, '""')}"` : ''
        ].join(','))
      ].join('\n');
      
      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `auditoria_reportes_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      toast({
        title: "Éxito",
        description: "Archivo CSV exportado correctamente"
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Error",
        description: "No se pudo exportar el archivo",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'view':
        return 'default';
      case 'refresh':
        return 'secondary';
      case 'page_change':
        return 'outline';
      case 'fullscreen':
        return 'secondary';
      case 'export':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view':
        return <FileBarChart className="h-3 w-3" />;
      case 'refresh':
        return <Activity className="h-3 w-3" />;
      case 'page_change':
        return <Calendar className="h-3 w-3" />;
      case 'fullscreen':
        return <Activity className="h-3 w-3" />;
      case 'export':
        return <Download className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      view: 'Visualización',
      refresh: 'Actualización',
      page_change: 'Cambio de página',
      fullscreen: 'Pantalla completa',
      export: 'Exportación'
    };
    return labels[action] || action;
  };

  const getReportName = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    return report ? report.name : 'Reporte no encontrado';
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
          <h2 className="text-2xl font-semibold">Auditoría de Reportes</h2>
          <p className="text-muted-foreground">
            Monitorea el uso y actividad de los reportes de Power BI
          </p>
        </div>
        
        <Button onClick={handleExportCSV} disabled={exporting || auditEvents.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exportando...' : 'Exportar CSV'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Usuario, email, reporte..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Report Filter */}
            <div className="space-y-2">
              <Label>Reporte</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los reportes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los reportes</SelectItem>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <Label>Acción</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las acciones</SelectItem>
                  <SelectItem value="view">Visualización</SelectItem>
                  <SelectItem value="refresh">Actualización</SelectItem>
                  <SelectItem value="page_change">Cambio de página</SelectItem>
                  <SelectItem value="fullscreen">Pantalla completa</SelectItem>
                  <SelectItem value="export">Exportación</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Rango de fechas</Label>
              <DatePickerWithRange
                date={dateRange}
                onDateChange={setDateRange}
                placeholder="Seleccionar fechas"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Eventos de Auditoría</span>
            </div>
            <Badge variant="outline">
              {auditEvents.length} evento(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {auditEvents.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No hay eventos disponibles</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedReport !== 'all' || selectedAction !== 'all' || dateRange
                  ? 'No hay eventos que coincidan con los filtros aplicados'
                  : 'No se han registrado eventos de auditoría aún'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-lg mt-1">
                        {getActionIcon(event.action)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getActionBadgeVariant(event.action)}>
                            {getActionLabel(event.action)}
                          </Badge>
                          <span className="text-sm font-medium">
                            {event.reportName}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>{event.userName}</span>
                          </div>
                          <span>{event.userEmail}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          {event.durationSec && (
                            <span>{event.durationSec}s</span>
                          )}
                        </div>
                        
                        {event.extra && (
                          <div className="mt-2">
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Ver detalles
                              </summary>
                              <div className="mt-2 p-2 bg-muted rounded text-muted-foreground font-mono">
                                {event.extra}
                              </div>
                            </details>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}