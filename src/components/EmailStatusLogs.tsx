
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Eye, CheckCircle, Paperclip, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmailLog, EmailLogDetail } from '@/types/email';
import { formatBogotaDateTime } from "@/utils/dateUtils";
import { EmailDetailDialog } from '@/components/EmailDetailDialog';

interface EmailStatusLogsProps {
  logs: EmailLog[];
  isLoading: boolean;
  onRefresh: (page?: number, pageSize?: number) => void;
  onFetchDetail: (logId: string) => Promise<EmailLogDetail | null>;
  onDownloadAttachment: (logId: string, fileName: string) => Promise<void>;
}

export function EmailStatusLogs({ logs, isLoading, onRefresh, onFetchDetail, onDownloadAttachment }: EmailStatusLogsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedEmailDetail, setSelectedEmailDetail] = useState<EmailLogDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const getStatusColor = (status: EmailLog['Status']) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    onRefresh(1, pageSize);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    onRefresh(newPage, pageSize);
  };

  const handleRowClick = async (log: EmailLog) => {
    setIsLoadingDetail(true);
    const detail = await onFetchDetail(log.Id);
    setIsLoadingDetail(false);
    if (detail) {
      setSelectedEmailDetail(detail);
    }
  };

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

            {/* Tabla de logs */}
            <div className="border rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Campaña</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Envío</TableHead>
                    <TableHead>Apertura</TableHead>
                    <TableHead>Adjuntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-5">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Cargando...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-5 text-muted-foreground">
                        No se encontraron registros de correos
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow 
                        key={log.Id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(log)}
                      >
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
                            {log.Status === 'SENT' ? 'Exitoso' : 'Fallido'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatBogotaDateTime(log.CreatedAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {log.OpenedAt ? (
                              <>
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">
                                  {formatBogotaDateTime(log.OpenedAt)}
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
                        <TableCell>
                          {log.hasAttachments && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Paperclip className="h-4 w-4" />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Página {currentPage}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={logs.length < pageSize || isLoading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EmailDetailDialog
        email={selectedEmailDetail}
        isOpen={!!selectedEmailDetail}
        onClose={() => setSelectedEmailDetail(null)}
        isLoading={isLoadingDetail}
        onDownloadAttachment={onDownloadAttachment}
      />
    </>
  );
}
