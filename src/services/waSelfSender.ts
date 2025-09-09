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
    window.postMessage({ type: "DALI_WA_EXT_PING" }, "*");
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
    window.postMessage({ type: "DALI_WA_EXT_STATUS" }, "*");
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

export function sendBatch(payload: SendBatchPayload) {
  window.postMessage({ type: "DALI_WA_SEND_BATCH", payload }, "*");
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