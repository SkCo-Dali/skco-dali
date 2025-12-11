import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Send, Eye, History, Filter, AlertTriangle, Mail, FileText, FileSignature, Plus, Share2 } from 'lucide-react';
import { Lead } from '@/types/crm';
import { EmailTemplate, DynamicField } from '@/types/email';
import { EmailComposer } from '@/components/EmailComposer';
import { EmailPreview } from '@/components/EmailPreview';
import { EmailStatusLogs } from '@/components/EmailStatusLogs';
import { EmailSendConfirmation } from '@/components/EmailSendConfirmation';
import { EmailSendProgressModal } from '@/components/EmailSendProgressModal';
import { GraphAuthRequiredDialog } from '@/components/GraphAuthRequiredDialog';
import { EmailSignatureDialog } from '@/components/EmailSignatureDialog';
import { EmailTemplatesModal } from '@/components/EmailTemplatesModal';
import { useMassEmail } from '@/hooks/useMassEmail';
import { useToast } from '@/hooks/use-toast';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useGraphAuthorization } from '@/hooks/useGraphAuthorization';

interface MassEmailSenderProps {
  filteredLeads: Lead[];
  onClose: () => void;
  opportunityId?: number;
}

export function MassEmailSender({ filteredLeads, onClose, opportunityId }: MassEmailSenderProps) {
  const { toast } = useToast();
  const { profile } = useUserProfile();
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
  
  // Estados para herramientas del header
  const [activePanel, setActivePanel] = useState<'fields' | 'social' | null>(null);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);

  const togglePanel = (panel: 'fields' | 'social') => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

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

  // Cargar plantilla por opportunity_id si existe, o restaurar borrador
  useEffect(() => {
    const loadTemplateByOpportunity = async () => {
      if (opportunityId) {
        try {
          const { emailTemplatesService } = await import('@/services/emailTemplatesService');
          const template = await emailTemplatesService.getTemplateByOpportunityId(opportunityId);
          
          if (template) {
            setTemplate({
              subject: template.subject,
              htmlContent: template.html_content,
              plainContent: template.plain_text_content || ''
            });
            clearBackup(); // Limpiar cualquier borrador anterior
            toast({
              title: "Plantilla cargada",
              description: `Se ha cargado la plantilla "${template.template_name}"`,
            });
            return;
          }
        } catch (error) {
          console.error('Error loading template by opportunity_id:', error);
        }
      }
      
      // Si no hay plantilla de oportunidad, restaurar borrador
      const restored = restoreFromStorage();
      if (restored && (restored.subject || restored.htmlContent)) {
        setTemplate(restored);
        toast({
          title: "Borrador restaurado",
          description: "Se ha recuperado tu borrador anterior",
        });
      }
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
    
    // Solo actualizar si la lista de leads cambió (no solo la referencia)
    if (validLeadIds !== currentIds && validLeads.length > 0) {
      setSelectedLeadIds(new Set(validLeads.map(l => l.id)));
    }
  }, [validLeads.map(l => l.id).join(',')]); // Depender de los IDs reales, no de la referencia
  
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

  // Colores para campos dinámicos
  const fieldColors: Record<string, { bg: string; text: string }> = {
    firstName: { bg: "#dbeafe", text: "#1e40af" },
    name: { bg: "#e5e7eb", text: "#374151" },
    company: { bg: "#fef3c7", text: "#92400e" },
    phone: { bg: "#e9d5ff", text: "#6b21a8" },
  };

  const getFieldColor = (fieldKey: string) => {
    return fieldColors[fieldKey] || { bg: "#e5e7eb", text: "#374151" };
  };

  // Handlers de drag para campos dinámicos
  const handleDragStart = (field: DynamicField) => (e: React.DragEvent) => {
    const colors = getFieldColor(field.key);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("fieldKey", field.key);
    e.dataTransfer.setData("fieldLabel", field.label);
    e.dataTransfer.setData("bgColor", colors.bg);
    e.dataTransfer.setData("textColor", colors.text);
  };

  // Handlers de drag para redes sociales
  const handleSocialNetworkDragStart = (network: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("socialNetwork", network);
  };

  // Función para insertar firma en el contenido
  const handleInsertSignature = (content: string) => {
    const newContent = template.htmlContent + "<br><br>" + content;
    setTemplate(prev => ({
      ...prev,
      htmlContent: newContent,
    }));
  };

  return (
    <>
      <div className="flex flex-col h-full max-h-[85vh]">
        {/* Header fijo */}
        <div className="flex-shrink-0 pb-3 border-b space-y-3">
          {/* Título y badges */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-semibold">Envío de Correos</h2>
              <div className="flex flex-wrap items-center gap-1.5">
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
            </div>
          </div>

          {/* Tabs siempre visibles */}
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

          {/* Botones de herramientas - siempre visibles en header */}
          {activeTab === 'compose' && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplatesModal(true)}
                  className="text-xs px-2"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Plantillas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSignatureDialog(true)}
                  className="text-xs px-2"
                >
                  <FileSignature className="h-3 w-3 mr-1" />
                  Firmas
                </Button>
                <Button
                  variant={activePanel === 'fields' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePanel('fields')}
                  className="text-xs px-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Campos Dinámicos
                </Button>
                <Button
                  variant={activePanel === 'social' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => togglePanel('social')}
                  className="text-xs px-2"
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  Redes Sociales
                </Button>
              </div>

              {/* Panel de campos dinámicos */}
              {activePanel === 'fields' && (
                <Card className="bg-muted/30 p-2">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {dynamicFields.map((field) => {
                      const colors = getFieldColor(field.key);
                      return (
                        <div
                          key={field.key}
                          draggable
                          onDragStart={handleDragStart(field)}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium cursor-move transition-transform hover:scale-105"
                          style={{
                            backgroundColor: colors.bg,
                            color: colors.text,
                          }}
                          title={`Arrastra al asunto o contenido. Ejemplo: ${field.example}`}
                        >
                          {field.label}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Arrastra los campos al asunto o contenido del email
                  </p>
                </Card>
              )}

              {/* Panel de redes sociales */}
              {activePanel === 'social' && (
                <Card className="bg-muted/30 p-2">
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    <div
                      draggable
                      onDragStart={handleSocialNetworkDragStart("whatsapp")}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium cursor-move transition-transform hover:scale-105 bg-[#00A859] text-white"
                      title="Arrastra al contenido del email para insertar botón de WhatsApp"
                    >
                      📱 WhatsApp
                    </div>
                    <div
                      draggable
                      onDragStart={handleSocialNetworkDragStart("instagram")}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium cursor-move transition-transform hover:scale-105 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white"
                      title="Arrastra al contenido del email para insertar botón de Instagram"
                    >
                      📸 Instagram
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Arrastra al contenido del email para insertar botones clicables
                  </p>
                </Card>
              )}
            </div>
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

      <EmailSignatureDialog
        isOpen={showSignatureDialog}
        onClose={() => setShowSignatureDialog(false)}
        onInsertSignature={handleInsertSignature}
      />

      <EmailTemplatesModal
        open={showTemplatesModal}
        onOpenChange={setShowTemplatesModal}
        onSelectTemplate={(selectedTemplate) => {
          setTemplate({
            subject: selectedTemplate.subject,
            htmlContent: selectedTemplate.htmlContent,
            plainContent: selectedTemplate.plainContent,
          });
        }}
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

