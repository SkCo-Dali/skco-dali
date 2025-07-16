
import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

// Configuración base para web components
const createWebComponentConfig = (entry, name, outDir) => defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production')
  },
  build: {
    lib: {
      entry: resolve(__dirname, entry),
      name: `SK_Dali_${name}_React`,
      fileName: () => `SK.Dali.${name}.React.js`,
      formats: ['umd']
    },
    rollupOptions: {
      external: [], // No externalizar dependencias para web components standalone
      output: {
        globals: {},
        // Generar CSS separado
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return `SK.Dali.${name}.React.css`;
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
        drop_console: false, // Mantener console.log para debugging
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

// Generar archivo individual para cada componente
async function generateIndividualComponent(componentName) {
  const componentFile = `generate-${componentName.toLowerCase()}-component.js`;
  const componentContent = `
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';

// Importar la página específica
import ${componentName} from '../src/pages/${componentName}';

// Importar contextos necesarios
import { AuthProvider } from '../src/contexts/AuthContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { SimpleConversationProvider } from '../src/contexts/SimpleConversationContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';

// Importar configuración de autenticación
import { msalConfig } from '../src/authConfig';

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
    
    // Instancia de MSAL para autenticación
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  async connectedCallback() {
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
    await this.copyGlobalStyles(shadow);

    // Inicializar MSAL
    await this.initializeMsal();

    // Renderizar el componente React
    this.root = ReactDOM.createRoot(container);
    this.renderComponent();
  }

  disconnectedCallback() {
    if (this.root) {
      this.root.unmount();
    }
  }

  async initializeMsal() {
    try {
      await this.msalInstance.initialize();
    } catch (error) {
      console.error('Error initializing MSAL:', error);
    }
  }

  async copyGlobalStyles(shadow) {
    // Copiar estilos de Tailwind y otros estilos globales
    const globalStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
    
    for (const style of globalStyles) {
      if (style.tagName === 'LINK') {
        // Para links externos, crear una nueva referencia
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = style.href;
        shadow.appendChild(newLink);
      } else {
        // Para estilos inline, clonar directamente
        const clonedStyle = style.cloneNode(true);
        shadow.appendChild(clonedStyle);
      }
    }

    // Cargar el CSS específico del componente si existe
    try {
      const cssResponse = await fetch('./SK.Dali.${componentName}.React.css');
      if (cssResponse.ok) {
        const cssText = await cssResponse.text();
        const componentStyles = document.createElement('style');
        componentStyles.textContent = cssText;
        shadow.appendChild(componentStyles);
      }
    } catch (error) {
      // CSS específico no encontrado, continuar sin él
    }

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
                      React.createElement(${componentName})
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
      authenticated: !!this.msalInstance?.getAllAccounts()?.length,
      isConnected: this.isConnected
    };
  }

  // API pública para forzar re-autenticación
  async forceReauth() {
    if (this.msalInstance) {
      try {
        await this.msalInstance.loginPopup();
        this.renderComponent(); // Re-renderizar después de autenticación
      } catch (error) {
        console.error('Error during re-authentication:', error);
      }
    }
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

  // Escribir el archivo del componente individual
  fs.writeFileSync(path.join(__dirname, componentFile), componentContent);
  return componentFile;
}

// Función principal para construir todos los web components
async function buildWebComponents() {
  try {
    console.log('🚀 Iniciando build de web components individuales...');
    
    const components = ['Leads', 'ChatDali', 'Dashboard', 'Informes'];
    const outDir = 'dist/web-components';
    
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
    for (const component of components) {
      console.log(\`🔨 Construyendo \${component}...\`);
      
      // Generar archivo de entrada individual
      const entryFile = await generateIndividualComponent(component);
      
      // Configurar build específico
      const config = createWebComponentConfig(entryFile, component, outDir);
      
      // Ejecutar build
      await build(config);
      
      // Limpiar archivo temporal
      fs.unlinkSync(path.join(__dirname, entryFile));
      
      console.log(\`✅ \${component} construido exitosamente\`);
    }
    
    // Generar archivo index.html de ejemplo
    const indexHtml = \`<!DOCTYPE html>
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
            <li>SK.Dali.Leads.React.js / SK.Dali.Leads.React.css</li>
            <li>SK.Dali.ChatDali.React.js / SK.Dali.ChatDali.React.css</li>
            <li>SK.Dali.Dashboard.React.js / SK.Dali.Dashboard.React.css</li>
            <li>SK.Dali.Informes.React.js / SK.Dali.Informes.React.css</li>
        </ul>
    </div>
    
    <div style="margin: 20px 0;">
        <h3>Ejemplo de uso:</h3>
        <pre><code>&lt;!-- Cargar CSS --&gt;
&lt;link rel="stylesheet" href="./SK.Dali.Leads.React.css"&gt;

&lt;!-- Cargar JS --&gt;
&lt;script src="./SK.Dali.Leads.React.js"&gt;&lt;/script&gt;

&lt;!-- Usar el componente --&gt;
&lt;sk-dali-leads-react&gt;&lt;/sk-dali-leads-react&gt;</code></pre>
    </div>
</body>
</html>\`;
    
    fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
    
    console.log('✅ Todos los web components generados exitosamente en dist/web-components/');
    console.log('📦 Archivos generados:');
    
    components.forEach(component => {
      console.log(\`  - SK.Dali.\${component}.React.js\`);
      console.log(\`  - SK.Dali.\${component}.React.css\`);
    });
    
    console.log('  - index.html (ejemplo de uso)');
    
  } catch (error) {
    console.error('❌ Error al generar web components:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === \`file://\${process.argv[1]}\`) {
  buildWebComponents();
}

export { buildWebComponents };
