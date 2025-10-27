
import { User } from '@/types/crm';
import { ApiUser } from '@/types/apiTypes';
import { mapRoleFromApi } from './roleMapper';

export const mapApiUserToUser = (apiUser: ApiUser): User => {
  return {
    id: apiUser.Id,
    name: apiUser.Name,
    email: apiUser.Email,
    role: mapRoleFromApi(apiUser.Role),
    isActive: apiUser.IsActive,
    createdAt: apiUser.CreatedAt,
    updatedAt: apiUser.UpdatedAt,
    avatar: null,
    zone: 'Skandia',
    team: 'Equipo Skandia',
    countryCodeWhatsApp: apiUser.CountryCodeWhatsApp,
    whatsappNumber: apiUser.WhatsAppNumber,
    idAgte: apiUser.IdAgte,
    idSociedad: apiUser.IdSociedad,
    idPromotor: apiUser.IdPromotor,
    idAliado: apiUser.IdAliado,
    wSaler: apiUser.WSaler,
    preferredName: apiUser.PreferredName,
    birthDate: apiUser.BirthDate,
    dailyEmailLimit: apiUser.DailyEmailLimit,
    dailyWhatsAppLimit: apiUser.DailyWhatsAppLimit,
    idSupervisor: apiUser.IdSupervisor
  };
};
