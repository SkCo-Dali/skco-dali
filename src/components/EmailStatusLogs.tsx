
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, RefreshCw, Eye, CheckCircle } from 'lucide-react';
import { EmailLog } from '@/types/email';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EmailDetailDialog } from '@/components/EmailDetailDialog';

interface EmailStatusLogsProps {
  logs: EmailLog[];
  isLoading: boolean;
  onRefresh: (campaign?: string, status?: string, createdAt?: string) => void;
}

export function EmailStatusLogs({ logs, isLoading, onRefresh }: EmailStatusLogsProps) {
  const [campaignFilter, setCampaignFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<EmailLog | null>(null);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.ToEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.Subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: EmailLog['Status']) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    onRefresh(
      campaignFilter || undefined,
      statusFilter || undefined,
      dateFilter || undefined
    );
  };

  useEffect(() => {
    // Auto-refresh cuando cambian los filtros
    const timeoutId = setTimeout(() => {
      handleRefresh();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [campaignFilter, statusFilter, dateFilter]);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Historial de Correos Enviados
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por email o asunto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Input
                type="text"
                placeholder="Filtrar por campaña"
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
              />
              
              <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Success">Exitoso</SelectItem>
                  <SelectItem value="Failed">Fallido</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            {/* Tabla de logs */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Envío</TableHead>
                    <TableHead>Apertura</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Cargando...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron registros de correos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow 
                        key={log.Id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEmail(log)}
                      >
                        <TableCell className="font-medium">{log.ToEmail}</TableCell>
                        <TableCell className="max-w-xs truncate" title={log.Subject}>
                          {log.Subject}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.Campaign || 'Sin campaña'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.Status)} variant="secondary">
                            {log.Status === 'Success' ? 'Exitoso' : 'Fallido'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.CreatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.OpenedAt ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">
                                  {format(new Date(log.OpenedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                No abierto
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {log.ErrorMessage && (
                            <span className="text-red-600 text-sm truncate block" title={log.ErrorMessage}>
                              {log.ErrorMessage}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <EmailDetailDialog
        email={selectedEmail}
        isOpen={!!selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </>
  );
}
