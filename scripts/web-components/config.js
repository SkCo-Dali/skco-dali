import { resolve } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configuración base para web components
 */
export const WEB_COMPONENTS_CONFIG = {
  // Directorio de salida
  OUTPUT_DIR: 'dist/web-components',
  
  // Directorio de páginas/componentes
  PAGES_DIR: resolve(__dirname, '../../src/pages'),
  
  // Directorio raíz del proyecto
  ROOT_DIR: resolve(__dirname, '../../'),
  
  // Extensiones a ignorar
  IGNORE_EXTENSIONS: ['.test.', '.spec.', '.d.ts'],
  
  // Componentes a incluir (si es vacío, incluye todos)
  INCLUDED_COMPONENTS: [],
  
  // Componentes a excluir (problemas de exportación o dependencias)
  EXCLUDED_COMPONENTS: ['Opportunities', 'OpportunityDetails'],
  
  // Configuración de Vite
  // Para cambiar opciones, ver: MINIFY-CONFIGURATION-GUIDE.md
  VITE_CONFIG: {
    lib: {
      formats: ['umd'],
    },
    build: {
      rollupOptions: {
        external: [],
      },
      // DESARROLLO: sourcemap: true, (sin minify)
      // PRODUCCIÓN: minify: 'esbuild', sourcemap: false,
      sourcemap: true,  // Generar source maps para debugging
      cssCodeSplit: false,
      emptyOutDir: false,
    },
  },
  
  // Nombre del custom element
  CUSTOM_ELEMENT_PREFIX: 'skco-dali',
  
  // Nombre del componente exportado
  COMPONENT_CLASS_PREFIX: 'SK_Dali',
  
  // Nombre del archivo
  FILE_NAME_PREFIX: 'SKCo.Dali',
};

/**
 * Estilos CSS que se deben inyectar en el shadow DOM
 */
export const HOST_STYLES = `
  :host {
    display: block;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    --background: 210 40% 98%;
    --foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  
  * {
    box-sizing: border-box;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
