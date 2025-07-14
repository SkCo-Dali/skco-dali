import { User } from '@/types/crm';
import { RolesResponse } from '@/types/apiTypes';
import { assignRoleBasedOnEmail, roles } from './userRoleUtils';
import { getUserByEmail } from './userApiClient';
import { ENV } from '@/config/environment';

const API_BASE_URL = `${ENV.CRM_API_BASE_URL}/api/users`;

// Helper function to get authorization headers
const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  try {
    // Try to get access token from SecureTokenManager
    const { SecureTokenManager } = await import('@/utils/secureTokenManager');
    const tokenData = SecureTokenManager.getToken();
    
    if (tokenData && tokenData.token) {
      headers['Authorization'] = `Bearer ${tokenData.token}`;
    }
  } catch (error) {
    console.warn('Could not get access token for API request:', error);
  }

  return headers;
};

// API 8: Obtener roles disponibles
export const getAvailableRoles = async (): Promise<string[]> => {
  const endpoint = `${API_BASE_URL}/roles`;
  
  console.log('🔍 API CALL: getAvailableRoles');
  console.log('📍 Endpoint:', endpoint);
  console.log('🔧 Method: GET');
  console.log('📤 Parameters: none');

  try {
    const headers = await getAuthHeaders();
    const response = await fetch(endpoint, { headers });
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.statusText);
      throw new Error(`Error al obtener roles: ${response.statusText}`);
    }
    
    const result: RolesResponse = await response.json();
    console.log('✅ API Response data:', result);
    console.log('📊 Available roles:', result.roles);
    
    return result.roles;
  } catch (error) {
    console.error('❌ getAvailableRoles error:', error);
    console.log('🔄 Using fallback roles due to error');
    // Retornar todos los roles definidos localmente como fallback
    return roles.map(role => role.value);
  }
};

// Función de compatibilidad para obtener rol por email (mantiene funcionalidad existente)
export const getUserRoleByEmail = async (email: string): Promise<User['role']> => {
  console.log('🔍 API CALL: getUserRoleByEmail');
  console.log('📤 Parameters:', { email });
  
  try {
    const user = await getUserByEmail(email);
    if (user) {
      console.log('✅ Found user role from API:', user.role);
      return user.role;
    } else {
      console.log('⚠️ User not found in API, using email-based role assignment');
      const assignedRole = assignRoleBasedOnEmail(email);
      console.log('🔄 Assigned role based on email:', assignedRole);
      return assignedRole;
    }
  } catch (error) {
    console.error('❌ getUserRoleByEmail error:', error);
    console.log('🔄 Using email-based role assignment as fallback');
    const assignedRole = assignRoleBasedOnEmail(email);
    console.log('🔄 Fallback assigned role:', assignedRole);
    return assignedRole;
  }
};
