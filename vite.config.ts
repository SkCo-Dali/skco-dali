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
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Workaround para markdown-it-attrs-es5
      'markdown-it-attrs-es5': 'markdown-it-attrs-es5/dist/markdown-it-attrs.browser.js',
    },
  },
  optimizeDeps: {
    exclude: ['markdown-it-attrs-es5'],
  },
}));
