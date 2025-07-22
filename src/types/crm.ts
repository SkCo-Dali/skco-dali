
export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed-Won' | 'Closed-Lost';

export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer' | 'supervisor' | 'analista' | 'gestor' | 'fp' | 'seguridad' | 'director' | 'promotor' | 'aliado' | 'socio';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  zone?: string;
  team?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserPermissions {
  canViewLeads: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canCreateLeads: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canCreateUsers: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

export interface Interaction {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp' | 'sms';
  description: string;
  date: string;
  userId: string;
  outcome: 'positive' | 'negative' | 'neutral';
  stage?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentNumber: number;
  documentType: 'CC' | 'CE' | 'PA' | 'NIT';
  company: string;
  source: 'web' | 'social' | 'referral' | 'cold-call' | 'event' | 'campaign' | 'Hubspot' | 'DaliLM' | 'DaliAI';
  campaign: string;
  product: string;
  portfolios: string[];
  stage: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost' | 'Nuevo' | 'Asignado' | 'Localizado: No interesado' | 'Localizado: Prospecto de venta FP' | 'Localizado: Prospecto de venta AD' | 'Localizado: Volver a llamar' | 'Localizado: No vuelve a contestar' | 'No localizado: No contesta' | 'No localizado: Número equivocado' | 'Contrato Creado' | 'Registro de Venta (fondeado)' | 'Eliminado';
  priority: Priority;
  value: number;
  assignedTo: string;
  createdBy: string;
  status: LeadStatus;
  portfolio: string;
  createdAt: string;
  updatedAt: string;
  nextFollowUp: string;
  notes: string;
  tags: string[];
  age: number;
  gender: 'Masculino' | 'Femenino' | 'Prefiero no decir';
  campaignOwnerName: string;
  preferredContactChannel: 'Correo' | 'Teléfono' | 'WhatsApp' | 'SMS';
  interactions: Interaction[];
  additionalInfo?: Record<string, any> | null;
  // Dynamic fields for interaction
  type?: 'call' | 'email' | 'meeting' | 'note' | 'whatsapp' | 'sms';
  outcome?: 'positive' | 'negative' | 'neutral';
}

// Role display names
export const getRoleDisplayName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    'admin': 'Administrador',
    'manager': 'Gerente',
    'agent': 'Agente',
    'viewer': 'Visualizador',
    'supervisor': 'Supervisor',
    'analista': 'Analista',
    'gestor': 'Gestor',
    'fp': 'FP',
    'seguridad': 'Seguridad',
    'director': 'Director',
    'promotor': 'Promotor',
    'aliado': 'Aliado',
    'socio': 'Socio'
  };
  return roleNames[role] || role;
};

// Role permissions
export const getRolePermissions = (role: UserRole): UserPermissions => {
  const rolePermissions: Record<UserRole, UserPermissions> = {
    'admin': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: true,
      canCreateLeads: true,
      canViewUsers: true,
      canEditUsers: true,
      canDeleteUsers: true,
      canCreateUsers: true,
      canViewReports: true,
      canManageSettings: true,
    },
    'manager': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: true,
      canCreateLeads: true,
      canViewUsers: true,
      canEditUsers: true,
      canDeleteUsers: false,
      canCreateUsers: true,
      canViewReports: true,
      canManageSettings: false,
    },
    'supervisor': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: true,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: true,
      canManageSettings: false,
    },
    'agent': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: false,
      canManageSettings: false,
    },
    'viewer': {
      canViewLeads: true,
      canEditLeads: false,
      canDeleteLeads: false,
      canCreateLeads: false,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: true,
      canManageSettings: false,
    },
    'analista': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: true,
      canManageSettings: false,
    },
    'gestor': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: false,
      canManageSettings: false,
    },
    'fp': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: false,
      canManageSettings: false,
    },
    'seguridad': {
      canViewLeads: true,
      canEditLeads: false,
      canDeleteLeads: false,
      canCreateLeads: false,
      canViewUsers: true,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: true,
      canManageSettings: false,
    },
    'director': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: true,
      canCreateLeads: true,
      canViewUsers: true,
      canEditUsers: true,
      canDeleteUsers: false,
      canCreateUsers: true,
      canViewReports: true,
      canManageSettings: true,
    },
    'promotor': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: false,
      canManageSettings: false,
    },
    'aliado': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: false,
      canManageSettings: false,
    },
    'socio': {
      canViewLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canCreateLeads: true,
      canViewUsers: false,
      canEditUsers: false,
      canDeleteUsers: false,
      canCreateUsers: false,
      canViewReports: true,
      canManageSettings: false,
    }
  };
  
  return rolePermissions[role] || rolePermissions['viewer'];
};
