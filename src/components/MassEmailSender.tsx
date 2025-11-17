import { useState, useEffect } from 'react';
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
}

export function MassEmailSender({ filteredLeads, onClose }: MassEmailSenderProps) {
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

  // Persistencia automática del borrador
  const { hasBackup, restoreFromStorage, clearBackup } = useFormPersistence({
    key: 'mass-email-draft',
    data: template,
    enabled: true,
    autoSaveInterval: 5000, // Guardar cada 5 segundos
  });

  // Verificar autorización de Graph al montar el componente
  useEffect(() => {
    if (!graphAuthLoading && !isAuthorized) {
      console.log('Usuario no autorizado al abrir MassEmailSender, mostrando dialog');
      setShowGraphAuthDialog(true);
    }
  }, [graphAuthLoading, isAuthorized]);

  // Restaurar borrador al montar el componente
  useEffect(() => {
    const restored = restoreFromStorage();
    if (restored && (restored.subject || restored.htmlContent)) {
      setTemplate(restored);
      toast({
        title: "Borrador restaurado",
        description: "Se ha recuperado tu borrador anterior",
      });
    }
  }, []);

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
  
  // Actualizar selección cuando cambien los validLeads
  useEffect(() => {
    setSelectedLeadIds(new Set(validLeads.map(l => l.id)));
  }, [filteredLeads]);
  
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

    // Proceder con la confirmación (la autorización ya fue verificada al abrir el modal)
    setShowConfirmation(true);
  };

  const handleGraphAuthComplete = async () => {
    setShowGraphAuthDialog(false);
    await checkStatus();
    
    // Después de autorizar, mostrar la confirmación
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
    // Close parent modal after a short delay
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Envío de Correos</h2>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                <Filter className="h-4 w-4 mr-1 text-white" />
                <span className="text-white">{leadsToSend.length} de {validLeads.length} seleccionados</span>
              </Badge>
              {isOverLimit && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Máximo 50 correos
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-100 rounded-full px-0 py-0 my-0">
            <TabsTrigger 
              value="compose" 
              className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200"
            >
              <Mail className="h-4 w-4" />
              Nuevo Correo
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-10 py-2 h-full text-sm font-medium transition-all duration-200"
            >
              <Eye className="h-4 w-4" />
              Previsualizar
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-10 py-2 h-full text-sm font-medium transition-all duration-200"
            >
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6 mt-4">
            <EmailComposer
              template={template}
              onTemplateChange={setTemplate}
              dynamicFields={dynamicFields}
              isIndividual={validLeads.length === 1}
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              alternateEmail={alternateEmail}
              onAlternateEmailChange={setAlternateEmail}
            />
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {leadsToSend.length} correo(s) listos para enviar
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('preview')}
                  disabled={!isReadyToSend}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Previsualizar
                </Button>
                <Button
                  onClick={handleSendEmails}
                  disabled={!isReadyToSend || isLoading}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Enviando...' : 'Enviar Correos'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 mt-4">
            <EmailPreview
              leads={validLeads}
              template={template}
              replaceDynamicFields={replaceDynamicFields}
              alternateEmail={alternateEmail}
              selectedLeadIds={selectedLeadIds}
              onToggleLead={handleToggleLead}
            />
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setActiveTab('compose')}
              >
                Volver a Editar
              </Button>
              <Button
                onClick={handleSendEmails}
                disabled={!isReadyToSend || isLoading}
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Enviando...' : `Confirmar Envío (${leadsToSend.length} correos)`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6 mt-4">
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
          // Si el usuario cierra el dialog sin autorizar, cerrar también el componente padre
          if (!open) {
            onClose();
          }
        }}
        onAuthorizationComplete={handleGraphAuthComplete}
      />
    </>
  );
}

