import { graphAuthConfig, graphScopeString } from '@/config/graphAuthConfig';
import type { 
  GraphAuthState, 
  GraphCodeExchangeRequest,
  GraphCodeExchangeResponse 
} from '@/types/graph';
import { ENV } from '@/config/environment';

/**
 * Servicio para manejar el flujo de autorización OAuth 2.0 con Microsoft Graph
 * 
 * Este servicio implementa el flujo de código de autorización con PKCE que permite:
 * 1. Obtener refresh tokens para uso a largo plazo
 * 2. Enviar correos en nombre del usuario sin sesión activa
 * 3. Renovar tokens automáticamente
 */
export class GraphAuthService {
  /**
   * Genera un code verifier aleatorio para PKCE
   */
  private static generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array);
  }

  /**
   * Genera el code challenge a partir del code verifier
   */
  private static async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  /**
   * Codifica un array de bytes en base64url
   */
  private static base64UrlEncode(array: Uint8Array): string {
    const base64 = btoa(String.fromCharCode(...array));
    return base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Almacena el code verifier en sessionStorage
   */
  private static storeCodeVerifier(verifier: string): void {
    sessionStorage.setItem('graph_code_verifier', verifier);
  }

  /**
   * Recupera el code verifier de sessionStorage
   */
  private static getCodeVerifier(): string | null {
    return sessionStorage.getItem('graph_code_verifier');
  }

  /**
   * Elimina el code verifier de sessionStorage
   */
  private static removeCodeVerifier(): void {
    sessionStorage.removeItem('graph_code_verifier');
  }
  /**
   * Inicia el flujo de autorización OAuth 2.0 con PKCE
   * Redirige al usuario a la página de consentimiento de Microsoft
   * 
   * @param userId - ID del usuario que está autorizando
   * @param returnPath - Ruta opcional a la que regresar después de la autorización
   */
  static async initiateAuthFlow(userId: string, returnPath?: string): Promise<void> {
    // Generar code verifier y challenge para PKCE
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // Almacenar el code verifier para usarlo en el callback
    this.storeCodeVerifier(codeVerifier);

    // Crear state con información del usuario para validar en el callback
    const state: GraphAuthState = {
      userId,
      timestamp: Date.now(),
      returnPath,
    };

    // Codificar state en base64
    const encodedState = btoa(JSON.stringify(state));

    // Construir URL de autorización con PKCE
    const params = new URLSearchParams({
      client_id: graphAuthConfig.clientId,
      response_type: 'code',
      redirect_uri: graphAuthConfig.redirectUri,
      response_mode: 'query',
      scope: graphScopeString,
      state: encodedState,
      prompt: 'consent', // Forzar pantalla de consentimiento para obtener refresh token
      code_challenge: codeChallenge,
      code_challenge_method: 'S256', // SHA-256
    });

    // Redirigir a Microsoft para autorización
    const authUrl = `${graphAuthConfig.authEndpoint}?${params.toString()}`;
    window.location.href = authUrl;
  }

  /**
   * Maneja el callback después de la autorización de Microsoft
   * Intercambia el código de autorización por tokens en el backend
   * 
   * @param code - Código de autorización recibido de Microsoft
   * @param state - State codificado para validación
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @returns Respuesta del backend con información de la autorización
   */
  static async handleCallback(
    code: string,
    state: string,
    b2cIdToken: string
  ): Promise<GraphCodeExchangeResponse> {
    try {
      // Recuperar el code verifier almacenado
      // const codeVerifier = this.getCodeVerifier();
      // if (!codeVerifier) {
      //   throw new Error('Code verifier no encontrado. El proceso de autorización puede haber expirado.');
      // }

      // Decodificar y validar state
      const stateData: GraphAuthState = JSON.parse(atob(state));

      // Validar que el state no sea muy antiguo (máximo 10 minutos)
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - stateData.timestamp > tenMinutes) {
        throw new Error('El proceso de autorización ha expirado. Por favor, intenta de nuevo.');
      }

      // Preparar request para el backend (incluir code verifier para PKCE)
      const request: GraphCodeExchangeRequest = {
        code,
        redirectUri: graphAuthConfig.redirectUri,
        userId: stateData.userId,
        // codeVerifier, // Agregar code verifier para PKCE SPA
      };

      // Intercambiar código por tokens en el backend
      const response = await fetch(
        `${ENV.CRM_API_BASE_URL}/api/graph/exchange-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${b2cIdToken}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 'Error al completar la autorización con Microsoft'
        );
      }

      const data: GraphCodeExchangeResponse = await response.json();

      // Limpiar el code verifier después de usarlo
      this.removeCodeVerifier();

      return data;
    } catch (error) {
      // Limpiar el code verifier en caso de error
      this.removeCodeVerifier();
      console.error('Error en handleCallback:', error);
      throw error;
    }
  }

  /**
   * Decodifica el state del callback para obtener información
   * 
   * @param encodedState - State codificado en base64
   * @returns Datos del state decodificados
   */
  static decodeState(encodedState: string): GraphAuthState {
    try {
      return JSON.parse(atob(encodedState));
    } catch (error) {
      throw new Error('State inválido en el callback de autorización');
    }
  }

  /**
   * Valida los parámetros del callback
   * 
   * @param searchParams - URLSearchParams del callback
   * @returns Object con code y state si son válidos
   * @throws Error si los parámetros son inválidos
   */
  static validateCallbackParams(searchParams: URLSearchParams): {
    code: string;
    state: string;
  } {
    const error = searchParams.get('error');
    if (error) {
      const errorDescription = searchParams.get('error_description') || 'Error desconocido';
      throw new Error(`Error de autorización: ${errorDescription}`);
    }

    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      throw new Error('Parámetros de callback inválidos');
    }

    return { code, state };
  }
}
