import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Shims para paquetes ES5 incompatibles con Vite de botframework-webchat
      'markdown-it-attrs-es5': path.resolve(__dirname, './src/shims/markdown-it-attrs-es5.ts'),
      'p-defer-es5': path.resolve(__dirname, './src/shims/p-defer-es5.ts'),
      'abort-controller-es5': path.resolve(__dirname, './src/shims/abort-controller-es5.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['markdown-it-attrs-es5', 'p-defer-es5', 'abort-controller-es5'],
  },
}));
