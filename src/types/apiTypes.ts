
// Interface para la respuesta de la API
export interface ApiUser {
  Id: string;
  Name: string;
  Email: string;
  Role: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  CountryCodeWhatsApp?: number;
  WhatsAppNumber?: string;
  IdAgte?: number | null;
  IdSociedad?: number | null;
  IdPromotor?: number | null;
  IdAliado?: number | null;
  WSaler?: string | null;
  PreferredName?: string | null;
  BirthDate?: string | null;
  DailyEmailLimit?: number;
  DailyWhatsAppLimit?: number;
  IdSupervisor?: number | null;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role: string;
  isActive?: boolean;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export interface ToggleUserStatusRequest {
  isActive: boolean;
}

export interface CreateUserResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
}

export interface ApiResponse {
  message: string;
}

export interface RolesResponse {
  roles: string[];
}
