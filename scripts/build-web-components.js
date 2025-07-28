
import { defineConfig, build } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    minify: 'esbuild',
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
import {useState, useEffect} from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { PublicClientApplication } from '@azure/msal-browser';

// Importar la página específica
import ${componentName} from '../src/pages/${componentName}';

// Importar contextos necesarios
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { SimpleConversationProvider } from '../src/contexts/SimpleConversationContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';

// Importar configuración de autenticación
import { msalConfig } from '../src/authConfig';


import { loginRequest } from '../src/authConfig';
import { getUserByEmail, createUser } from '../src/utils/userApiClient';
import { TokenValidationService } from '../src/services/tokenValidationService';
import { getUserRoleByEmail } from '../src/utils/userRoleService';
import SecureTokenManager from '../src/utils/secureTokenManager';

// Importar CSS
import '../src/index.css';

// Componente de autenticación automática
const AutoAuthWrapper = ({ children, Component }) => {

  const { user, loading, msalInstance, login } = useAuth();
  const [isAutoAuthenticating, setIsAutoAuthenticating] = useState(false);

  // Función para ejecutar autenticación automática
  const executeAutoAuth = async () => {
    if (isAutoAuthenticating || user || loading) return;
    
    setIsAutoAuthenticating(true);
    
    try {

      // Paso 1: Obtener token de MSAL
      const response = await msalInstance.loginPopup({
        ...loginRequest,
        prompt: 'select_account'
      });
      
      if (!response || !response.account || !response.accessToken) {
        throw new Error('Respuesta de autenticación incompleta');
      }
      
      // Paso 2: Validar token
      const tokenValidation = await TokenValidationService.validateAccessToken(response.accessToken);
      
      if (!tokenValidation.isValid || !tokenValidation.userInfo) {
        throw new Error(tokenValidation.error || 'Token de acceso inválido');
      }

      const { userInfo } = tokenValidation;
      
      // Paso 3: Validar dominio del email
      if (!TokenValidationService.validateEmailDomain(userInfo.email)) {
        throw new Error('El email no pertenece a un dominio autorizado');
      }

      // Almacenar idToken para uso con el backend
      SecureTokenManager.storeToken({
        token: response.idToken,
        expiresAt: response.expiresOn.getTime(),
        refreshToken: response.account.homeAccountId || '',
      });
      
      // Paso 4: Obtener foto del perfil
      const getUserPhoto = async (accessToken) => {
        try {
          const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
            headers: { Authorization: \`Bearer \${accessToken}\` },
          });
          
          if (photoResponse.ok) {
            const photoBlob = await photoResponse.blob();
            return URL.createObjectURL(photoBlob);
          }
          return null;
        } catch (error) {
          return null;
        }
      };

      const userPhoto = await getUserPhoto(response.accessToken);
      
      // Paso 5: Buscar o crear usuario en base de datos
      const findOrCreateUser = async (email, name) => {
        try {
          let existingUser = await getUserByEmail(email);
          
          if (existingUser) {
            sessionStorage.setItem('authenticated-user-uuid', existingUser.id);
            return existingUser;
          }
          
          const assignedRole = await getUserRoleByEmail(email);
          const newUser = await createUser({
            name,
            email,
            role: assignedRole,
            isActive: true
          });
          
          sessionStorage.setItem('authenticated-user-uuid', newUser.id);
          return newUser;
          
        } catch (error) {
          throw new Error('No se pudo crear o encontrar el usuario en la base de datos');
        }
      };

      const dbUser = await findOrCreateUser(userInfo.email, userInfo.name);
      
      // Paso 6: Crear objeto de usuario final
      const finalUser = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        avatar: userPhoto,
        zone: dbUser.zone || 'Skandia',
        team: dbUser.team || 'Equipo Skandia',
        jobTitle: userInfo.jobTitle || 'Usuario',
        isActive: dbUser.isActive,
        createdAt: dbUser.createdAt || new Date().toISOString()
      };
      
      // Paso 7: Completar login
      login(finalUser);
      
    } catch (error) {
      console.error('Error en autenticación automática:', error);
      
      // Mostrar mensaje de error sin comprometer la seguridad
      let errorMessage = 'Error durante la autenticación automática';
      
      if (error.errorCode === 'user_cancelled') {
        errorMessage = 'Autenticación cancelada por el usuario';
      } else if (error.errorCode === 'popup_blocked') {
        errorMessage = 'El popup fue bloqueado. Por favor, permite popups para este sitio.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // En un web component, usamos console.error en lugar de alert
      console.error('Error de autenticación:', errorMessage);
      
    } finally {
      setIsAutoAuthenticating(false);
    }
  };

  // Ejecutar autenticación automática cuando no hay usuario
  useEffect(() => {
    if (!loading && !user && !isAutoAuthenticating) {
      executeAutoAuth();
    }
  }, [user, loading, isAutoAuthenticating]);

  // Mostrar loading mientras se autentica
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

  // Si no hay usuario después de intentar autenticar, mostrar error
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
      }, 'No se pudo autenticar automáticamente'),
      React.createElement('p', {
        key: 'help',
        style: { color: '#666', fontSize: '14px' }
      }, 'Verifica tu conexión y permisos de popup')
    ]);
  }

  return children;
};

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
    const shadow = this.shadowRoot ? this.shadowRoot : this.attachShadow({ mode: 'open' });

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
                      React.createElement(
                        AutoAuthWrapper,
                        { Component: ${componentName} },
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
    console.log('Forzando re-autenticación...');
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
      console.log(`🔨 Construyendo ${component}...`);
      
      // Generar archivo de entrada individual
      const entryFile = await generateIndividualComponent(component);
      
      // Configurar build específico
      const config = createWebComponentConfig(entryFile, component, outDir);
      
      // Ejecutar build
      await build(config);
      
      // Limpiar archivo temporal
      fs.unlinkSync(path.join(__dirname, entryFile));
      
      console.log(`✅ ${component} construido exitosamente`);
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
</html>`;

    fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);
    
    console.log('✅ Todos los web components generados exitosamente en dist/web-components/');
    console.log('📦 Archivos generados:');
    
    components.forEach(component => {
      console.log(`  - SK.Dali.${component}.React.js`);
      console.log(`  - SK.Dali.${component}.React.css`);
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
