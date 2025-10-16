// Shim para abort-controller-es5
// Los navegadores modernos ya tienen AbortController nativo
export { AbortController, AbortSignal } from 'abort-controller';
export default AbortController;
