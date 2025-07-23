
import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Mapeo de páginas a componentes
const PAGE_COMPONENTS = {
  'Index': 'LogIn',
  'Dashboard': 'Dashboard',
  'Leads': 'Leads',
  'ChatDali': 'ChatDali',
  'Informes': 'Informes',
  'Tasks': 'Tasks',
  'Reports': 'Reports',
  'Users': 'Users'
};

// Función para generar el archivo de entrada para cada componente
function generateComponentEntry(pageName, componentName) {
  const importName = pageName === 'Index' ? 'Index' : pageName;
  
  return `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Importar la página específica
import ${importName} from '../src/pages/${importName}';

// Importar contextos necesarios
import { AuthProvider } from '../src/contexts/AuthContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { SimpleConversationProvider } from '../src/contexts/SimpleConversationContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';

// Importar CSS
import '../src/index.css';

class SK_Dali_${componentName}_React extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  connectedCallback() {
    // Crear shadow DOM para encapsulación
    const shadow = this.attachShadow({ mode: 'open' });
    
    // Crear contenedor para React
    const container = document.createElement('div');
    container.style.cssText = \`
      width: 100%;
      height: 100vh;
      overflow: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    \`;
    shadow.appendChild(container);

    // Copiar estilos globales al shadow DOM
    this.copyGlobalStyles(shadow);

    // Renderizar el componente React
    this.root = ReactDOM.createRoot(container);
    this.renderComponent();
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }

  copyGlobalStyles(shadow) {
    // Copiar estilos de Tailwind y otros estilos globales
    const globalStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
    
    globalStyles.forEach(style => {
      if (style.tagName === 'LINK') {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = style.href;
        shadow.appendChild(newLink);
      } else {
        const clonedStyle = style.cloneNode(true);
        shadow.appendChild(clonedStyle);
      }
    });

    // Agregar estilos específicos para el web component
    const hostStyles = document.createElement('style');
    hostStyles.textContent = \`
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
    \`;
    shadow.appendChild(hostStyles);
  }

  renderComponent() {
    this.root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          QueryClientProvider,
          { client: this.queryClient },
          React.createElement(
            AuthProvider,
            null,
            React.createElement(
              SimpleConversationProvider,
              null,
              React.createElement(
                NotificationProvider,
                null,
                React.createElement(
                  BrowserRouter,
                  null,
                  React.createElement(
                    ThemeProvider,
                    null,
                    React.createElement(
                      SettingsProvider,
                      null,
                      React.createElement(${importName})
                    )
                  )
                )
              )
            )
          )
        )
      )
    );
  }

  // API pública para obtener información del componente
  getComponentInfo() {
    return {
      name: 'SK.Dali.${componentName}.React',
      version: '1.0.0',
      isConnected: this.isConnected
    };
  }
}

// Registrar el custom element
if (!customElements.get('sk-dali-${componentName.toLowerCase()}-react')) {
  customElements.define('sk-dali-${componentName.toLowerCase()}-react', SK_Dali_${componentName}_React);
}

// Exportar para uso programático
export default SK_Dali_${componentName}_React;

// Auto-registrar si se ejecuta directamente
if (typeof window !== 'undefined') {
  console.log('SK.Dali.${componentName}.React web component registered');
}
`;
}

// Configuración base para web components
const createWebComponentConfig = (entry, componentName, outDir) => defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, entry),
      name: `SK_Dali_${componentName}_React`,
      fileName: () => `SK.Dali.${componentName}.React.js`,
      formats: ['umd']
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return `SK.Dali.${componentName}.React.css`;
          }
          return assetInfo.name;
        }
      }
    },
    outDir,
    emptyOutDir: false,
    cssCodeSplit: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
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

// Función principal para construir todos los web components
async function buildWebComponents() {
  try {
    console.log('🚀 Iniciando build de web components...');
    
    const outDir = 'dist/elements';
    
    // Crear directorio de salida
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    } else {
      // Limpiar directorio existente
      fs.readdirSync(outDir).forEach(file => {
        fs.unlinkSync(path.join(outDir, file));
      });
    }

    // Construir cada componente individualmente
    for (const [pageName, componentName] of Object.entries(PAGE_COMPONENTS)) {
      console.log(`🔨 Construyendo ${componentName}...`);
      
      // Generar archivo de entrada individual
      const entryContent = generateComponentEntry(pageName, componentName);
      const entryFile = `generate-${componentName.toLowerCase()}-component.js`;
      fs.writeFileSync(path.join(__dirname, entryFile), entryContent);
      
      // Configurar build específico
      const config = createWebComponentConfig(entryFile, componentName, outDir);
      
      // Ejecutar build
      await build(config);
      
      // Limpiar archivo temporal
      fs.unlinkSync(path.join(__dirname, entryFile));
      
      console.log(`✅ ${componentName} construido exitosamente`);
    }
    
    // Generar archivo index.html de ejemplo
    const indexHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SK Dali Web Components</title>
</head>
<body>
    <h1>SK Dali Web Components</h1>
    <div style="margin: 20px 0;">
        <h2>Componentes disponibles:</h2>
        <ul>
${Object.values(PAGE_COMPONENTS).map(name => 
  `            <li>SK.Dali.${name}.React.js / SK.Dali.${name}.React.css</li>`
).join('\n')}
        </ul>
    </div>
    
    <div style="margin: 20px 0;">
        <h3>Ejemplo de uso:</h3>
        <pre><code>&lt;!-- Cargar CSS --&gt;
&lt;link rel="stylesheet" href="./SK.Dali.LogIn.React.css"&gt;

&lt;!-- Cargar JS --&gt;
&lt;script src="./SK.Dali.LogIn.React.js"&gt;&lt;/script&gt;

&lt;!-- Usar el componente --&gt;
&lt;sk-dali-login-react&gt;&lt;/sk-dali-login-react&gt;</code></pre>
    </div>
</body>
</html>`;
    
    fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
    
    console.log('✅ Todos los web components generados exitosamente en dist/elements/');
    console.log('📦 Archivos generados:');
    
    Object.values(PAGE_COMPONENTS).forEach(componentName => {
      console.log(`  - SK.Dali.${componentName}.React.js`);
      console.log(`  - SK.Dali.${componentName}.React.css`);
    });
    
    console.log('  - index.html (ejemplo de uso)');
    
  } catch (error) {
    console.error('❌ Error al generar web components:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  buildWebComponents();
}

export { buildWebComponents };
