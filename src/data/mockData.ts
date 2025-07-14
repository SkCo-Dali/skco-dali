
import { User, Lead, Interaction } from '@/types/crm';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@skandia.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    zone: 'Bogotá',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z'
  },
  {
    id: '2',
    name: 'María González',
    email: 'maria.gonzalez@skandia.com',
    role: 'supervisor',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9c4e1e8?w=100&h=100&fit=crop&crop=face',
    zone: 'Medellín',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z'
  },
  {
    id: '3',
    name: 'Juan Pérez',
    email: 'juan.perez@skandia.com',
    role: 'fp',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    zone: 'Bogotá',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z'
  },
  {
    id: '4',
    name: 'Ana López',
    email: 'ana.lopez@skandia.com',
    role: 'fp',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    zone: 'Cali',
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z'
  }
];

export const mockInteractions: Interaction[] = [
  {
    id: '1',
    leadId: '1',
    type: 'call',
    description: 'Llamada inicial de prospección. Cliente interesado en seguros de vida.',
    date: '2024-01-15T10:30:00Z',
    userId: '3',
    outcome: 'positive'
  },
  {
    id: '2',
    leadId: '1',
    type: 'email',
    description: 'Envío de información sobre productos de seguros.',
    date: '2024-01-16T14:20:00Z',
    userId: '3',
    outcome: 'neutral'
  }
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Roberto Silva',
    email: 'roberto.silva@empresa.com',
    phone: '+57 310 123 4567',
    company: 'TechCorp S.A.S',
    source: 'web',
    product: 'Fondo Voluntario de Pensión',
    portfolios: ['Portfolio A', 'Portfolio B'],
    stage: 'Asignado',
    priority: 'high',
    value: 15000000,
    assignedTo: '3',
    createdBy: '1', // Add createdBy property
    status: 'New',
    campaign: 'Campaign A',
    portfolio: 'Portfolio A',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-16T14:20:00Z',
    nextFollowUp: '2024-01-18T09:00:00Z',
    notes: 'Cliente con alto potencial, CEO de empresa tecnológica.',
    tags: ['CEO', 'Tech', 'Alto Valor'],
    interactions: mockInteractions.filter(i => i.leadId === '1')
  },
  {
    id: '2',
    name: 'Patricia Moreno',
    email: 'patricia.moreno@gmail.com',
    phone: '+57 320 654 3210',
    company: 'Independiente',
    source: 'social',
    product: 'Fondo de Pensiones Obligatorias',
    portfolios: ['Portfolio C'],
    stage: 'Localizado: Prospecto de venta FP',
    priority: 'medium',
    value: 8000000,
    assignedTo: '4',
    createdBy: '2', // Add createdBy property
    status: 'Contacted',
    campaign: 'Campaign B',
    portfolio: 'Portfolio C',
    createdAt: '2024-01-10T12:00:00Z',
    updatedAt: '2024-01-15T16:30:00Z',
    nextFollowUp: '2024-01-20T11:00:00Z',
    notes: 'Profesional independiente buscando plan de pensiones.',
    tags: ['Profesional', 'Pensiones'],
    interactions: []
  },
  {
    id: '3',
    name: 'Eduardo Ramírez',
    email: 'eduardo.ramirez@constructora.com',
    phone: '+57 315 987 6543',
    company: 'Constructora del Valle',
    source: 'referral',
    product: 'Fondo de Inversión Colectiva',
    portfolios: ['Portfolio A', 'Portfolio D'],
    stage: 'Localizado: Prospecto de venta AD',
    priority: 'urgent',
    value: 50000000,
    assignedTo: '3',
    createdBy: '3', // Add createdBy property
    status: 'Qualified',
    campaign: 'Campaign A',
    portfolio: 'Portfolio A',
    createdAt: '2024-01-05T09:30:00Z',
    updatedAt: '2024-01-17T13:45:00Z',
    nextFollowUp: '2024-01-19T15:00:00Z',
    notes: 'Requiere cotización urgente para renovación de póliza empresarial.',
    tags: ['Empresa', 'Renovación', 'Urgente'],
    interactions: []
  },
  {
    id: '4',
    name: 'Lucía Herrera',
    email: 'lucia.herrera@hotmail.com',
    phone: '+57 301 456 7890',
    company: '',
    source: 'campaign',
    product: 'Fondo Voluntario de Pensión',
    portfolios: ['Portfolio B'],
    stage: 'Nuevo',
    priority: 'low',
    value: 2500000,
    assignedTo: '4',
    createdBy: '4', // Add createdBy property
    status: 'New',
    campaign: 'Campaign C',
    portfolio: 'Portfolio B',
    createdAt: '2024-01-18T07:15:00Z',
    updatedAt: '2024-01-18T07:15:00Z',
    notes: 'Lead generado por campaña digital.',
    tags: ['Digital', 'Vehículo'],
    interactions: []
  },
  {
    id: '5',
    name: 'Miguel Torres',
    email: 'miguel.torres@universidad.edu.co',
    phone: '+57 312 111 2222',
    company: 'Universidad Nacional',
    source: 'event',
    product: 'Fondo Voluntario de Pensión',
    portfolios: ['Portfolio A', 'Portfolio C'],
    stage: 'Registro de Venta (fondeado)',
    priority: 'medium',
    value: 12000000,
    assignedTo: '3',
    createdBy: '3', // Add createdBy property
    status: 'Won',
    campaign: 'Campaign A',
    portfolio: 'Portfolio A',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    notes: 'Exitoso cierre de plan educativo para hijos.',
    tags: ['Educación', 'Familia', 'Cerrado'],
    interactions: []
  }
];

export const currentUser = mockUsers[0]; // Admin user for demo
