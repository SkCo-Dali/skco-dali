import { ENV } from "@/config/environment";
import type { GraphTokenData, GraphAuthorizationStatus, GraphTokenRefreshResponse } from "@/types/graph";

/**
 * Servicio para gestionar tokens de Microsoft Graph
 *
 * Responsabilidades:
 * - Verificar si un usuario tiene autorización válida
 * - Renovar access tokens automáticamente usando refresh tokens
 * - Revocar autorizaciones
 * - Obtener tokens válidos para uso en operaciones de Graph API
 */
export class GraphTokenManager {
  // Buffer de tiempo antes de la expiración para renovar el token
  private static readonly TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene un access token válido para el usuario
   * Si el token está por expirar, lo renueva automáticamente
   *
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @param userId - ID del usuario
   * @returns Access token válido de Microsoft Graph
   */
  static async getValidAccessToken(b2cIdToken: string, userId: string): Promise<string> {
    const tokenData = await this.getStoredTokenData(b2cIdToken, userId);

    if (!tokenData) {
      throw new Error("Usuario no ha autorizado acceso a Microsoft Graph");
    }

    // Verificar si el token está por expirar
    const now = new Date().getTime();
    const expiresAt = new Date(tokenData.expiresAt).getTime();

    if (expiresAt - now < this.TOKEN_EXPIRY_BUFFER) {
      // Token expirado o por expirar, renovar
      const refreshResponse = await this.refreshAccessToken(b2cIdToken, userId);
      return refreshResponse.accessToken;
    }

    return tokenData.accessToken;
  }

  /**
   * Renueva el access token usando el refresh token almacenado en el backend
   *
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @param userId - ID del usuario
   * @returns Nueva información del access token
   */
  private static async refreshAccessToken(b2cIdToken: string, userId: string): Promise<GraphTokenRefreshResponse> {
    const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/graph/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${b2cIdToken}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al renovar token de Microsoft Graph");
    }

    const data: GraphTokenRefreshResponse = await response.json();
    return data;
  }

  /**
   * Obtiene los datos del token almacenados en el backend
   *
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @param userId - ID del usuario
   * @returns Datos del token o null si no existe autorización
   */
  private static async getStoredTokenData(b2cIdToken: string, userId: string): Promise<GraphTokenData | null> {
    try {
      const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/graph/token-data/${userId}`, {
        headers: {
          Authorization: `Bearer ${b2cIdToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Usuario no ha autorizado
        }
        throw new Error("Error al obtener datos del token");
      }

      return await response.json();
    } catch (error) {
      console.error("Error obteniendo token data:", error);
      return null;
    }
  }

  /**
   * Verifica si el usuario tiene una autorización válida de Microsoft Graph
   *
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @param userId - ID del usuario
   * @returns Estado de la autorización
   */
  static async getAuthorizationStatus(b2cIdToken: string, userId: string): Promise<GraphAuthorizationStatus> {
    try {
      const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/graph/status`, {
        headers: {
          Authorization: `Bearer ${b2cIdToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { isAuthorized: false };
        }
        throw new Error("Error al verificar estado de autorización");
      }

      return await response.json();
    } catch (error) {
      console.error("Error verificando autorización:", error);
      return { isAuthorized: false };
    }
  }

  /**
   * Verifica si el usuario tiene autorización válida (método simplificado)
   *
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @param userId - ID del usuario
   * @returns true si tiene autorización válida
   */
  static async hasValidAuthorization(b2cIdToken: string, userId: string): Promise<boolean> {
    const status = await this.getAuthorizationStatus(b2cIdToken, userId);
    return status.isAuthorized;
  }

  /**
   * Revoca la autorización del usuario
   * Elimina los tokens almacenados en el backend
   *
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @param userId - ID del usuario
   */
  static async revokeAuthorization(b2cIdToken: string, userId: string): Promise<void> {
    const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/graph/revoke/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${b2cIdToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al revocar autorización");
    }
  }

  /**
   * Envía un correo en nombre del usuario usando Microsoft Graph
   *
   * @param b2cIdToken - Token de ID de B2C para autenticar con el backend
   * @param userId - ID del usuario
   * @param emailData - Datos del correo a enviar
   */
  static async sendEmailOnBehalf(
    b2cIdToken: string,
    userId: string,
    emailData: {
      to: string[];
      subject: string;
      body: string;
      isHtml?: boolean;
      cc?: string[];
      bcc?: string[];
    },
  ): Promise<void> {
    const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/graph/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${b2cIdToken}`,
      },
      body: JSON.stringify({
        userId,
        ...emailData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al enviar correo");
    }
  }
}
