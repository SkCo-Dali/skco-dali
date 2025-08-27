import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { PublicClientApplication, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/authConfig';

import { useToast } from '@/hooks/use-toast';
import SecureTokenManager from '@/utils/secureTokenManager';
import { TokenHeartbeatManager } from '@/components/TokenHeartbeatManager';
import { SessionService } from '@/services/sessionService';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  getAccessToken: () => Promise<{ idToken: string; accessToken: string } | null>;
  msalInstance: PublicClientApplication;
  isInitialized: boolean;
  signInWithAzure: () => Promise<{ error: any }>;
  endSession?: () => Promise<void>;
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
  
  const { toast } = useToast();


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


  const login = (userData: User) => {
    setUser(userData);
    sessionStorage.setItem('skandia-crm-user', JSON.stringify(userData));
  };

  const endSession = async () => {
    // Terminar sesión en el servidor si existe
    try {
      const sessionData = sessionStorage.getItem('app_session_data');
      if (sessionData) {
        const { sessionToken } = JSON.parse(sessionData);
        if (sessionToken) {
          await SessionService.logout(sessionToken);
        }
      }
    } catch (error) {
      console.warn('Error terminando sesión en servidor:', error);
    }
    
    // Limpiar datos de sesión local
    sessionStorage.removeItem('app_session_data');
  };

  const logout = async () => {
    // Terminar sesión de la aplicación primero
    await endSession();
    
    setUser(null);
    setAccessToken(null);
    
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

  const getAccessToken = async (): Promise<{ idToken: string; accessToken: string } | null> => {
    console.log('🔐 === INICIANDO getAccessToken ===');
    console.log('🔍 isInitialized:', isInitialized);
    console.log('🔍 accessToken actual completo:', accessToken || 'null');
    
    if (!isInitialized) {
      console.log('❌ MSAL no inicializado, retornando null');
      return null;
    }

    try {
      console.log('🔍 Verificando token almacenado...');
      // Intentar obtener token almacenado de forma segura
      const storedTokenData = SecureTokenManager.getToken();
      console.log('🔍 Token almacenado obtenido:', storedTokenData ? 'Existe' : 'No existe');
      
      const accounts = msalInstance.getAllAccounts();
      console.log('👥 Cuentas disponibles:', accounts.length);
      
      if (accounts.length === 0) {
        console.log('🔄 No hay cuentas, iniciando login popup...');
        const response = await msalInstance.loginPopup(loginRequest);
        
        // Almacenar idToken para el backend
        const tokenData = {
          token: response.idToken,
          expiresAt: response.expiresOn ? response.expiresOn.getTime() : Date.now() + (3600 * 1000),
          refreshToken: response.account?.homeAccountId
        };
        SecureTokenManager.storeToken(tokenData);
        setAccessToken(response.accessToken);
        
        console.log('✅ Tokens obtenidos via login popup:', {
          idToken: response.idToken || 'null',
          accessToken: response.accessToken || 'null',
          tokensAreDifferent: response.idToken !== response.accessToken
        });
        
        return {
          idToken: response.idToken || '',
          accessToken: response.accessToken || ''
        };
      }

      const account = accounts[0];
      
      // Intentar obtener tokens silenciosamente
      try {
        console.log('🔄 Intentando obtener tokens silenciosamente...');
        const silentResponse = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });
        
        // Almacenar idToken renovado para el backend
        const newTokenData = {
          token: silentResponse.idToken,
          expiresAt: silentResponse.expiresOn ? silentResponse.expiresOn.getTime() : Date.now() + (3600 * 1000),
          refreshToken: silentResponse.account?.homeAccountId
        };
        SecureTokenManager.storeToken(newTokenData);
        
        // Mantener accessToken para uso interno
        setAccessToken(silentResponse.accessToken);
        
        console.log('✅ Tokens renovados silenciosamente:', {
          idToken: silentResponse.idToken || 'null',
          accessToken: silentResponse.accessToken || 'null',
          tokensAreDifferent: silentResponse.idToken !== silentResponse.accessToken
        });
        
        return {
          idToken: silentResponse.idToken || '',
          accessToken: silentResponse.accessToken || ''
        };
      } catch (silentError) {
        console.log('❌ Error en token silencioso:', silentError);
        console.log('🔄 Intentando popup para nuevo token...');
        
        // Si falla la renovación silenciosa, usar popup
        const popupResponse = await msalInstance.acquireTokenPopup({
          ...loginRequest,
          account,
        });
        
        const tokenData = {
          token: popupResponse.idToken,
          expiresAt: popupResponse.expiresOn ? popupResponse.expiresOn.getTime() : Date.now() + (3600 * 1000),
          refreshToken: popupResponse.account?.homeAccountId
        };
        SecureTokenManager.storeToken(tokenData);
        setAccessToken(popupResponse.accessToken);
        
        console.log('✅ Tokens obtenidos via popup:', {
          idToken: popupResponse.idToken || 'null',
          accessToken: popupResponse.accessToken || 'null',
          tokensAreDifferent: popupResponse.idToken !== popupResponse.accessToken
        });
        
        return {
          idToken: popupResponse.idToken || '',
          accessToken: popupResponse.accessToken || ''
        };
      }
    } catch (error) {
      console.log('❌ Error general en getAccessToken:', error);
      return null;
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
    endSession,
    accessToken,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      <TokenHeartbeatManager />
      {children}
    </AuthContext.Provider>
  );
}
