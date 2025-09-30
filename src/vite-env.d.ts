/// <reference types="vite/client" />

// Chrome Extension API types
interface ChromeRuntime {
  sendMessage(extensionId: string, message: any, callback?: (response: any) => void): void;
  lastError?: chrome.runtime.LastError;
}

interface Chrome {
  runtime: ChromeRuntime;
}

declare const chrome: Chrome;
