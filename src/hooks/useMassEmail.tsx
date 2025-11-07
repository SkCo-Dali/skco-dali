import { useState, useCallback, useRef } from "react";
import { Lead } from "@/types/crm";
import {
  EmailRecipient,
  EmailSendRequest,
  EmailSendResponse,
  EmailLog,
  EmailLogsResponse,
  EmailTemplate,
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
    { key: "name", label: "Nombres y Apellidos", example: "Juan Pérez" },
    { key: "firstName", label: "Primer Nombre", example: "Juan" },
    { key: "email", label: "Email", example: "juan@ejemplo.com" },
    { key: "company", label: "Empresa", example: "Acme Corp" },
    { key: "phone", label: "Teléfono", example: "+57 300 123 4567" },
    { key: "campaign", label: "Campaña", example: "Campaña1" },
    { key: "source", label: "Fuente", example: "web" },
  ];

  const replaceDynamicFields = useCallback((template: string, lead: Lead): string => {
    let result = template;
    result = result.replace(/\{name\}/g, lead.name);
    result = result.replace(/\{firstName\}/g, lead.firstName || "");
    result = result.replace(/\{email\}/g, lead.email || "");
    result = result.replace(/\{company\}/g, lead.company || "");
    result = result.replace(/\{phone\}/g, lead.phone || "");
    result = result.replace(/\{campaign\}/g, lead.campaign || "");
    result = result.replace(/\{source\}/g, lead.source);
    return result;
  }, []);

  const generateEmailRecipients = useCallback(
    (leads: Lead[], template: EmailTemplate, alternateEmail?: string): EmailRecipient[] => {
      return leads.map((lead) => {
        const processedHtmlContent = replaceDynamicFields(template.htmlContent, lead);
        const processedPlainContent = replaceDynamicFields(template.plainContent, lead);

        // Para envíos individuales, usar el email alternativo si está especificado
        const targetEmail = leads.length === 1 && alternateEmail?.trim() ? alternateEmail.trim() : lead.email || "";

        return {
          LeadId: lead.id,
          Campaign: lead.campaign || "Sin campaña",
          to: targetEmail,
          subject: replaceDynamicFields(template.subject, lead),
          html_content: processedHtmlContent, // Enviar el HTML correctamente procesado
          plain_content: processedPlainContent || convertHtmlToPlain(processedHtmlContent), // Usar plain o convertir HTML
        };
      });
    },
    [replaceDynamicFields],
  );

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
    async (leads: Lead[], template: EmailTemplate, alternateEmail?: string): Promise<boolean> => {
      console.log("📧 === INICIANDO ENVÍO DE CORREOS MASIVOS ===");

      if (!user) {
        toast({
          title: "Error",
          description: "Usuario no autenticado",
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
        const recipients = generateEmailRecipients(leads, template, alternateEmail);
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
    async (campaign?: string, status?: string, createdAt?: string): Promise<void> => {
      if (!user) return;

      setIsLoading(true);

      try {
        // Construir parámetros sin userId
        const params = new URLSearchParams({
          ...(campaign && { campaign }),
          ...(status && { status }),
          ...(createdAt && { createdAt }),
        });

        const endpoint = `${ENV.CRM_API_BASE_URL}/api/emails/logs${params.toString() ? `?${params}` : ""}`;

        // LOG: Endpoint y parámetros para obtener logs
        console.log("📧 OBTENER LOGS DE CORREOS - API CALL");
        console.log("📧 Endpoint:", endpoint);
        console.log("📧 Method: GET");
        console.log("📧 Params:", {
          ...(campaign && { campaign }),
          ...(status && { status }),
          ...(createdAt && { createdAt }),
        });

        const response = await fetch(endpoint, {
          method: "GET",
          headers: {},
        });

        // LOG: Respuesta del servidor
        console.log("📧 Logs Response status:", response.status);
        console.log("📧 Logs Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("📧 Logs Error response text:", errorText);
          throw new Error(`Error al obtener logs: ${response.statusText}`);
        }

        const data: EmailLogsResponse = await response.json();

        // LOG: Datos recibidos
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

  return {
    isLoading,
    emailLogs,
    dynamicFields,
    replaceDynamicFields,
    generateEmailRecipients,
    sendMassEmail,
    fetchEmailLogs,
    sendProgress,
    sendEvents,
    pauseResumeSend,
    cancelSend,
    downloadReport,
  };
}
