import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { PublicClientApplication, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/authConfig';
import { SessionTimeoutWarning } from '@/components/SessionTimeoutWarning';
import { useToast } from '@/hooks/use-toast';
import SecureTokenManager from '@/utils/secureTokenManager';

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
    setShowTimeoutWarning(false);
    toast({
      title: "Sesión expirada",
      description: "Tu sesión ha expirado por inactividad",
      variant: "destructive",
    });
    await logout();
  };

  const showSessionWarning = () => {
    setShowTimeoutWarning(true);
  };

  const resetSessionTimer = () => {
    if (!user) return;

    clearSessionTimers();
    setLastActivity(Date.now());

    const warningMs = (SESSION_TIMEOUT_MINUTES - WARNING_MINUTES) * 60 * 1000;
    const newWarningTimer = setTimeout(showSessionWarning, warningMs);
    setWarningTimer(newWarningTimer);

    const timeoutMs = SESSION_TIMEOUT_MINUTES * 60 * 1000;
    const newTimeoutTimer = setTimeout(handleSessionTimeout, timeoutMs);
    setTimeoutTimer(newTimeoutTimer);
  };

  const handleUserActivity = () => {
    const now = Date.now();
    const timeSinceLastActivity = now - lastActivity;
    
    if (timeSinceLastActivity > 60000) {
      resetSessionTimer();
    }
  };

  const extendSession = () => {
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
        await msalInstance.initialize();
        setIsInitialized(true);

        // Limpiar tokens expirados al iniciar
        SecureTokenManager.cleanupExpiredTokens();

        const response = await msalInstance.handleRedirectPromise();
        if (response) {
          // Almacenar idToken de forma segura para el backend
          if (response.idToken) {
            const tokenData = {
              token: response.idToken,
              expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
              refreshToken: response.account?.homeAccountId
            };
            SecureTokenManager.storeToken(tokenData);
          }
        }

        const accounts = msalInstance.getAllAccounts();
        
        if (accounts.length > 0) {
          const savedUser = sessionStorage.getItem('skandia-crm-user');
          if (savedUser) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          }
        }
      } catch (error) {
        setIsInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, []);

  useEffect(() => {
    if (!user) {
      clearSessionTimers();
      return;
    }

    resetSessionTimer();

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
    setUser(userData);
    sessionStorage.setItem('skandia-crm-user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    setShowTimeoutWarning(false);
    clearSessionTimers();
    
    // Limpiar tokens de forma segura
    SecureTokenManager.clearToken();
    sessionStorage.removeItem('skandia-crm-user');
    
    if (!isInitialized) {
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
      // Error silenciado para logout
    }
  };

  const signInWithAzure = async (): Promise<{ error: any }> => {
    try {
      const response = await msalInstance.loginPopup(loginRequest);
      
      // Almacenar idToken para el backend
      if (response.idToken) {
        const tokenData = {
          token: response.idToken,
          expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
          refreshToken: response.account?.homeAccountId
        };
        SecureTokenManager.storeToken(tokenData);
      }
      
      // Mantener accessToken para uso interno
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async (): Promise<void> => {
    await logout();
  };

  const getAccessToken = async (): Promise<string | undefined> => {
    if (!isInitialized) {
      return undefined;
    }

    try {
      // Intentar obtener token almacenado de forma segura
      const storedTokenData = SecureTokenManager.getToken();
      
      if (storedTokenData && !SecureTokenManager.isTokenExpired(storedTokenData)) {
        // Si el token necesita renovación, intentar renovarlo
        if (SecureTokenManager.shouldRefreshToken(storedTokenData)) {
          // Intentar renovar token
          const accounts = msalInstance.getAllAccounts();
          if (accounts.length > 0) {
            try {
              const response = await msalInstance.acquireTokenSilent({
                ...loginRequest,
                account: accounts[0],
              });
              
              // Almacenar idToken renovado para el backend
              const newTokenData = {
                token: response.idToken,
                expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
                refreshToken: response.account?.homeAccountId
              };
              SecureTokenManager.storeToken(newTokenData);
              
              // Mantener accessToken para uso interno
              setAccessToken(response.accessToken);
              return response.accessToken;
            } catch (refreshError) {
              // Si falla la renovación, intentar obtener nuevo token
              const response = await msalInstance.loginPopup(loginRequest);
              const tokenData = {
                token: response.idToken,
                expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
                refreshToken: response.account?.homeAccountId
              };
              SecureTokenManager.storeToken(tokenData);
              setAccessToken(response.accessToken);
              return response.accessToken;
            }
          }
        }
        
        // Para getAccessToken seguimos devolviendo el accessToken para uso interno
        // pero el idToken se mantiene almacenado para el backend
        return accessToken;
      }

      // Si no hay token válido almacenado, obtener uno nuevo
      const accounts = msalInstance.getAllAccounts();
      
      if (accounts.length === 0) {
        const response = await msalInstance.loginPopup(loginRequest);
        const tokenData = {
          token: response.idToken,
          expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
          refreshToken: response.account?.homeAccountId
        };
        SecureTokenManager.storeToken(tokenData);
        setAccessToken(response.accessToken);
        return response.accessToken;
      }

      const account = accounts[0];
      
      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        const tokenData = {
          token: response.idToken,
          expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
          refreshToken: response.account?.homeAccountId
        };
        SecureTokenManager.storeToken(tokenData);
        setAccessToken(response.accessToken);
        return response.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          const response = await msalInstance.acquireTokenPopup({
            ...loginRequest,
            account,
          });
          const tokenData = {
            token: response.idToken,
            expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
            refreshToken: response.account?.homeAccountId
          };
          SecureTokenManager.storeToken(tokenData);
          setAccessToken(response.accessToken);
          return response.accessToken;
        } else {
          throw error;
        }
      }
    } catch (error) {
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
