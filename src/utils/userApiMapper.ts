
import { User } from '@/types/crm';
import { ApiUser } from '@/types/apiTypes';
import { mapRoleFromApi } from './roleMapper';

export const mapApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.Id,
    name: apiUser.Name,
    email: apiUser.Email,
    role: mapRoleFromApi(apiUser.Role), // Usar el mapeador para convertir el rol
    isActive: apiUser.IsActive,
    createdAt: apiUser.CreatedAt,
    updatedAt: apiUser.UpdatedAt,
    avatar: null,
    zone: 'Skandia',
    team: 'Equipo Skandia'
  };
};
