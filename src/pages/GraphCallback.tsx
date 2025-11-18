import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GraphAuthService } from '@/services/graphAuthService';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Página de callback para Microsoft Graph OAuth
 * 
 * Esta página recibe el código de autorización de Microsoft y lo intercambia
 * por tokens en el backend. Luego redirige al usuario a su página de origen.
 */
export default function GraphCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [accountEmail, setAccountEmail] = useState<string>('');

  useEffect(() => {
    const code = searchParams.get('code');
    const callbackKey = `graph_callback_${code}`;
    
    // Verificar si ya procesamos este código
    if (sessionStorage.getItem(callbackKey)) {
      console.log('Callback ya procesado, ignorando...');
      return;
    }
    
    // Marcar como procesado inmediatamente
    sessionStorage.setItem(callbackKey, 'processing');
    
    processCallback().finally(() => {
      // Limpiar después de 5 minutos
      setTimeout(() => {
        sessionStorage.removeItem(callbackKey);
      }, 5 * 60 * 1000);
    });
  }, []);

  const processCallback = async () => {
    try {
      // Validar parámetros del callback
      const { code, state } = GraphAuthService.validateCallbackParams(searchParams);

      // Decodificar state para obtener información del usuario
      const stateData = GraphAuthService.decodeState(state);

      // Obtener token de B2C para autenticar con el backend
      const b2cToken = await getAccessToken();
      if (!b2cToken?.idToken) {
        throw new Error('No se pudo obtener el token de autenticación de B2C');
      }

      // Intercambiar código por tokens en el backend
      const response = await GraphAuthService.handleCallback(
        code,
        state,
        b2cToken.idToken
      );

      // Autorización completada exitosamente
      setAccountEmail(response.accountEmail || '');
      setStatus('success');

      // Mostrar mensaje de éxito
      toast({
        title: 'Autorización exitosa',
        description: 'Tu cuenta corporativa ha sido conectada correctamente',
      });

      // Redirigir al usuario después de 2 segundos
      setTimeout(() => {
        const returnPath = stateData.returnPath || '/perfil';
        navigate(returnPath);
      }, 2000);

    } catch (error) {
      console.error('Error procesando callback:', error);
      
      const message = error instanceof Error 
        ? error.message 
        : 'Error desconocido al procesar la autorización';
      
      setErrorMessage(message);
      setStatus('error');

      toast({
        title: 'Error en autorización',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleRetry = () => {
    navigate('/perfil');
  };

  // Estado: Procesando
  if (status === 'processing') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Completando autorización</CardTitle>
            <CardDescription>
              Estamos conectando tu cuenta corporativa de Microsoft...
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>Por favor, espera un momento.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado: Éxito
  if (status === 'success') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">¡Autorización exitosa!</CardTitle>
            <CardDescription>
              Tu cuenta corporativa ha sido conectada correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {accountEmail && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">Cuenta conectada:</p>
                <p className="font-medium">{accountEmail}</p>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              <p>Ahora puedes enviar correos desde tu cuenta corporativa.</p>
              <p className="mt-2">Serás redirigido automáticamente...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Estado: Error
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-rose-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Error en autorización</CardTitle>
          <CardDescription>
            No se pudo completar la autorización
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Posibles causas:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Cancelaste el proceso de autorización</li>
              <li>El proceso tomó demasiado tiempo</li>
              <li>No tienes permisos suficientes en tu cuenta</li>
              <li>Error de conexión con Microsoft</li>
            </ul>
          </div>

          <Button 
            onClick={handleRetry} 
            className="w-full"
            variant="default"
          >
            Volver a intentar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
