
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Importar las páginas principales
import Leads from '../src/pages/Leads';
import ChatDali from '../src/pages/ChatDali';
import Dashboard from '../src/pages/Dashboard';
import Informes from '../src/pages/Informes';

// Importar contextos necesarios
import { AuthProvider } from '../src/contexts/AuthContext';
import { NotificationProvider } from '../src/contexts/NotificationContext';
import { SimpleConversationProvider } from '../src/contexts/SimpleConversationContext';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';

// Importar CSS
import '../src/index.css';

// Componente de autenticación automática
const AutoAuthWrapper = ({ children, Component }) => {
  const { useAuth } = require('../src/contexts/AuthContext');
  const { MicrosoftAuth } = require('../src/components/MicrosoftAuth');
  const { useState, useEffect } = require('react');

  const { user, loading, msalInstance, login } = useAuth();
  const [isAutoAuthenticating, setIsAutoAuthenticating] = useState(false);

  // Función para ejecutar autenticación automática
  const executeAutoAuth = async () => {
    if (isAutoAuthenticating || user || loading) return;
    
    setIsAutoAuthenticating(true);
    
    try {
      const { loginRequest } = require('../src/authConfig');
      const { getUserByEmail, createUser } = require('../src/utils/userApiClient');
      const { TokenValidationService } = require('../src/services/tokenValidationService');
      const { getUserRoleByEmail } = require('../src/utils/userRoleService');
      const SecureTokenManager = require('../src/utils/secureTokenManager').default;

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
            headers: { Authorization: `Bearer ${accessToken}` },
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

class BaseWebComponent extends HTMLElement {
  constructor(Component, componentName) {
    super();
    this.Component = Component;
    this.componentName = componentName;
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
    container.style.width = '100%';
    container.style.height = '100%';
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
      const clonedStyle = style.cloneNode(true);
      shadow.appendChild(clonedStyle);
    });

    // Agregar estilos específicos para el web component
    const componentStyles = document.createElement('style');
    componentStyles.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100vh;
        overflow: auto;
      }
      
      * {
        box-sizing: border-box;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    shadow.appendChild(componentStyles);
  }

  renderComponent() {
    const { Component } = this;
    
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
                        { Component },
                        React.createElement(Component)
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

  // Método para actualizar props si es necesario
  updateProps(newProps) {
    this.props = { ...this.props, ...newProps };
    if (this.root) {
      this.renderComponent();
    }
  }
}

// Crear web components específicos para cada página
class LeadsWebComponent extends BaseWebComponent {
  constructor() {
    super(Leads, 'crm-leads');
  }
}

class ChatDaliWebComponent extends BaseWebComponent {
  constructor() {
    super(ChatDali, 'crm-chat-dali');
  }
}

class DashboardWebComponent extends BaseWebComponent {
  constructor() {
    super(Dashboard, 'crm-dashboard');
  }
}

class InformesWebComponent extends BaseWebComponent {
  constructor() {
    super(Informes, 'crm-informes');
  }
}

// Función para registrar todos los web components
export function registerCRMWebComponents() {
  // Verificar si ya están registrados
  if (!customElements.get('crm-leads')) {
    customElements.define('crm-leads', LeadsWebComponent);
  }
  
  if (!customElements.get('crm-chat-dali')) {
    customElements.define('crm-chat-dali', ChatDaliWebComponent);
  }
  
  if (!customElements.get('crm-dashboard')) {
    customElements.define('crm-dashboard', DashboardWebComponent);
  }
  
  if (!customElements.get('crm-informes')) {
    customElements.define('crm-informes', InformesWebComponent);
  }
}

// Auto-registrar si se ejecuta directamente
if (typeof window !== 'undefined') {
  registerCRMWebComponents();
}

// Exportar para uso manual
export {
  LeadsWebComponent,
  ChatDaliWebComponent,
  DashboardWebComponent,
  InformesWebComponent
};
