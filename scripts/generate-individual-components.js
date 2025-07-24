
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

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

      // Envolver en proveedores base
      element = React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          QueryClientProvider,
          { client: this.queryClient },
          React.createElement(
            BrowserRouter,
            null,
            element
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
