
// Environment configuration - centralized management of all environment variables
export const ENV = {
  // Azure/Microsoft Authentication - B2C (APIs Organizacionales)
  AZURE_CLIENT_ID: import.meta.env.VITE_AZURE_CLIENT_ID || '0efa5aa7-89db-4916-bfe4-053728eef63d',
  AZURE_TENANT_ID: import.meta.env.VITE_AZURE_TENANT_ID || '08271f42-81ef-45d6-81ac-49776c4be615',
  ENTRA_TENANT_NAME: import.meta.env.VITE_ENTRA_TENANT_NAME || 'skcotest',
  AZURE_AUTHORITY: import.meta.env.VITE_AZURE_AUTHORITY || 'https://skcotest.b2clogin.com/skcotest.onmicrosoft.com/b2c_1a_signup_signin_userinfo',
  AUTH_LOG_LEVEL: import.meta.env.VITE_AUTH_LOG_LEVEL || 1, // 0 = Error, 1 = Warning, 2 = Info, 3 = Verbose, 4 = Trace
  PII_LOGGING_ENABLED: import.meta.env.VITE_PII_LOGGING_ENABLED === 'true' || false,
  USER_INFO_URL: import.meta.env.VITE_USER_INFO_URL || 'https://skcotest.b2clogin.com/0db6dbc3-6908-4517-a7f2-81ea685a25e2/b2c_1a_signup_signin_userinfo/openid/v2.0/userinfo',

  // B2C Configuration (APIs Organizacionales)
  B2C_CLIENT_ID: import.meta.env.VITE_B2C_CLIENT_ID || import.meta.env.VITE_AZURE_CLIENT_ID || '0efa5aa7-89db-4916-bfe4-053728eef63d',
  B2C_TENANT_ID: import.meta.env.VITE_B2C_TENANT_ID || import.meta.env.VITE_AZURE_TENANT_ID || '08271f42-81ef-45d6-81ac-49776c4be615',
  B2C_TENANT_NAME: import.meta.env.VITE_B2C_TENANT_NAME || import.meta.env.VITE_ENTRA_TENANT_NAME || 'skcotest',
  B2C_AUTHORITY: import.meta.env.VITE_B2C_AUTHORITY || import.meta.env.VITE_AZURE_AUTHORITY || 'https://skcotest.b2clogin.com/skcotest.onmicrosoft.com/b2c_1a_signup_signin_userinfo',
  B2C_SCOPES: import.meta.env.VITE_B2C_SCOPES || '0efa5aa7-89db-4916-bfe4-053728eef63d,offline_access,openid',

  // B2E Configuration (Microsoft Graph API)
  B2E_CLIENT_ID: import.meta.env.VITE_B2E_CLIENT_ID || '',
  B2E_TENANT_ID: import.meta.env.VITE_B2E_TENANT_ID || '',
  B2E_AUTHORITY: import.meta.env.VITE_B2E_AUTHORITY || '',
  B2E_SCOPES: import.meta.env.VITE_B2E_SCOPES || 'User.Read,Mail.Send,Mail.Read,Calendars.Read,offline_access',

  // Microsoft Graph API
  GRAPH_API_BASE_URL: import.meta.env.VITE_GRAPH_API_BASE_URL || 'https://graph.microsoft.com/v1.0',
  
  // Backend APIs
  CRM_API_BASE_URL: import.meta.env.VITE_CRM_API_BASE_URL || 'https://skcodalilmdev.azurewebsites.net',
  AI_API_BASE_URL: import.meta.env.VITE_AI_API_BASE_URL || 'https://skcoDaliAIDev.azurewebsites.net',
  TEMPLATES_API_BASE_URL: import.meta.env.VITE_TEMPLATES_API_BASE_URL || 'https://skcodaliaidev.azurewebsites.net',
  MAESTRO_API_BASE_URL: import.meta.env.VITE_MAESTRO_API_BASE_URL || 'https://skcoaimultiagentdev.azurewebsites.net',
  MARKET_DALI_API_BASE_URL: import.meta.env.VITE_MARKET_DALI_API_BASE_URL || 'https://skcomarketdali-hmd6ddbke7akbfaz.eastus2-01.azurewebsites.net',
  
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
  REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin + window.location.pathname,
  
  // Application Settings
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Skandia CRM',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Session Configuration
  CACHE_LOCATION: import.meta.env.VITE_CACHE_LOCATION || 'sessionStorage',
  STORE_AUTH_STATE_IN_COOKIE: import.meta.env.VITE_STORE_AUTH_STATE_IN_COOKIE === 'true' || false,
  
  // Security Settings
  ALLOWED_DOMAINS: (import.meta.env.VITE_ALLOWED_DOMAINS || 'skandia.com,skandia.co,skandia.com.co,fp.skandia.com.co').split(','),
  ENABLE_DOMAIN_VALIDATION: import.meta.env.VITE_ENABLE_DOMAIN_VALIDATION !== 'false',
  
  // Required Scopes (Legacy - usa B2C_SCOPES en su lugar)
  REQUIRED_SCOPES: (import.meta.env.VITE_REQUIRED_SCOPES || '0efa5aa7-89db-4916-bfe4-053728eef63d,offline_access,openid').split(','),
} as const;

// Validation function to ensure critical environment variables are set
export const validateEnvironment = () => {
  const requiredVars = [
    'AZURE_CLIENT_ID',
    'AZURE_TENANT_ID',
    'CRM_API_BASE_URL',
    'AI_API_BASE_URL',
    'B2C_CLIENT_ID',
    'B2C_TENANT_ID'
  ];

  const missing = requiredVars.filter(key => !ENV[key as keyof typeof ENV]);

  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
  }

  return missing.length === 0;
};
