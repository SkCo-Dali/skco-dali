
import { Configuration, PopupRequest, RedirectRequest, LogLevel } from '@azure/msal-browser';
import { ENV } from '@/config/environment';

// Configuración MSAL para Microsoft Entra ID
export const msalConfig: Configuration = {
    auth: {
         knownAuthorities: ENV.ENTRA_TENANT_NAME == 'microsoft' ? undefined : [`${ENV.ENTRA_TENANT_NAME}.b2clogin.com`],
        clientId: ENV.AZURE_CLIENT_ID,
        authority: ENV.AZURE_AUTHORITY,
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
                        console.error(message);
                        return;
                    case LogLevel.Info:
                        console.info(message);
                        return;
                    case LogLevel.Verbose:
                        console.debug(message);
                        return;
                    case LogLevel.Warning:
                        console.warn(message);
                        return;
                }
            },
        }
    }
};

// Scopes optimizados para Microsoft Graph API
export const loginRequest: RedirectRequest = {
  scopes: ENV.REQUIRED_SCOPES,

};
