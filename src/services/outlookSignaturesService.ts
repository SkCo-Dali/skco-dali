import { IPublicClientApplication } from '@azure/msal-browser';
import { loginRequest } from '@/authConfig';
import { OutlookSignature } from '@/types/email';
import { extractIdpAccessToken } from '@/utils/tokenUtils';

export class OutlookSignaturesService {
  private msalInstance: IPublicClientApplication;

  constructor(msalInstance: IPublicClientApplication) {
    this.msalInstance = msalInstance;
  }

  /**
   * Obtiene las firmas de Outlook del usuario desde Microsoft Graph API
   */
  async getUserSignatures(): Promise<OutlookSignature[]> {
    try {
      const account = this.msalInstance.getActiveAccount();
      if (!account) {
        throw new Error('No hay una cuenta activa');
      }

      // Obtener el token de B2C
      const tokenResponse = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account
      });

      // Extraer el idp_access_token (token de Microsoft Graph)
      const graphToken = extractIdpAccessToken(tokenResponse.accessToken);
      
      if (!graphToken) {
        throw new Error('No se pudo obtener el token de Graph API');
      }

      console.log('🔐 Token de Graph API obtenido para firmas');

      // Consultar las configuraciones del buzón
      const response = await fetch('https://graph.microsoft.com/v1.0/me/mailboxSettings', {
        headers: {
          'Authorization': `Bearer ${graphToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error al obtener las firmas: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extraer firmas de la configuración del buzón
      const signatures: OutlookSignature[] = [];
      
      if (data.automaticRepliesSetting?.internalReplyMessage) {
        signatures.push({
          id: 'internal-reply',
          name: 'Respuesta Automática Interna',
          content: data.automaticRepliesSetting.internalReplyMessage,
          isDefault: false
        });
      }

      if (data.automaticRepliesSetting?.externalReplyMessage) {
        signatures.push({
          id: 'external-reply',
          name: 'Respuesta Automática Externa',
          content: data.automaticRepliesSetting.externalReplyMessage,
          isDefault: false
        });
      }

      // Intentar obtener la firma predeterminada del usuario
      // Nota: Microsoft Graph no expone directamente las firmas de Outlook
      // Esta es una limitación conocida de la API
      // Como alternativa, intentamos obtener configuraciones relacionadas
      
      return signatures;
    } catch (error) {
      console.error('Error al obtener firmas de Outlook:', error);
      throw error;
    }
  }

  /**
   * Obtiene la firma predeterminada del usuario
   * Nota: Esta es una implementación limitada debido a restricciones de Microsoft Graph API
   */
  async getDefaultSignature(): Promise<OutlookSignature | null> {
    try {
      const signatures = await this.getUserSignatures();
      return signatures.find(sig => sig.isDefault) || signatures[0] || null;
    } catch (error) {
      console.error('Error al obtener firma predeterminada:', error);
      return null;
    }
  }

  /**
   * Obtiene las firmas usando la API de Outlook REST (alternativa)
   * Esta es una aproximación más directa pero requiere permisos adicionales
   */
  async getUserSignaturesViaOutlookRest(): Promise<OutlookSignature[]> {
    try {
      const account = this.msalInstance.getActiveAccount();
      if (!account) {
        throw new Error('No hay una cuenta activa');
      }

      const tokenResponse = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account
      });

      // Extraer el idp_access_token (token de Microsoft Graph)
      const graphToken = extractIdpAccessToken(tokenResponse.accessToken);
      
      if (!graphToken) {
        throw new Error('No se pudo obtener el token de Graph API');
      }

      // Intentar obtener un mensaje de muestra para extraer la firma
      const response = await fetch(
        'https://outlook.office.com/api/v2.0/me/messages?$top=1&$select=Body',
        {
          headers: {
            'Authorization': `Bearer ${graphToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error al consultar mensajes: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Esta es una implementación limitada ya que Microsoft no expone
      // directamente las firmas guardadas vía API
      console.warn('Extracción de firmas desde Outlook REST tiene limitaciones');
      
      return [];
    } catch (error) {
      console.error('Error en getUserSignaturesViaOutlookRest:', error);
      return [];
    }
  }
}
