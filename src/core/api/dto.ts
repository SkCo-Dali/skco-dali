// DTO types for DALI | Ficha 360° de Asesores

export interface Advisor {
  id: string;
  doc: string;
  nombre: string;
  region: string;
  zona: string;
  jefe?: string;
  canal?: string;
  estado?: "activo" | "inactivo";
}

export interface SalesKPI {
  fecha: string;
  produccion: number;
  primas: number;
  negocios: number;
  conversion: number;
  ticket: number;
}

export interface Goal {
  mes: string;
  producto: string;
  meta: number;
}

export interface LearningRecord {
  advisorId: string;
  cursoId: string;
  nombre: string;
  horas: number;
  score?: number;
  fecha: string;
  estado: "completo" | "pendiente";
}

export interface Certification {
  advisorId: string;
  certId: string;
  nombre: string;
  entidad: string;
  expide: string;
  expira: string;
  estado: "vigente" | "por_vencer" | "vencida";
  archivoUrl?: string;
}

export interface Campaign {
  campaignId: string;
  nombre: string;
  objetivo: string;
  producto: string;
  canal: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "activa" | "pausada" | "finalizada";
  owner?: string;
  presupuesto?: number;
}

export interface CampaignAssignment {
  campaignId: string;
  advisorId: string;
  cuota?: number;
  leadsAsignados?: number;
  leadsAtendidos?: number;
}

export interface CampaignPerf {
  campaignId: string;
  advisorId: string;
  fecha: string;
  negocios: number;
  primas: number;
  conversion: number;
  ticket: number;
  costo?: number;
}
