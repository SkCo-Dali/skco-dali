import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { PublicClientApplication, InteractionRequiredAuthError, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/authConfig';

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
          // If there's an account, check for saved user data
          const savedUser = localStorage.getItem('skandia-crm-user');
          if (savedUser) {
            console.log('Loading saved user data');
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

  const login = (userData: User) => {
    console.log('Logging in user:', userData);
    setUser(userData);
    localStorage.setItem('skandia-crm-user', JSON.stringify(userData));
  };

  const logout = async () => {
    console.log('Logging out user');
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('skandia-crm-user');
    
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
    </AuthContext.Provider>
  );
}
