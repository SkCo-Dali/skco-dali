
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { loginRequest } from '@/authConfig';
import { getUserRoleByEmail } from '@/utils/userRoleService';
import { getUserByEmail, createUser } from '@/utils/userApiClient';

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
      console.log('No se pudo obtener la foto del perfil:', error);
      return null;
    }
  };

  const findOrCreateUser = async (email: string, name: string) => {
    console.log('🔍 Buscando usuario en la base de datos:', email);
    
    try {
      // Primero intentar buscar el usuario existente
      let existingUser = await getUserByEmail(email);
      
      if (existingUser) {
        console.log('✅ Usuario encontrado en la base de datos:', existingUser);
        console.log('🆔 UUID del usuario almacenado:', existingUser.id);
        console.log('📧 Email del usuario:', existingUser.email);
        
        // Almacenar el UUID en localStorage para uso posterior
        localStorage.setItem('authenticated-user-uuid', existingUser.id);
        console.log('💾 UUID almacenado en localStorage:', localStorage.getItem('authenticated-user-uuid'));
        
        return existingUser;
      }
      
      console.log('👤 Usuario no encontrado, creando nuevo usuario con rol FP');
      
      // Si no existe, crear nuevo usuario con rol FP
      const newUser = await createUser({
        name,
        email,
        role: 'fp',
        isActive: true
      });
      
      console.log('✅ Usuario creado exitosamente:', newUser);
      console.log('🆔 UUID del nuevo usuario almacenado:', newUser.id);
      console.log('📧 Email del nuevo usuario:', newUser.email);
      
      // Almacenar el UUID en localStorage para uso posterior
      localStorage.setItem('authenticated-user-uuid', newUser.id);
      console.log('💾 UUID del nuevo usuario almacenado en localStorage:', localStorage.getItem('authenticated-user-uuid'));
      
      return newUser;
      
    } catch (error) {
      console.error('❌ Error en findOrCreateUser:', error);
      
      // En caso de error, usar la asignación de rol basada en email como fallback
      console.log('🔄 Usando asignación de rol como fallback');
      const assignedRole = await getUserRoleByEmail(email);
      
      const fallbackUser = {
        id: Date.now().toString(), // ID temporal
        name,
        email,
        role: assignedRole,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: null,
        zone: 'Skandia',
        team: 'Equipo Skandia'
      };
      
      console.log('⚠️ Usuario fallback creado con ID temporal:', fallbackUser.id);
      console.log('💾 ID temporal almacenado en localStorage:', fallbackUser.id);
      localStorage.setItem('authenticated-user-uuid', fallbackUser.id);
      
      return fallbackUser;
    }
  };

  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      console.log('Iniciando login con Microsoft...');
      
      const response = await msalInstance.loginPopup({
        ...loginRequest,
        prompt: 'select_account'
      });
      
      console.log('Respuesta de login:', response);
      
      if (response && response.account) {
        try {
          // Obtener token para Microsoft Graph
          const tokenResponse = await msalInstance.acquireTokenSilent({
            scopes: ['User.Read'],
            account: response.account,
          });
          
          // Obtener información del usuario desde Microsoft Graph
          const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
            headers: {
              Authorization: `Bearer ${tokenResponse.accessToken}`,
            },
          });
          
          if (!userResponse.ok) {
            throw new Error(`Error al obtener datos del usuario: ${userResponse.statusText}`);
          }
          
          const userData = await userResponse.json();
          console.log('Datos del usuario desde Entra ID:', userData);
          
          // Obtener foto del perfil
          const userPhoto = await getUserPhoto(tokenResponse.accessToken);
          
          const userEmail = userData.mail || userData.userPrincipalName;
          
          // Usar el nombre completo del directorio de Entra ID
          const fullName = userData.displayName || userData.givenName + ' ' + userData.surname || response.account.name || 'Usuario Microsoft';
          
          // Buscar o crear usuario en la base de datos
          const dbUser = await findOrCreateUser(userEmail, fullName);
          
          const user = {
            id: dbUser.id,
            name: dbUser.name, // Usar el nombre de la base de datos
            email: dbUser.email,
            role: dbUser.role,
            avatar: userPhoto,
            zone: dbUser.zone || 'Skandia',
            team: dbUser.team || 'Equipo Skandia',
            jobTitle: userData.jobTitle || userData.department || 'Usuario',
            isActive: dbUser.isActive,
            createdAt: dbUser.createdAt || new Date().toISOString()
          };
          
          console.log('Usuario final creado para login:', user);
          console.log('🔑 ID del usuario autenticado que se usará en las operaciones:', user.id);
          
          login(user);
          console.log('Login exitoso con usuario de base de datos');
        } catch (graphError) {
          console.error('Error obteniendo datos del usuario:', graphError);
          // Aún así crear usuario con datos básicos de MSAL
          const userEmail = response.account.username;
          const fullName = response.account.name || 'Usuario Microsoft';
          
          // Intentar buscar o crear usuario incluso con datos básicos
          try {
            const dbUser = await findOrCreateUser(userEmail, fullName);
            
            const user = {
              id: dbUser.id,
              name: dbUser.name,
              email: dbUser.email,
              role: dbUser.role,
              avatar: null,
              zone: dbUser.zone || 'Microsoft',
              team: dbUser.team || 'Equipo Microsoft',
              jobTitle: 'Usuario',
              isActive: dbUser.isActive,
              createdAt: dbUser.createdAt || new Date().toISOString()
            };
            
            console.log('🔑 ID del usuario autenticado (fallback Graph):', user.id);
            login(user);
          } catch (fallbackError) {
            console.error('Error en fallback de creación de usuario:', fallbackError);
            // Como último recurso, usar datos de MSAL sin base de datos
            const assignedRole = await getUserRoleByEmail(userEmail);
            
            const user = {
              id: response.account.homeAccountId,
              name: fullName,
              email: userEmail,
              role: assignedRole,
              avatar: null,
              zone: 'Microsoft',
              team: 'Equipo Microsoft',
              jobTitle: 'Usuario',
              isActive: true,
              createdAt: new Date().toISOString()
            };
            
            console.log('🔑 ID del usuario autenticado (fallback final):', user.id);
            localStorage.setItem('authenticated-user-uuid', user.id);
            login(user);
          }
        }
      }
    } catch (error) {
      console.error('Error durante la autenticación con Microsoft:', error);
      
      // Mostrar error más específico al usuario
      if (error.errorCode === 'user_cancelled') {
        console.log('El usuario canceló el login');
      } else if (error.errorCode === 'popup_blocked') {
        alert('El popup fue bloqueado. Por favor, permite popups para este sitio.');
      } else {
        alert('Error durante la autenticación. Por favor, inténtalo de nuevo.');
      }
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
