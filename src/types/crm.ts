export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent';
  department?: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions?: UserPermissions;
}

export interface UserPermissions {
  canCreateUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canViewAllLeads: boolean;
  canEditAllLeads: boolean;
  canDeleteLeads: boolean;
  canExportData: boolean;
  canManageSettings: boolean;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  documentNumber: number;
  documentType: 'CC' | 'CE' | 'PA' | 'NIT' | 'TIP';
  company: string;
  source: string; // Cambiado para aceptar cualquier string que venga de la API
  campaign: string;
  product: string;
  portfolios: string[];
  stage: 'Eliminado' | 'Nuevo' | 'Asignado' | 'Localizado: No interesado' | 'Localizado: Prospecto de venta FP' | 'Localizado: Prospecto de venta AD' | 'Localizado: Volver a llamar' | 'Localizado: No vuelve a contestar' | 'No localizado: No contesta' | 'No localizado: Número equivocado' | 'Contrato Creado' | 'Registro de Venta (fondeado)';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  value: number;
  assignedTo: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  portfolio: string;
  createdAt: string;
  updatedAt: string;
  nextFollowUp: string;
  notes: string;
  tags: string[];
  age: number;
  gender: 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir';
  campaignOwnerName: string;
  preferredContactChannel: 'Teléfono' | 'Correo' | 'WhatsApp' | 'SMS';
  interactions: Interaction[];
}

export interface Interaction {
  id: string;
  type: 'email' | 'phone' | 'whatsapp' | 'sms' | 'meeting' | 'task' | 'note';
  date: string;
  description: string;
  agent: string;
}

export interface Stats {
  total: number;
  newLeads: number;
  contacted: number;
  qualified: number;
}
