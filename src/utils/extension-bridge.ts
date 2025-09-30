import { EventoExtension, LoteSalida } from '@/types/whatsapp-propio';

export class ExtensionBridge {
  private listeners: ((event: EventoExtension) => void)[] = [];
  private isListening = false;

  constructor() {
    this.setupMessageListener();
  }

  private setupMessageListener() {
    if (this.isListening) return;
    
    window.addEventListener('message', this.handleMessage.bind(this));
    this.isListening = true;
  }

  private handleMessage(event: MessageEvent) {
    if (event.source !== window) return;

    const { type, payload } = event.data;
    console.log('ExtensionBridge: Mensaje recibido:', { type, payload });
    
    // Manejar respuesta PONG de la extensión
    if (type === 'DALI_WA_EXT_PONG') {
      console.log('ExtensionBridge: Pong detectado, tipo:', type);
      this.notifyListeners({ kind: 'pong' });
    } 
    // Manejar resultados individuales de mensajes
    else if (type === 'DALI_WA_RESULT') {
      console.log(`Resultado para ${event.data.phoneRaw}: ${event.data.status}`);
      this.notifyListeners({
        kind: 'event',
        messageId: event.data.phoneRaw,
        status: event.data.status === 'success' ? 'sent' : 'failed',
        error: event.data.status === 'error' ? event.data.error : undefined
      });
    }
    // Mantener compatibilidad con tipos anteriores
    else if (type === 'DALI_WA_EVENT' || type === 'WA_SENDER_EVENT' || type === 'WA_EVENT') {
      this.notifyListeners({
        kind: 'event',
        ...payload
      });
    } else if (type === 'DALI_WA_DONE' || type === 'WA_SENDER_DONE' || type === 'WA_DONE') {
      this.notifyListeners({
        kind: 'done',
        ...payload
      });
    }
  }

  private notifyListeners(event: EventoExtension) {
    this.listeners.forEach(listener => listener(event));
  }

  public onEvent(listener: (event: EventoExtension) => void) {
    this.listeners.push(listener);
    
    // Retornar función para remover el listener
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public ping(): Promise<boolean> {
    return new Promise((resolve) => {
      console.log('ExtensionBridge: Iniciando ping a la extensión WA-Sender');
      
      const timeout = setTimeout(() => {
        console.log('ExtensionBridge: Timeout - extensión no detectada');
        resolve(false);
      }, 3000);
      
      const removeListener = this.onEvent((event) => {
        console.log('ExtensionBridge: Evento recibido:', event);
        if (event.kind === 'pong') {
          console.log('ExtensionBridge: Pong recibido - extensión detectada');
          clearTimeout(timeout);
          removeListener();
          resolve(true);
        }
      });

      // Usar chrome.runtime para comunicarse con la extensión específica
      try {
        console.log('ExtensionBridge: Enviando ping via chrome.runtime...');
        chrome.runtime.sendMessage("ecbjlbfhlbljkgdjiajioahaebpmgkfd", { type: "DALI_WA_EXT_PING" }, (response) => {
          if (chrome.runtime.lastError) {
            console.log("Extensión no encontrada via chrome.runtime");
            return;
          }
          if (response && response.type === "DALI_WA_EXT_PONG") {
            console.log(`Extensión encontrada, versión: ${response.version}`);
            clearTimeout(timeout);
            removeListener();
            resolve(true);
          }
        });
      } catch (error) {
        console.log('ExtensionBridge: chrome.runtime no disponible, usando postMessage...');
        window.postMessage({ type: 'DALI_WA_EXT_PING' }, '*');
      }
      
      // También revisar si hay alguna variable global que indique la presencia de la extensión
      setTimeout(() => {
        if ((window as any).waSenderExtension || (window as any).WA_SENDER_EXTENSION) {
          console.log('ExtensionBridge: Extensión detectada via variable global');
          clearTimeout(timeout);
          removeListener();
          resolve(true);
        }
      }, 100);
    });
  }

  public sendBatch(lote: LoteSalida) {
    window.postMessage({ type: 'DALI_WA_SEND_BATCH', payload: lote }, '*');
  }

  public pauseResume() {
    window.postMessage({ type: 'DALI_WA_PAUSE_RESUME' }, '*');
  }

  public cancel() {
    window.postMessage({ type: 'DALI_WA_CANCEL' }, '*');
  }

  public static isChrome(): boolean {
    // Detectar Chrome específicamente, excluyendo Edge y otros navegadores basados en Chromium
    const isChrome = navigator.userAgent.includes('Chrome') && !!(window as any).chrome;
    const isEdge = navigator.userAgent.includes('Edge') || navigator.userAgent.includes('Edg/');
    const isOpera = navigator.userAgent.includes('Opera') || navigator.userAgent.includes('OPR');
    
    return isChrome && !isEdge && !isOpera;
  }

  public cleanup() {
    if (this.isListening) {
      window.removeEventListener('message', this.handleMessage.bind(this));
      this.isListening = false;
    }
    this.listeners = [];
  }
}