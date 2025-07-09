
import { Configuration, PopupRequest } from '@azure/msal-browser';

// Configuración MSAL para Microsoft Entra ID
export const msalConfig: Configuration = {
  auth: {
    clientId: '2cc89bfe-6192-40e2-80a8-fd218121c623', // Reemplazar con tu Client ID real
    authority: 'https://login.microsoftonline.com/08271f42-81ef-45d6-81ac-49776c4be615',
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
};

// Scopes optimizados para Microsoft Graph API
export const loginRequest: PopupRequest = {
  scopes: [
    'User.Read',              // Datos básicos del perfil + foto
    'Mail.Send',              // Enviar correos en nombre del usuario
    'Mail.Read',              // Leer correos para validaciones
    'offline_access'          // Para renovación automática de tokens
  ],
};

// Removido: calendarRequest ya no es necesario
