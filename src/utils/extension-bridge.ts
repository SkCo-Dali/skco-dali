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
    
    if (type === 'DALI_WA_PONG') {
      this.notifyListeners({ kind: 'pong' });
    } else if (type === 'DALI_WA_EVENT') {
      this.notifyListeners({
        kind: 'event',
        ...payload
      });
    } else if (type === 'DALI_WA_DONE') {
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
      const timeout = setTimeout(() => resolve(false), 3000);
      
      const removeListener = this.onEvent((event) => {
        if (event.kind === 'pong') {
          clearTimeout(timeout);
          removeListener();
          resolve(true);
        }
      });

      window.postMessage({ type: 'DALI_WA_PING' }, '*');
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
    return navigator.userAgent.includes('Chrome') && !!(window as any).chrome;
  }

  public cleanup() {
    if (this.isListening) {
      window.removeEventListener('message', this.handleMessage.bind(this));
      this.isListening = false;
    }
    this.listeners = [];
  }
}