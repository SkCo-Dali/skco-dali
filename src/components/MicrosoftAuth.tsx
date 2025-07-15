
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { loginRequest } from '@/authConfig';
import { getUserByEmail, createUser } from '@/utils/userApiClient';
import { TokenValidationService } from '@/services/tokenValidationService';
import { getUserRoleByEmail } from '@/utils/userRoleService';
import SecureTokenManager from '@/utils/secureTokenManager';

export function MicrosoftAuth() {
  const { msalInstance, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const getUserPhoto = async (accessToken: string): Promise<string | null> => {
    try {
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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

  const findOrCreateUser = async (email: string, name: string) => {
    try {
      // Buscar usuario existente
      let existingUser = await getUserByEmail(email);
      
      if (existingUser) {
        sessionStorage.setItem('authenticated-user-uuid', existingUser.id);
        return existingUser;
      }
      
      // Crear nuevo usuario con rol basado en email
      const assignedRole = await getUserRoleByEmail(email);
      const newUser = await createUser({
        name,
        email,
        role: assignedRole,
        isActive: true
      });
      
      sessionStorage.setItem('authenticated-user-uuid', newUser.id);
      
      return newUser;
      
    } catch (error) {
      throw new Error('No se pudo crear o encontrar el usuario en la base de datos');
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      // Paso 1: Obtener token de MSAL
      const response = await msalInstance.loginPopup({
        ...loginRequest,
        prompt: 'select_account'
      });
      
      if (!response || !response.account || !response.accessToken) {
        throw new Error('Respuesta de autenticación incompleta');
      }
      
      // Paso 2: Validar token contra Microsoft Graph
      const tokenValidation = await TokenValidationService.validateAccessToken(response.accessToken);
      
      if (!tokenValidation.isValid || !tokenValidation.userInfo) {
        throw new Error(tokenValidation.error || 'Token de acceso inválido');
      }

      const { userInfo } = tokenValidation;
      
      // Paso 3: Validar dominio del email (ahora más flexible)
      if (!TokenValidationService.validateEmailDomain(userInfo.email)) {
        throw new Error('El email no pertenece a un dominio autorizado para acceder a la aplicación');
      }

      SecureTokenManager.storeToken({
        token: response.idToken,
        expiresAt: response.expiresOn.getTime(),
        refreshToken: response.account.homeAccountId || '',
      });
      
      // Paso 4: Obtener foto del perfil (opcional, no crítico)
      const userPhoto = await getUserPhoto(response.accessToken);
      
      // Paso 5: Buscar o crear usuario en base de datos
      const dbUser = await findOrCreateUser(userInfo.email, userInfo.name);
      
      // Paso 6: Crear objeto de usuario final
      const user = {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        avatar: userPhoto,
        zone: dbUser.zone || 'Skandia',
        team: dbUser.team || 'Equipo Skandia',
        jobTitle: userInfo.jobTitle || 'Usuario',
        isActive: dbUser.isActive,
        createdAt: dbUser.createdAt || new Date().toISOString()
      };
      
      // Paso 7: Completar login
      login(user);
      
    } catch (error) {
      // Manejo específico de errores sin fallbacks inseguros
      let errorMessage = 'Error durante la autenticación';
      
      if (error.errorCode === 'user_cancelled') {
        errorMessage = 'Autenticación cancelada por el usuario';
      } else if (error.errorCode === 'popup_blocked') {
        errorMessage = 'El popup fue bloqueado. Por favor, permite popups para este sitio.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Mostrar error al usuario sin comprometer la seguridad
      alert(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleMicrosoftLogin}
      disabled={isLoading}
      className="w-full h-12 bg-[#3f3f3f] hover:bg-[#9f9f9f] text-white"
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Autenticando...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-3">
          <span>Accede con tu cuenta de Skandia</span>
        </div>
      )}
    </Button>
  );
}
