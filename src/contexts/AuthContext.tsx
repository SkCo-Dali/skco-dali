import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types/crm';
import { IPublicClientApplication } from '@azure/msal-browser';
import { useMsal, useAccount, useIsAuthenticated } from '@azure/msal-react';

import { useToast } from '@/hooks/use-toast';
import { registerMsalFetchInterceptor } from '@/utils/msalFetchInterceptor';
import { getUserRoleByEmail } from '@/utils/userApiUtils';
import { getUserByEmail, createUser } from "@/utils/userApiClient";
import { ENV } from '@/config/environment';
import { extractIdpAccessToken } from '@/utils/tokenUtils';
import { SessionService } from '@/services/sessionService';
import { loginRequest } from "@/authConfig";
import { isatty } from 'tty';

interface AuthContextType {
    user: User | null;
    login: (userData: User) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
    isAuthenticated: boolean;
    isInitialized: boolean;
    msalInstance: IPublicClientApplication;
    signOut: () => Promise<void>;
    signInWithAzure: () => Promise<void>;
    getAccessToken: () => Promise<{ accessToken: string; idToken: string } | null>;
    accessToken: string | null;
    updateUserProfile: (updates: Partial<User>) => void;
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
    const [isInitialized, setIsInitialized] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const { instance: msalInstance } = useMsal();
    const account = useAccount(msalInstance.getActiveAccount() || {});
    const isAuthenticated = useIsAuthenticated();

    const { toast } = useToast();


    useEffect(() => {
        registerMsalFetchInterceptor(msalInstance);

        if (account && !user) {
            setLoading(true);
            // Extraer información del usuario desde la cuenta activa
            const userEmail = account.username || account.idTokenClaims?.email as string || '';
            const userName = account.name || userEmail;

            getUserPhoto().then(async photoUrl => {
                try {
                    // Fetch or create user in backend
                    const dbUser = await findOrCreateUser(userEmail, userName);
                    
                    // Load profile data BEFORE creating user object
                    let profileData: Partial<User> = {};
                    try {
                            profileData = await loadProfileData();
                            console.log('✅ Perfil cargado antes de login:', profileData);
                        
                    } catch (profileError) {
                        console.error('❌ Error al cargar perfil inicial:', profileError);
                        // Continue with login even if profile loading fails
                    }

                    const user = {
                        id: dbUser.id,
                        name: dbUser.name,
                        email: dbUser.email,
                        role: dbUser.role,
                        avatar: photoUrl,
                        zone: dbUser.zone || "Skandia",
                        team: dbUser.team || "Equipo Skandia",
                        jobTitle: "Usuario",
                        isActive: dbUser.isActive,
                        createdAt: dbUser.createdAt || new Date().toISOString(),
                        // Include profile data from API
                        ...profileData,
                    };
                    
                    login(user);
                } catch (error) {
                    console.error('Error during user retrieval/creation:', error);
                    toast({
                        title: "Authentication Error",
                        description: error instanceof Error ? error.message : "An unknown error occurred during authentication.",
                        variant: "destructive",
                    });
                    msalInstance.logoutPopup({
                        mainWindowRedirectUri: window.location.origin
                    });
                } finally {
                    setLoading(false);
                }
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
        try {
            await SessionService.startSession(undefined, navigator.userAgent);
            console.log('✅ Sesión registrada exitosamente');
        } catch (error) {
            console.error('❌ Error al registrar sesión:', error);
            // No bloqueamos el login si falla el registro de sesión
        }
    };

    const loadProfileData = async (): Promise<Partial<User>> => {
        try {
            const { userProfileApiClient } = await import('@/utils/userProfileApiClient');
            const profileData = await userProfileApiClient.getProfile(accessToken);
            
            // Find WhatsApp contact channel
            const whatsappChannel = profileData.contactChannels.find(
                channel => channel.channelType === 'WhatsApp'
            );

            return {
                preferredName: profileData.basic.preferredName,
                birthDate: profileData.basic.birthDate,
                gender: profileData.basic.gender,
                maritalStatus: profileData.basic.maritalStatus,
                childrenCount: profileData.basic.childrenCount,
                whatsappCountryCode: whatsappChannel?.countryCode || null,
                whatsappPhone: whatsappChannel?.channelValue || null,
                emailSignatureHtml: profileData.appPreferences.emailSignatureHtml,
                primaryActionCode: profileData.appPreferences.primaryActionCode,
                primaryActionRoute: profileData.appPreferences.primaryActionRoute,
            };
        } catch (error) {
            console.error('❌ Error al cargar datos de perfil:', error);
            return {};
        }
    };

    const getUserPhoto = async (): Promise<string | null> => {
        try {
            const token = await getAccessToken();
            if (!token) return null;
            const graphToken = extractIdpAccessToken(token.accessToken);

            const photoResponse = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
                headers: {
                    Authorization: `Bearer ${graphToken}`
                },
            });

            if (photoResponse.ok) {
                const photoBlob = await photoResponse.blob();
                return URL.createObjectURL(photoBlob);
            }

            return null;
        } catch (error) {
            return null;
        }
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

    const signInWithAzure = async (): Promise<void> => {
        try {
            await msalInstance.loginPopup();
        } catch (error) {
            console.error('Error during sign in:', error);
            throw error;
        }
    };

    const getAccessToken = async (): Promise<{ accessToken: string; idToken: string } | null> => {
        try {
            const accounts = msalInstance.getAllAccounts();
            if (accounts.length === 0) {
                console.warn('No hay cuentas disponibles para obtener token');
                return null;
            }

            const response = await msalInstance.acquireTokenSilent({
                scopes: ENV.REQUIRED_SCOPES,
                account: accounts[0]
            });

            const token = response.accessToken;
            const idToken = response.idToken;
            setAccessToken(token);
            return { accessToken: token, idToken: idToken };
        } catch (error) {
            console.error('❌ Error getting access token:', error);
            return null;
        }
    };

    const updateUserProfile = (updates: Partial<User>) => {
        if (user) {
            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);
            sessionStorage.setItem('skandia-crm-user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: useIsAuthenticated(),
        isInitialized,
        msalInstance,
        signOut,
        signInWithAzure,
        getAccessToken,
        accessToken,
        updateUserProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}