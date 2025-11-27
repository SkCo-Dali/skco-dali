import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mail, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Download,
  X,
  Pause,
  Play
} from 'lucide-react';
import { formatBogotaDateTime } from '@/utils/dateUtils';

export interface EmailSendEvent {
  id: string;
  leadId: string;
  leadName: string;
  email: string;
  status: 'pending' | 'sending' | 'success' | 'failed';
  error?: string;
  timestamp: string;
}

export interface EmailSendProgress {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  isPaused: boolean;
  isCompleted: boolean;
  eta?: number;
}

interface EmailSendProgressModalProps {
  isOpen: boolean;
  progress: EmailSendProgress;
  events: EmailSendEvent[];
  onPauseResume: () => void;
  onCancel: () => void;
  onClose: () => void;
  onDownloadReport: () => void;
}

export function EmailSendProgressModal({
  isOpen,
  progress,
  events,
  onPauseResume,
  onCancel,
  onClose,
  onDownloadReport
}: EmailSendProgressModalProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    if (!progress.isCompleted && !progress.isPaused && isOpen) {
      const interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [progress.isCompleted, progress.isPaused, isOpen]);

  const progressPercent = progress.total > 0 
    ? ((progress.sent + progress.failed) / progress.total) * 100 
    : 0;

  const isCompleted = progress.isCompleted;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: EmailSendEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'sending':
        return <Mail className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: EmailSendEvent['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'sending':
        return <Badge className="bg-blue-100 text-blue-800">Enviando...</Badge>;
      default:
        return <Badge variant="secondary">Pendiente</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isCompleted ? onClose : undefined}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envío de Correos en Progreso
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Card */}
          <div className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Progreso General</div>
                <div className="text-2xl font-bold">
                  {progress.sent + progress.failed} / {progress.total}
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="text-sm text-muted-foreground">Tiempo transcurrido</div>
                <div className="text-xl font-semibold">{formatTime(timeElapsed)}</div>
              </div>
            </div>

            <Progress value={progressPercent} className="h-2" />

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{progress.sent}</div>
                <div className="text-xs text-muted-foreground">Enviados</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{progress.failed}</div>
                <div className="text-xs text-muted-foreground">Fallidos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{progress.pending}</div>
                <div className="text-xs text-muted-foreground">Pendientes</div>
              </div>
            </div>

            {progress.eta && progress.eta > 0 && !progress.isPaused && (
              <div className="text-sm text-center text-muted-foreground pt-2 border-t">
                Tiempo estimado restante: {formatTime(progress.eta)}
              </div>
            )}
          </div>

          {/* Events List */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Eventos recientes</div>
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="space-y-3">
                {events.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Iniciando envío...
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 bg-background rounded-lg border"
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 overflow-hidden">
                          <div className="font-medium truncate min-w-0">{event.leadName}</div>
                          <div className="flex-shrink-0">{getStatusBadge(event.status)}</div>
                        </div>
                        <div className="text-sm text-muted-foreground truncate overflow-hidden">
                          {event.email}
                        </div>
                        {event.error && (
                          <div className="text-xs text-red-600 mt-1 break-words">
                            Error: {event.error}
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatBogotaDateTime(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            {!isCompleted ? (
              <>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Envío
                </Button>
                <Button
                  variant="outline"
                  onClick={onPauseResume}
                >
                  {progress.isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Reanudar
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="flex-1 flex justify-end">
                <Button onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
