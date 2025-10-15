import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { IPublicClientApplication } from '@azure/msal-browser';
import { useMsal, useAccount, useIsAuthenticated } from '@azure/msal-react';

import { useToast } from '@/hooks/use-toast';
import { useSessionManager } from '@/hooks/useSessionManager';
import { registerMsalFetchInterceptor } from '@/utils/msalFetchInterceptor';

interface AuthContextType {
    user: User | null;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    isAuthenticated: boolean;
    msalInstance: IPublicClientApplication;
    signOut: () => Promise<void>;
    sessionState: any;
    isSessionActive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



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
    const [loading, setLoading] = useState(false);
    const { instance: msalInstance } = useMsal();

    const { toast } = useToast();

    // Session management
    const { sessionState, isSessionActive, startSession, endSession } = useSessionManager();
    

    useEffect(() => {
        registerMsalFetchInterceptor(msalInstance);
        
        console.log('App component mounted with MSAL instance:', msalInstance);
    }, [msalInstance]);

    const login = async (userData: User) => {
        setUser(userData);
        sessionStorage.setItem('skandia-crm-user', JSON.stringify(userData));

        // Start session after successful login
        try {
            await startSession();
            console.log('Session started successfully');
        } catch (error) {
            console.error('Failed to start session:', error);
        }
    };

    const logout = async () => {
        // End session first
        try {
            await endSession();
            console.log('Session ended successfully');
        } catch (error) {
            console.error('Failed to end session:', error);
        }

        setUser(null);

        // Limpiar tokens de forma segura
        sessionStorage.removeItem('skandia-crm-user');



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


    const signOut = async (): Promise<void> => {
        await logout();
    };



    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: useIsAuthenticated(),
        msalInstance,
        signOut,
        sessionState,
        isSessionActive,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}