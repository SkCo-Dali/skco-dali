import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, Chrome, Globe, MessageSquare, ExternalLink } from 'lucide-react';
import { detectChrome, detectExtension, checkWALogin } from '@/services/waSelfSender';

interface RequirementsChecklistProps {
  onValidationChange: (isValid: boolean) => void;
}

export function RequirementsChecklist({ onValidationChange }: RequirementsChecklistProps) {
  const [isChrome, setIsChrome] = useState(false);
  const [extensionDetected, setExtensionDetected] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);
  const [extensionVersion, setExtensionVersion] = useState<string>('');
  const [isCheckingExtension, setIsCheckingExtension] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  // Verificar requisitos iniciales
  useEffect(() => {
    console.log('🔍 RequirementsChecklist: Iniciando verificaciones...');
    
    // Verificar Chrome
    const chromeDetected = detectChrome();
    console.log('🔍 Chrome detectado:', chromeDetected);
    setIsChrome(chromeDetected);
    
    // Verificar extensión automáticamente
    if (chromeDetected) {
      checkExtension();
    }
  }, []);

  // Actualizar validación cuando cambien los requisitos
  useEffect(() => {
    const isValid = isChrome && extensionDetected && sessionActive;
    onValidationChange(isValid);
  }, [isChrome, extensionDetected, sessionActive, onValidationChange]);

  // Verificar extensión Dali WA Sender
  const checkExtension = async () => {
    if (!isChrome) return;
    
    setIsCheckingExtension(true);
    try {
      console.log('🔍 Verificando extensión Dali WA Sender...');
      
      const detection = await detectExtension();
      console.log('📡 Respuesta de extensión:', detection);
      
      if (detection.ok && detection.info) {
        setExtensionDetected(true);
        setExtensionVersion(detection.info.version);
        setSessionActive(detection.info.loggedIn);
        console.log('✅ Extensión Dali WA Sender detectada:', detection.info);
      } else {
        setExtensionDetected(false);
        setExtensionVersion('');
        setSessionActive(false);
        console.log('❌ No se pudo detectar la extensión Dali WA Sender');
      }
      
    } catch (error) {
      console.error('❌ Error verificando extensión:', error);
      setExtensionDetected(false);
      setExtensionVersion('');
      setSessionActive(false);
    } finally {
      setIsCheckingExtension(false);
    }
  };

  // Verificar sesión de WhatsApp Web
  const verifySession = async () => {
    if (!extensionDetected) return;
    
    setIsCheckingSession(true);
    try {
      console.log('🔍 Verificando sesión de WhatsApp Web...');
      
      const isLoggedIn = await checkWALogin();
      console.log('📡 Estado de sesión WA:', isLoggedIn);
      
      setSessionActive(isLoggedIn);
      
      if (isLoggedIn) {
        console.log('✅ Sesión de WhatsApp Web activa');
      } else {
        console.log('❌ No hay sesión activa en WhatsApp Web');
      }
      
    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      setSessionActive(false);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const openWhatsAppWeb = () => {
    window.open('https://web.whatsapp.com/', '_blank');
  };

  const openExtensionInstall = () => {
    window.open('chrome://extensions/', '_blank');
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
          Checklist de Requisitos - Dali WA Sender
        </CardTitle>
        <CardDescription>
          Verifica que todos los componentes estén listos para el envío
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Requisito 1: Navegador compatible */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Chrome className="h-5 w-5 text-blue-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Navegador compatible</span>
                  <StatusIcon condition={isChrome} />
                  <Badge variant={isChrome ? "default" : "destructive"}>
                    {isChrome ? "Chrome/Edge detectado" : "Requerido"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Chrome o Edge Chromium necesario para la extensión
                </p>
              </div>
            </div>
          </div>

          {/* Requisito 2: Extensión Dali WA Sender */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Extensión Dali WA Sender</span>
                  <StatusIcon condition={extensionDetected} />
                  <Badge variant={extensionDetected ? "default" : "destructive"}>
                    {extensionDetected ? `Instalada (v${extensionVersion})` : "No detectada"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Extensión propia para automatizar WhatsApp Web
                </p>
              </div>
            </div>
            {!extensionDetected && isChrome && (
              <div className="flex space-x-2">
                <Button 
                  onClick={openExtensionInstall}
                  variant="outline" 
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gestionar extensiones
                </Button>
                <Button 
                  onClick={checkExtension}
                  variant="outline" 
                  size="sm"
                  disabled={isCheckingExtension}
                >
                  {isCheckingExtension ? "Verificando..." : "Reintentar"}
                </Button>
              </div>
            )}
          </div>

          {/* Requisito 3: Sesión de WhatsApp Web */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-green-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">WhatsApp Web</span>
                  <StatusIcon condition={sessionActive} />
                  <Badge variant={sessionActive ? "default" : "destructive"}>
                    {sessionActive ? "Sesión activa" : "Sin sesión"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sesión iniciada en web.whatsapp.com
                </p>
              </div>
            </div>
            {extensionDetected && !sessionActive && (
              <div className="flex space-x-2">
                <Button 
                  onClick={openWhatsAppWeb}
                  variant="outline" 
                  size="sm"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir WhatsApp Web
                </Button>
                <Button 
                  onClick={verifySession}
                  variant="outline" 
                  size="sm"
                  disabled={isCheckingSession}
                >
                  {isCheckingSession ? "Verificando..." : "Verificar Sesión"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Alertas */}
        {!isChrome && (
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Google Chrome requerido:</strong> Esta funcionalidad requiere Chrome o Edge Chromium 
              para funcionar con la extensión Dali WA Sender.
            </AlertDescription>
          </Alert>
        )}

        {/* Nota de privacidad */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>🔒 Privacidad garantizada:</strong> Dali no accede a tus chats de WhatsApp. 
            La extensión solo automatiza el envío en tu navegador local.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}