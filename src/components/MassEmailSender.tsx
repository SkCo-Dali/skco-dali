import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, History, Filter, AlertTriangle, Mail } from 'lucide-react';
import { Lead } from '@/types/crm';
import { EmailTemplate } from '@/types/email';
import { EmailComposer } from '@/components/EmailComposer';
import { EmailPreview } from '@/components/EmailPreview';
import { EmailStatusLogs } from '@/components/EmailStatusLogs';
import { EmailSendConfirmation } from '@/components/EmailSendConfirmation';
import { EmailSendProgressModal } from '@/components/EmailSendProgressModal';
import { GraphAuthRequiredDialog } from '@/components/GraphAuthRequiredDialog';
import { useMassEmail } from '@/hooks/useMassEmail';
import { useToast } from '@/hooks/use-toast';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useGraphAuthorization } from '@/hooks/useGraphAuthorization';

interface MassEmailSenderProps {
  filteredLeads: Lead[];
  onClose: () => void;
  opportunityId?: number;
}

export function MassEmailSender({ filteredLeads, onClose, opportunityId }: MassEmailSenderProps) {
  const { toast } = useToast();
  const {
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
  } = useMassEmail();

  const { isAuthorized, loading: graphAuthLoading, checkStatus } = useGraphAuthorization();

  const [activeTab, setActiveTab] = useState('compose');
  const [showGraphAuthDialog, setShowGraphAuthDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: '',
    htmlContent: '',
    plainContent: ''
  });
  
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Ref para el portal del toolbar
  const toolbarPortalRef = useRef<HTMLDivElement>(null);
  
  // Flag para indicar si ya se intentó cargar la plantilla por oportunidad
  const [templateLoadAttempted, setTemplateLoadAttempted] = useState(false);

  // Persistencia automática del borrador - solo habilitar después de intentar cargar plantilla
  const { restoreFromStorage, clearBackup } = useFormPersistence({
    key: 'mass-email-draft',
    data: template,
    enabled: templateLoadAttempted, // Solo guardar después de la carga inicial
    autoSaveInterval: 5000,
  });

  // Verificar autorización de Graph al montar el componente
  useEffect(() => {
    if (!graphAuthLoading && !isAuthorized) {
      console.log('Usuario no autorizado al abrir MassEmailSender, mostrando dialog');
      setShowGraphAuthDialog(true);
    }
  }, [graphAuthLoading, isAuthorized]);

  // Cargar plantilla por opportunity_id si existe, o restaurar borrador
  useEffect(() => {
    const loadTemplateByOpportunity = async () => {
      // Si hay opportunityId, intentar cargar plantilla primero
      if (opportunityId) {
        try {
          const { emailTemplatesService } = await import('@/services/emailTemplatesService');
          const loadedTemplate = await emailTemplatesService.getTemplateByOpportunityId(opportunityId);
          
          if (loadedTemplate) {
            setTemplate({
              subject: loadedTemplate.subject,
              htmlContent: loadedTemplate.html_content,
              plainContent: loadedTemplate.plain_text_content || ''
            });
            clearBackup(); // Limpiar cualquier borrador existente
            setTemplateLoadAttempted(true);
            toast({
              title: "Plantilla cargada",
              description: `Se ha cargado la plantilla "${loadedTemplate.template_name}"`,
            });
            return;
          }
        } catch (error) {
          console.error('Error loading template by opportunity_id:', error);
        }
      }
      
      // Solo si no hay opportunityId o no se encontró plantilla, restaurar borrador
      const restored = restoreFromStorage();
      if (restored && (restored.subject || restored.htmlContent)) {
        setTemplate(restored);
        toast({
          title: "Borrador restaurado",
          description: "Se ha recuperado tu borrador anterior",
        });
      }
      setTemplateLoadAttempted(true);
    };
    
    loadTemplateByOpportunity();
  }, [opportunityId]);

  // Cargar historial de correos cuando se activa la pestaña de logs
  useEffect(() => {
    if (activeTab === 'logs') {
      fetchEmailLogs();
    }
  }, [activeTab]);

  // Limpiar borrador cuando se envíe exitosamente
  const handleSuccessfulSend = () => {
    clearBackup();
  };
  
  // Estado para email alternativo en envíos individuales
  const [alternateEmail, setAlternateEmail] = useState('');

  // Filtrar leads que tengan email válido
  const validLeads = filteredLeads.filter(lead => lead.email && lead.email.trim() !== '');
  
  // Estado para trackear qué leads están seleccionados (por defecto todos)
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(() => new Set(validLeads.map(l => l.id)));
  
  // Actualizar selección SOLO cuando cambie la lista de IDs de validLeads
  useEffect(() => {
    const validLeadIds = validLeads.map(l => l.id).sort().join(',');
    const currentIds = Array.from(selectedLeadIds).sort().join(',');
    
    if (validLeadIds !== currentIds && validLeads.length > 0) {
      setSelectedLeadIds(new Set(validLeads.map(l => l.id)));
    }
  }, [validLeads.map(l => l.id).join(',')]);
  
  // Leads que realmente se enviarán (seleccionados y limitados a 50)
  const leadsToSend = validLeads.filter(lead => selectedLeadIds.has(lead.id)).slice(0, 50);
  const isOverLimit = leadsToSend.length > 50;

  const handleSendEmails = async () => {
    if (!template.subject.trim() || !template.htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa el asunto y contenido del email",
        variant: "destructive"
      });
      return;
    }

    if (leadsToSend.length === 0) {
      toast({
        title: "Error",
        description: "No hay leads seleccionados para enviar correos",
        variant: "destructive"
      });
      return;
    }

    if (leadsToSend.length > 50) {
      toast({
        title: "Error",
        description: "El máximo permitido es 50 correos por envío. Por favor, reduce la cantidad de destinatarios.",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleGraphAuthComplete = async () => {
    setShowGraphAuthDialog(false);
    await checkStatus();
    
    if (isAuthorized) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmSend = async () => {
    setShowConfirmation(false);
    setShowProgressModal(true);
    
    const success = await sendMassEmail(leadsToSend, template, alternateEmail, attachments);
    if (success) {
      handleSuccessfulSend();
    }
  };

  const handleCloseProgress = () => {
    setShowProgressModal(false);
    fetchEmailLogs();
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const isReadyToSend = template.subject.trim() && template.htmlContent.trim() && leadsToSend.length > 0 && leadsToSend.length <= 50;
  
  const handleToggleLead = (leadId: string) => {
    setSelectedLeadIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(leadId)) {
        newSet.delete(leadId);
      } else {
        newSet.add(leadId);
      }
      return newSet;
    });
  };

  return (
    <>
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header fijo con tabs y toolbar */}
        <div className="flex-shrink-0 pb-3 border-b space-y-3">
        {/* Título y badge en una línea */}
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg sm:text-xl font-semibold">Envío de Correos</h2>
            <Badge variant="secondary" className="text-xs">
              <Filter className="h-3 w-3 mr-1 text-white" />
              <span className="text-white">{leadsToSend.length} de {validLeads.length} seleccionados</span>
            </Badge>
            {isOverLimit && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Máximo 50
              </Badge>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-full h-9">
              <TabsTrigger 
                value="compose" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-200 gap-1 h-full"
              >
                <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Nuevo Correo</span>
                <span className="sm:hidden">Nuevo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-200 gap-1 h-full"
              >
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Previsualizar</span>
                <span className="sm:hidden">Vista</span>
              </TabsTrigger>
              <TabsTrigger 
                value="logs" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full text-xs sm:text-sm font-medium transition-all duration-200 gap-1 h-full"
              >
                <History className="h-3 w-3 sm:h-4 sm:w-4" />
                Historial
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Portal container para toolbar de EmailComposer - solo visible en tab compose */}
          {activeTab === 'compose' && (
            <div ref={toolbarPortalRef} className="mt-2" />
          )}
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto py-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="compose" className="space-y-4 mt-0">
              <EmailComposer
                template={template}
                onTemplateChange={setTemplate}
                dynamicFields={dynamicFields}
                isIndividual={validLeads.length === 1}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                alternateEmail={alternateEmail}
                onAlternateEmailChange={setAlternateEmail}
                toolbarPortalRef={toolbarPortalRef}
              />
            </TabsContent>

            <TabsContent value="preview" className="space-y-4 mt-0">
              <EmailPreview
                leads={validLeads}
                template={template}
                replaceDynamicFields={replaceDynamicFields}
                alternateEmail={alternateEmail}
                selectedLeadIds={selectedLeadIds}
                onToggleLead={handleToggleLead}
              />
            </TabsContent>

            <TabsContent value="logs" className="space-y-4 mt-0">
              <EmailStatusLogs
                logs={validLeads.length === 1 ? emailLogs.filter(log => log.LeadId === validLeads[0]?.id) : emailLogs}
                isLoading={isLoading}
                onRefresh={fetchEmailLogs}
                onFetchDetail={fetchEmailLogDetail}
                onDownloadAttachment={downloadEmailAttachment}
                onResendEmail={resendEmail}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer fijo con botones de acción */}
        <div className="flex-shrink-0 pt-3 border-t bg-background">
          {activeTab === 'compose' && (
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <div className="text-xs text-muted-foreground text-center sm:text-left">
                {leadsToSend.length} correo(s) listos para enviar
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  disabled={!isReadyToSend}
                  className="flex-1 sm:flex-none text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Previsualizar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendEmails}
                  disabled={!isReadyToSend || isLoading}
                  className="flex-1 sm:flex-none text-xs"
                >
                  <Send className="h-3 w-3 mr-1" />
                  {isLoading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'preview' && (
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('compose')}
                className="text-xs"
              >
                Volver a Editar
              </Button>
              <Button
                size="sm"
                onClick={handleSendEmails}
                disabled={!isReadyToSend || isLoading}
                className="text-xs"
              >
                <Send className="h-3 w-3 mr-1" />
                {isLoading ? 'Enviando...' : `Confirmar (${leadsToSend.length})`}
              </Button>
            </div>
          )}
        </div>
      </div>

      <EmailSendConfirmation
        isOpen={showConfirmation}
        onConfirm={handleConfirmSend}
        onCancel={() => setShowConfirmation(false)}
        recipientCount={leadsToSend.length}
        isLoading={isLoading}
      />

      <EmailSendProgressModal
        isOpen={showProgressModal}
        progress={sendProgress}
        events={sendEvents}
        onPauseResume={pauseResumeSend}
        onCancel={cancelSend}
        onClose={handleCloseProgress}
        onDownloadReport={downloadReport}
      />

      <GraphAuthRequiredDialog
        open={showGraphAuthDialog}
        onOpenChange={(open) => {
          setShowGraphAuthDialog(open);
          if (!open) {
            onClose();
          }
        }}
        onAuthorizationComplete={handleGraphAuthComplete}
      />
    </>
  );
}
