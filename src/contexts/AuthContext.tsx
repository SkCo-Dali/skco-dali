import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { PublicClientApplication, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/authConfig';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import { useToast } from '@/hooks/use-toast';

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
    console.log('🕐 Sesión expirada por inactividad');
    setShowTimeoutWarning(false);
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado por inactividad",
      variant: "destructive",
    });
    await logout();
  };

  const showSessionWarning = () => {
    console.log('⚠️ Mostrando advertencia de sesión');
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

    console.log(`⏰ Timer de sesión configurado: ${SESSION_TIMEOUT_MINUTES} minutos`);
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
    console.log('🔄 Extendiendo sesión');
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
        console.log('Initializing MSAL...');
        await msalInstance.initialize();
        console.log('MSAL initialized successfully');
        setIsInitialized(true);

        // Handle redirect promise after initialization
        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          console.log('Redirect response:', response);
        }

        // Check for existing accounts
        const accounts = msalInstance.getAllAccounts();
        console.log('Existing accounts:', accounts.length);
        
        if (accounts.length > 0) {
          // If there's an account, check for saved user data in sessionStorage
          const savedUser = sessionStorage.getItem('skandia-crm-user');
          if (savedUser) {
            console.log('Loading saved user data from sessionStorage');
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Error initializing MSAL:', error);
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
    console.log('Logging in user:', userData);
    setUser(userData);
    sessionStorage.setItem('skandia-crm-user', JSON.stringify(userData));
  };

  const logout = async () => {
    console.log('Logging out user');
    setUser(null);
    setAccessToken(null);
    setShowTimeoutWarning(false);
    clearSessionTimers();
    sessionStorage.removeItem('skandia-crm-user');
    
    if (!isInitialized) {
      console.warn('MSAL not initialized for logout');
      return;
    }

    try {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup({
          account: accounts[0],
          mainWindowRedirectUri: window.location.origin
        });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const signInWithAzure = async (): Promise<{ error: any }> => {
    try {
      const response = await msalInstance.loginPopup(loginRequest);
      setAccessToken(response.accessToken);
      return { error: null };
    } catch (error) {
      console.error('Azure sign-in error:', error);
      return { error };
    }
  };

  const signOut = async (): Promise<void> => {
    await logout();
  };

  const getAccessToken = async (): Promise<string | undefined> => {
    if (!isInitialized) {
      console.warn('MSAL not initialized for token acquisition');
      return undefined;
    }

    try {
      const accounts = msalInstance.getAllAccounts();
      
      if (accounts.length === 0) {
        console.log('No accounts found, starting login flow');
        const response = await msalInstance.loginPopup(loginRequest);
        setAccessToken(response.accessToken);
        return response.accessToken;
      }

      const account = accounts[0];
      console.log('Attempting to acquire token silently');
      
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        console.log('Token acquired silently');
        setAccessToken(response.accessToken);
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          console.log('Interaction required, showing popup');
          const response = await msalInstance.acquireTokenPopup({
            ...loginRequest,
            account,
          });
          setAccessToken(response.accessToken);
          return response.accessToken;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error obtaining token:', error);
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
