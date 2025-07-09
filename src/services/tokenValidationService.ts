
import { ENV } from '@/config/environment';

interface TokenValidationResult {
  isValid: boolean;
  userInfo?: {
    email: string;
    name: string;
    id: string;
    jobTitle?: string;
    department?: string;
  };
  error?: string;
}

export class TokenValidationService {
  private static readonly GRAPH_USER_ENDPOINT = `${ENV.GRAPH_API_BASE_URL}/me`;
  private static readonly REQUIRED_SCOPES = ENV.REQUIRED_SCOPES;

  /**
   * Valida un token de acceso contra Microsoft Graph API
   */
  static async validateAccessToken(accessToken: string): Promise<TokenValidationResult> {
    if (!accessToken || typeof accessToken !== 'string') {
      return {
        isValid: false,
        error: 'Token de acceso inválido'
      };
    }

    try {
      const response = await fetch(this.GRAPH_USER_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return {
          isValid: false,
          error: `Token inválido: ${response.status} ${response.statusText}`
        };
      }

      const userData = await response.json();
      
      // Validar que tenemos los campos mínimos requeridos
      if (!userData.mail && !userData.userPrincipalName) {
        return {
          isValid: false,
          error: 'El token no contiene información de email válida'
        };
      }

      if (!userData.displayName && !userData.givenName) {
        return {
          isValid: false,
          error: 'El token no contiene información de nombre válida'
        };
      }

      const userInfo = {
        email: userData.mail || userData.userPrincipalName,
        name: userData.displayName || `${userData.givenName || ''} ${userData.surname || ''}`.trim(),
        id: userData.id,
        jobTitle: userData.jobTitle,
        department: userData.department
      };

      return {
        isValid: true,
        userInfo
      };

    } catch (error) {
      return {
        isValid: false,
        error: 'Error durante la validación del token'
      };
    }
  }

  /**
   * Valida que el token tenga los scopes requeridos
   */
  static async validateTokenScopes(tokenResponse: any): Promise<boolean> {
    if (!tokenResponse || !tokenResponse.scopes) {
      return false;
    }

    const tokenScopes = Array.isArray(tokenResponse.scopes) 
      ? tokenResponse.scopes 
      : tokenResponse.scopes.split(' ');

    const hasRequiredScopes = this.REQUIRED_SCOPES.every(scope => 
      tokenScopes.includes(scope)
    );

    return hasRequiredScopes;
  }

  /**
   * Valida que el dominio del email sea válido para la organización
   */
  static validateEmailDomain(email: string): boolean {
    const emailDomain = email.toLowerCase().split('@')[1];
    const isValid = ENV.ALLOWED_DOMAINS.includes(emailDomain);

    return isValid;
  }
}
