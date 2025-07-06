
import { User } from '@/types/crm';

export const assignRoleBasedOnEmail = (email: string): User['role'] => {
  // Asignar rol de administrador específicamente a drcastro@skandia.com.co (case-insensitive)
  if (email.toLowerCase() === 'drcastro@skandia.com.co') {
    return 'admin';
  }
  // Rol por defecto para otros usuarios
  return 'fp';
};

export const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'analista', label: 'Analista' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'gestor', label: 'Gestor' },
  { value: 'director', label: 'Director' },
  { value: 'promotor', label: 'Promotor' },
  { value: 'aliado', label: 'Aliado' },
  { value: 'socio', label: 'Socio' },
  { value: 'fp', label: 'FP' }
];
