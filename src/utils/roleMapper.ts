
import { User } from '@/types/crm';

// Mapeo de roles del frontend a roles de la API
export const FRONTEND_TO_API_ROLE_MAP: Record<User['role'], string> = {
  'admin': 'admin',
  'manager': 'manager',
  'agent': 'agent', 
  'viewer': 'viewer',
  'supervisor': 'supervisor', 
  'analista': 'analista',
  'gestor': 'gestor',
  'fp': 'fp',
  'seguridad': 'seguridad',
  'director': 'director',
  'promotor': 'promotor',
  'aliado': 'aliado',
  'socio': 'socio',
  'ais': 'ais'
};

// Mapeo de roles de la API a roles del frontend
export const API_TO_FRONTEND_ROLE_MAP: Record<string, User['role']> = {
  'admin': 'admin',
  'manager': 'manager',
  'agent': 'agent',
  'viewer': 'viewer', 
  'supervisor': 'supervisor', 
  'analista': 'analista',
  'gestor': 'gestor',
  'fp': 'fp',
  'seguridad': 'seguridad',
  'director': 'director',
  'promotor': 'promotor',
  'aliado': 'aliado',
  'socio': 'socio',
  'ais': 'ais'
};

// Función para convertir rol del frontend al formato de la API
export const mapRoleToApi = (frontendRole: User['role']): string => {
  const apiRole = FRONTEND_TO_API_ROLE_MAP[frontendRole];
  if (!apiRole) {
    console.warn(`⚠️ Unknown frontend role: ${frontendRole}, defaulting to 'fp'`);
    return 'fp';
  }
  console.log(`🔄 Mapping frontend role '${frontendRole}' to API role '${apiRole}'`);
  return apiRole;
};

// Función para convertir rol de la API al formato del frontend
export const mapRoleFromApi = (apiRole: string): User['role'] => {
  const frontendRole = API_TO_FRONTEND_ROLE_MAP[apiRole];
  if (!frontendRole) {
    console.warn(`⚠️ Unknown API role: ${apiRole}, defaulting to 'fp'`);
    return 'fp';
  }
  return frontendRole;
};
