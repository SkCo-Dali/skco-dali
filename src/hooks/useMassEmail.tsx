import { useState, useCallback } from 'react';
import { Lead } from '@/types/crm';
import { 
  EmailRecipient, 
  EmailSendRequest, 
  EmailSendResponse,
  EmailLog, 
  EmailLogsResponse,
  EmailTemplate 
} from '@/types/email';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createInteraction } from '@/utils/interactionsApiClient';
import { ENV } from '@/config/environment';

export function useMassEmail() {
  const { user, getAccessToken } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  const dynamicFields = [
    { key: 'name', label: 'Nombre', example: 'Juan Pérez' },
    { key: 'email', label: 'Email', example: 'juan@ejemplo.com' },
    { key: 'company', label: 'Empresa', example: 'Acme Corp' },
    { key: 'phone', label: 'Teléfono', example: '+57 300 123 4567' },
    { key: 'campaign', label: 'Campaña', example: 'Campaña1' },
    { key: 'source', label: 'Fuente', example: 'web' },
  ];

  const replaceDynamicFields = useCallback((template: string, lead: Lead): string => {
    let result = template;
    result = result.replace(/\{name\}/g, lead.name);
    result = result.replace(/\{email\}/g, lead.email || '');
    result = result.replace(/\{company\}/g, lead.company || '');
    result = result.replace(/\{phone\}/g, lead.phone || '');
    result = result.replace(/\{campaign\}/g, lead.campaign || '');
    result = result.replace(/\{source\}/g, lead.source);
    return result;
  }, []);

  const generateEmailRecipients = useCallback((
    leads: Lead[], 
    template: EmailTemplate
  ): EmailRecipient[] => {
    return leads.map(lead => {
      const processedHtmlContent = replaceDynamicFields(template.htmlContent, lead);
      const processedPlainContent = replaceDynamicFields(template.plainContent, lead);
      
      return {
        LeadId: lead.id,
        Campaign: lead.campaign || 'Sin campaña',
        to: lead.email || '',
        subject: replaceDynamicFields(template.subject, lead),
        html_content: processedHtmlContent, // Enviar el HTML correctamente procesado
        plain_content: processedPlainContent || convertHtmlToPlain(processedHtmlContent) // Usar plain o convertir HTML
      };
    });
  }, [replaceDynamicFields]);

  // Función para convertir HTML a texto plano
  const convertHtmlToPlain = useCallback((html: string): string => {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }, []);

  const createInteractionForEmailSent = useCallback(async (
    leadId: string,
    plainContent: string
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      await createInteraction({
        LeadId: leadId,
        UserId: user.id,
        Type: 'email',
        Description: `Se envió un correo a través de Dali LM: ${plainContent}`,
        Stage: '', // No se envía Stage según la documentación
        Outcome: 'neutral'
      });
    } catch (error) {
      console.error('Error creating interaction for email sent:', error);
      // No mostramos error al usuario para no interrumpir el flujo principal
    }
  }, [user]);

  const sendMassEmail = useCallback(async (
    leads: Lead[], 
    template: EmailTemplate
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive"
      });
      return false;
    }

    // Validación del límite de 20 correos
    if (leads.length > 20) {
      toast({
        title: "Error",
        description: "El máximo permitido es 20 correos por envío",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }

      const recipients = generateEmailRecipients(leads, template);
      
      const payload: EmailSendRequest = {
        userId: user.id,
        user_email: user.email,
        token: token,
        recipients
      };

      const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/send`;
      
      // LOG: Endpoint y body que se envía
      console.log('📧 ENVÍO DE CORREOS MASIVOS - API CALL');
      console.log('📧 Endpoint:', endpoint);
      console.log('📧 Method: POST');
      console.log('📧 Body enviado:', JSON.stringify(payload, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      // LOG: Respuesta del servidor
      console.log('📧 Response status:', response.status);
      console.log('📧 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('📧 Error response text:', errorText);
        throw new Error(`Error en el envío: ${response.statusText}`);
      }

      const result: EmailSendResponse = await response.json();
      
      // LOG: Resultado de la API
      console.log('📧 Response data:', JSON.stringify(result, null, 2));
      
      // Crear interacciones para los correos enviados exitosamente
      const successfulSends = result.results.filter(r => r.status === 'Success');
      
      for (const successfulSend of successfulSends) {
        const recipient = recipients.find(r => r.to === successfulSend.to);
        if (recipient) {
          await createInteractionForEmailSent(recipient.LeadId, recipient.plain_content);
        }
      }

      const failedCount = result.results.filter(r => r.status === 'Failed').length;
      
      if (failedCount > 0) {
        toast({
          title: "Envío parcialmente exitoso",
          description: `${successfulSends.length} correos enviados, ${failedCount} fallaron`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Éxito",
          description: `Se han enviado ${successfulSends.length} correos exitosamente`,
        });
      }

      return successfulSends.length > 0;
    } catch (error) {
      console.error('📧 Error sending mass email:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error desconocido al enviar correos",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user, getAccessToken, generateEmailRecipients, createInteractionForEmailSent, toast]);

  const fetchEmailLogs = useCallback(async (
    campaign?: string,
    status?: string,
    createdAt?: string
  ): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const params = new URLSearchParams({
        userId: user.id,
        ...(campaign && { campaign }),
        ...(status && { status }),
        ...(createdAt && { createdAt })
      });

      const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/logs?${params}`;
      
      // LOG: Endpoint y parámetros para obtener logs
      console.log('📧 OBTENER LOGS DE CORREOS - API CALL');
      console.log('📧 Endpoint:', endpoint);
      console.log('📧 Method: GET');
      console.log('📧 Params:', {
        userId: user.id,
        ...(campaign && { campaign }),
        ...(status && { status }),
        ...(createdAt && { createdAt })
      });

      const response = await fetch(endpoint);

      // LOG: Respuesta del servidor
      console.log('📧 Logs Response status:', response.status);
      console.log('📧 Logs Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('📧 Logs Error response text:', errorText);
        throw new Error(`Error al obtener logs: ${response.statusText}`);
      }

      const data: EmailLogsResponse = await response.json();
      
      // LOG: Datos recibidos
      console.log('📧 Logs Response data:', JSON.stringify(data, null, 2));
      console.log('📧 Número de logs recibidos:', data.logs.length);
      
      setEmailLogs(data.logs);
    } catch (error) {
      console.error('📧 Error fetching email logs:', error);
      toast({
        title: "Error",
        description: "Error al obtener el historial de correos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  return {
    isLoading,
    emailLogs,
    dynamicFields,
    replaceDynamicFields,
    generateEmailRecipients,
    sendMassEmail,
    fetchEmailLogs
  };
}
