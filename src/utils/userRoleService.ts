import { User } from '@/types/crm';
import { RolesResponse } from '@/types/apiTypes';
import { assignRoleBasedOnEmail, roles } from './userRoleUtils';
import { getUserByEmail } from './userApiClient';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/users`;


// API 8: Obtener roles disponibles
export const getAvailableRoles = async (): Promise<string[]> => {
  const endpoint = `${API_BASE_URL}/roles`;

  try {
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al obtener roles: ${response.statusText}`);
    }
    
    const result: RolesResponse = await response.json();
    
    return result.roles;
  } catch (error) {
    console.error('❌ getAvailableRoles error:', error);
    // Retornar todos los roles definidos localmente como fallback
    return roles.map(role => role.value);
  }
};

// Función de compatibilidad para obtener rol por email (mantiene funcionalidad existente)
export const getUserRoleByEmail = async (email: string): Promise<User['role']> => {
  try {
    const user = await getUserByEmail(email);
    if (user) {
      return user.role;
    } else {
      const assignedRole = assignRoleBasedOnEmail(email);
      return assignedRole;
    }
  } catch (error) {
    console.error('❌ getUserRoleByEmail error:', error);
    const assignedRole = assignRoleBasedOnEmail(email);
    return assignedRole;
  }
};
