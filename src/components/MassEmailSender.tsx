
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Send, Eye, History, Filter, AlertTriangle } from 'lucide-react';
import { Lead } from '@/types/crm';
import { EmailTemplate } from '@/types/email';
import { EmailComposer } from '@/components/EmailComposer';
import { EmailPreview } from '@/components/EmailPreview';
import { EmailStatusLogs } from '@/components/EmailStatusLogs';
import { EmailSendConfirmation } from '@/components/EmailSendConfirmation';
import { useMassEmail } from '@/hooks/useMassEmail';
import { useToast } from '@/hooks/use-toast';

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
    fetchEmailLogs
  } = useMassEmail();

  const [activeTab, setActiveTab] = useState('compose');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [template, setTemplate] = useState<EmailTemplate>({
    subject: '',
    htmlContent: '',
    plainContent: ''
  });

  // Filtrar leads que tengan email válido y limitar a 20
  const validLeads = filteredLeads.filter(lead => lead.email && lead.email.trim() !== '');
  const leadsToShow = validLeads.slice(0, 20);
  const isOverLimit = validLeads.length > 20;

  const handleSendEmails = async () => {
    if (!template.subject.trim() || !template.htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa el asunto y contenido del email",
        variant: "destructive"
      });
      return;
    }

    if (validLeads.length === 0) {
      toast({
        title: "Error",
        description: "No hay leads con email válido para enviar correos",
        variant: "destructive"
      });
      return;
    }

    if (validLeads.length > 20) {
      toast({
        title: "Error",
        description: "El máximo permitido es 20 correos por envío. Por favor, reduce la cantidad de destinatarios.",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmation(false);
    
    const success = await sendMassEmail(leadsToShow, template);
    if (success) {
      // Cambiar a la pestaña de historial para ver los resultados
      setActiveTab('logs');
      // Actualizar logs
      fetchEmailLogs();
    }
  };

  const isReadyToSend = template.subject.trim() && template.htmlContent.trim() && validLeads.length > 0 && validLeads.length <= 20;

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Envío de Correos
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  <Filter className="h-4 w-4 mr-1" />
                  {validLeads.length} leads con email válido
                </Badge>
                {isOverLimit && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Máximo 20 correos
                  </Badge>
                )}
                <Button variant="outline" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            </CardTitle>
            {isOverLimit && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <span className="text-amber-800 text-sm">
                  Se mostrarán solo los primeros 20 leads. {validLeads.length - 20} leads adicionales serán omitidos.
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="compose" className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Componer
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Previsualizar
                </TabsTrigger>
                <TabsTrigger value="logs" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historial
                </TabsTrigger>
              </TabsList>

              <TabsContent value="compose" className="space-y-6">
                <EmailComposer
                  template={template}
                  onTemplateChange={setTemplate}
                  dynamicFields={dynamicFields}
                />
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {leadsToShow.length} correo(s) listos para enviar
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

              <TabsContent value="preview" className="space-y-6">
                <EmailPreview
                  leads={leadsToShow}
                  template={template}
                  replaceDynamicFields={replaceDynamicFields}
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
                    {isLoading ? 'Enviando...' : `Confirmar Envío (${leadsToShow.length} correos)`}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="space-y-6">
                <EmailStatusLogs
                  logs={emailLogs}
                  isLoading={isLoading}
                  onRefresh={fetchEmailLogs}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <EmailSendConfirmation
        isOpen={showConfirmation}
        onConfirm={handleConfirmSend}
        onCancel={() => setShowConfirmation(false)}
        recipientCount={leadsToShow.length}
        isLoading={isLoading}
      />
    </>
  );
}
