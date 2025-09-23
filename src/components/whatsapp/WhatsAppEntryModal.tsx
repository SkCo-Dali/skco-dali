import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Smartphone, 
  Chrome, 
  Zap, 
  Shield, 
  Users, 
  CheckCircle, 
  Star,
  Bot
} from 'lucide-react';

interface WhatsAppEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPropio: () => void;
  onSelectSami: () => void;
  leadsCount: number;
}

export function WhatsAppEntryModal({ 
  isOpen, 
  onClose, 
  onSelectPropio, 
  onSelectSami, 
  leadsCount 
}: WhatsAppEntryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MessageSquare className="h-6 w-6 text-[#25D366]" />
            Enviar por WhatsApp
          </DialogTitle>
          <DialogDescription>
            Selecciona cómo deseas enviar mensajes a {leadsCount} leads
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Opción A: WhatsApp Propio */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Recomendado
              </Badge>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg pt-4">
                <Smartphone className="h-5 w-5 text-[#25D366]" />
                Envía desde tu propio WhatsApp
              </CardTitle>
              <CardDescription>
                Recomendado si deseas iniciar conversaciones 1:1 y mantener todo en tu línea personal o de negocio
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pb-4">
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Requisitos
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-5">
                  <li className="flex items-center gap-2">
                    <Chrome className="h-3 w-3" />
                    Usa Google Chrome en escritorio
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Instala la extensión Dali WA Sender (te guiamos en 3 pasos)
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" />
                    Mantén WhatsApp Web abierto y con sesión activa
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  Ventajas
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-5">
                  <li className="flex items-start gap-2">
                    <Shield className="h-3 w-3 mt-0.5" />
                    Control total de la conversación desde tu celular
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageSquare className="h-3 w-3 mt-0.5" />
                    Mensaje libre (sin plantillas preaprobadas)
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="h-3 w-3 mt-0.5" />
                    Dali no accede a tus conversaciones ni cuenta
                  </li>
                </ul>
              </div>

              <Button 
                onClick={onSelectPropio}
                className="w-full bg-[#25D366] hover:bg-[#25D366]/90"
                size="lg"
              >
                Continuar con mi WhatsApp
              </Button>
            </CardContent>
          </Card>

          {/* Opción B: Sami WhatsApp */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors">
            <div className="absolute top-4 right-4">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Oficial
              </Badge>
            </div>
            
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Bot className="h-5 w-5 text-orange-500" />
                Envía desde Sami WhatsApp
              </CardTitle>
              <CardDescription>
                Usa la línea oficial con marca Skandia y flujos de Sami
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  Características
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-5">
                  <li className="flex items-center gap-2">
                    <Chrome className="h-3 w-3" />
                    No requiere Chrome ni extensión
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageSquare className="h-3 w-3" />
                    Funciona en cualquier navegador
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Debes escoger una plantilla preaprobada
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  Ventajas
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-5">
                  <li className="flex items-start gap-2">
                    <Users className="h-3 w-3 mt-0.5" />
                    Línea oficial con imagen de Sami
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-3 w-3 mt-0.5" />
                    Flujos de calificación automáticos
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 mt-0.5" />
                    Llegan leads más calientes (interesados reales)
                  </li>
                </ul>
              </div>

              <Button 
                onClick={onSelectSami}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Usar Sami WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Nota de privacidad */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 flex items-start gap-2">
            <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
            <span>
              <strong>Privacidad garantizada:</strong> Dali no accede a tus conversaciones ni a tu cuenta de WhatsApp. 
              La automatización ocurre en tu navegador sobre WhatsApp Web abierto por ti.
            </span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}