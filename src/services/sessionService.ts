import { ENV } from '@/config/environment';

const BASE_URL = ENV.CRM_API_BASE_URL;

export interface SessionResponse {
  sessionToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: string;
}

export interface SessionData {
  sessionToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: Date;
}

export interface HeartbeatResponse {
  secondsToExpiry: number;
}

export interface SessionInfo {
  sessionId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
  sessionToken: string; // masked
}

export class SessionService {
  /**
   * Inicia una nueva sesión de la aplicación
   */
  static async startSession(accessToken: string, ipAddress?: string, userAgent?: string): Promise<SessionResponse> {
    const response = await fetch(`${BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent })
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al iniciar sesión: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Mantiene viva la sesión (heartbeat)
   */
  static async heartbeat(sessionToken: string): Promise<HeartbeatResponse> {
    const response = await fetch(`${BASE_URL}/api/sessions/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionToken })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error en heartbeat: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Rota/Extiende la sesión
   */
  static async refreshSession(refreshToken: string): Promise<SessionResponse> {
    const response = await fetch(`${BASE_URL}/api/sessions/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al refrescar sesión: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Lista las sesiones activas del usuario
   */
  static async getMySessions(accessToken: string): Promise<SessionInfo[]> {
    const response = await fetch(`${BASE_URL}/api/sessions/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error al obtener sesiones: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Cierra la sesión actual
   */
  static async logout(sessionToken: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/sessions/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionToken })
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn(`Error al cerrar sesión en el servidor: ${response.status} - ${error}`);
      // No lanzamos error aquí para permitir logout local incluso si falla el servidor
    }
  }
}