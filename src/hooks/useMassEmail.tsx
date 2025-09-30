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
    template: EmailTemplate,
    alternateEmail?: string
  ): EmailRecipient[] => {
    return leads.map(lead => {
      const processedHtmlContent = replaceDynamicFields(template.htmlContent, lead);
      const processedPlainContent = replaceDynamicFields(template.plainContent, lead);
      
      // Para envíos individuales, usar el email alternativo si está especificado
      const targetEmail = (leads.length === 1 && alternateEmail?.trim()) 
        ? alternateEmail.trim() 
        : lead.email || '';
      
      return {
        LeadId: lead.id,
        Campaign: lead.campaign || 'Sin campaña',
        to: targetEmail,
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
    subject: string
  ): Promise<void> => {
    if (!user?.id) return;

    try {
      await createInteraction({
        LeadId: leadId,
        UserId: user.id,
        Type: 'email',
        Description: `Se envió un correo a través de Dali - Asunto: ${subject}`,
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
    template: EmailTemplate,
    alternateEmail?: string
  ): Promise<boolean> => {
    console.log('📧 === INICIANDO ENVÍO DE CORREOS MASIVOS ===');
    
    if (!user) {
      console.log('❌ Usuario no autenticado');
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive"
      });
      return false;
    }

    console.log('👤 Usuario autenticado:', {
      id: user.id,
      email: user.email,
      name: user.name
    });

    // Validación del límite de 20 correos
    if (leads.length > 20) {
      console.log('❌ Límite de correos excedido:', leads.length);
      toast({
        title: "Error",
        description: "El máximo permitido es 20 correos por envío",
        variant: "destructive"
      });
      return false;
    }

    console.log('📊 Número de leads a procesar:', leads.length);
    setIsLoading(true);
    
    try {
      console.log('🔐 Obteniendo tokens de acceso...');
      const tokens = await getAccessToken();
      
      if (!tokens || !tokens.idToken || !tokens.accessToken) {
        console.log('❌ Tokens faltantes:', tokens);
        throw new Error('No se pudieron obtener los tokens de acceso');
      }
      
      const { idToken, accessToken } = tokens;

      console.log('✅ Tokens completos obtenidos exitosamente:', {
        idToken: idToken,
        accessToken: accessToken
      });

      const recipients = generateEmailRecipients(leads, template, alternateEmail);
      console.log('📧 Recipients generados:', recipients.length);
      
      // Payload simplificado - solo recipients
      const payload = {
        recipients
      };

      const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/send`;
      
      // LOG: Endpoint y body que se envía
      console.log('📧 === DETALLES DE LA LLAMADA AL API ===');
      console.log('📧 Endpoint:', endpoint);
      console.log('📧 Method: POST');
      console.log('📧 Headers completos que se enviarán:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
        'X-Graph-Token': accessToken
      });
      console.log('📧 Payload enviado:', JSON.stringify(payload, null, 2));

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
          'X-Graph-Token': accessToken
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
          await createInteractionForEmailSent(recipient.LeadId, recipient.subject);
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
      // Obtener token de acceso
      const tokens = await getAccessToken();
      
      if (!tokens || !tokens.idToken) {
        throw new Error('No se pudieron obtener los tokens de acceso');
      }

      // Construir parámetros sin userId
      const params = new URLSearchParams({
        ...(campaign && { campaign }),
        ...(status && { status }),
        ...(createdAt && { createdAt })
      });

      const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/logs${params.toString() ? `?${params}` : ''}`;
      
      // LOG: Endpoint y parámetros para obtener logs
      console.log('📧 OBTENER LOGS DE CORREOS - API CALL');
      console.log('📧 Endpoint:', endpoint);
      console.log('📧 Method: GET');
      console.log('📧 Headers:', {
        'Authorization': `Bearer ${tokens.idToken}`
      });
      console.log('📧 Params:', {
        ...(campaign && { campaign }),
        ...(status && { status }),
        ...(createdAt && { createdAt })
      });

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.idToken}`
        }
      });

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
