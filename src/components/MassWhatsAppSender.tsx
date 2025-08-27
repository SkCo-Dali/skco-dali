import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, History, MessageSquare, AlertTriangle, X } from 'lucide-react';
import { Lead } from '@/types/crm';
import { WhatsAppTemplate, WhatsAppValidationError } from '@/types/whatsapp';
import { WhatsAppTemplateSelector } from '@/components/WhatsAppTemplateSelector';
import { WhatsAppUserInfo } from '@/components/WhatsAppUserInfo';
import { WhatsAppPreview } from '@/components/WhatsAppPreview';
import { WhatsAppSendConfirmation } from '@/components/WhatsAppSendConfirmation';
import { WhatsAppSendLogs } from '@/components/WhatsAppSendLogs';
import { useMassWhatsApp } from '@/hooks/useMassWhatsApp';
import { useToast } from '@/hooks/use-toast';

interface MassWhatsAppSenderProps {
  filteredLeads: Lead[];
  onClose: () => void;
}

export function MassWhatsAppSender({ filteredLeads, onClose }: MassWhatsAppSenderProps) {
  const { toast } = useToast();
  const {
    isLoading,
    templates,
    userInfo,
    sendLogs,
    validateLeads,
    replaceTemplateVariables,
    fetchTemplates,
    fetchUserInfo,
    updateUserInfo,
    sendMassWhatsApp,
    fetchSendLogs
  } = useMassWhatsApp();

  const [activeTab, setActiveTab] = useState('compose');
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<WhatsAppValidationError[]>([]);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Validar leads al cargar el componente
  const { validLeads, errors } = validateLeads(filteredLeads);

  useEffect(() => {
    const hadPreviousErrors = validationErrors.length > 0;
    setValidationErrors(errors);
    
    // Solo mostrar errores si son nuevos o si no había errores anteriormente
    if (errors.length > 0 && !hadPreviousErrors) {
      setShowValidationErrors(true);
      toast({
        title: "Números inválidos encontrados",
        description: `${errors.length} leads tienen números de WhatsApp inválidos`,
        variant: "destructive"
      });
    }
  }, [filteredLeads, validateLeads, errors, toast, validationErrors.length]);

  useEffect(() => {
    fetchTemplates();
    fetchUserInfo();
    fetchSendLogs();
  }, [fetchTemplates, fetchUserInfo, fetchSendLogs]);

  const handleSendMessages = async () => {
    if (!selectedTemplate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una plantilla",
        variant: "destructive"
      });
      return;
    }

    if (validLeads.length === 0) {
      toast({
        title: "Error",
        description: "No hay leads válidos para enviar mensajes",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmation(false);
    
    if (selectedTemplate) {
      const success = await sendMassWhatsApp(validLeads, selectedTemplate);
      if (success) {
        setActiveTab('logs');
        fetchSendLogs();
      }
    }
  };

  const isReadyToSend = selectedTemplate && validLeads.length > 0 && userInfo.phoneNumber && userInfo.fullName;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-[#25D366]" />
            <h2 className="text-xl font-semibold">Envío Masivo de WhatsApp</h2>
          </div>
          <div className="flex items-center gap-2 mx-2">
            <Badge variant="secondary">
              {validLeads.length} leads válidos
            </Badge>
            {validationErrors.length > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {validationErrors.length} números inválidos
              </Badge>
            )}
          </div>
        </div>
        
        {validationErrors.length > 0 && showValidationErrors && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100"
              onClick={() => setShowValidationErrors(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <h4 className="font-medium text-red-800 mb-2 pr-8">Números de WhatsApp inválidos:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm text-red-700">
                  <strong>{error.leadName}</strong> - {error.phoneNumber || 'Sin número'}: {error.error}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-full px-0 py-0 my-0">
            <TabsTrigger value="compose" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">
              <Send className="h-4 w-4" />
              Componer
            </TabsTrigger>
            <TabsTrigger value="preview" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">
              <Eye className="h-4 w-4" />
              Previsualizar
            </TabsTrigger>
            <TabsTrigger value="logs" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6 mt-4">
            <WhatsAppTemplateSelector
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
              isLoading={isLoading}
            />
            
            <WhatsAppUserInfo
              userInfo={userInfo}
              onUpdateUserInfo={updateUserInfo}
              isLoading={isLoading}
            />
            
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {validLeads.length} mensajes listos para enviar
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
                  onClick={handleSendMessages}
                  disabled={!isReadyToSend || isLoading}
                  className="bg-[#25D366] hover:bg-[#25D366]/90"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isLoading ? 'Enviando...' : 'Enviar WhatsApp'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6 mt-4">
            {selectedTemplate ? (
              <WhatsAppPreview
                leads={validLeads}
                template={selectedTemplate}
                replaceTemplateVariables={replaceTemplateVariables}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-5">
                  <p className="text-muted-foreground">
                    Selecciona una plantilla para ver la previsualización
                  </p>
                </CardContent>
              </Card>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setActiveTab('compose')}
              >
                Volver a Componer
              </Button>
              <Button
                onClick={handleSendMessages}
                disabled={!isReadyToSend || isLoading}
                className="bg-[#25D366] hover:bg-[#25D366]/90"
              >
                <Send className="h-4 w-4 mr-2" />
                {isLoading ? 'Enviando...' : `Enviar ${validLeads.length} mensajes`}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6 mt-4">
            <WhatsAppSendLogs
              logs={sendLogs}
              isLoading={isLoading}
              onRefresh={fetchSendLogs}
            />
          </TabsContent>
        </Tabs>
      </div>

      <WhatsAppSendConfirmation
        isOpen={showConfirmation}
        onConfirm={handleConfirmSend}
        onCancel={() => setShowConfirmation(false)}
        messageCount={validLeads.length}
        isLoading={isLoading}
      />
    </>
  );
}
