import { Interaction } from './interactions';

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Closed-Won' | 'Closed-Lost';

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
  priority: 'low' | 'medium' | 'high' | 'urgent';
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
}
