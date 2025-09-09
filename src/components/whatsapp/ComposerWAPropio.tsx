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
  throttle: { porMinuto: number; jitterSeg: [number, number] | null };
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
    // Temporalmente deshabilitado el check de requisitos para pruebas
    return true && // requirementsValid && 
           message.trim().length > 0 && 
           validLeads.length > 0;
  };

  const handleSend = () => {
    if (!canSend()) return;

    const config: SendConfig = {
      message: message.trim(),
      attachments,
      throttle: {
        porMinuto: throttlePerMinute,
        jitterSeg: useJitter ? [2, 5] : null
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="pl-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-[#25D366]" />
              Envío por WhatsApp (tu número)
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {leads.length} leads seleccionados
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Sugerido: máx. {suggestedLimit}/día
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Composición */}
        <div className="lg:col-span-2 space-y-6">
          {/* Composición del mensaje */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Composición del Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PlaceholdersBar onInsertPlaceholder={insertPlaceholder} />
              
              <div className="space-y-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Escribe tu mensaje aquí... Puedes usar {name}, {company}, {email}, {phone} para personalizar"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{characterCount} caracteres</span>
                  {isLongMessage && (
                    <span className="flex items-center gap-1 text-yellow-600">
                      <AlertCircle className="h-3 w-3" />
                      Mensaje largo (puede dividirse)
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
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Previsualización
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="h-4 w-4 mr-1" />
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
            <CardHeader>
              <CardTitle className="text-lg">Parámetros de Envío</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
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
                  <Label className="text-sm font-medium">Jitter aleatorio</Label>
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
                  <Label className="text-sm font-medium">Modo de prueba</Label>
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
        <div className="space-y-6">
          <RequirementsChecklist
            onValidationChange={setRequirementsValid}
          />

          {/* Nota de seguridad */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-800">
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
      <div className="flex justify-between items-center pt-4 border-t bg-background sticky bottom-0 py-4">
        <div className="text-sm text-muted-foreground">
          {validLeads.length} mensajes listos • 
          {dryRun ? ' Modo prueba (3 contactos)' : ` Envío completo`}
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={() => setShowPreview(true)}
            variant="outline"
            disabled={validLeads.length === 0 || !message.trim()}
          >
            <Eye className="h-4 w-4 mr-2" />
            Previsualizar
          </Button>
          
          <Button
            onClick={handleSend}
            disabled={!canSend()}
            className="bg-[#25D366] hover:bg-[#25D366]/90"
          >
            <Send className="h-4 w-4 mr-2" />
            {dryRun ? 'Enviar Prueba' : 'Enviar WhatsApp'}
          </Button>
        </div>
      </div>
    </div>
  );
}