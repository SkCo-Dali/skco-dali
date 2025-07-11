
// Environment configuration - centralized management of all environment variables
export const ENV = {
  // Azure/Microsoft Authentication
  AZURE_CLIENT_ID: import.meta.env.VITE_AZURE_CLIENT_ID || '2cc89bfe-6192-40e2-80a8-fd218121c623',
  AZURE_TENANT_ID: import.meta.env.VITE_AZURE_TENANT_ID || '08271f42-81ef-45d6-81ac-49776c4be615',
  AZURE_AUTHORITY: import.meta.env.VITE_AZURE_AUTHORITY || 'https://login.microsoftonline.com/08271f42-81ef-45d6-81ac-49776c4be615',
  
  // Microsoft Graph API
  GRAPH_API_BASE_URL: import.meta.env.VITE_GRAPH_API_BASE_URL || 'https://graph.microsoft.com/v1.0',
  
  // Backend APIs
  CRM_API_BASE_URL: import.meta.env.VITE_CRM_API_BASE_URL || 'https://skcodalilmdev.azurewebsites.net',
  AI_API_BASE_URL: import.meta.env.VITE_AI_API_BASE_URL || 'https://skcoDaliAIDev.azurewebsites.net',
  TEMPLATES_API_BASE_URL: import.meta.env.VITE_TEMPLATES_API_BASE_URL || 'https://skcodaliaidev.azurewebsites.net',
  MAESTRO_API_BASE_URL: import.meta.env.VITE_MAESTRO_API_BASE_URL || 'https://skcoaimultiagentdev.azurewebsites.net',
  
  // Static Resources
  BLOB_RESOURCES_URL: import.meta.env.VITE_BLOB_RESOURCES_URL || 'https://skcoblobresources.blob.core.windows.net',
  AI_STUDIO_BLOB_URL: import.meta.env.VITE_AI_STUDIO_BLOB_URL || 'https://aistudiojarvis0534199251.blob.core.windows.net',
  
  // CDN URLs
  CDN_JSDELIVR_URL: import.meta.env.VITE_CDN_JSDELIVR_URL || 'https://cdn.jsdelivr.net',
  FONTS_GOOGLEAPIS_URL: import.meta.env.VITE_FONTS_GOOGLEAPIS_URL || 'https://fonts.googleapis.com',
  FONTS_GSTATIC_URL: import.meta.env.VITE_FONTS_GSTATIC_URL || 'https://fonts.gstatic.com',
  
  // Microsoft Login
  MS_LOGIN_URL: import.meta.env.VITE_MS_LOGIN_URL || 'https://login.microsoftonline.com',
  
  // Redirect URLs
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
  
  // Application Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Skandia CRM',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Session Configuration
  CACHE_LOCATION: import.meta.env.VITE_CACHE_LOCATION || 'sessionStorage',
  STORE_AUTH_STATE_IN_COOKIE: import.meta.env.VITE_STORE_AUTH_STATE_IN_COOKIE === 'true' || false,
  
  // Security Settings - Ahora más flexible para múltiples dominios
  ALLOWED_DOMAINS: (import.meta.env.VITE_ALLOWED_DOMAINS || 'skandia.com,skandia.co,skandia.com.co,gmail.com,outlook.com,hotmail.com,yahoo.com').split(','),
  
  // Configuración de validación de dominio - permite deshabilitar la validación
  ENABLE_DOMAIN_VALIDATION: import.meta.env.VITE_ENABLE_DOMAIN_VALIDATION !== 'false', // Por defecto habilitado, se puede deshabilitar
  
  // Required Scopes
  REQUIRED_SCOPES: (import.meta.env.VITE_REQUIRED_SCOPES || 'User.Read,Mail.Send,Mail.Read,offline_access').split(','),
} as const;

// Validation function to ensure critical environment variables are set
export const validateEnvironment = () => {
  const requiredVars = [
    'AZURE_CLIENT_ID',
    'AZURE_TENANT_ID',
    'CRM_API_BASE_URL',
    'AI_API_BASE_URL'
  ];
  
  const missing = requiredVars.filter(key => !ENV[key as keyof typeof ENV]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }
  
  return missing.length === 0;
};
