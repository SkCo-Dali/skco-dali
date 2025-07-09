import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { PublicClientApplication, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/authConfig';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import { useToast } from '@/hooks/use-toast';
import { logSecure } from '@/utils/secureLogger';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  getAccessToken: () => Promise<string | undefined>;
  msalInstance: PublicClientApplication;
  isInitialized: boolean;
  signInWithAzure: () => Promise<{ error: any }>;
  accessToken: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create MSAL Instance without top-level await
const msalInstance = new PublicClientApplication(msalConfig);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  
  // Estados para el timeout de sesión
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [timeoutTimer, setTimeoutTimer] = useState<NodeJS.Timeout | null>(null);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  
  const { toast } = useToast();

  // Configuración del timeout (en minutos)
  const SESSION_TIMEOUT_MINUTES = 30;
  const WARNING_MINUTES = 5;

  const clearSessionTimers = () => {
    if (timeoutTimer) {
      clearTimeout(timeoutTimer);
      setTimeoutTimer(null);
    }
    if (warningTimer) {
      clearTimeout(warningTimer);
      setWarningTimer(null);
    }
  };

  const handleSessionTimeout = async () => {
    logSecure.userEvent('Session expired due to inactivity', user?.email);
    setShowTimeoutWarning(false);
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado por inactividad",
      variant: "destructive",
    });
    await logout();
  };

  const showSessionWarning = () => {
    logSecure.userEvent('Session timeout warning shown', user?.email);
    setShowTimeoutWarning(true);
  };

  const resetSessionTimer = () => {
    if (!user) return;

    clearSessionTimers();
    setLastActivity(Date.now());

    // Timer para mostrar advertencia
    const warningMs = (SESSION_TIMEOUT_MINUTES - WARNING_MINUTES) * 60 * 1000;
    const newWarningTimer = setTimeout(showSessionWarning, warningMs);
    setWarningTimer(newWarningTimer);

    // Timer para cerrar sesión
    const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000;
    const newTimeoutTimer = setTimeout(handleSessionTimeout, timeoutMs);
    setTimeoutTimer(newTimeoutTimer);

    logSecure.debug(`Session timer configured: ${SESSION_TIMEOUT_MINUTES} minutes`);
  };

  const handleUserActivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    
    // Solo reiniciar si ha pasado más de 1 minuto
    if (timeSinceLastActivity > 60000) {
      resetSessionTimer();
    }
  };

  const extendSession = () => {
    logSecure.userEvent('Session extended by user', user?.email);
    setShowTimeoutWarning(false);
    resetSessionTimer();
    toast({
      title: "Sesión extendida",
      description: `Tu sesión se ha extendido por ${SESSION_TIMEOUT_MINUTES} minutos más`,
    });
  };

  const handleTimeoutLogout = async () => {
    setShowTimeoutWarning(false);
    await logout();
  };

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        logSecure.info('Initializing MSAL authentication');
        await msalInstance.initialize();
        logSecure.info('MSAL initialized successfully');
        setIsInitialized(true);

        // Handle redirect promise after initialization
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          logSecure.info('MSAL redirect handled successfully');
        }

        // Check for existing accounts
        const accounts = msalInstance.getAllAccounts();
        logSecure.info(`Found ${accounts.length} existing MSAL accounts`);
        
        if (accounts.length > 0) {
          // If there's an account, check for saved user data in sessionStorage
          const savedUser = sessionStorage.getItem('skandia-crm-user');
          if (savedUser) {
            logSecure.info('Loading saved user data from sessionStorage');
            const userData = JSON.parse(savedUser);
            setUser(userData);
            logSecure.userEvent('User session restored', userData.email);
          }
        }
      } catch (error) {
        logSecure.authError('MSAL initialization failed', error);
        setIsInitialized(true); // Set to true even on error to prevent infinite loading
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, []);

  // Configurar listeners de actividad cuando hay usuario autenticado
  useEffect(() => {
    if (!user) {
      clearSessionTimers();
      return;
    }

    // Inicializar timer de sesión
    resetSessionTimer();

    // Eventos de actividad del usuario
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      clearSessionTimers();
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [user]);

  const login = (userData: User) => {
    logSecure.userEvent('User login successful', userData.email);
    setUser(userData);
    sessionStorage.setItem('skandia-crm-user', JSON.stringify(userData));
  };

  const logout = async () => {
    const userEmail = user?.email;
    logSecure.userEvent('User logout initiated', userEmail);
    
    setUser(null);
    setAccessToken(null);
    setShowTimeoutWarning(false);
    clearSessionTimers();
    sessionStorage.removeItem('skandia-crm-user');
    
    if (!isInitialized) {
      logSecure.warn('MSAL not initialized for logout');
      return;
    }

    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0],
          mainWindowRedirectUri: window.location.origin
        });
        logSecure.userEvent('MSAL logout completed', userEmail);
      }
    } catch (error) {
      logSecure.authError('MSAL logout failed', error, userEmail);
    }
  };

  const signInWithAzure = async (): Promise<{ error: any }> => {
    try {
      logSecure.info('Azure sign-in initiated');
      const response = await msalInstance.loginPopup(loginRequest);
      setAccessToken(response.accessToken);
      logSecure.info('Azure sign-in successful');
      return { error: null };
    } catch (error) {
      logSecure.authError('Azure sign-in failed', error);
      return { error };
    }
  };

  const signOut = async (): Promise<void> => {
    await logout();
  };

  const getAccessToken = async (): Promise<string | undefined> => {
    if (!isInitialized) {
      logSecure.warn('MSAL not initialized for token acquisition');
      return undefined;
    }

    try {
      const accounts = msalInstance.getAllAccounts();
      
      if (accounts.length === 0) {
        logSecure.info('No accounts found, starting login flow');
        const response = await msalInstance.loginPopup(loginRequest);
        setAccessToken(response.accessToken);
        logSecure.info('Token acquired via login popup');
        return response.accessToken;
      }

      const account = accounts[0];
      logSecure.debug('Attempting to acquire token silently');
      
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        logSecure.debug('Token acquired silently');
        setAccessToken(response.accessToken);
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          logSecure.info('Interaction required, showing popup');
          const response = await msalInstance.acquireTokenPopup({
            ...loginRequest,
            account,
          });
          setAccessToken(response.accessToken);
          logSecure.info('Token acquired via popup');
          return response.accessToken;
        } else {
          throw error;
        }
      }
    } catch (error) {
      logSecure.authError('Token acquisition failed', error);
      return undefined;
    }
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    getAccessToken,
    msalInstance,
    isInitialized,
    signInWithAzure,
    accessToken,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <SessionTimeoutWarning
        isOpen={showTimeoutWarning}
        onExtend={extendSession}
        onLogout={handleTimeoutLogout}
        remainingMinutes={WARNING_MINUTES}
      />
    </AuthContext.Provider>
  );
}
