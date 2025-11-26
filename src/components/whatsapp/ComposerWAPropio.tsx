import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Send,
  Eye,
  AlertCircle,
  FileText,
  Users,
  MessageSquare,
  Clock,
  Zap
} from 'lucide-react';
import { Lead } from '@/types/crm';
import { RequirementsChecklist } from './RequirementsChecklist';
import { PhoneValidationSummary } from './PhoneValidationSummary';
import { MessagePreviewSamples } from './MessagePreviewSamples';
import { PlaceholdersBar } from './PlaceholdersBar';
import { AttachmentPicker } from './AttachmentPicker';
import { normalizarTelefonoColombia } from '@/utils/whatsapp-phone';
import { FileRef } from '@/types/whatsapp-propio';

interface ComposerWAPropioProps {
  leads: Lead[];
  onBack: () => void;
  onSend: (config: SendConfig) => void;
}

export interface SendConfig {
  message: string;
  attachments: FileRef[];
  throttle: { minMs?: number; maxMs?: number; perMin?: number };
  dryRun: boolean;
  validLeads: Lead[];
}

export function ComposerWAPropio({ leads, onBack, onSend }: ComposerWAPropioProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileRef[]>([]);
  const [throttlePerMinute, setThrottlePerMinute] = useState(10);
  const [useJitter, setUseJitter] = useState(true);
  const [dryRun, setDryRun] = useState(false);
  const [requirementsValid, setRequirementsValid] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Validar teléfonos
  const validatePhones = () => {
    const validLeads = [];
    const errors = [];
    
    for (const lead of leads) {
      const result = normalizarTelefonoColombia(lead.phone || '');
      if (result.ok) {
        validLeads.push({
          ...lead,
          phone: result.e164! // Normalizado
        });
      } else {
        errors.push({
          leadId: lead.id,
          leadName: lead.name,
          phoneOriginal: lead.phone || '',
          motivo: result.motivo || 'Error desconocido'
        });
      }
    }
    
    return { validLeads, errors };
  };

  const { validLeads, errors } = validatePhones();

  const insertPlaceholder = (placeholder: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newMessage = message.substring(0, start) + 
                        `{${placeholder}}` + 
                        message.substring(end);
      
      setMessage(newMessage);
      
      // Restaurar cursor después del placeholder
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length + 2, start + placeholder.length + 2);
      }, 0);
    }
  };

  const renderMessageWithPlaceholders = (msg: string, lead: Lead) => {
    return msg
      .replace(/{name}/g, lead.name || 'N/A')
      .replace(/{company}/g, lead.company || 'N/A')
      .replace(/{email}/g, lead.email || 'N/A')
      .replace(/{phone}/g, lead.phone || 'N/A');
  };

  const canSend = () => {
    // Habilitado siempre para usar el nuevo protocolo Dali WA Sender
    return message.trim().length > 0 && validLeads.length > 0;
  };

  const handleSend = () => {
    if (!canSend()) return;

    const config: SendConfig = {
      message: message.trim(),
      attachments,
      throttle: {
        minMs: Math.floor(60000 / throttlePerMinute), // Convertir por minuto a millisegundos mínimos
        maxMs: Math.floor(60000 / throttlePerMinute) + (useJitter ? 4000 : 0), // Agregar jitter si está habilitado
        perMin: throttlePerMinute
      },
      dryRun,
      validLeads
    };

    onSend(config);
  };

  const suggestedLimit = 300;
  const characterCount = message.length;
  const isLongMessage = characterCount > 900;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="pl-0 shrink-0"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm">Volver</span>
          </Button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base sm:text-2xl font-bold flex items-center gap-1.5 sm:gap-2">
              <MessageSquare className="h-4 w-4 sm:h-6 sm:w-6 text-[#25D366] shrink-0" />
              <span className="truncate">Envío por WhatsApp</span>
            </h1>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Badge variant="secondary" className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            {leads.length} leads
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span className="hidden sm:inline">Sugerido: máx. {suggestedLimit}/día</span>
            <span className="sm:hidden">Máx. {suggestedLimit}/día</span>
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Columna izquierda: Composición */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Composición del mensaje */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Composición del Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <PlaceholdersBar onInsertPlaceholder={insertPlaceholder} />
              
              <div className="space-y-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Escribe tu mensaje aquí... Puedes usar {name}, {company}, {email}, {phone} para personalizar"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[100px] sm:min-h-[120px] resize-none text-sm sm:text-base"
                />
                <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                  <span>{characterCount} caracteres</span>
                  {isLongMessage && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertCircle className="h-3 w-3" />
                      <span className="hidden sm:inline">Mensaje largo (puede dividirse)</span>
                      <span className="sm:hidden">Largo</span>
                    </span>
                  )}
                </div>
              </div>

              <AttachmentPicker
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                maxFiles={2}
              />
            </CardContent>
          </Card>

          {/* Validación de teléfonos */}
          <PhoneValidationSummary
            validCount={validLeads.length}
            errorCount={errors.length}
            errors={errors}
          />

          {/* Previsualización */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg flex items-center justify-between">
                Previsualización
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  size="sm"
                  className="text-xs sm:text-sm"
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {showPreview ? 'Ocultar' : 'Ver todo'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MessagePreviewSamples
                leads={validLeads}
                message={message}
                renderMessage={renderMessageWithPlaceholders}
                showAll={showPreview}
              />
            </CardContent>
          </Card>

          {/* Parámetros de envío */}
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-base sm:text-lg">Parámetros de Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <Label className="text-xs sm:text-sm font-medium">
                  Velocidad: {throttlePerMinute} mensajes por minuto
                </Label>
                <Slider
                  value={[throttlePerMinute]}
                  onValueChange={(value) => setThrottlePerMinute(value[0])}
                  min={5}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Recomendado: 10 msg/min para evitar bloqueos
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs sm:text-sm font-medium">Jitter aleatorio</Label>
                  <p className="text-xs text-muted-foreground">
                    Variar tiempo entre mensajes (2-5 segundos)
                  </p>
                </div>
                <Switch
                  checked={useJitter}
                  onCheckedChange={setUseJitter}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-xs sm:text-sm font-medium">Modo de prueba</Label>
                  <p className="text-xs text-muted-foreground">
                    Enviar solo a los primeros 3 contactos
                  </p>
                </div>
                <Switch
                  checked={dryRun}
                  onCheckedChange={setDryRun}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Requisitos */}
        <div className="space-y-4 sm:space-y-6">
          <RequirementsChecklist
            onValidationChange={setRequirementsValid}
          />

          {/* Nota de seguridad */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>Seguridad y privacidad:</strong> Dali no accede a tus 
                conversaciones ni a tu cuenta. La extensión solo automatiza 
                la escritura y el clic de envío en WhatsApp Web abierto por ti 
                en tu navegador.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer de acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t bg-background sticky bottom-0 py-3 sm:py-4">
        <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
          {validLeads.length} mensajes listos • 
          {dryRun ? ' Modo prueba (3 contactos)' : ` Envío completo`}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            disabled={validLeads.length === 0 || !message.trim()}
            className="w-full sm:w-auto text-xs sm:text-sm"
          >
            <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Previsualizar
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!canSend()}
            className="w-full sm:w-auto bg-[#25D366] hover:bg-[#25D366]/90 text-xs sm:text-sm"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            {dryRun ? 'Enviar Prueba' : 'Enviar WhatsApp'}
          </Button>
        </div>
      </div>
    </div>
  );
}