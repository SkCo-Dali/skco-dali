import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/types/crm';
import { 
  SendProgress, 
  SendEvent,
  DaliWAMessage,
  DaliWABatchPayload
} from '@/types/whatsapp-propio';
import { 
  listenExtensionMessages, 
  sendBatch, 
  pauseBatch, 
  resumeBatch, 
  cancelBatch,
  detectExtension,
  checkWALogin 
} from '@/services/waSelfSender';
import { useToast } from '@/hooks/use-toast';

export interface UseWhatsAppPropioReturn {
  sendProgress: SendProgress;
  sendEvents: SendEvent[];
  isLoading: boolean;
  
  sendMessages: (config: SendMessagesConfig) => Promise<void>;
  pauseResume: () => void;
  cancelSend: () => void;
  downloadReport: () => void;
}

export interface SendMessagesConfig {
  message: string;
  attachments: any[]; // FileRef[] - simplificado por ahora
  leads: Lead[];
  throttle: { minMs?: number; maxMs?: number; perMin?: number };
  dryRun: boolean;
  userEmail: string;
}

export function useWhatsAppPropio(): UseWhatsAppPropioReturn {
  const { toast } = useToast();
  const [sendProgress, setSendProgress] = useState<SendProgress>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    isActive: false,
    isPaused: false
  });
  
  const [sendEvents, setSendEvents] = useState<SendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const messageListener = useRef<(() => void) | null>(null);
  const currentBatchId = useRef<string | null>(null);

  const addEvent = useCallback((event: Omit<SendEvent, 'id' | 'timestamp'>) => {
    const newEvent: SendEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    setSendEvents(prev => [newEvent, ...prev].slice(0, 50)); // Mantener solo los últimos 50
  }, []);

  const updateProgress = useCallback((update: Partial<SendProgress>) => {
    setSendProgress(prev => ({ ...prev, ...update }));
  }, []);

  const renderMessage = useCallback((template: string, lead: Lead): string => {
    return template
      .replace(/{name}/g, lead.name || 'N/A')
      .replace(/{company}/g, lead.company || 'N/A')  
      .replace(/{email}/g, lead.email || 'N/A')
      .replace(/{phone}/g, lead.phone || 'N/A');
  }, []);

  const sendMessages = useCallback(async (config: SendMessagesConfig) => {
    try {
      setIsLoading(true);
      
      // Verificar extensión primero
      const extensionCheck = await detectExtension();
      if (!extensionCheck.ok) {
        throw new Error('Extensión Dali WA Sender no detectada');
      }

      // Verificar sesión de WhatsApp Web
      const sessionCheck = await checkWALogin();
      if (!sessionCheck) {
        throw new Error('No hay sesión activa en WhatsApp Web');
      }

      // Preparar leads (usar solo los primeros 3 si es dryRun)
      const leadsToSend = config.dryRun ? config.leads.slice(0, 3) : config.leads;
      
      // Crear mensajes con el nuevo formato
      const messages: DaliWAMessage[] = leadsToSend.map(lead => ({
        id: uuidv4(),
        to: lead.phone, // Usar formato E.164 si es necesario
        renderedText: renderMessage(config.message, lead)
      }));

      // Crear payload del lote
      const batchPayload: DaliWABatchPayload = {
        batchId: uuidv4(),
        messages,
        throttle: {
          minMs: config.throttle.minMs || 3000,
          maxMs: config.throttle.maxMs || 7000,
          perMin: config.throttle.perMin || 10
        }
      };

      currentBatchId.current = batchPayload.batchId;

      // Inicializar progreso
      setSendProgress({
        total: messages.length,
        sent: 0,
        failed: 0,
        pending: messages.length,
        isActive: true,
        isPaused: false
      });

      setSendEvents([]);

      // Configurar listener de mensajes de la extensión
      if (messageListener.current) {
        messageListener.current(); // Limpiar listener anterior
      }

      messageListener.current = listenExtensionMessages((e) => {
        const messageType = e.data?.type;
        
        if (messageType === 'DALI_WA_MSG_PROGRESS') {
          const progress = e.data;
          const message = messages.find(m => m.id === progress.messageId);
          if (message) {
            const lead = leadsToSend.find(l => l.phone === message.to);
            if (lead) {
              addEvent({
                leadName: lead.name,
                phoneNumber: message.to,
                status: progress.status,
                error: progress.error,
                ticks: progress.ticks
              });

              // Actualizar contadores
              setSendProgress(prev => {
                const newSent = progress.status === 'sent' ? prev.sent + 1 : prev.sent;
                const newFailed = progress.status === 'failed' ? prev.failed + 1 : prev.failed;
                return {
                  ...prev,
                  sent: newSent,
                  failed: newFailed,
                  pending: prev.total - newSent - newFailed
                };
              });
            }
          }
        } else if (messageType === 'DALI_WA_BATCH_DONE') {
          const done = e.data;
          if (done.batchId === currentBatchId.current) {
            updateProgress({
              isActive: false,
              isPaused: false
            });

            toast({
              title: "Envío completado",
              description: `Se enviaron ${done.sent} mensajes correctamente${done.failed > 0 ? `, ${done.failed} fallaron` : ''}`,
            });

            // Limpiar listener
            if (messageListener.current) {
              messageListener.current();
              messageListener.current = null;
            }

            // TODO: Persistir en API cuando esté disponible
            // await persistirBatch(batchPayload, sendEvents);
          }
        }
      });

      // Enviar lote a la extensión
      sendBatch(batchPayload);

      toast({
        title: config.dryRun ? "Enviando mensajes de prueba" : "Enviando mensajes",
        description: `Iniciando envío a ${messages.length} contactos`,
      });

    } catch (error) {
      console.error('Error sending messages:', error);
      toast({
        title: "Error en el envío",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
      
      updateProgress({
        isActive: false,
        isPaused: false
      });
      
      // Limpiar listener en caso de error
      if (messageListener.current) {
        messageListener.current();
        messageListener.current = null;
      }
    } finally {
      setIsLoading(false);
    }
  }, [toast, addEvent, updateProgress, renderMessage]);

  const pauseResume = useCallback(() => {
    if (currentBatchId.current && sendProgress.isActive) {
      if (sendProgress.isPaused) {
        resumeBatch();
        setSendProgress(prev => ({ ...prev, isPaused: false }));
        toast({
          title: "Envío reanudado",
          description: "Continuando con el envío de mensajes"
        });
      } else {
        pauseBatch();
        setSendProgress(prev => ({ ...prev, isPaused: true }));
        toast({
          title: "Envío pausado",
          description: "El envío ha sido pausado temporalmente"
        });
      }
    }
  }, [sendProgress.isActive, sendProgress.isPaused, toast]);

  const cancelSend = useCallback(() => {
    if (currentBatchId.current && sendProgress.isActive) {
      cancelBatch();
      updateProgress({
        isActive: false,
        isPaused: false
      });
      
      // Limpiar listener
      if (messageListener.current) {
        messageListener.current();
        messageListener.current = null;
      }
      
      toast({
        title: "Envío cancelado",
        description: "El proceso de envío ha sido detenido",
        variant: "destructive"
      });
    }
  }, [sendProgress.isActive, toast, updateProgress]);

  const downloadReport = useCallback(() => {
    if (sendEvents.length === 0) return;

    const csvContent = [
      ['ID', 'Nombre', 'Teléfono', 'Estado', 'Error', 'Confirmación', 'Timestamp'].join(','),
      ...sendEvents.map(event => [
        event.id,
        `"${event.leadName}"`,
        event.phoneNumber,
        event.status,
        `"${event.error || ''}"`,
        event.ticks || '',
        event.timestamp
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `dali-whatsapp-reporte-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Reporte descargado",
      description: "El archivo CSV ha sido guardado"
    });
  }, [sendEvents, toast]);

  return {
    sendProgress,
    sendEvents,
    isLoading,
    sendMessages,
    pauseResume,
    cancelSend,
    downloadReport
  };
}