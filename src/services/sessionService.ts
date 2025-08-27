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
    console.log('🚀 SessionService.startSession called');
    console.log('🔐 AccessToken available:', !!accessToken);
    console.log('🔐 AccessToken length:', accessToken?.length || 0);
    console.log('🔐 AccessToken preview:', accessToken?.substring(0, 50) + '...');
    console.log('🌐 BASE_URL:', BASE_URL);
    console.log('📍 Full endpoint:', `${BASE_URL}/api/sessions`);
    console.log('🖥️ UserAgent:', userAgent);
    console.log('📡 IP Address:', ipAddress);

    const requestBody = {
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent })
    };
    
    console.log('📦 Request body:', JSON.stringify(requestBody, null, 2));

    // Log complete request details
    const requestHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };
    
    console.log('📤 === HTTP REQUEST DETAILS ===');
    console.log('📍 Method: POST');
    console.log('📍 URL:', `${BASE_URL}/api/sessions`);
    console.log('📍 Headers:', {
      'Authorization': `Bearer ${accessToken.substring(0, 50)}...${accessToken.substring(accessToken.length - 20)}`,
      'Content-Type': requestHeaders['Content-Type']
    });
    console.log('📍 Body:', JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(`${BASE_URL}/api/sessions`, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
      });

      console.log('📊 Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Response error text:', error);
        throw new Error(`Error al iniciar sesión: ${response.status} - ${error}`);
      }

      const responseData = await response.json();
      console.log('✅ Session started successfully');
      console.log('📦 Response data keys:', Object.keys(responseData));
      console.log('🔐 Session token preview:', responseData.sessionToken?.substring(0, 30) + '...');
      console.log('🆔 Session ID:', responseData.sessionId);
      console.log('⏰ Expires at:', responseData.expiresAt);

      return responseData;
    } catch (error) {
      console.error('❌ SessionService.startSession error:', error);
      throw error;
    }
  }

  /**
   * Mantiene viva la sesión (heartbeat)
   */
  static async heartbeat(sessionToken: string): Promise<HeartbeatResponse> {
    console.log('💓 SessionService.heartbeat called');
    console.log('🔐 Session token preview:', sessionToken?.substring(0, 30) + '...');
    console.log('📍 Full endpoint:', `${BASE_URL}/api/sessions/heartbeat`);

    try {
      const response = await fetch(`${BASE_URL}/api/sessions/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sessionToken })
      });

      console.log('📊 Heartbeat response status:', response.status);
      console.log('📊 Heartbeat response ok:', response.ok);

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Heartbeat error text:', error);
        throw new Error(`Error en heartbeat: ${response.status} - ${error}`);
      }

      const responseData = await response.json();
      console.log('✅ Heartbeat successful');
      console.log('⏰ Seconds to expiry:', responseData.secondsToExpiry);

      return responseData;
    } catch (error) {
      console.error('❌ SessionService.heartbeat error:', error);
      throw error;
    }
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