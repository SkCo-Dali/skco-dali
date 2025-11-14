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

  // Authority para autenticación multi-tenant
  // Permite que usuarios de cualquier organización de Microsoft autoricen
  authority: "https://login.microsoftonline.com/common",

  // URL de redirección después de la autorización
  redirectUri: typeof window !== "undefined" ? `${window.location.origin}/graph-callback` : "",

  // URL para el endpoint de tokens
  tokenEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/token",

  // URL para el endpoint de autorización
  authEndpoint: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize",
};

/**
 * Scopes necesarios para enviar correos en nombre del usuario
 *
 * - offline_access: CRÍTICO - Necesario para obtener refresh tokens
 * - Mail.Send: Permite enviar correos como el usuario
 * - User.Read: Permite leer el perfil básico del usuario
 */
export const graphScopes = [
  "offline_access", // Necesario para refresh token
  "Mail.Send", // Enviar correos
  "User.Read", // Leer perfil básico
  //"Calendars.Read",
  //"MailboxSettings.Read",
  "openid",
  //"profile",
  //"Mail.Read",
];

/**
 * Scope string formateado para las peticiones OAuth
 */
export const graphScopeString = graphScopes.join(" ");
