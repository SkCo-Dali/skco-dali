
import { Lead } from "@/types/crm";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";

export interface LeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  onSortedLeadsChange?: (sortedLeads: Lead[]) => void;
}

export type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true },
  { key: 'email', label: 'Email', visible: true },
  { key: 'phone', label: 'Teléfono', visible: false },
  { key: 'product', label: 'Producto', visible: true },
  { key: 'stage', label: 'Etapa', visible: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true },
  { key: 'campaign', label: 'Campaña', visible: true },
  { key: 'source', label: 'Fuente', visible: false },
  { key: 'lastInteraction', label: 'Últ. interacción', visible: false },
  { key: 'company', label: 'Empresa', visible: false },
  { key: 'value', label: 'Valor', visible: false },
  { key: 'priority', label: 'Prioridad', visible: false },
  { key: 'createdAt', label: 'Fecha creación', visible: false },
  { key: 'age', label: 'Edad', visible: false },
  { key: 'gender', label: 'Género', visible: false },
  { key: 'preferredContactChannel', label: 'Medio de contacto preferido', visible: false },
  { key: 'documentType', label: 'Tipo documento', visible: true },
  { key: 'documentNumber', label: 'Número documento', visible: true },
];
