
import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Configuración específica para web components
const webComponentConfig = defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'generate-web-components.js'),
      name: 'CRMWebComponents',
      fileName: (format) => `crm-web-components.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [], // No externalizar dependencias para web components standalone
      output: {
        globals: {}
      }
    },
    outDir: 'dist/web-components',
    emptyOutDir: true,
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src')
    }
  }
});

// Función para ejecutar el build
async function buildWebComponents() {
  try {
    console.log('🚀 Iniciando build de web components...');
    
    await build(webComponentConfig);
    
    console.log('✅ Web components generados exitosamente en dist/web-components/');
    console.log('📦 Archivos generados:');
    console.log('  - crm-web-components.es.js (ES Modules)');
    console.log('  - crm-web-components.umd.js (UMD)');
    console.log('  - crm-web-components.css (Estilos)');
    
  } catch (error) {
    console.error('❌ Error al generar web components:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  buildWebComponents();
}

export { buildWebComponents, webComponentConfig };
