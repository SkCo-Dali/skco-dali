import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GraphTokenManager } from '@/services/graphTokenManager';
import type { GraphAuthorizationStatus } from '@/types/graph';

/**
 * Hook personalizado para gestionar el estado de autorización de Microsoft Graph
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isAuthorized, accountEmail, loading, checkStatus } = useGraphAuthorization();
 *   
 *   return (
 *     <div>
 *       {isAuthorized ? (
 *         <p>Conectado con {accountEmail}</p>
 *       ) : (
 *         <GraphAuthButton onAuthorizationComplete={checkStatus} />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useGraphAuthorization() {
  const { user, getAccessToken } = useAuth();
  const [status, setStatus] = useState<GraphAuthorizationStatus>({ isAuthorized: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    if (!user) {
      setStatus({ isAuthorized: false });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await getAccessToken();
      if (!token?.idToken) {
        setStatus({ isAuthorized: false });
        setLoading(false);
        return;
      }

      const authStatus = await GraphTokenManager.getAuthorizationStatus(
        token.idToken,
        user.id
      );

      setStatus(authStatus);
    } catch (err) {
      console.error('Error checking Graph authorization status:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStatus({ isAuthorized: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user]);

  return {
    isAuthorized: status.isAuthorized,
    accountEmail: status.accountEmail,
    authorizedAt: status.authorizedAt,
    scopes: status.scopes,
    loading,
    error,
    checkStatus,
  };
}

/**
 * Hook para enviar correos usando Microsoft Graph
 * 
 * @example
 * ```tsx
 * function SendEmailComponent() {
 *   const { sendEmail, sending, error } = useGraphEmailSender();
 *   
 *   const handleSend = async () => {
 *     await sendEmail({
 *       to: ['client@example.com'],
 *       subject: 'Seguimiento',
 *       body: '<h1>Hola</h1>',
 *       isHtml: true,
 *     });
 *   };
 *   
 *   return <button onClick={handleSend} disabled={sending}>Enviar</button>;
 * }
 * ```
 */
export function useGraphEmailSender() {
  const { user, getAccessToken } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendEmail = async (emailData: {
    to: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
    cc?: string[];
    bcc?: string[];
  }) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      setSending(true);
      setError(null);

      const token = await getAccessToken();
      if (!token?.idToken) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      await GraphTokenManager.sendEmailOnBehalf(
        token.idToken,
        user.id,
        emailData
      );

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar correo';
      setError(errorMessage);
      console.error('Error sending email via Graph:', err);
      throw err;
    } finally {
      setSending(false);
    }
  };

  return {
    sendEmail,
    sending,
    error,
  };
}
