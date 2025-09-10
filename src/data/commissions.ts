export interface Commission {
  id: string;
  clientName: string;
  policyNumber: string;
  productType: 'patrimonio' | 'ahorro' | 'seguros' | 'enfermedades' | 'pensiones';
  commissionType: 'mantenimiento' | 'incremento' | 'reactivacion' | 'clawback' | 'preferencias';
  commissionValue: number;
  period: string;
  month: number;
  year: number;
  createdAt: string;
  agentId: string;
  agentName: string;
}

export interface CommissionStats {
  totalMonth: number;
  totalYear: number;
  totalCommissions: number;
  averageCommission: number;
  bestMonth: string;
  growth: number;
}

export const mockCommissions: Commission[] = [
  // Crea Patrimonio
  {
    id: '1',
    clientName: 'Distribuidora SAS',
    policyNumber: '360001234',
    productType: 'patrimonio',
    commissionType: 'mantenimiento',
    commissionValue: 150000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-15T10:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },
  {
    id: '2',
    clientName: 'Carlos Pérez',
    policyNumber: '360001235',
    productType: 'patrimonio',
    commissionType: 'incremento',
    commissionValue: 85000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-10T09:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },
  {
    id: '3',
    clientName: 'Distribuidora SAS',
    policyNumber: '360001236',
    productType: 'patrimonio',
    commissionType: 'preferencias',
    commissionValue: 65000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-20T14:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },
  
  // Crea Ahorro
  {
    id: '4',
    clientName: 'Distribuidora SAS',
    policyNumber: '360001237',
    productType: 'ahorro',
    commissionType: 'mantenimiento',
    commissionValue: 150000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-12T11:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },
  {
    id: '5',
    clientName: 'Carlos Pérez',
    policyNumber: '360001238',
    productType: 'ahorro',
    commissionType: 'incremento',
    commissionValue: 85000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-18T16:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },

  // Seguros
  {
    id: '6',
    clientName: 'Ana López',
    policyNumber: '360001239',
    productType: 'seguros',
    commissionType: 'mantenimiento',
    commissionValue: 250000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-25T12:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },

  // Enfermedades Graves
  {
    id: '7',
    clientName: 'María González',
    policyNumber: '360001240',
    productType: 'enfermedades',
    commissionType: 'clawback',
    commissionValue: 150000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-30T08:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },

  // Pensiones
  {
    id: '8',
    clientName: 'Roberto Silva',
    policyNumber: '360001241',
    productType: 'pensiones',
    commissionType: 'clawback',
    commissionValue: 150000,
    period: '2025-01',
    month: 1,
    year: 2025,
    createdAt: '2025-01-28T15:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },

  // Datos de meses anteriores para gráficas
  {
    id: '9',
    clientName: 'Cliente Ejemplo',
    policyNumber: '360001242',
    productType: 'patrimonio',
    commissionType: 'mantenimiento',
    commissionValue: 120000,
    period: '2024-12',
    month: 12,
    year: 2024,
    createdAt: '2024-12-15T10:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },
  {
    id: '10',
    clientName: 'Cliente Ejemplo 2',
    policyNumber: '360001243',
    productType: 'ahorro',
    commissionType: 'incremento',
    commissionValue: 95000,
    period: '2024-11',
    month: 11,
    year: 2024,
    createdAt: '2024-11-20T14:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  },
  {
    id: '11',
    clientName: 'Cliente Ejemplo 3',
    policyNumber: '360001244',
    productType: 'seguros',
    commissionType: 'reactivacion',
    commissionValue: 180000,
    period: '2024-10',
    month: 10,
    year: 2024,
    createdAt: '2024-10-25T16:00:00Z',
    agentId: '1',
    agentName: 'Carlos Rodríguez'
  }
];

export const PRODUCT_TYPE_LABELS: Record<Commission['productType'], string> = {
  'patrimonio': 'Crea Patrimonio',
  'ahorro': 'Crea Ahorro',
  'seguros': 'Seguros',
  'enfermedades': 'Enfermedades Graves',
  'pensiones': 'Seguro Individual de Pensiones'
};

export const COMMISSION_TYPE_LABELS: Record<Commission['commissionType'], string> = {
  'mantenimiento': 'Mantenimiento de compensación',
  'incremento': 'Incremento de adie-activo',
  'preferencias': 'Preferencias',
  'reactivacion': 'Reactivación',
  'clawback': 'Clawback'
};

export const PRODUCT_COLORS: Record<Commission['productType'], string> = {
  'patrimonio': '#00c73d',
  'ahorro': '#2563eb',
  'seguros': '#dc2626',
  'enfermedades': '#7c3aed',
  'pensiones': '#ea580c'
};