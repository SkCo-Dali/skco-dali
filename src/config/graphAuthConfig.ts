/**
 * Configuración de Microsoft Graph OAuth 2.0
 *
 * Esta configuración se usa para obtener permisos delegados del usuario
 * para enviar correos en su nombre, incluso cuando no tiene sesión activa.
 *
 * IMPORTANTE: Esta es una aplicación separada de Azure AD B2C
 * Debe registrarse en Azure AD (no B2C) para acceder a Microsoft Graph
 */

export const graphAuthConfig = {
  // ID de la aplicación registrada en Azure AD para Microsoft Graph
  clientId: import.meta.env.VITE_GRAPH_CLIENT_ID || "2cc89bfe-6192-40e2-80a8-fd218121c623",

  // Tenant ID de Skandia Colombia (obtener desde Azure AD Portal)
  tenantId: import.meta.env.VITE_GRAPH_TENANT_ID || "common",

  // Authority para autenticación single-tenant
  // Usa el tenant ID específico de la organización
  get authority() {
    return `https://login.microsoftonline.com/${this.tenantId}`;
  },

  // URL de redirección después de la autorización
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/graph-callback` : "",

  // URL para el endpoint de tokens
  get tokenEndpoint() {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
  },

  // URL para el endpoint de autorización
  get authEndpoint() {
    return `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/authorize`;
  },
};

/**
 * Scopes necesarios para enviar correos en nombre del usuario
 *
 * - offline_access: CRÍTICO - Necesario para obtener refresh tokens
 * - Mail.Send: Permite enviar correos como el usuario
 * - Mail.Read: Permite leer correos del usuario
 * - User.Read: Permite leer el perfil básico del usuario
 * - MailboxSettings.Read: Permite leer configuración de buzón (firmas de Outlook)
 * - Calendars.Read: Permite leer calendario del usuario
 */
export const graphScopes = [
  "offline_access", // Necesario para refresh token
  "Mail.Send", // Enviar correos
  "Mail.Read", // Leer correos
  "User.Read", // Leer perfil básico
  "MailboxSettings.Read", // Leer configuración de buzón y firmas
  "Calendars.Read", // Leer calendario
  "openid", // OpenID Connect
];

/**
 * Scope string formateado para las peticiones OAuth
 */
export const graphScopeString = graphScopes.join(" ");
