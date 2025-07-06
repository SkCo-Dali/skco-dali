import { User } from '@/types/crm';
import { ApiUser, CreateUserRequest, UpdateUserRequest, ToggleUserStatusRequest, CreateUserResponse, ApiResponse } from '@/types/apiTypes';
import { mapApiUserToUser } from './userApiMapper';
import { mapRoleToApi } from './roleMapper';

const API_BASE_URL = 'https://skcodalilmdev.azurewebsites.net/api/users';

// API 1: Obtener todos los usuarios
export const getAllUsers = async (): Promise<User[]> => {
  const endpoint = `${API_BASE_URL}/list`;
  console.log('🔍 API CALL: getAllUsers');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: GET');
  console.log('📤 Parameters: none');

  try {
    const response = await fetch(endpoint);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al obtener usuarios: ${response.statusText}`);
    }
    
    const apiUsers: ApiUser[] = await response.json();
    console.log('✅ API Response data:', apiUsers);
    console.log('📊 Users count:', apiUsers.length);
    
    const mappedUsers = apiUsers.map(mapApiUserToUser);
    console.log('🔄 Mapped users:', mappedUsers);
    
    return mappedUsers;
  } catch (error) {
    console.error('❌ getAllUsers error:', error);
    throw error;
  }
};

// API 2: Obtener usuario por ID
export const getUserById = async (id: string): Promise<User | null> => {
  const endpoint = `${API_BASE_URL}/${id}`;
  console.log('🔍 API CALL: getUserById');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: GET');
  console.log('📤 Parameters:', { id });

  try {
    const response = await fetch(endpoint);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ User not found (404)');
        return null;
      }
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al obtener usuario: ${response.statusText}`);
    }
    
    const apiUser: ApiUser = await response.json();
    console.log('✅ API Response data:', apiUser);
    
    const mappedUser = mapApiUserToUser(apiUser);
    console.log('🔄 Mapped user:', mappedUser);
    
    return mappedUser;
  } catch (error) {
    console.error('❌ getUserById error:', error);
    throw error;
  }
};

// API 3: Crear nuevo usuario
export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const endpoint = API_BASE_URL;
  const requestBody = {
    name: userData.name,
    email: userData.email,
    role: mapRoleToApi(userData.role as User['role']), // Mapear rol a formato API
    isActive: userData.isActive ?? true,
  };
  
  console.log('🔍 API CALL: createUser');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: POST');
  console.log('📤 Request body (original role):', userData.role);
  console.log('📤 Request body (mapped role):', requestBody.role);
  console.log('📤 Request body:', requestBody);
  console.log('📤 Headers:', { 'Content-Type': 'application/json' });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al crear usuario: ${response.statusText}`);
    }

    const result: CreateUserResponse = await response.json();
    console.log('✅ API Response data:', result);
    
    const createdUser: User = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: userData.role as User['role'], // Mantener el rol original del frontend
      isActive: result.user.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: null,
      zone: 'Skandia',
      team: 'Equipo Skandia'
    };
    
    console.log('🔄 Created user object:', createdUser);
    return createdUser;
  } catch (error) {
    console.error('❌ createUser error:', error);
    throw error;
  }
};

// API 4: Actualizar usuario
export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${id}`;
  const requestBody = {
    ...userData,
    role: mapRoleToApi(userData.role as User['role']) // Mapear rol a formato API
  };
  
  console.log('🔍 API CALL: updateUser');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: PUT');
  console.log('📤 Parameters:', { id });
  console.log('📤 Request body (original role):', userData.role);
  console.log('📤 Request body (mapped role):', requestBody.role);
  console.log('📤 Request body:', requestBody);
  console.log('📤 Headers:', { 'Content-Type': 'application/json' });

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `Error al actualizar usuario: ${response.statusText}`;
      
      // Intentar obtener más detalles del error del cuerpo de la respuesta
      try {
        const errorBody = await response.text();
        console.error('❌ Error response body:', errorBody);
        if (errorBody) {
          errorMessage += ` - ${errorBody}`;
        }
      } catch (parseError) {
        console.error('❌ Could not parse error response:', parseError);
      }
      
      console.error('❌ API Error:', errorMessage);
      throw new Error(errorMessage);
    }
    
    // Intentar parsear la respuesta
    try {
      const result: ApiResponse = await response.json();
      console.log('✅ API Response data:', result);
    } catch (parseError) {
      console.log('ℹ️ No JSON response body (this might be normal for some APIs)');
    }
  } catch (error) {
    console.error('❌ updateUser error:', error);
    
    // Si es un error de red o de parsing, agregar más contexto
    if (error instanceof TypeError) {
      console.error('❌ Network error or parsing error:', error.message);
    }
    
    throw error;
  }
};

// API 5: Eliminar usuario
export const deleteUser = async (id: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${id}`;
  
  console.log('🔍 API CALL: deleteUser');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: DELETE');
  console.log('📤 Parameters:', { id });

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al eliminar usuario: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ deleteUser error:', error);
    throw error;
  }
};

// API 6: Activar/Desactivar usuario
export const toggleUserStatus = async (id: string, isActive: boolean): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${id}/activate`;
  const requestBody: ToggleUserStatusRequest = { isActive };
  
  console.log('🔍 API CALL: toggleUserStatus');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: PUT');
  console.log('📤 Parameters:', { id });
  console.log('📤 Request body:', requestBody);
  console.log('📤 Headers:', { 'Content-Type': 'application/json' });

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);

    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al cambiar estado del usuario: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    console.log('✅ API Response data:', result);
  } catch (error) {
    console.error('❌ toggleUserStatus error:', error);
    throw error;
  }
};

// API 7: Buscar usuario por email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const endpoint = `${API_BASE_URL}/search?query=${encodeURIComponent(email)}`;
  
  console.log('🔍 API CALL: getUserByEmail');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: GET');
  console.log('📤 Parameters:', { email, encodedEmail: encodeURIComponent(email) });

  try {
    const response = await fetch(endpoint);
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      if (response.status === 404) {
        console.log('ℹ️ User not found by email (404)');
        return null;
      }
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al buscar usuario: ${response.statusText}`);
    }
    
    const apiUsers: ApiUser[] = await response.json();
    console.log('✅ API Response data:', apiUsers);
    console.log('📊 Found users count:', apiUsers.length);
    
    if (apiUsers.length > 0) {
      const mappedUser = mapApiUserToUser(apiUsers[0]);
      console.log('🔄 Mapped user:', mappedUser);
      return mappedUser;
    } else {
      console.log('ℹ️ No users found in response array');
      return null;
    }
  } catch (error) {
    console.error('❌ getUserByEmail error:', error);
    throw error;
  }
};
