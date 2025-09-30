// Utilidad específica para comunicación con la extensión de WhatsApp
// ID de la extensión: ecbjlbfhlbljkgdjiajioahaebpmgkfd

export interface WhatsAppExtensionResult {
  phoneRaw: string;
  status: 'success' | 'error';
  error?: string;
  timestamp?: string;
}

export interface WhatsAppBatchItem {
  phone: string;
  textResolved: string;
}

export class WhatsAppExtensionCommunicator {
  private static readonly EXTENSION_ID = "ecbjlbfhlbljkgdjiajioahaebpmgkfd";
  private resultListeners: ((result: WhatsAppExtensionResult) => void)[] = [];

  constructor() {
    this.setupResultListener();
  }

  private setupResultListener() {
    window.addEventListener("message", (event) => {
      if (event.source !== window || !event.data || event.data.type !== "DALI_WA_RESULT") {
        return;
      }

      const result: WhatsAppExtensionResult = event.data;
      console.log(`Resultado para ${result.phoneRaw}: ${result.status}`);
      
      // Notificar a todos los listeners
      this.resultListeners.forEach(listener => listener(result));
    });
  }

  /**
   * Verifica si la extensión está instalada
   */
  public checkExtension(): Promise<{ installed: boolean; version?: string }> {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          WhatsAppExtensionCommunicator.EXTENSION_ID, 
          { type: "DALI_WA_EXT_PING" }, 
          (response) => {
            if (chrome.runtime.lastError) {
              console.log("Extensión no encontrada.");
              resolve({ installed: false });
              return;
            }
            
            if (response && response.type === "DALI_WA_EXT_PONG") {
              console.log(`Extensión encontrada, versión: ${response.version}`);
              resolve({ installed: true, version: response.version });
            } else {
              resolve({ installed: false });
            }
          }
        );
      } catch (error) {
        console.error("Error al verificar extensión:", error);
        resolve({ installed: false });
      }
    });
  }

  /**
   * Envía un lote de mensajes a la extensión
   */
  public sendBatch(items: WhatsAppBatchItem[]): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          WhatsAppExtensionCommunicator.EXTENSION_ID,
          {
            type: "DALI_WA_SEND_BATCH",
            items: items
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error al enviar lote:", chrome.runtime.lastError);
              resolve(false);
              return;
            }
            
            console.log("Lote enviado exitosamente");
            resolve(true);
          }
        );
      } catch (error) {
        console.error("Error al enviar lote:", error);
        resolve(false);
      }
    });
  }

  /**
   * Registra un listener para recibir resultados de mensajes
   */
  public onResult(listener: (result: WhatsAppExtensionResult) => void): () => void {
    this.resultListeners.push(listener);
    
    // Retorna función para remover el listener
    return () => {
      const index = this.resultListeners.indexOf(listener);
      if (index > -1) {
        this.resultListeners.splice(index, 1);
      }
    };
  }

  /**
   * Limpia todos los listeners
   */
  public cleanup() {
    this.resultListeners = [];
  }
}