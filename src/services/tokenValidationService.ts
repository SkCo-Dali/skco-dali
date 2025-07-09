
import { logSecure } from '@/utils/secureLogger';

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
  private static readonly GRAPH_USER_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
  private static readonly REQUIRED_SCOPES = ['User.Read'];

  /**
   * Valida un token de acceso contra Microsoft Graph API
   */
  static async validateAccessToken(accessToken: string): Promise<TokenValidationResult> {
    if (!accessToken || typeof accessToken !== 'string') {
      logSecure.authError('Token validation failed', 'Invalid access token provided');
      return {
        isValid: false,
        error: 'Token de acceso inválido'
      };
    }

    try {
      logSecure.debug('Validating access token against Microsoft Graph');
      
      const response = await fetch(this.GRAPH_USER_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logSecure.authError('Token validation failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        return {
          isValid: false,
          error: `Token inválido: ${response.status} ${response.statusText}`
        };
      }

      const userData = await response.json();
      
      // Validar que tenemos los campos mínimos requeridos
      if (!userData.mail && !userData.userPrincipalName) {
        logSecure.authError('Token validation failed', 'Missing required email field');
        return {
          isValid: false,
          error: 'El token no contiene información de email válida'
        };
      }

      if (!userData.displayName && !userData.givenName) {
        logSecure.authError('Token validation failed', 'Missing required name field');
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

      logSecure.info('Token validated successfully', {
        email: userInfo.email.substring(0, 3) + '***'
      });

      return {
        isValid: true,
        userInfo
      };

    } catch (error) {
      logSecure.authError('Token validation exception', error);
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
      logSecure.warn('Token response missing scopes information');
      return false;
    }

    const tokenScopes = Array.isArray(tokenResponse.scopes) 
      ? tokenResponse.scopes 
      : tokenResponse.scopes.split(' ');

    const hasRequiredScopes = this.REQUIRED_SCOPES.every(scope => 
      tokenScopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      logSecure.authError('Token missing required scopes', {
        required: this.REQUIRED_SCOPES,
        provided: tokenScopes
      });
    }

    return hasRequiredScopes;
  }

  /**
   * Valida que el dominio del email sea válido para la organización
   */
  static validateEmailDomain(email: string): boolean {
    const validDomains = [
      'skandia.com',
      'skandia.co', 
      'skandia.com.co'
    ];

    const emailDomain = email.toLowerCase().split('@')[1];
    const isValid = validDomains.includes(emailDomain);

    if (!isValid) {
      logSecure.authError('Invalid email domain', {
        domain: emailDomain,
        validDomains
      });
    }

    return isValid;
  }
}
