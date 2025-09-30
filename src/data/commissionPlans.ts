export type CommissionPlanStatus = 'published' | 'ready_to_approve' | 'draft' | 'rejected' | 'inactive';

export type AssignmentType = 'all_users' | 'user' | 'role' | 'team';

export interface CommissionPlan {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  assignmentType: AssignmentType;
  assignmentValue?: string; // User ID, Role name, or Team name
  publishedOn?: string;
  status: CommissionPlanStatus;
  rules: CommissionRule[];
}

export interface CommissionRule {
  id: string;
  name: string;
  formula: string;
  conditions: string;
  catalog: string;
  description?: string;
  owner?: string;
  dataField?: string;
}

export const ROLES_LIST = [
  'Administrador Comisiones',
  'Director Comercial - Agencias',
  'Director Comercial - Empleados', 
  'Director Comercial - Seguros',
  'Empleados',
  'Empleados-Agente',
  'Gerente Comercial - Agencias',
  'Gerente Comercial - Empleados',
  'Gerente Comercial - Seguros',
  'Intermediario',
  'Intermediario - Agente AIS',
  'Intermediario - Aliado',
  'Intermediario - Promotor',
  'Skandia Administrator',
  'System Administrator',
  'Tradicional',
  'Tradicional - Agente Asociado',
  'Tradicional - Agente Socio'
];

export const STATUS_LABELS: Record<CommissionPlanStatus, string> = {
  published: 'Published',
  ready_to_approve: 'Ready to Approve',
  draft: 'Draft',
  rejected: 'Rejected',
  inactive: 'Inactive'
};

export const ASSIGNMENT_LABELS: Record<AssignmentType, string> = {
  all_users: 'All Users',
  user: 'User',
  role: 'Role',
  team: 'Team'
};

export const mockCommissionPlans: CommissionPlan[] = [
  {
    id: '1',
    name: 'AIS_CLAW_CREA',
    description: 'Agencias Clawback para Front',
    startDate: '2024-10-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-05-12T12:44:00Z',
    status: 'published',
    rules: [
      {
        id: '1',
        name: 'AIS_FRONT1_OMPEV_MASTER',
        formula: '2 / 100 * record.ValorBase',
        conditions: 'Producto equal OMPEV and CanalDescripcion equal Intermediario and CodigoEstadoContrato equal 1 and NumeroPrimaPagada bigger than 1 and Clasificacion equal Master',
        catalog: 'Pólizas'
      }
    ]
  },
  {
    id: '2',
    name: 'AIS_CLAW_ENGRAV',
    description: 'Intermediarios Clawback para Front',
    startDate: '2025-01-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-06-05T01:43:00Z',
    status: 'published',
    rules: []
  },
  {
    id: '3',
    name: 'AIS_CLAW_OMPEV',
    description: 'Agentes Independientes Seguros. Clawback para Front 1 y Front 19.',
    startDate: '2024-10-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-07-23T17:21:00Z',
    status: 'published',
    rules: []
  },
  {
    id: '4',
    name: 'AIS_FRONT19_OMPEV',
    description: 'Agentes Independientes Seguros. Se liquida cuando longa 19 primas pagadas.',
    startDate: '2024-10-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-07-29T14:03:00Z',
    status: 'ready_to_approve',
    rules: []
  },
  {
    id: '5',
    name: 'AIS_FRONT1_OMPEV',
    description: 'Agentes Independientes Seguros. Comisión del asesor dependiendo su categoría: Master, Senior, Junior, Promotor o aliado.',
    startDate: '2024-10-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-07-29T14:32:00Z',
    status: 'draft',
    rules: []
  },
  {
    id: '6',
    name: 'AIS_FRONT_CREA',
    description: 'Intermediarios. Se liquida cuando la póliza haya fondeado la primera prima.',
    startDate: '2024-10-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-04-30T01:58:00Z',
    status: 'inactive',
    rules: []
  },
  {
    id: '7',
    name: 'AIS_FRONT_ENGRAV',
    description: 'Comisión de ENGRAV para el pago del front 1',
    startDate: '2025-01-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-06-05T09:01:00Z',
    status: 'rejected',
    rules: []
  },
  {
    id: '8',
    name: 'AIS_INCREMENTO_OMPEV',
    description: 'Agentes Independientes Seguros. Se liquida en el momento que se dé un incremento.',
    startDate: '2024-10-01',
    endDate: '2050-12-31',
    assignmentType: 'all_users',
    publishedOn: '2025-07-29T14:49:00Z',
    status: 'published',
    rules: []
  }
];