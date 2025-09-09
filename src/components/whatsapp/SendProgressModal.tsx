import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pause, 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  MessageSquare
} from 'lucide-react';
import { SendProgress, SendEvent } from '@/types/whatsapp-propio';

interface SendProgressModalProps {
  isOpen: boolean;
  progress: SendProgress;
  events: SendEvent[];
  onPauseResume: () => void;
  onCancel: () => void;
  onClose: () => void;
  onDownloadReport: () => void;
}

export function SendProgressModal({ 
  isOpen, 
  progress, 
  events,
  onPauseResume,
  onCancel,
  onClose,
  onDownloadReport
}: SendProgressModalProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (progress.isActive && !progress.isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [progress.isActive, progress.isPaused]);

  const progressPercent = progress.total > 0 ? 
    ((progress.sent + progress.failed) / progress.total) * 100 : 0;

  const isCompleted = !progress.isActive && (progress.sent + progress.failed) === progress.total;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string, ticks?: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
            Enviado {ticks && `${ticks}`}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="text-xs">
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Pendiente
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isCompleted ? onClose : undefined}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#25D366]" />
            {isCompleted ? 'Envío Completado' : 'Enviando Mensajes de WhatsApp'}
          </DialogTitle>
          <DialogDescription>
            {isCompleted ? 
              'El proceso de envío ha terminado' :
              'Enviando mensajes a través de WhatsApp Web'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Barra de progreso */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Progreso del Envío
                {!isCompleted && (
                  <div className="text-sm text-muted-foreground">
                    Tiempo: {formatTime(timeElapsed)}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={progressPercent} className="w-full" />
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {progress.total}
                  </div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {progress.sent}
                  </div>
                  <div className="text-sm text-muted-foreground">Enviados</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {progress.failed}
                  </div>
                  <div className="text-sm text-muted-foreground">Fallidos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {progress.pending}
                  </div>
                  <div className="text-sm text-muted-foreground">Pendientes</div>
                </div>
              </div>

              {progress.eta && (
                <div className="text-center text-sm text-muted-foreground">
                  Tiempo estimado restante: {progress.eta}
                </div>
              )}

              {progress.isPaused && (
                <div className="text-center">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Pausado
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de eventos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full">
                <div className="space-y-2">
                  {events.slice(-20).reverse().map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(event.status)}
                        <div>
                          <p className="font-medium text-sm">
                            {event.leadName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {event.phoneNumber}
                          </p>
                          {event.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {event.error}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(event.status, event.ticks)}
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {events.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Esperando eventos de envío...
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Controles */}
        <div className="flex justify-between pt-4 border-t">
          {isCompleted ? (
            <div className="flex gap-2 w-full">
              <Button
                onClick={onDownloadReport}
                variant="outline"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Descargar Reporte
              </Button>
              <Button
                onClick={onClose}
                className="flex-1"
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={onCancel}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Square className="h-4 w-4 mr-2" />
                Cancelar Envío
              </Button>
              
              <Button
                onClick={onPauseResume}
                variant="outline"
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}