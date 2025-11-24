import { useState, useCallback, useRef } from "react";
import { Lead } from "@/types/crm";
import {
  EmailRecipient,
  EmailSendRequest,
  EmailSendResponse,
  EmailLog,
  EmailLogsResponse,
  EmailLogDetail,
  EmailLogDetailResponse,
  EmailTemplate,
  EmailAttachment,
} from "@/types/email";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { createInteraction } from "@/utils/interactionsApiClient";
import { ENV } from "@/config/environment";
import { EmailSendEvent, EmailSendProgress } from "@/components/EmailSendProgressModal";

export function useMassEmail() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [sendProgress, setSendProgress] = useState<EmailSendProgress>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    isPaused: false,
    isCompleted: false,
  });
  const [sendEvents, setSendEvents] = useState<EmailSendEvent[]>([]);
  const isCancelledRef = useRef(false);
  const isPausedRef = useRef(false);

  const dynamicFields = [
    { key: "firstName", label: "Primer Nombre", example: "Juan" },
    { key: "name", label: "Nombres y Apellidos", example: "Juan Pérez" },
    { key: "company", label: "Empresa", example: "Acme Corp" },
    { key: "phone", label: "Teléfono", example: "+57 300 123 4567" },
  ];

  const replaceDynamicFields = useCallback((template: string, lead: Lead): string => {
    let result = template;
    
    // Generar URL de WhatsApp del asesor
    const countryCode = (user?.whatsappCountryCode || user?.countryCodeWhatsApp?.toString() || '57').replace('+', '');
    const advisorPhone = user?.whatsappPhone || user?.whatsappNumber || user?.phone || '';
    const whatsappUrl = `https://wa.me/${countryCode}${advisorPhone}`;
    
    // Mapeo de campos dinámicos a valores del lead
    const fieldMap: Record<string, string> = {
      name: lead.name,
      firstName: lead.firstName || "",
      company: lead.company || "",
      phone: lead.phone || "",
    };
    
    // Reemplazar nodos de campos dinámicos de TipTap con atributos data-*
    result = result.replace(
      /<span([^>]*data-field-key="([^"]+)"[^>]*)>([^<]*)<\/span>/g,
      (match, attributes, key, content) => {
        const value = fieldMap[key] || "";
        
        // Extraer todos los atributos de formato
        const boldMatch = attributes.match(/data-bold="true"/);
        const italicMatch = attributes.match(/data-italic="true"/);
        const underlineMatch = attributes.match(/data-underline="true"/);
        const colorMatch = attributes.match(/data-color="([^"]*)"/);
        const fontSizeMatch = attributes.match(/data-font-size="([^"]*)"/);
        const fontFamilyMatch = attributes.match(/data-font-family="([^"]*)"/);
        
        // Construir estilos inline basados en los atributos
        const styles: string[] = [];
        
        if (boldMatch) styles.push('font-weight: bold');
        if (italicMatch) styles.push('font-style: italic');
        if (underlineMatch) styles.push('text-decoration: underline; text-decoration-color: currentColor');
        if (colorMatch && colorMatch[1]) styles.push(`color: ${colorMatch[1]}`);
        if (fontSizeMatch && fontSizeMatch[1]) styles.push(`font-size: ${fontSizeMatch[1]}`);
        if (fontFamilyMatch && fontFamilyMatch[1]) styles.push(`font-family: ${fontFamilyMatch[1]}`);
        
        // Si hay estilos de formato aplicados, envolver el valor en un span con esos estilos
        if (styles.length > 0) {
          return `<span style="${styles.join('; ')}">${value}</span>`;
        }
        
        return value;
      }
    );
    
    // Reemplazar patrones de texto plano {key} para datos del lead
    result = result.replace(/\{name\}/g, lead.name);
    result = result.replace(/\{firstName\}/g, lead.firstName || "");
    result = result.replace(/\{company\}/g, lead.company || "");
    result = result.replace(/\{phone\}/g, lead.phone || "");
    
    // Reemplazar variables del asesor
    result = result.replace(/\{WHATSAPP_URL\}/g, whatsappUrl);
    result = result.replace(/\{NOMBRE_ASESOR\}/g, user?.name || "");
    result = result.replace(/\{CARGO_ASESOR\}/g, user?.jobTitle || "");
    result = result.replace(/\{CELULAR_ASESOR\}/g, advisorPhone || "");
    result = result.replace(/\{CORREO_ASESOR\}/g, user?.email || "");
    
    return result;
  }, [user]);

  // Función para convertir HTML a texto plano
  const convertHtmlToPlain = useCallback((html: string): string => {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();
  }, []);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateEmailRecipients = useCallback(
    async (leads: Lead[], template: EmailTemplate, alternateEmail?: string, attachments?: File[]): Promise<EmailRecipient[]> => {
      console.log("📧 Generando recipients con template:", {
        subject: template.subject,
        htmlContentLength: template.htmlContent?.length,
        plainContentLength: template.plainContent?.length,
        attachmentsCount: attachments?.length || 0,
      });

      // Convertir archivos a base64 si hay adjuntos
      let emailAttachments: EmailAttachment[] = [];
      if (attachments && attachments.length > 0) {
      emailAttachments = await Promise.all(
        attachments.map(async (file) => ({
          filename: file.name,
          content_bytes: await convertFileToBase64(file),
          content_type: file.type || 'application/octet-stream',
        }))
      );
      }

      return leads.map((lead) => {
        const processedHtmlContent = replaceDynamicFields(template.htmlContent || '', lead);
        const processedPlainContent = replaceDynamicFields(template.plainContent || '', lead);

        // Para envíos individuales, usar el email alternativo si está especificado
        const targetEmail = leads.length === 1 && alternateEmail?.trim() ? alternateEmail.trim() : lead.email || "";

        const recipient: EmailRecipient = {
          LeadId: lead.id,
          Campaign: lead.campaign || "Sin campaña",
          to: targetEmail,
          subject: replaceDynamicFields(template.subject || '', lead),
          html_content: processedHtmlContent, // Enviar el HTML correctamente procesado
          plain_content: processedPlainContent || convertHtmlToPlain(processedHtmlContent), // Usar plain o convertir HTML
        };

        if (emailAttachments.length > 0) {
          recipient.attachments = emailAttachments;
        }

        console.log("📧 Recipient generado:", {
          to: recipient.to,
          subject: recipient.subject,
          html_content_length: recipient.html_content.length,
          plain_content_length: recipient.plain_content.length,
          attachments_count: recipient.attachments?.length || 0,
        });

        return recipient;
      });
    },
    [replaceDynamicFields, convertHtmlToPlain],
  );

  const createInteractionForEmailSent = useCallback(
    async (leadId: string, subject: string): Promise<void> => {
      if (!user?.id) return;

      try {
        await createInteraction({
          LeadId: leadId,
          Type: "email",
          Description: `Se envió un correo a través de Dali - Asunto: ${subject}`,
          Stage: "", // No se envía Stage según la documentación
          Outcome: "neutral",
        });
      } catch (error) {
        console.error("Error creating interaction for email sent:", error);
        // No mostramos error al usuario para no interrumpir el flujo principal
      }
    },
    [user],
  );

  const addEvent = useCallback((event: EmailSendEvent) => {
    setSendEvents(prev => [event, ...prev]);
  }, []);

  const updateProgress = useCallback((updates: Partial<EmailSendProgress>) => {
    setSendProgress(prev => ({ ...prev, ...updates }));
  }, []);

  const sendMassEmail = useCallback(
    async (leads: Lead[], template: EmailTemplate, alternateEmail?: string, attachments?: File[]): Promise<boolean> => {
      console.log("📧 === INICIANDO ENVÍO DE CORREOS MASIVOS ===");
      console.log("📧 Template recibido:", {
        subject: template.subject,
        htmlContentLength: template.htmlContent?.length || 0,
        plainContentLength: template.plainContent?.length || 0,
        attachmentsCount: attachments?.length || 0,
        htmlPreview: template.htmlContent?.substring(0, 50),
      });

      if (!user) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
          variant: "destructive",
        });
        return false;
      }

      // Validar que el template tenga contenido
      if (!template.subject?.trim() || !template.htmlContent?.trim()) {
        console.error("📧 ERROR: Template sin contenido", {
          subject: template.subject,
          htmlContent: template.htmlContent,
        });
        toast({
          title: "Error",
          description: "Debes completar el asunto y contenido del email antes de enviar",
          variant: "destructive",
        });
        return false;
      }

      if (leads.length > 20) {
        toast({
          title: "Error",
          description: "El máximo permitido es 20 correos por envío",
          variant: "destructive",
        });
        return false;
      }

      // Reset state
      isCancelledRef.current = false;
      isPausedRef.current = false;
      setSendEvents([]);
      setSendProgress({
        total: leads.length,
        sent: 0,
        failed: 0,
        pending: leads.length,
        isPaused: false,
        isCompleted: false,
      });

      setIsLoading(true);
      const startTime = Date.now();

      try {
        const recipients = await generateEmailRecipients(leads, template, alternateEmail, attachments);
        let sentCount = 0;
        let failedCount = 0;

        // Send emails one by one
        for (let i = 0; i < recipients.length; i++) {
          // Check if cancelled
          if (isCancelledRef.current) {
            console.log("📧 Envío cancelado por el usuario");
            toast({
              title: "Envío cancelado",
              description: `Se enviaron ${sentCount} correos antes de cancelar`,
            });
            break;
          }

          // Check if paused
          while (isPausedRef.current && !isCancelledRef.current) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          const recipient = recipients[i];
          const lead = leads[i];

          // Add sending event
          const eventId = `email-${Date.now()}-${i}`;
          addEvent({
            id: eventId,
            leadId: lead.id,
            leadName: lead.name,
            email: recipient.to,
            status: 'sending',
            timestamp: new Date().toISOString(),
          });

          try {
            // Send individual email
            const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/emails/send`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ recipients: [recipient] }),
            });

            if (!response.ok) {
              throw new Error(`Error en el envío: ${response.statusText}`);
            }

            const result: EmailSendResponse = await response.json();
            const emailResult = result.results[0];

            if (emailResult.status === 'Success') {
              sentCount++;
              // Create interaction
              await createInteractionForEmailSent(recipient.LeadId, recipient.subject);
              
              // Update event to success
              setSendEvents(prev => 
                prev.map(e => e.id === eventId 
                  ? { ...e, status: 'success' as const, timestamp: new Date().toISOString() }
                  : e
                )
              );
            } else {
              failedCount++;
              // Update event to failed
              setSendEvents(prev => 
                prev.map(e => e.id === eventId 
                  ? { ...e, status: 'failed' as const, error: emailResult.error || 'Error desconocido', timestamp: new Date().toISOString() }
                  : e
                )
              );
            }
          } catch (error) {
            failedCount++;
            console.error("📧 Error sending email to", recipient.to, error);
            
            // Update event to failed
            setSendEvents(prev => 
              prev.map(e => e.id === eventId 
                ? { ...e, status: 'failed' as const, error: error instanceof Error ? error.message : 'Error desconocido', timestamp: new Date().toISOString() }
                : e
              )
            );
          }

          // Update progress
          const pending = recipients.length - (sentCount + failedCount);
          const elapsed = (Date.now() - startTime) / 1000;
          const avgTimePerEmail = elapsed / (sentCount + failedCount);
          const eta = Math.ceil(pending * avgTimePerEmail);

          updateProgress({
            sent: sentCount,
            failed: failedCount,
            pending,
            eta,
          });

          // Small delay between emails to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Mark as completed
        updateProgress({ isCompleted: true });

        if (!isCancelledRef.current) {
          if (failedCount > 0) {
            toast({
              title: "Envío completado con errores",
              description: `${sentCount} correos enviados, ${failedCount} fallaron`,
              variant: "destructive",
            });
          } else {
            toast({
              title: "Éxito",
              description: `Se han enviado ${sentCount} correos exitosamente`,
            });
          }
        }

        return sentCount > 0;
      } catch (error) {
        console.error("📧 Error sending mass email:", error);
        updateProgress({ isCompleted: true });
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Error desconocido al enviar correos",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user, generateEmailRecipients, createInteractionForEmailSent, toast, addEvent, updateProgress],
  );

  const pauseResumeSend = useCallback(() => {
    isPausedRef.current = !isPausedRef.current;
    updateProgress({ isPaused: isPausedRef.current });
  }, [updateProgress]);

  const cancelSend = useCallback(() => {
    isCancelledRef.current = true;
    updateProgress({ isCompleted: true });
  }, [updateProgress]);

  const downloadReport = useCallback(() => {
    const csv = [
      ['Lead', 'Email', 'Estado', 'Error', 'Fecha'].join(','),
      ...sendEvents.map(event => [
        event.leadName,
        event.email,
        event.status === 'success' ? 'Enviado' : event.status === 'failed' ? 'Fallido' : 'Pendiente',
        event.error || '',
        event.timestamp
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-envio-emails-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [sendEvents]);

  const fetchEmailLogs = useCallback(
    async (page: number = 1, pageSize: number = 20): Promise<void> => {
      if (!user) return;

      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: pageSize.toString(),
        });

        const authToken = localStorage.getItem("authToken") || "";
        const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/logs?${params}`;

        console.log("📧 OBTENER LOGS DE CORREOS - API CALL");
        console.log("📧 Endpoint:", endpoint);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        console.log("📧 Logs Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("📧 Logs Error response text:", errorText);
          throw new Error(`Error al obtener logs: ${response.statusText}`);
        }

        const data: EmailLogsResponse = await response.json();

        console.log("📧 Logs Response data:", JSON.stringify(data, null, 2));
        console.log("📧 Número de logs recibidos:", data.logs.length);

        setEmailLogs(data.logs);
      } catch (error) {
        console.error("📧 Error fetching email logs:", error);
        toast({
          title: "Error",
          description: "Error al obtener el historial de correos",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [user, toast],
  );

  const fetchEmailLogDetail = useCallback(
    async (logId: string): Promise<EmailLogDetail | null> => {
      if (!user) return null;

      try {
        const authToken = localStorage.getItem("authToken") || "";
        const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/logs/${logId}`;

        console.log("📧 OBTENER DETALLE DE LOG - API CALL");
        console.log("📧 Endpoint:", endpoint);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al obtener detalle: ${response.statusText}`);
        }

        const data: EmailLogDetailResponse = await response.json();
        console.log("📧 Log Detail Response:", data);

        return data.log;
      } catch (error) {
        console.error("📧 Error fetching email log detail:", error);
        toast({
          title: "Error",
          description: "Error al obtener los detalles del correo",
          variant: "destructive",
        });
        return null;
      }
    },
    [user, toast],
  );

  const downloadEmailAttachment = useCallback(
    async (logId: string, fileName: string): Promise<void> => {
      if (!user) return;

      try {
        const authToken = localStorage.getItem("authToken") || "";
        const encodedName = encodeURIComponent(fileName);
        const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/logs/${logId}/attachments/${encodedName}/download`;

        console.log("📧 DESCARGAR ADJUNTO - API CALL");
        console.log("📧 Endpoint:", endpoint);

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al descargar adjunto: ${response.statusText}`);
        }

        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

        toast({
          title: "Éxito",
          description: `Archivo "${fileName}" descargado`,
        });
      } catch (error) {
        console.error("📧 Error downloading attachment:", error);
        toast({
          title: "Error",
          description: "Error al descargar el archivo adjunto",
          variant: "destructive",
        });
      }
    },
    [user, toast],
  );

  /**
   * Reenviar un correo desde el historial
   */
  const resendEmail = async (emailDetail: EmailLogDetail) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          title: "Error",
          description: "No se encontró el token de autenticación",
          variant: "destructive",
        });
        return;
      }

      // Preparar el payload para reenviar
      const recipients: EmailRecipient[] = [{
        LeadId: emailDetail.LeadId,
        Campaign: emailDetail.Campaign,
        to: emailDetail.ToEmail,
        subject: emailDetail.Subject,
        html_content: emailDetail.HtmlContent,
        plain_content: emailDetail.PlainContent || "",
        attachments: [] // Los adjuntos ya están en el servidor, podrían re-incluirse si es necesario
      }];

      const response = await fetch(`${ENV.CRM_API_BASE_URL}/api/emails/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ recipients }),
      });

      if (!response.ok) {
        throw new Error("Error al reenviar el correo");
      }

      const data = await response.json();
      
      toast({
        title: "Correo reenviado",
        description: `El correo fue reenviado exitosamente a ${emailDetail.ToEmail}`,
      });

      // Refrescar el historial
      await fetchEmailLogs();
    } catch (error) {
      console.error("Error al reenviar correo:", error);
      toast({
        title: "Error",
        description: "No se pudo reenviar el correo",
        variant: "destructive",
      });
    }
  };

  return {
    isLoading,
    emailLogs,
    dynamicFields,
    replaceDynamicFields,
    sendMassEmail,
    fetchEmailLogs,
    fetchEmailLogDetail,
    downloadEmailAttachment,
    resendEmail,
    sendProgress,
    sendEvents,
    pauseResumeSend,
    cancelSend,
    downloadReport,
  };
}
