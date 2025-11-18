import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GraphAuthButton } from '@/components/GraphAuthButton';
import { useGraphAuthorization, useGraphEmailSender } from '@/hooks/useGraphAuthorization';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Componente de ejemplo para demostrar el uso de Microsoft Graph OAuth
 * Este componente puede ser usado como referencia o para testing
 */
export function GraphAuthExample() {
  const { isAuthorized, accountEmail, loading: authLoading } = useGraphAuthorization();
  const { sendEmail, sending } = useGraphEmailSender();
  const { toast } = useToast();

  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSendEmail = async () => {
    if (!to || !subject || !body) {
      toast({
        title: 'Campos requeridos',
        description: 'Por favor completa todos los campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      await sendEmail({
        to: to.split(',').map(email => email.trim()),
        subject,
        body,
        isHtml: false,
      });

      toast({
        title: 'Correo enviado',
        description: `Correo enviado exitosamente a ${to}`,
      });

      // Limpiar formulario
      setTo('');
      setSubject('');
      setBody('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al enviar correo',
        variant: 'destructive',
      });
    }
  };

  if (authLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Verificando autorización...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estado de Autorización */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Estado de Microsoft Graph
          </CardTitle>
          <CardDescription>
            Gestiona tu conexión con Microsoft para envío de correos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthorized ? (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Conectado exitosamente</strong>
                <br />
                Cuenta: {accountEmail}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                No has autorizado tu cuenta de Microsoft. Conéctala para enviar correos.
              </AlertDescription>
            </Alert>
          )}

          <GraphAuthButton 
            variant={isAuthorized ? 'outline' : 'default'}
            size="lg"
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Formulario de Envío de Correo (solo si está autorizado) */}
      {isAuthorized && (
        <Card>
          <CardHeader>
            <CardTitle>Enviar Correo de Prueba</CardTitle>
            <CardDescription>
              Este correo se enviará desde tu cuenta corporativa: {accountEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="to">Para (separar múltiples con comas)</Label>
              <Input
                id="to"
                type="text"
                placeholder="ejemplo@email.com, otro@email.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                type="text"
                placeholder="Asunto del correo"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={sending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Mensaje</Label>
              <Textarea
                id="body"
                placeholder="Escribe tu mensaje aquí..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={sending}
                rows={6}
              />
            </div>

            <Button 
              onClick={handleSendEmail} 
              disabled={sending}
              className="w-full"
              size="lg"
            >
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Correo
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Información Adicional */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            ℹ️ Información
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            <strong>¿Qué es Microsoft Graph OAuth?</strong>
          </p>
          <p>
            Es una forma segura de dar permisos a esta aplicación para enviar correos 
            en tu nombre desde tu cuenta corporativa de Microsoft.
          </p>
          <p className="pt-2">
            <strong>Beneficios:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Los correos se envían desde tu cuenta, no desde el sistema</li>
            <li>Mayor confianza para los destinatarios</li>
            <li>Funciona incluso cuando no estás conectado</li>
            <li>Puedes revocar el acceso en cualquier momento</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
