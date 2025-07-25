
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

// Componente de autenticación automática
const AutoAuthWrapper = ({ children, Component }) => {
  const { useAuth } = require('../src/contexts/AuthContext');
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

// Función helper para crear web component individual
export function createWebComponent(Component, componentName, additionalProviders = []) {
  class CustomWebComponent extends HTMLElement {
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
      this.props = {};
    }

    static get observedAttributes() {
      return ['data-props'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'data-props' && newValue !== oldValue) {
        try {
          this.props = JSON.parse(newValue) || {};
          if (this.root) {
            this.renderComponent();
          }
        } catch (error) {
          console.warn(`Error parsing props for ${componentName}:`, error);
        }
      }
    }

    connectedCallback() {
      const shadow = this.attachShadow({ mode: 'open' });
      
      // Crear contenedor
      const container = document.createElement('div');
      container.style.cssText = `
        width: 100%;
        height: 100%;
        overflow: auto;
      `;
      shadow.appendChild(container);

      // Copiar estilos
      this.copyStyles(shadow);

      // Crear root de React
      this.root = ReactDOM.createRoot(container);
      this.renderComponent();
    }

    disconnectedCallback() {
      if (this.root) {
        this.root.unmount();
      }
    }

    copyStyles(shadow) {
      // Copiar todas las hojas de estilo
      const existingStyles = document.querySelectorAll('style, link[rel="stylesheet"]');
      existingStyles.forEach(style => {
        const clonedStyle = style.cloneNode(true);
        shadow.appendChild(clonedStyle);
      });

      // Agregar estilos del host
      const hostStyles = document.createElement('style');
      hostStyles.textContent = `
        :host {
          display: block;
          width: 100%;
          height: 100%;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      shadow.appendChild(hostStyles);
    }

    renderComponent() {
      // Crear el árbol de proveedores
      let element = React.createElement(Component, this.props);
      
      // Aplicar proveedores adicionales
      additionalProviders.reverse().forEach(Provider => {
        element = React.createElement(Provider, null, element);
      });

      // Envolver en AutoAuthWrapper y proveedores base
      element = React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          QueryClientProvider,
          { client: this.queryClient },
          React.createElement(
            BrowserRouter,
            null,
            React.createElement(
              AutoAuthWrapper,
              { Component },
              element
            )
          )
        )
      );

      this.root.render(element);
    }

    // API pública para actualizar props
    updateProps(newProps) {
      this.props = { ...this.props, ...newProps };
      this.setAttribute('data-props', JSON.stringify(this.props));
    }

    // API pública para obtener el estado del componente
    getComponentState() {
      return {
        props: this.props,
        isConnected: this.isConnected
      };
    }
  }

  return CustomWebComponent;
}

// Crear componentes individuales con sus proveedores específicos
export function createLeadsWebComponent() {
  const { AuthProvider } = require('../src/contexts/AuthContext');
  const { NotificationProvider } = require('../src/contexts/NotificationContext');
  const Leads = require('../src/pages/Leads').default;
  
  return createWebComponent(
    Leads, 
    'crm-leads-standalone',
    [NotificationProvider, AuthProvider]
  );
}

export function createChatDaliWebComponent() {
  const { AuthProvider } = require('../src/contexts/AuthContext');
  const { NotificationProvider } = require('../src/contexts/NotificationContext');
  const { SimpleConversationProvider } = require('../src/contexts/SimpleConversationContext');
  const { ThemeProvider } = require('../src/contexts/ThemeContext');
  const { SettingsProvider } = require('../src/contexts/SettingsContext');
  const ChatDali = require('../src/pages/ChatDali').default;
  
  return createWebComponent(
    ChatDali,
    'crm-chat-dali-standalone',
    [SettingsProvider, ThemeProvider, SimpleConversationProvider, NotificationProvider, AuthProvider]
  );
}

export function createDashboardWebComponent() {
  const { AuthProvider } = require('../src/contexts/AuthContext');
  const { NotificationProvider } = require('../src/contexts/NotificationContext');
  const Dashboard = require('../src/pages/Dashboard').default;
  
  return createWebComponent(
    Dashboard,
    'crm-dashboard-standalone',
    [NotificationProvider, AuthProvider]
  );
}

export function createInformesWebComponent() {
  const { AuthProvider } = require('../src/contexts/AuthContext');
  const { NotificationProvider } = require('../src/contexts/NotificationContext');
  const Informes = require('../src/pages/Informes').default;
  
  return createWebComponent(
    Informes,
    'crm-informes-standalone',
    [NotificationProvider, AuthProvider]
  );
}

// Función para registrar componentes individuales
export function registerIndividualComponents() {
  const components = [
    { name: 'crm-leads-standalone', factory: createLeadsWebComponent },
    { name: 'crm-chat-dali-standalone', factory: createChatDaliWebComponent },
    { name: 'crm-dashboard-standalone', factory: createDashboardWebComponent },
    { name: 'crm-informes-standalone', factory: createInformesWebComponent }
  ];

  components.forEach(({ name, factory }) => {
    if (!customElements.get(name)) {
      customElements.define(name, factory());
    }
  });
}
