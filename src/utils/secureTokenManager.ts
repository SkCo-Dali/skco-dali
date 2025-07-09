
import { ENV } from '@/config/environment';

interface TokenData {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

export class SecureTokenManager {
  private static readonly TOKEN_KEY = 'auth_token_data';
  private static readonly REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutos

  /**
   * Almacena token de forma segura
   */
  static storeToken(tokenData: TokenData): void {
    try {
      // Usar sessionStorage en lugar de localStorage para mayor seguridad
      const encryptedData = this.encryptData(JSON.stringify(tokenData));
      sessionStorage.setItem(this.TOKEN_KEY, encryptedData);
    } catch (error) {
      throw new Error('Error al almacenar token de autenticación');
    }
  }

  /**
   * Recupera token almacenado
   */
  static getToken(): TokenData | null {
    try {
      const encryptedData = sessionStorage.getItem(this.TOKEN_KEY);
      if (!encryptedData) {
        return null;
      }

      const decryptedData = this.decryptData(encryptedData);
      const tokenData: TokenData = JSON.parse(decryptedData);

      // Verificar si el token no ha expirado
      if (this.isTokenExpired(tokenData)) {
        this.clearToken();
        return null;
      }

      return tokenData;
    } catch (error) {
      this.clearToken();
      return null;
    }
  }

  /**
   * Limpia token almacenado
   */
  static clearToken(): void {
    try {
      sessionStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      // Silenciar error de limpieza
    }
  }

  /**
   * Verifica si el token necesita ser renovado
   */
  static shouldRefreshToken(tokenData: TokenData): boolean {
    const timeUntilExpiry = tokenData.expiresAt - Date.now();
    return timeUntilExpiry < this.REFRESH_THRESHOLD;
  }

  /**
   * Verifica si el token ha expirado
   */
  static isTokenExpired(tokenData: TokenData): boolean {
    return Date.now() >= tokenData.expiresAt;
  }

  /**
   * Encriptación simple (no para producción crítica)
   */
  private static encryptData(data: string): string {
    // Implementación básica de ofuscación
    // En producción real, usar una librería de encriptación robusta
    const encoded = btoa(data);
    const scrambled = encoded.split('').reverse().join('');
    return btoa(scrambled);
  }

  /**
   * Desencriptación simple
   */
  private static decryptData(encryptedData: string): string {
    try {
      const unscrambled = atob(encryptedData);
      const reversed = unscrambled.split('').reverse().join('');
      return atob(reversed);
    } catch (error) {
      throw new Error('Token corrupto o inválido');
    }
  }

  /**
   * Valida formato de token
   */
  static validateTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // Validar que parece un JWT o token válido
    const parts = token.split('.');
    if (parts.length === 3) {
      // Posible JWT
      return true;
    }

    // Validar longitud mínima para otros tipos de token
    return token.length >= 20;
  }

  /**
   * Limpia automáticamente tokens expirados al iniciar la aplicación
   */
  static cleanupExpiredTokens(): void {
    const tokenData = this.getToken();
    if (tokenData && this.isTokenExpired(tokenData)) {
      this.clearToken();
    }
  }
}

export default SecureTokenManager;
