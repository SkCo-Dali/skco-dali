import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
      // Shim para markdown-it-attrs-es5 que rompe la resolución en Vite
      'markdown-it-attrs-es5': path.resolve(__dirname, './src/shims/markdown-it-attrs-es5.ts'),
      // Shim para p-defer-es5
      'p-defer-es5': path.resolve(__dirname, './src/shims/p-defer-es5.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['markdown-it-attrs-es5', 'p-defer-es5'],
  },
}));
