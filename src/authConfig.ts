
import { Configuration, PopupRequest, RedirectRequest, LogLevel, SilentRequest } from '@azure/msal-browser';
import { ENV } from '@/config/environment';

// Constantes de tipo de autenticación
export const AUTH_TYPE_B2C = 'B2C' as const;
export const AUTH_TYPE_B2E = 'B2E' as const;
export type AuthType = typeof AUTH_TYPE_B2C | typeof AUTH_TYPE_B2E;

// ============================================
// CONFIGURACIÓN B2C (APIs Organizacionales)
// ============================================

export const msalConfigB2C: Configuration = {
    auth: {
        knownAuthorities: ENV.B2C_TENANT_NAME === 'microsoft' ? undefined : [`${ENV.B2C_TENANT_NAME}.b2clogin.com`],
        clientId: ENV.B2C_CLIENT_ID,
        authority: ENV.B2C_AUTHORITY,
        redirectUri: ENV.REDIRECT_URI
    },
    cache: {
        cacheLocation: ENV.CACHE_LOCATION as 'localStorage' | 'sessionStorage',
        storeAuthStateInCookie: ENV.STORE_AUTH_STATE_IN_COOKIE,
    },
    system: {
        loggerOptions: {
            logLevel: ENV.AUTH_LOG_LEVEL,
            piiLoggingEnabled: ENV.PII_LOGGING_ENABLED,
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error('[B2C]', message);
                        return;
                    case LogLevel.Warning:
                        console.warn('[B2C]', message);
                        return;
                }
            },
        }
    }
};

export const loginRequestB2C: RedirectRequest = {
    scopes: ENV.B2C_SCOPES.split(','),
};

export const tokenRequestB2C: SilentRequest = {
    scopes: ENV.B2C_SCOPES.split(','),
    forceRefresh: false
};

// ============================================
// CONFIGURACIÓN B2E (Microsoft Graph API)
// ============================================

export const msalConfigB2E: Configuration = {
    auth: {
        clientId: ENV.B2E_CLIENT_ID,
        authority: ENV.B2E_AUTHORITY || `https://login.microsoftonline.com/${ENV.B2E_TENANT_ID}`,
        redirectUri: ENV.REDIRECT_URI
    },
    cache: {
        cacheLocation: ENV.CACHE_LOCATION as 'localStorage' | 'sessionStorage',
        storeAuthStateInCookie: ENV.STORE_AUTH_STATE_IN_COOKIE,
    },
    system: {
        loggerOptions: {
            logLevel: ENV.AUTH_LOG_LEVEL,
            piiLoggingEnabled: ENV.PII_LOGGING_ENABLED,
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case LogLevel.Error:
                        console.error('[B2E]', message);
                        return;
                    case LogLevel.Warning:
                        console.warn('[B2E]', message);
                        return;
                }
            },
        }
    }
};

export const loginRequestB2E: RedirectRequest = {
    scopes: ENV.B2E_SCOPES.split(','),
};

export const tokenRequestB2E: SilentRequest = {
    scopes: ENV.B2E_SCOPES.split(','),
    forceRefresh: false
};

// ============================================
// FUNCIONES HELPER
// ============================================

export const getMsalConfig = (authType: AuthType): Configuration => {
    return authType === AUTH_TYPE_B2C ? msalConfigB2C : msalConfigB2E;
};

export const getLoginRequest = (authType: AuthType): RedirectRequest => {
    return authType === AUTH_TYPE_B2C ? loginRequestB2C : loginRequestB2E;
};

export const getTokenRequest = (authType: AuthType): SilentRequest => {
    return authType === AUTH_TYPE_B2C ? tokenRequestB2C : tokenRequestB2E;
};

// ============================================
// CONFIGURACIONES LEGACY (Compatibilidad)
// ============================================

export const msalConfig: Configuration = msalConfigB2C;
export const loginRequest: RedirectRequest = loginRequestB2C;

// ============================================
// MICROSOFT GRAPH CONFIGURATION
// ============================================

export const graphConfig = {
    graphMeEndpoint: `${ENV.GRAPH_API_BASE_URL}/me`,
    graphMailEndpoint: `${ENV.GRAPH_API_BASE_URL}/me/messages`,
    graphPhotoEndpoint: `${ENV.GRAPH_API_BASE_URL}/me/photo/$value`,
    graphCalendarEndpoint: `${ENV.GRAPH_API_BASE_URL}/me/calendar/events`,
};
