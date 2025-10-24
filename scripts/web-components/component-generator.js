import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Escanea el directorio de páginas y obtiene los componentes disponibles
 */
export async function discoverComponents(pagesDir) {
  try {
    const files = fs.readdirSync(pagesDir);
    
    const components = files
      .filter(file => {
        // Filtrar por extensión
        return file.endsWith('.tsx') || file.endsWith('.ts');
      })
      .filter(file => {
        // Excluir archivos de índice
        return file !== 'index.tsx' && file !== 'Index.tsx';
      })
      .filter(file => {
        // Excluir archivos de test o tipos
        return !file.includes('.test.') && 
               !file.includes('.spec.') && 
               !file.includes('.d.ts');
      })
      .map(file => ({
        filename: file,
        name: file.replace(/\.(tsx|ts)$/, ''),
        path: path.join(pagesDir, file)
      }));
    
    return components;
  } catch (error) {
    throw new Error(`Error al descubrir componentes: ${error.message}`);
  }
}

/**
 * Genera el código base del wrapper del componente web
 * @param {string} componentName - Nombre del componente
 * @param {string} absoluteComponentPath - Ruta absoluta al archivo del componente
 */
export function generateComponentCode(componentName, absoluteComponentPath) {
  const className = `SK_Dali_${componentName}_React`;
  
  return `import React from 'react';
import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';

// Importar el componente de página
import ${componentName} from '${absoluteComponentPath}';

// Importar contextos necesarios
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { SimpleConversationProvider } from '@/contexts/SimpleConversationContext';
import { AssignableUsersProvider } from '@/contexts/AssignableUsersContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

// Importar configuración de autenticación
import { msalConfig, loginRequest } from '@/authConfig';
import { getUserByEmail, createUser } from '@/utils/userApiClient';
import { TokenValidationService } from '@/services/tokenValidationService';
import { getUserRoleByEmail } from '@/utils/userRoleService';

// Importar CSS
import '@/index.css';

// Componente de autenticación automática usando useAuth y useMsal
const AutoAuthWrapper = ({ children }) => {
  const { user, loading, login } = useAuth();
  const { instance: msalInstance } = useMsal();
  const [isAutoAuthenticating, setIsAutoAuthenticating] = useState(false);
  const [autoAuthError, setAutoAuthError] = useState(null);

  const executeAutoAuth = async () => {
    if (isAutoAuthenticating || user || loading) return;
    
    setIsAutoAuthenticating(true);
    setAutoAuthError(null);
    
    try {
      const response = await msalInstance.loginPopup({
        ...loginRequest,
        prompt: 'none'
      });
      
      
    } catch (error) {
      console.error('Error en autenticación automática:', error);
      
      setAutoAuthError(errorMessage);
      console.error('Error de autenticación:', errorMessage);
      
    } finally {
      setIsAutoAuthenticating(false);
    }
  };

  useEffect(() => {
    if (!loading && !user && !isAutoAuthenticating) {
      executeAutoAuth();
    }
  }, [user, loading, isAutoAuthenticating]);

  if (loading || isAutoAuthenticating) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column'
      }
    }, [
      React.createElement('div', {
        key: 'spinner',
        style: {
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }
      }),
      React.createElement('p', {
        key: 'text',
        style: { marginTop: '16px', color: '#666' }
      }, isAutoAuthenticating ? 'Autenticando...' : 'Cargando...')
    ]);
  }

  if (!user) {
    return React.createElement('div', {
      style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        padding: '20px'
      }
    }, [
      React.createElement('p', {
        key: 'error',
        style: { color: '#e74c3c', marginBottom: '16px' }
      }, autoAuthError || 'No se pudo autenticar automáticamente'),
      React.createElement('p', {
        key: 'help',
        style: { color: '#666', fontSize: '14px' }
      }, 'Verifica tu conexión y permisos de popup')
    ]);
  }

  return children;
};

class ${className} extends HTMLElement {
  constructor() {
    super();
    this.root = null;
    this.msalInstance = null;
    this.queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
      },
    });
  }

  async connectedCallback() {
    const shadow = this.shadowRoot ? this.shadowRoot : this.attachShadow({ mode: 'open' });

    const container = document.createElement('div');
    shadow.appendChild(container);

    await this.copyGlobalStyles(shadow);
    await this.initializeMsal();

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
      this.msalInstance = new PublicClientApplication(msalConfig);
      await this.msalInstance.initialize();
    } catch (error) {
      console.error('Error initializing MSAL:', error);
    }
  }

  async copyGlobalStyles(shadow) {
    const globalStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
    
    for (const style of globalStyles) {
      if (style.tagName === 'LINK') {
        const newLink = document.createElement('link');
        newLink.rel = 'stylesheet';
        newLink.href = style.href;
        shadow.appendChild(newLink);
      } else {
        const clonedStyle = style.cloneNode(true);
        shadow.appendChild(clonedStyle);
      }
    }

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
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
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
            ThemeProvider,
            null,
            React.createElement(
              MsalProvider,
              { instance: this.msalInstance },
              React.createElement(
                AuthProvider,
                null,
                React.createElement(
                  NotificationProvider,
                  null,
                  React.createElement(
                    AssignableUsersProvider,
                    null,
                    React.createElement(
                      SimpleConversationProvider,
                      null,
                      React.createElement(
                        AutoAuthWrapper,
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
      )
    );
  }

  getComponentInfo() {
    return {
      name: 'SKCo.Dali.${componentName}.React',
      version: '1.0.0',
      authenticated: !!this.msalInstance?.getAllAccounts()?.length,
      isConnected: this.isConnected
    };
  }

  async forceReauth() {
    console.log('Forzando re-autenticación...');
    if (this.msalInstance) {
      try {
        await this.msalInstance.loginPopup();
        this.renderComponent();
      } catch (error) {
        console.error('Error during re-authentication:', error);
      }
    }
  }
}

customElements.define('skco-dali-${componentName.toLowerCase()}-react', ${className});
export default ${className};

if (typeof window !== 'undefined') {
  console.log('SKCo.Dali.${componentName}.React web component registered');
}`;
}
