import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraphAuthButton } from "@/components/GraphAuthButton";
import { Mail, ShieldCheck, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/**
 * Componente para gestionar integraciones con Microsoft
 * Permite al usuario autorizar el envío de correos corporativos
 */
export function ProfileMicrosoftIntegration() {
  const handleAuthorizationComplete = (accountEmail?: string) => {
    console.log('Autorización completada para:', accountEmail);
  };

  const handleAuthorizationRevoked = () => {
    console.log('Autorización revocada');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Integraciones Microsoft</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Conecta tu cuenta corporativa de Microsoft para funcionalidades adicionales
        </p>
      </div>

      {/* Email Authorization Card */}
      <Card className="p-6 border-border/40 space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg">Envío de Correos Corporativos</h3>
            <p className="text-sm text-muted-foreground">
              Autoriza el envío automático de correos desde tu cuenta corporativa de Microsoft
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base">Estado de la Autorización</Label>
            <GraphAuthButton
              variant="ghost"
              size="lg"
              authorizeText="Conectar Cuenta Corporativa"
              authorizedText="Cuenta Corporativa Conectada"
              onAuthorizationComplete={handleAuthorizationComplete}
              onAuthorizationRevoked={handleAuthorizationRevoked}
              className="w-full sm:w-auto"
            />
          </div>

          {/* Benefits Section */}
          <div className="mt-6 space-y-3">
            <Label className="text-base">Beneficios de la Conexión</Label>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Envío automático de correos de seguimiento a leads y oportunidades</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Notificaciones por correo electrónico sin necesidad de estar conectado</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Los correos se envían desde tu cuenta corporativa, no desde el sistema</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Mayor confianza y profesionalismo en las comunicaciones</span>
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Security Information */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Seguridad y Privacidad</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200 space-y-2">
          <p className="text-sm">
            Tu información está segura. Al autorizar esta integración:
          </p>
          <ul className="text-sm space-y-1 ml-4 list-disc">
            <li>Solo obtenemos permisos para enviar correos en tu nombre</li>
            <li>No accedemos a tu bandeja de entrada ni leemos tus correos</li>
            <li>Los tokens se almacenan encriptados en nuestra base de datos</li>
            <li>Puedes revocar el acceso en cualquier momento</li>
            <li>La conexión usa el protocolo OAuth 2.0 de Microsoft</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Technical Details */}
      <Card className="p-4 border-border/40 bg-muted/20">
        <div className="space-y-2">
          <h4 className="font-medium text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Detalles Técnicos
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• <strong>Permisos solicitados:</strong> Mail.Send, User.Read, offline_access</p>
            <p>• <strong>Protocolo:</strong> OAuth 2.0 Authorization Code Flow</p>
            <p>• <strong>Validez de tokens:</strong> Los tokens se renuevan automáticamente</p>
            <p>• <strong>Duración:</strong> La autorización permanece activa hasta que la revoques</p>
          </div>
        </div>
      </Card>

      {/* FAQ Section */}
      <Card className="p-6 border-border/40">
        <h4 className="font-semibold mb-4">Preguntas Frecuentes</h4>
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-foreground">¿Por qué necesito autorizar mi cuenta?</p>
            <p className="text-muted-foreground mt-1">
              Para que el sistema pueda enviar correos en tu nombre de forma automática, incluso cuando no estés
              conectado. Esto mejora la experiencia de seguimiento con clientes.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">¿Los correos se envían desde mi cuenta?</p>
            <p className="text-muted-foreground mt-1">
              Sí, todos los correos se envían desde tu cuenta corporativa de Microsoft, apareciendo como si tú los
              hubieras enviado directamente.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">¿Puedo revocar el acceso?</p>
            <p className="text-muted-foreground mt-1">
              Por supuesto. Solo haz clic en el botón "Cuenta Corporativa Conectada" y se desconectará inmediatamente.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">¿Qué pasa si cambio mi contraseña de Microsoft?</p>
            <p className="text-muted-foreground mt-1">
              La autorización seguirá funcionando. OAuth 2.0 no depende de tu contraseña, sino de tokens de acceso
              que se renuevan automáticamente.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
