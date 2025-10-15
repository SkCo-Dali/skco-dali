import { ENV } from '@/config/environment';

const API_BASE_URL = ENV.CRM_API_BASE_URL;

interface SessionResponse {
  sessionToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: string;
}

interface HeartbeatResponse {
  secondsToExpiry: number;
}

interface UserSession {
  sessionId: string;
  deviceInfo: string;
  ipAddress: string;
  lastActivity: string;
  isActive: boolean;
}

export class SessionService {
  /**
   * Iniciar sesión de app - POST /api/sessions
   */
  static async startSession(ipAddress?: string, userAgent?: string): Promise<SessionResponse> {

    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...(ipAddress && { ipAddress }),
        ...(userAgent && { userAgent })
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Session start failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Mantener viva la sesión - POST /api/sessions/heartbeat
   */
  static async heartbeat(sessionToken: string): Promise<HeartbeatResponse> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionToken })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Heartbeat failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Rotar/Extender sesión - POST /api/sessions/refresh
   */
  static async refreshSession(refreshToken: string): Promise<SessionResponse> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Session refresh failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Listar mis sesiones - GET /api/sessions/me
   */
  static async getMySessions(): Promise<UserSession[]> {

    const response = await fetch(`${API_BASE_URL}/api/sessions/me`, {
      method: 'GET',
      headers: {
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Get sessions failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Cerrar sesión de app - POST /api/sessions/logout
   */
  static async logout(sessionToken: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/sessions/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionToken })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Logout failed: ${response.status} ${errorText}`);
    }
  }
}