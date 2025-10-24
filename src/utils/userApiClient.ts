import { User } from '@/types/crm';
import { ApiUser, CreateUserRequest, UpdateUserRequest, ToggleUserStatusRequest, CreateUserResponse, ApiResponse } from '@/types/apiTypes';
import { mapApiUserToUser } from './userApiMapper';
import { mapRoleToApi } from './roleMapper';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/users`;

// Helper function to get authorization headers
// The MSAL interceptor will automatically add the Bearer token
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  return headers;
};


// API 1: Obtener todos los usuarios con paginación
export const getAllUsers = async (options?: {
    page?: number;
    pageSize?: number;
    sortBy?: 'CreatedAt' | 'UpdatedAt' | 'Name' | 'Email' | 'Role' | 'IsActive';
    sortDir?: 'asc' | 'desc';
    name?: string;
    email?: string;
    role?: string;
    isActive?: boolean;
}): Promise<User[]> => {
    const allUsers: User[] = [];
    let currentPage = options?.page || 1;
    const pageSize = options?.pageSize || 200; // Usar el máximo permitido para obtener todos
    let hasMoreData = true;

    try {
        while (hasMoreData) {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                page_size: pageSize.toString(),
            });

            // Agregar parámetros opcionales
            if (options?.sortBy) params.append('sort_by', options.sortBy);
            if (options?.sortDir) params.append('sort_dir', options.sortDir);
            if (options?.name) params.append('name', options.name);
            if (options?.email) params.append('email', options.email);
            if (options?.role) params.append('role', options.role);
            if (options?.isActive !== undefined) params.append('is_active', options.isActive.toString());

            const endpoint = `${API_BASE_URL}/list?${params.toString()}`;
            const headers = await getAuthHeaders();

            const response = await fetch(endpoint, {
                method: 'GET',
                headers,
            });

            if (!response.ok) {
                // Manejo de errores específicos
                if (response.status === 401) {
                    throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
                }
                if (response.status === 403) {
                    throw new Error('No tienes permisos para ver esta sección. Se requiere rol admin o serviceDesk.');
                }
                if (response.status === 400) {
                    throw new Error('Parámetros inválidos en la solicitud.');
                }
                throw new Error(`Error al obtener usuarios: ${response.statusText}`);
            }

            const result: {
                items: ApiUser[];
                page: number;
                page_size: number;
                total: number;
                total_pages: number;
            } = await response.json();

            const mappedUsers = result.items.map(mapApiUserToUser);
            allUsers.push(...mappedUsers);

            // Si estamos solicitando una página específica, no seguir paginando
            if (options?.page) {
                hasMoreData = false;
            } else {
                // Si no hay más páginas, terminar
                hasMoreData = currentPage < result.total_pages;
                currentPage++;
            }
        }

        return allUsers;
    } catch (error) {
        console.error('❌ Error in getAllUsers:', error);
        throw error;
    }
};

// API 2: Obtener usuario por ID
export const getUserById = async (id: string): Promise<User | null> => {
    const endpoint = `${API_BASE_URL}/${id}`;
    const headers = await getAuthHeaders();

    const response = await fetch(endpoint, {
        method: 'GET',
        headers,
    });

    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        if (response.status === 401) {
            throw new Error('No autenticado. Por favor, inicia sesión nuevamente.');
        }
        if (response.status === 403) {
            throw new Error('No tienes permisos para acceder a esta información.');
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
    const headers = await getAuthHeaders();
    const requestBody = {
        name: userData.name,
        email: userData.email,
        role: mapRoleToApi(userData.role as User['role']),
        isActive: userData.isActive ?? true,
    };
    const response = await fetch(endpoint, {
        method: 'POST',
        headers,
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
    const headers = await getAuthHeaders();
    const requestBody = {
        ...userData,
        role: mapRoleToApi(userData.role as User['role'])
    };

    const response = await fetch(endpoint, {
        method: 'PUT',
        headers,
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
    const headers = await getAuthHeaders();

    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers,
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
    const headers = await getAuthHeaders();
    const requestBody: ToggleUserStatusRequest = { isActive };

    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers,
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
    const headers = await getAuthHeaders();

    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers,
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
