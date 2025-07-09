
import { User } from '@/types/crm';
import { ApiUser, CreateUserRequest, UpdateUserRequest, ToggleUserStatusRequest, CreateUserResponse, ApiResponse } from '@/types/apiTypes';
import { mapApiUserToUser } from './userApiMapper';
import { mapRoleToApi } from './roleMapper';
import { logSecure } from './secureLogger';

const API_BASE_URL = 'https://skcodalilmdev.azurewebsites.net/api/users';

// API 1: Obtener todos los usuarios
export const getAllUsers = async (): Promise<User[]> => {
  const endpoint = `${API_BASE_URL}/list`;
  
  logSecure.httpRequest('GET', endpoint);

  try {
    const response = await fetch(endpoint);
    logSecure.httpResponse(response.status, endpoint);
    
    if (!response.ok) {
      logSecure.error('API Error in getAllUsers', { status: response.status, statusText: response.statusText });
      throw new Error(`Error al obtener usuarios: ${response.statusText}`);
    }
    
    const apiUsers: ApiUser[] = await response.json();
    const mappedUsers = apiUsers.map(mapApiUserToUser);
    
    logSecure.info('Users retrieved successfully', { count: mappedUsers.length });
    return mappedUsers;
  } catch (error) {
    logSecure.error('getAllUsers failed', error);
    throw error;
  }
};

// API 2: Obtener usuario por ID
export const getUserById = async (id: string): Promise<User | null> => {
  const endpoint = `${API_BASE_URL}/${id}`;
  
  logSecure.httpRequest('GET', endpoint);

  try {
    const response = await fetch(endpoint);
    logSecure.httpResponse(response.status, endpoint);
    
    if (!response.ok) {
      if (response.status === 404) {
        logSecure.info('User not found', { id });
        return null;
      }
      logSecure.error('API Error in getUserById', { status: response.status, statusText: response.statusText });
      throw new Error(`Error al obtener usuario: ${response.statusText}`);
    }
    
    const apiUser: ApiUser = await response.json();
    const mappedUser = mapApiUserToUser(apiUser);
    
    logSecure.info('User retrieved successfully', { userId: id });
    return mappedUser;
  } catch (error) {
    logSecure.error('getUserById failed', { id, error });
    throw error;
  }
};

// API 3: Crear nuevo usuario
export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  const endpoint = API_BASE_URL;
  const requestBody = {
    name: userData.name,
    email: userData.email,
    role: mapRoleToApi(userData.role as User['role']),
    isActive: userData.isActive ?? true,
  };
  
  logSecure.httpRequest('POST', endpoint, { 'Content-Type': 'application/json' }, requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    logSecure.httpResponse(response.status, endpoint);

    if (!response.ok) {
      logSecure.error('API Error in createUser', { status: response.status, statusText: response.statusText });
      throw new Error(`Error al crear usuario: ${response.statusText}`);
    }

    const result: CreateUserResponse = await response.json();
    
    const createdUser: User = {
      id: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: userData.role as User['role'],
      isActive: result.user.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      avatar: null,
      zone: 'Skandia',
      team: 'Equipo Skandia'
    };
    
    logSecure.info('User created successfully', { userId: createdUser.id, email: createdUser.email });
    return createdUser;
  } catch (error) {
    logSecure.error('createUser failed', error);
    throw error;
  }
};

// API 4: Actualizar usuario
export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${id}`;
  const requestBody = {
    ...userData,
    role: mapRoleToApi(userData.role as User['role'])
  };
  
  logSecure.httpRequest('PUT', endpoint, { 'Content-Type': 'application/json' }, requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    logSecure.httpResponse(response.status, endpoint);

    if (!response.ok) {
      let errorMessage = `Error al actualizar usuario: ${response.statusText}`;
      
      try {
        const errorBody = await response.text();
        if (errorBody) {
          errorMessage += ` - ${errorBody}`;
        }
      } catch (parseError) {
        logSecure.error('Could not parse error response', parseError);
      }
      
      logSecure.error('API Error in updateUser', { status: response.status, errorMessage });
      throw new Error(errorMessage);
    }
    
    try {
      const result: ApiResponse = await response.json();
      logSecure.info('User updated successfully', { userId: id });
    } catch (parseError) {
      logSecure.debug('No JSON response body (might be normal)');
    }
  } catch (error) {
    logSecure.error('updateUser failed', { id, error });
    throw error;
  }
};

// API 5: Eliminar usuario
export const deleteUser = async (id: string): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${id}`;
  
  logSecure.httpRequest('DELETE', endpoint);

  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
    });

    logSecure.httpResponse(response.status, endpoint);

    if (!response.ok) {
      logSecure.error('API Error in deleteUser', { status: response.status, statusText: response.statusText });
      throw new Error(`Error al eliminar usuario: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    logSecure.info('User deleted successfully', { userId: id });
  } catch (error) {
    logSecure.error('deleteUser failed', { id, error });
    throw error;
  }
};

// API 6: Activar/Desactivar usuario
export const toggleUserStatus = async (id: string, isActive: boolean): Promise<void> => {
  const endpoint = `${API_BASE_URL}/${id}/activate`;
  const requestBody: ToggleUserStatusRequest = { isActive };
  
  logSecure.httpRequest('PUT', endpoint, { 'Content-Type': 'application/json' }, requestBody);

  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    logSecure.httpResponse(response.status, endpoint);

    if (!response.ok) {
      logSecure.error('API Error in toggleUserStatus', { status: response.status, statusText: response.statusText });
      throw new Error(`Error al cambiar estado del usuario: ${response.statusText}`);
    }
    
    const result: ApiResponse = await response.json();
    logSecure.info('User status toggled successfully', { userId: id, isActive });
  } catch (error) {
    logSecure.error('toggleUserStatus failed', { id, isActive, error });
    throw error;
  }
};

// API 7: Buscar usuario por email
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const endpoint = `${API_BASE_URL}/search?query=${encodeURIComponent(email)}`;
  
  logSecure.httpRequest('GET', endpoint);

  try {
    const response = await fetch(endpoint);
    logSecure.httpResponse(response.status, endpoint);
    
    if (!response.ok) {
      if (response.status === 404) {
        logSecure.info('User not found by email', { email: email.substring(0, 3) + '***' });
        return null;
      }
      logSecure.error('API Error in getUserByEmail', { status: response.status, statusText: response.statusText });
      throw new Error(`Error al buscar usuario: ${response.statusText}`);
    }
    
    const apiUsers: ApiUser[] = await response.json();
    
    if (apiUsers.length > 0) {
      const mappedUser = mapApiUserToUser(apiUsers[0]);
      logSecure.info('User found by email', { email: email.substring(0, 3) + '***' });
      return mappedUser;
    } else {
      logSecure.info('No users found in response', { email: email.substring(0, 3) + '***' });
      return null;
    }
  } catch (error) {
    logSecure.error('getUserByEmail failed', { email: email.substring(0, 3) + '***', error });
    throw error;
  }
};
