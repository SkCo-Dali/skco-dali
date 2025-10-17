// Shim para evitar problemas de resolución con "markdown-it-attrs-es5" en Vite
// Web Chat intenta registrar este plugin en markdown-it, pero no es crítico para nuestro uso,
// así que proveemos un plugin no-op.
export default function markdownItAttrsShim(md?: unknown): void {
  // no-op
}
