import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { IPublicClientApplication } from '@azure/msal-browser';
import { useMsal, useAccount, useIsAuthenticated } from '@azure/msal-react';

import { useToast } from '@/hooks/use-toast';
import { registerMsalFetchInterceptor } from '@/utils/msalFetchInterceptor';
import { getUserRoleByEmail } from '@/utils/userApiUtils';
import { getUserByEmail, createUser } from "@/utils/userApiClient";

interface AuthContextType {
    user: User | null;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    isAuthenticated: boolean;
    msalInstance: IPublicClientApplication;
    signOut: () => Promise<void>;
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
    const account = useAccount(msalInstance.getActiveAccount() || {});
    const isAuthenticated = useIsAuthenticated();

    const { toast } = useToast();



    useEffect(() => {
        registerMsalFetchInterceptor(msalInstance);
        
        if (account && !user) {
            console.log('🟢🟢🟢 AuthProvider: Active account found:', account);
            setLoading(true);
            // Extraer información del usuario desde la cuenta activa
            const userEmail = account.username || account.idTokenClaims?.email as string || '';
            const userName = account.name || userEmail;
            // Fetch or create user in backend
            findOrCreateUser(userEmail, userName).then((dbUser) => {
                const user = {
                    id: dbUser.id,
                    name: dbUser.name,
                    email: dbUser.email,
                    role: dbUser.role,
                    avatar: null, // TODO: fetch actual photo if needed
                    zone: dbUser.zone || "Skandia",
                    team: dbUser.team || "Equipo Skandia",
                    jobTitle: "Usuario",
                    isActive: dbUser.isActive,
                    createdAt: dbUser.createdAt || new Date().toISOString(),
                };
                login(user);
            }).catch((error) => {
                console.error('Error during user retrieval/creation:', error);
                toast({
                    title: "Authentication Error",
                    description: error instanceof Error ? error.message : "An unknown error occurred during authentication.",
                    variant: "destructive",
                });
                msalInstance.logoutPopup({
                    mainWindowRedirectUri: window.location.origin
                });
            }).finally(() => {
                setLoading(false);
            });
        }

    }, [msalInstance, account, isAuthenticated]);
    const findOrCreateUser = async (email: string, name: string) => {

        // Buscar usuario existente
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            // Verificar si el usuario está activo
            if (!existingUser.isActive) {
                throw new Error("Tu cuenta está inactiva. Por favor contacta al administrador para activarla.");
            }

            sessionStorage.setItem("authenticated-user-uuid", existingUser.id);
            return existingUser;
        }

        // Crear nuevo usuario con rol basado en email
        const assignedRole = await getUserRoleByEmail(email);
        const newUser = await createUser({
            name,
            email,
            role: assignedRole,
            isActive: true,
        });

        sessionStorage.setItem("authenticated-user-uuid", newUser.id);

        return newUser;
    };

    const login = async (userData: User) => {
        setUser(userData);
        sessionStorage.setItem('skandia-crm-user', JSON.stringify(userData));

        // Start session after successful login

    };

    const logout = async () => {
        // End session first

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
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}