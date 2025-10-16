import { User } from '@/types/crm';
import { ApiUser, CreateUserRequest, UpdateUserRequest, ToggleUserStatusRequest, CreateUserResponse, ApiResponse } from '@/types/apiTypes';
import { mapApiUserToUser } from './userApiMapper';
import { mapRoleToApi } from './roleMapper';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/users`;

const getHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };


  return headers;
};


// API 1: Obtener todos los usuarios
export const getAllUsers = async (): Promise<User[]> => {
    const endpoint = `${API_BASE_URL}/list`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(),
    });
    if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.statusText}`);
    }

    const apiUsers: ApiUser[] = await response.json();
    const mappedUsers = apiUsers.map(mapApiUserToUser);

    return mappedUsers;
};

// API 2: Obtener usuario por ID
export const getUserById = async (id: string): Promise<User | null> => {
    const endpoint = `${API_BASE_URL}/${id}`;

    const response = await fetch(endpoint, {
        method: 'GET',
        headers: getHeaders(),
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        throw new Error(`Error al obtener usuario: ${response.statusText}`);
    }

    const apiUser: ApiUser = await response.json();
    const mappedUser = mapApiUserToUser(apiUser);

    return mappedUser;
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
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
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

    return createdUser;
};

// API 4: Actualizar usuario
export const updateUser = async (id: string, userData: UpdateUserRequest): Promise<void> => {
    const endpoint = `${API_BASE_URL}/${id}`;
    const requestBody = {
        ...userData,
        role: mapRoleToApi(userData.role as User['role'])
    };

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        let errorMessage = `Error al actualizar usuario: ${response.statusText}`;

        try {
            const errorBody = await response.text();
            if (errorBody) {
                errorMessage += ` - ${errorBody}`;
            }
        } catch (parseError) {
            // Ignored
        }

        throw new Error(errorMessage);
    }

    try {
        const result: ApiResponse = await response.json();
    } catch (parseError) {
        // No JSON response body (might be normal)
    }
};

// API 5: Eliminar usuario
export const deleteUser = async (id: string): Promise<void> => {
    const endpoint = `${API_BASE_URL}/${id}`;

    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        if (!response.ok) {
            throw new Error(`Error al eliminar usuario: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
    } catch (error) {
        throw error;
    }
};

// API 6: Activar/Desactivar usuario
export const toggleUserStatus = async (id: string, isActive: boolean): Promise<void> => {
    const endpoint = `${API_BASE_URL}/${id}/activate`;
    const requestBody: ToggleUserStatusRequest = { isActive };

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            throw new Error(`Error al cambiar estado del usuario: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
    } catch (error) {
        throw error;
    }
};

// API 7: Buscar usuario por email
export const getUserByEmail = async (email: string): Promise<User | null> => {
    const endpoint = `${API_BASE_URL}/search?query=${encodeURIComponent(email)}`;

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: getHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Error al buscar usuario: ${response.statusText}`);
        }

        const apiUsers: ApiUser[] = await response.json();

        if (apiUsers.length > 0) {
            const mappedUser = mapApiUserToUser(apiUsers[0]);
            return mappedUser;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
};
