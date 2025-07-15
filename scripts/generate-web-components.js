
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
                      React.createElement(Component)
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
