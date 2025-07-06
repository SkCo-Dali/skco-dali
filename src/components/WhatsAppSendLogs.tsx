
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, RefreshCw, MessageSquare } from 'lucide-react';
import { WhatsAppSendLog } from '@/types/whatsapp';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface WhatsAppSendLogsProps {
  logs: WhatsAppSendLog[];
  isLoading?: boolean;
  onRefresh: () => void;
}

export function WhatsAppSendLogs({
  logs,
  isLoading = false,
  onRefresh
}: WhatsAppSendLogsProps) {
  const getStatusBadge = (status: WhatsAppSendLog['status']) => {
    const variants = {
      sent: { variant: 'default' as const, text: 'Enviado', color: 'bg-green-500' },
      delivered: { variant: 'secondary' as const, text: 'Entregado', color: 'bg-blue-500' },
      read: { variant: 'secondary' as const, text: 'Leído', color: 'bg-purple-500' },
      failed: { variant: 'destructive' as const, text: 'Fallido', color: 'bg-red-500' },
      pending: { variant: 'outline' as const, text: 'Pendiente', color: 'bg-yellow-500' }
    };

    const config = variants[status];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.text}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Historial de Envíos
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && logs.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00c83c]"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay envíos registrados</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Fecha y Hora</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {log.recipientNumber}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={log.message}>
                        {log.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.sentAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                      {log.error && (
                        <div className="text-xs text-red-500 mt-1" title={log.error}>
                          {log.error}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
