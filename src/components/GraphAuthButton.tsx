import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GraphAuthService } from '@/services/graphAuthService';
import { GraphTokenManager } from '@/services/graphTokenManager';
import { Mail, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface GraphAuthButtonProps {
  /**
   * Variante del botón
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  
  /**
   * Tamaño del botón
   */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  
  /**
   * Texto personalizado del botón cuando no está autorizado
   */
  authorizeText?: string;
  
  /**
   * Texto personalizado del botón cuando ya está autorizado
   */
  authorizedText?: string;
  
  /**
   * Mostrar solo el icono (útil para barras de herramientas)
   */
  iconOnly?: boolean;
  
  /**
   * Clase CSS adicional
   */
  className?: string;
  
  /**
   * Callback cuando se completa la autorización exitosamente
   */
  onAuthorizationComplete?: (accountEmail?: string) => void;
  
  /**
   * Callback cuando se revoca la autorización
   */
  onAuthorizationRevoked?: () => void;
}

/**
 * Botón reutilizable para autorizar acceso a Microsoft Graph
 * 
 * Permite al usuario dar permisos para enviar correos en su nombre
 * Muestra el estado de autorización y permite revocar permisos
 * 
 * @example
 * // Uso básico
 * <GraphAuthButton />
 * 
 * @example
 * // Personalizado con callbacks
 * <GraphAuthButton
 *   variant="outline"
 *   size="sm"
 *   onAuthorizationComplete={(email) => console.log('Autorizado:', email)}
 * />
 * 
 * @example
 * // Solo icono con tooltip
 * <GraphAuthButton iconOnly size="icon" />
 */
export function GraphAuthButton({
  variant = 'default',
  size = 'default',
  authorizeText = 'Autorizar Envío de Correos',
  authorizedText = 'Cuenta Corporativa Conectada',
  iconOnly = false,
  className = '',
  onAuthorizationComplete,
  onAuthorizationRevoked,
}: GraphAuthButtonProps) {
  const { user, getAccessToken } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | undefined>();

  // Verificar estado de autorización al montar el componente
  useEffect(() => {
    checkAuthorizationStatus();
  }, [user]);

  const checkAuthorizationStatus = async () => {
    if (!user) {
      setCheckingStatus(false);
      return;
    }

    try {
      setCheckingStatus(true);
      const token = await getAccessToken();
      if (!token?.idToken) {
        setCheckingStatus(false);
        return;
      }

      const status = await GraphTokenManager.getAuthorizationStatus(
        token.idToken,
        user.id
      );

      setIsAuthorized(status.isAuthorized);
      setAccountEmail(status.accountEmail);
    } catch (error) {
      console.error('Error verificando estado de autorización:', error);
      setIsAuthorized(false);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleAuthorize = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para autorizar acceso',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Iniciar flujo de autorización OAuth
      // El usuario será redirigido a Microsoft y luego a /graph-callback
      GraphAuthService.initiateAuthFlow(user.id, location.pathname);
    } catch (error) {
      console.error('Error iniciando autorización:', error);
      toast({
        title: 'Error',
        description: 'Error al iniciar el proceso de autorización',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await getAccessToken();
      if (!token?.idToken) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      await GraphTokenManager.revokeAuthorization(token.idToken, user.id);

      setIsAuthorized(false);
      setAccountEmail(undefined);

      toast({
        title: 'Autorización revocada',
        description: 'Se ha desconectado tu cuenta corporativa',
      });

      onAuthorizationRevoked?.();
    } catch (error) {
      console.error('Error revocando autorización:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al revocar autorización',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <Button variant={variant} size={size} disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {!iconOnly && <span className="ml-2">Verificando...</span>}
      </Button>
    );
  }

  // Botón cuando ya está autorizado
  if (isAuthorized) {
    const buttonContent = (
      <Button
        variant={variant}
        size={size}
        onClick={handleRevoke}
        disabled={loading}
        className={className}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
        {!iconOnly && (
          <span className="ml-2">{authorizedText}</span>
        )}
      </Button>
    );

    if (iconOnly || accountEmail) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {buttonContent}
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-sm">
                <p className="font-semibold">Cuenta conectada</p>
                {accountEmail && <p className="text-muted-foreground">{accountEmail}</p>}
                <p className="text-xs mt-1 text-muted-foreground">Click para desconectar</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return buttonContent;
  }

  // Botón para autorizar
  const authorizeButton = (
    <Button
      variant={variant}
      size={size}
      onClick={handleAuthorize}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Mail className="h-4 w-4" />
      )}
      {!iconOnly && (
        <span className="ml-2">{authorizeText}</span>
      )}
    </Button>
  );

  if (iconOnly) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {authorizeButton}
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-semibold">Autorizar envío de correos</p>
              <p className="text-muted-foreground text-xs mt-1">
                Conecta tu cuenta corporativa de Microsoft
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return authorizeButton;
}

/**
 * Versión compacta del botón para barras de herramientas
 */
export function GraphAuthButtonCompact(props: Omit<GraphAuthButtonProps, 'iconOnly' | 'size'>) {
  return <GraphAuthButton {...props} iconOnly size="icon" />;
}

/**
 * Versión con icono de escudo para páginas de configuración
 */
export function GraphAuthButtonSecurity(props: GraphAuthButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <ShieldCheck className="h-5 w-5 text-muted-foreground" />
      <GraphAuthButton {...props} />
    </div>
  );
}
