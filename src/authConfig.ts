
import { Configuration, PopupRequest } from '@azure/msal-browser';
import { ENV } from '@/config/environment';

// Configuración MSAL para Microsoft Entra ID
export const msalConfig: Configuration = {
  auth: {
    clientId: ENV.AZURE_CLIENT_ID,
    authority: ENV.AZURE_AUTHORITY,
    redirectUri: ENV.REDIRECT_URI,
  },
  cache: {
    cacheLocation: ENV.CACHE_LOCATION as 'localStorage' | 'sessionStorage',
    storeAuthStateInCookie: ENV.STORE_AUTH_STATE_IN_COOKIE,
  },
};

// Scopes optimizados para Microsoft Graph API
export const loginRequest: PopupRequest = {
  scopes: ENV.REQUIRED_SCOPES,
};
