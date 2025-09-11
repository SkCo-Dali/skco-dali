export type ExtPong = { version: string; loggedIn: boolean };
export type Detected = { ok: boolean; info?: ExtPong };

export function detectChrome(): boolean {
  const ua = navigator.userAgent;
  const isEdgeChromium = ua.includes("Edg/");
  const isChrome = ua.includes("Chrome/") && !ua.includes("OPR/") && !ua.includes("Brave/");
  return isChrome || isEdgeChromium;
}

export function listenExtensionMessages(onAny: (e: MessageEvent) => void) {
  window.addEventListener("message", onAny);
  return () => window.removeEventListener("message", onAny);
}

export function detectExtension(timeoutMs = 3000): Promise<Detected> {
  return new Promise((resolve) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "DALI_WA_EXT_PONG") {
        window.removeEventListener("message", onMsg);
        resolve({ ok: true, info: { version: e.data.version, loggedIn: e.data.loggedIn } });
      }
    };
    window.addEventListener("message", onMsg);
    
    // Enviar ping a la extensión usando chrome.runtime
    try {
      chrome.runtime.sendMessage("ecbjlbfhlbljkgdjiajioahaebpmgkfd", { type: "DALI_WA_EXT_PING" }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Extensión no encontrada via chrome.runtime");
          return;
        }
        if (response && response.type === "DALI_WA_EXT_PONG") {
          window.removeEventListener("message", onMsg);
          resolve({ ok: true, info: { version: response.version, loggedIn: response.loggedIn } });
        }
      });
    } catch (error) {
      // Fallback a postMessage si chrome.runtime no está disponible
      window.postMessage({ type: "DALI_WA_EXT_PING" }, "*");
    }
    
    setTimeout(() => { 
      window.removeEventListener("message", onMsg); 
      resolve({ ok: false }); 
    }, timeoutMs);
  });
}

export function checkWALogin(timeoutMs = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "DALI_WA_EXT_STATUS_OK") {
        window.removeEventListener("message", onMsg);
        resolve(!!e.data.loggedIn);
      }
    };
    window.addEventListener("message", onMsg);
    
    try {
      chrome.runtime.sendMessage("ecbjlbfhlbljkgdjiajioahaebpmgkfd", { type: "DALI_WA_EXT_STATUS" }, (response) => {
        if (chrome.runtime.lastError) {
          return;
        }
        if (response && response.type === "DALI_WA_EXT_STATUS_OK") {
          window.removeEventListener("message", onMsg);
          resolve(!!response.loggedIn);
        }
      });
    } catch (error) {
      window.postMessage({ type: "DALI_WA_EXT_STATUS" }, "*");
    }
    
    setTimeout(() => { 
      window.removeEventListener("message", onMsg); 
      resolve(false); 
    }, timeoutMs);
  });
}

export type SendBatchPayload = {
  batchId: string;
  throttle?: { minMs?: number; maxMs?: number; perMin?: number };
  messages: Array<{ id: string; to: string; renderedText: string }>;
};

export type BatchItem = {
  phone: string;
  textResolved: string;
};

export function sendBatch(payload: SendBatchPayload) {
  try {
    // Enviar a la extensión usando chrome.runtime
    chrome.runtime.sendMessage("ecbjlbfhlbljkgdjiajioahaebpmgkfd", {
      type: "DALI_WA_SEND_BATCH",
      items: payload.messages.map(msg => ({
        phone: msg.to,
        textResolved: msg.renderedText
      }))
    });
  } catch (error) {
    // Fallback a postMessage
    window.postMessage({ type: "DALI_WA_SEND_BATCH", payload }, "*");
  }
}

export function pauseBatch() { 
  window.postMessage({ type: "DALI_WA_BATCH_PAUSE" }, "*"); 
}

export function resumeBatch() { 
  window.postMessage({ type: "DALI_WA_BATCH_RESUME" }, "*"); 
}

export function cancelBatch() { 
  window.postMessage({ type: "DALI_WA_BATCH_CANCEL" }, "*"); 
}