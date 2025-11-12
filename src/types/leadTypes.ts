// Lead type enum
export type LeadType = 'generic' | 'pac' | 'corporate';

// Extended lead interface for typed leads
export interface TypedLead {
  tipoLead: LeadType;
  // PAC specific fields
  numeroEmpleadosAproximado?: number;
  estadoLeadPac?: 'Prospecto' | 'En Contacto' | 'En Negociación' | 'Cerrado Ganado' | 'Cerrado Perdido';
  sectorEmpresa?: string;
  // Corporate specific fields
  estadoLeadCorporativo?: string;
  segmento?: string;
}
