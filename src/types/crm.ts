
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
  jobTitle?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  // Properties for authentication context compatibility
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
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
  canAssignRoles: boolean;
  canAccessUserManagement: boolean;
  accessiblePages: string[];
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
  // Dynamic fields for interaction - these should be separate from the core Lead interface
  // but kept for backward compatibility
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
      canAssignRoles: true,
      canAccessUserManagement: true,
      accessiblePages: ['dashboard', 'leads', 'users', 'reports', 'tasks', 'chat']
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
      canAssignRoles: true,
      canAccessUserManagement: true,
      accessiblePages: ['dashboard', 'leads', 'users', 'reports', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'reports', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'reports', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'reports', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'users', 'reports']
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
      canAssignRoles: true,
      canAccessUserManagement: true,
      accessiblePages: ['dashboard', 'leads', 'users', 'reports', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'tasks', 'chat']
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
      canAssignRoles: false,
      canAccessUserManagement: false,
      accessiblePages: ['dashboard', 'leads', 'reports', 'tasks', 'chat']
    }
  };
  
  return rolePermissions[role] || rolePermissions['viewer'];
};
