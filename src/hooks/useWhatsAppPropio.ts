import { useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/types/crm';
import { 
  LoteSalida, 
  MensajeSalida, 
  SendProgress, 
  SendEvent,
  FileRef
} from '@/types/whatsapp-propio';
import { ExtensionBridge } from '@/utils/extension-bridge';
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
  attachments: FileRef[];
  leads: Lead[];
  throttle: { porMinuto: number; jitterSeg: [number, number] | null };
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
  
  const extensionBridge = useRef<ExtensionBridge | null>(null);
  const currentLoteId = useRef<string | null>(null);

  const addEvent = useCallback((event: Omit<SendEvent, 'id' | 'timestamp'>) => {
    const newEvent: SendEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date().toISOString()
    };
    
    setSendEvents(prev => [...prev, newEvent]);
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
      
      // Crear bridge si no existe
      if (!extensionBridge.current) {
        extensionBridge.current = new ExtensionBridge();
      }

      const bridge = extensionBridge.current;
      
      // Verificar extensión
      const extensionOk = await bridge.ping();
      if (!extensionOk) {
        throw new Error('Extensión no detectada o WhatsApp Web no está activo');
      }

      // Preparar leads (usar solo los primeros 3 si es dryRun)
      const leadsToSend = config.dryRun ? config.leads.slice(0, 3) : config.leads;
      
      // Crear mensajes
      const mensajes: MensajeSalida[] = leadsToSend.map(lead => ({
        id: uuidv4(),
        to_e164: lead.phone,
        texto_resuelto: renderMessage(config.message, lead),
        adjuntos: config.attachments.length > 0 ? config.attachments : undefined
      }));

      // Crear lote
      const lote: LoteSalida = {
        loteId: uuidv4(),
        mensajes,
        throttle: config.throttle,
        dryRun: config.dryRun,
        meta: {
          createdBy: config.userEmail,
          fuente: 'WA_PROPIO'
        }
      };

      currentLoteId.current = lote.loteId;

      // Inicializar progreso
      setSendProgress({
        total: mensajes.length,
        sent: 0,
        failed: 0,
        pending: mensajes.length,
        isActive: true,
        isPaused: false
      });

      setSendEvents([]);

      // Configurar listeners de eventos
      bridge.onEvent((event) => {
        if (event.loteId !== lote.loteId) return;

        switch (event.kind) {
          case 'event':
            if (event.messageId && event.status) {
              const mensaje = mensajes.find(m => m.id === event.messageId);
              if (mensaje) {
                const lead = leadsToSend.find(l => l.phone === mensaje.to_e164);
                if (lead) {
                  addEvent({
                    leadName: lead.name,
                    phoneNumber: mensaje.to_e164,
                    status: event.status,
                    error: event.error,
                    ticks: event.ticks
                  });

                  // Actualizar progreso
                  setSendProgress(prev => ({
                    ...prev,
                    sent: event.status === 'sent' ? prev.sent + 1 : prev.sent,
                    failed: event.status === 'failed' ? prev.failed + 1 : prev.failed,
                    pending: prev.pending - 1
                  }));
                }
              }
            }
            break;

          case 'done':
            updateProgress({
              isActive: false,
              isPaused: false
            });

            toast({
              title: "Envío completado",
              description: `Se enviaron ${event.sent} mensajes correctamente`,
            });

            // TODO: Persistir en API cuando esté disponible
            // await persistirLote(lote, events);
            
            break;
        }
      });

      // Enviar lote a la extensión
      bridge.sendBatch(lote);

      toast({
        title: config.dryRun ? "Enviando mensajes de prueba" : "Enviando mensajes",
        description: `Iniciando envío a ${mensajes.length} contactos`,
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
    } finally {
      setIsLoading(false);
    }
  }, [toast, addEvent, updateProgress, renderMessage]);

  const pauseResume = useCallback(() => {
    if (extensionBridge.current && currentLoteId.current) {
      extensionBridge.current.pauseResume();
      setSendProgress(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  }, []);

  const cancelSend = useCallback(() => {
    if (extensionBridge.current && currentLoteId.current) {
      extensionBridge.current.cancel();
      updateProgress({
        isActive: false,
        isPaused: false
      });
      
      toast({
        title: "Envío cancelado",
        description: "El proceso de envío ha sido detenido",
        variant: "destructive"
      });
    }
  }, [toast, updateProgress]);

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
    link.setAttribute('download', `whatsapp-reporte-${new Date().toISOString().split('T')[0]}.csv`);
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