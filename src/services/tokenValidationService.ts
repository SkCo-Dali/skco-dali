
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
  private static readonly USER_INFO_ENDPOINT = `${ENV.USER_INFO_URL}`;
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
      const response = await fetch(this.USER_INFO_ENDPOINT, {
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

      const userData = await TokenValidationService.mapUserInfoResponse( response.json());
      
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
   * Ahora más flexible - permite deshabilitar la validación o usar múltiples dominios
   */
  static validateEmailDomain(email: string): boolean {
    // Si la validación de dominio está deshabilitada, permitir cualquier email
    if (!ENV.ENABLE_DOMAIN_VALIDATION) {
      console.log('Domain validation disabled, allowing all domains');
      return true;
    }

    const emailDomain = email.toLowerCase().split('@')[1];
    
    // Si no hay dominios configurados, permitir cualquier dominio
    if (!ENV.ALLOWED_DOMAINS || ENV.ALLOWED_DOMAINS.length === 0) {
      console.log('No domain restrictions configured, allowing all domains');
      return true;
    }

    const isValid = ENV.ALLOWED_DOMAINS.some(domain => 
      emailDomain === domain.toLowerCase().trim()
    );

    if (!isValid) {
      console.log(`Domain ${emailDomain} not in allowed domains:`, ENV.ALLOWED_DOMAINS);
    }

    return isValid;
  }

  static async mapUserInfoResponse(response: any): Promise<any> {
    if (!response) return null;
    //Validate if response is a promise
    if (typeof response.then === 'function') {
      response = await response;
    }
    let result = {
    "displayName": response.displayName || response.name,
    "givenName": response.givenName || response.given_name,
    "jobTitle": response.jobTitle || "Desconocido",
    "mail": response.mail || response.email,
    "mobilePhone": null,
    "officeLocation": null,
    "preferredLanguage": null,
    "surname": response.surname || response.family_name,
    "userPrincipalName": response.userPrincipalName || response.email,
    "id": response.id || response.sub
};
    return result;
  }
}
