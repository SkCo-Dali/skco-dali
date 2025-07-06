
import { useState, useCallback } from 'react';
import { Lead } from '@/types/crm';
import { WhatsAppTemplate, WhatsAppUserInfo, WhatsAppMessage, WhatsAppSendLog, WhatsAppValidationError } from '@/types/whatsapp';
import { useToast } from '@/hooks/use-toast';

export function useMassWhatsApp() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [userInfo, setUserInfo] = useState<WhatsAppUserInfo>({
    phoneNumber: '',
    fullName: ''
  });
  const [sendLogs, setSendLogs] = useState<WhatsAppSendLog[]>([]);

  // Validar número de WhatsApp
  const validateWhatsAppNumber = useCallback((phoneNumber: string): boolean => {
    // Solo números, 10 dígitos, debe comenzar con 3
    const regex = /^3\d{9}$/;
    return regex.test(phoneNumber);
  }, []);

  // Validar leads y sus números
  const validateLeads = useCallback((leads: Lead[]): { validLeads: Lead[], errors: WhatsAppValidationError[] } => {
    const validLeads: Lead[] = [];
    const errors: WhatsAppValidationError[] = [];

    leads.forEach(lead => {
      if (!lead.phone) {
        errors.push({
          leadId: lead.id,
          leadName: lead.name,
          phoneNumber: '',
          error: 'No tiene número de teléfono'
        });
      } else if (!validateWhatsAppNumber(lead.phone)) {
        errors.push({
          leadId: lead.id,
          leadName: lead.name,
          phoneNumber: lead.phone,
          error: 'Número inválido (debe tener 10 dígitos y comenzar con 3)'
        });
      } else {
        validLeads.push(lead);
      }
    });

    return { validLeads, errors };
  }, [validateWhatsAppNumber]);

  // Reemplazar variables en plantilla
  const replaceTemplateVariables = useCallback((template: WhatsAppTemplate, lead: Lead): string => {
    let content = template.content;
    
    // Variables disponibles
    const variables: { [key: string]: string } = {
      '{nombre}': lead.name || '',
      '{email}': lead.email || '',
      '{telefono}': lead.phone || '',
      '{empresa}': lead.company || '',
      '{producto}': lead.product?.join(', ') || ''
    };

    // Reemplazar cada variable
    Object.entries(variables).forEach(([variable, value]) => {
      content = content.replace(new RegExp(variable, 'g'), value);
    });

    return content;
  }, []);

  // Obtener plantillas (mock por ahora)
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data - más adelante será una llamada real a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTemplates: WhatsAppTemplate[] = [
        {
          id: '1',
          name: 'Saludo inicial',
          content: 'Hola {nombre}, soy {remitente} de Skandia. Me gustaría conversar contigo sobre nuestros productos de inversión.',
          variables: ['{nombre}', '{remitente}'],
          isApproved: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Seguimiento comercial',
          content: 'Hola {nombre}, quería hacer seguimiento a tu interés en {producto}. ¿Tienes tiempo para una llamada?',
          variables: ['{nombre}', '{producto}'],
          isApproved: true,
          createdAt: new Date().toISOString()
        }
      ];
      
      setTemplates(mockTemplates);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las plantillas",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Obtener información del usuario (mock por ahora)
  const fetchUserInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock data - más adelante será una llamada real a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockUserInfo: WhatsAppUserInfo = {
        phoneNumber: '3001234567',
        fullName: 'Carlos Rodríguez'
      };
      
      setUserInfo(mockUserInfo);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del usuario",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Actualizar información del usuario
  const updateUserInfo = useCallback(async (newUserInfo: WhatsAppUserInfo) => {
    setIsLoading(true);
    try {
      // Validar número del usuario
      if (!validateWhatsAppNumber(newUserInfo.phoneNumber)) {
        toast({
          title: "Error",
          description: "El número debe tener 10 dígitos y comenzar con 3",
          variant: "destructive"
        });
        return false;
      }

      // Mock API call - más adelante será una llamada real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserInfo(newUserInfo);
      toast({
        title: "Éxito",
        description: "Información actualizada correctamente"
      });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la información",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [validateWhatsAppNumber, toast]);

  // Enviar mensajes masivos
  const sendMassWhatsApp = useCallback(async (leads: Lead[], template: WhatsAppTemplate): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Mock API call - más adelante será una llamada real
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Crear logs de envío mock
      const newLogs: WhatsAppSendLog[] = leads.map(lead => ({
        id: `log-${Date.now()}-${lead.id}`,
        recipientNumber: lead.phone || '',
        message: replaceTemplateVariables(template, lead),
        sentAt: new Date().toISOString(),
        status: Math.random() > 0.1 ? 'sent' : 'failed' // 90% éxito
      }));
      
      setSendLogs(prev => [...newLogs, ...prev]);
      
      toast({
        title: "Envío completado",
        description: `Se enviaron ${leads.length} mensajes de WhatsApp`
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al enviar los mensajes",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [replaceTemplateVariables, toast]);

  // Obtener historial de envíos
  const fetchSendLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock API call - más adelante será una llamada real
      await new Promise(resolve => setTimeout(resolve, 500));
      // Los logs ya están en el estado local
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el historial",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    templates,
    userInfo,
    sendLogs,
    validateWhatsAppNumber,
    validateLeads,
    replaceTemplateVariables,
    fetchTemplates,
    fetchUserInfo,
    updateUserInfo,
    sendMassWhatsApp,
    fetchSendLogs
  };
}
