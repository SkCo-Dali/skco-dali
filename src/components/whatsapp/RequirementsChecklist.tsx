import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Chrome, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { ExtensionBridge } from '@/utils/extension-bridge';

interface RequirementsChecklistProps {
  onValidationChange: (isValid: boolean) => void;
}

export function RequirementsChecklist({ onValidationChange }: RequirementsChecklistProps) {
  const [isChrome, setIsChrome] = useState(false);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  const extensionBridge = new ExtensionBridge();

  useEffect(() => {
    // Verificar Chrome
    setIsChrome(ExtensionBridge.isChrome());
    
    // Verificar extensión automáticamente
    checkExtension();

    return () => {
      extensionBridge.cleanup();
    };
  }, []);

  useEffect(() => {
    // Notificar cambios de validación
    const isValid = isChrome && extensionDetected && sessionActive;
    onValidationChange(isValid);
  }, [isChrome, extensionDetected, sessionActive, onValidationChange]);

  const checkExtension = async () => {
    try {
      const detected = await extensionBridge.ping();
      setExtensionDetected(detected);
      // No asumir que la sesión está activa solo porque la extensión responde
    } catch (error) {
      setExtensionDetected(false);
      setSessionActive(false);
    }
  };

  const verifySession = async () => {
    if (!extensionDetected) return;
    
    setIsCheckingSession(true);
    try {
      const sessionOk = await extensionBridge.ping();
      setSessionActive(sessionOk);
    } catch (error) {
      setSessionActive(false);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const openWhatsAppWeb = () => {
    window.open('https://web.whatsapp.com/', '_blank');
  };

  const openExtensionInstall = () => {
    const installUrl = 'https://chromewebstore.google.com/detail/wa-sender/hcddckfgihadahfdiefinmneegaoehdh';
    window.open(installUrl, '_blank');
  };

  const StatusIcon = ({ condition }: { condition: boolean | null }) => {
    if (condition === true) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (condition === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Checklist de Requisitos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chrome */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Chrome className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-medium">Google Chrome</h4>
              <p className="text-sm text-muted-foreground">
                Navegador requerido para la extensión
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon condition={isChrome} />
            {isChrome ? (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Detectado
              </Badge>
            ) : (
              <Badge variant="destructive">
                No detectado
              </Badge>
            )}
          </div>
        </div>

        {/* Extensión */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-purple-600" />
            <div>
              <h4 className="font-medium">Extensión WA-Sender</h4>
              <p className="text-sm text-muted-foreground">
                Automatiza el envío en WhatsApp Web
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon condition={extensionDetected} />
            {extensionDetected ? (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Instalada
              </Badge>
            ) : (
              <>
                <Badge variant="destructive">
                  No instalada
                </Badge>
                <Button
                  onClick={openExtensionInstall}
                  size="sm"
                  variant="outline"
                  className="ml-2"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Instalar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* WhatsApp Web */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <ExternalLink className="h-5 w-5 text-[#25D366]" />
            <div>
              <h4 className="font-medium">WhatsApp Web</h4>
              <p className="text-sm text-muted-foreground">
                Sesión activa requerida
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon condition={sessionActive} />
            {sessionActive ? (
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Sesión activa
              </Badge>
            ) : (
              <>
                <Badge variant="destructive">
                  Sin sesión
                </Badge>
                <Button
                  onClick={openWhatsAppWeb}
                  size="sm"
                  variant="outline"
                  className="ml-2"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Abrir
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Verificar sesión */}
        <div className="pt-2">
          <Button
            onClick={verifySession}
            disabled={!extensionDetected || isCheckingSession}
            variant="outline"
            className="w-full"
          >
            {isCheckingSession ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Verificar Sesión
          </Button>
        </div>

        {/* Alertas */}
        {!isChrome && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">
              Esta opción requiere Google Chrome en escritorio y la instalación 
              de la extensión WA-Sender.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}