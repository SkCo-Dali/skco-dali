import { useState } from "react"; 
import { Lead } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, ChevronUp, ChevronDown, MoreVertical, Edit, Calendar, User as UserIcon, MessageCircle, Trash2, Mail } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUsersApi } from "@/hooks/useUsersApi";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";

interface LeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  onSortedLeadsChange?: (sortedLeads: Lead[]) => void;
  onSendEmail?: (lead: Lead) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: false, sortable: false },
  { key: 'product', label: 'Producto', visible: true, sortable: true },
  { key: 'stage', label: 'Etapa', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
  { key: 'campaign', label: 'Campaña', visible: true, sortable: true },
  { key: 'source', label: 'Fuente', visible: false, sortable: true },
  { key: 'lastInteraction', label: 'Últ. interacción', visible: false, sortable: true },
  { key: 'company', label: 'Empresa', visible: false, sortable: true },
  { key: 'value', label: 'Valor', visible: false, sortable: true },
  { key: 'priority', label: 'Prioridad', visible: false, sortable: true },
  { key: 'createdAt', label: 'Fecha creación', visible: false, sortable: true },
  { key: 'age', label: 'Edad', visible: false, sortable: true },
  { key: 'gender', label: 'Género', visible: false, sortable: true },
  { key: 'preferredContactChannel', label: 'Medio de contacto preferido', visible: false, sortable: true },
  { key: 'documentType', label: 'Tipo documento', visible: true, sortable: true },
  { key: 'documentNumber', label: 'Número documento', visible: true, sortable: true },
];

export function LeadsTable({ 
  leads, 
  paginatedLeads, 
  onLeadClick, 
  onLeadUpdate, 
  columns = defaultColumns, 
  onSortedLeadsChange,
  onSendEmail
}: LeadsTableProps) {
  const { users } = useUsersApi();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const visibleColumns = columns.filter(col => col.visible);
  
  const calculateTableWidth = () => {
    const nameColumnWidth = 350; // Columna nombre siempre 350px
    const regularColumnWidth = 250; // Todas las demás columnas 250px
    const visibleRegularColumns = visibleColumns.length - 1; // Restar la columna nombre
    
    return nameColumnWidth + (visibleRegularColumns * regularColumnWidth);
  };

  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig && sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key: columnKey, direction });
    
    const sortedLeads = [...leads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (columnKey) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email.toLowerCase();
          bValue = b.email.toLowerCase();
          break;
        case 'product':
          aValue = (a.product || '').toLowerCase();
          bValue = (b.product || '').toLowerCase();
          break;
        case 'campaign':
          aValue = (a.campaign || '').toLowerCase();
          bValue = (b.campaign || '').toLowerCase();
          break;
        case 'source':
          aValue = a.source.toLowerCase();
          bValue = b.source.toLowerCase();
          break;
        case 'stage':
          aValue = a.stage;
          bValue = b.stage;
          break;
        case 'assignedTo':
          const assignedUserA = users.find(u => u.id === a.assignedTo);
          const assignedUserB = users.find(u => u.id === b.assignedTo);
          aValue = (assignedUserA?.name || a.assignedTo || 'Sin asignar').toLowerCase();
          bValue = (assignedUserB?.name || b.assignedTo || 'Sin asignar').toLowerCase();
          break;
        case 'lastInteraction':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'phone':
          aValue = (a.phone || '').toLowerCase();
          bValue = (b.phone || '').toLowerCase();
          break;
        case 'company':
          aValue = (a.company || '').toLowerCase();
          bValue = (b.company || '').toLowerCase();
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'priority':
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'urgent': 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'age':
          aValue = a.age || 0;
          bValue = b.age || 0;
          break;
        case 'gender':
          aValue = (a.gender || '').toLowerCase();
          bValue = (b.gender || '').toLowerCase();
          break;
        case 'preferredContactChannel':
          aValue = (a.preferredContactChannel || '').toLowerCase();
          bValue = (b.preferredContactChannel || '').toLowerCase();
          break;
        case 'documentType':
          aValue = (a.documentType || '').toLowerCase();
          bValue = (b.documentType || '').toLowerCase();
          break;
        case 'documentNumber':
          aValue = a.documentNumber || 0;
          bValue = b.documentNumber || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    onSortedLeadsChange?.(sortedLeads);
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return null;
    }
    
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  const handleLeadAction = (action: string, lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'edit':
        onLeadClick(lead);
        break;
      case 'email':
        if (onSendEmail) {
          onSendEmail(lead);
        }
        break;
      case 'profile':
        console.log('Ver perfil del lead:', lead.name);
        break;
      case 'notes':
        console.log('Ver notas del lead:', lead.name);
        break;
      case 'whatsapp':
        if (lead.phone) {
          const cleanPhone = lead.phone.replace(/\D/g, '');
          window.open(`https://wa.me/${cleanPhone}`, '_blank');
        } else {
          console.log('No hay número de teléfono disponible para este lead');
        }
        break;
      case 'delete':
        console.log('Eliminar lead:', lead.name);
        break;
      default:
        break;
    }
  };

  const renderCellContent = (lead: Lead, columnKey: string) => {
    const assignedUser = users.find(u => u.id === lead.assignedTo);

    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center justify-between w-full">
            <div className="text-gray-900 font-medium text-xs truncate pr-2">
              {lead.name}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4 text-green-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
                <DropdownMenuItem onClick={(e) => handleLeadAction('edit', lead, e)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edición rápida
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleLeadAction('email', lead, e)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleLeadAction('whatsapp', lead, e)}>
                  <FaWhatsapp className="mr-2 h-4 w-4" />
                  Enviar WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => handleLeadAction('delete', lead, e)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      case 'email':
        return (
          <EditableLeadCell
            lead={lead}
            field="email"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'phone':
        return (
          <EditableLeadCell
            lead={lead}
            field="phone"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'company':
        return (
          <EditableLeadCell
            lead={lead}
            field="company"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'documentNumber':
        return (
          <EditableLeadCell
            lead={lead}
            field="documentNumber"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'product':
        return (
          <span className="text-gray-700 text-xs text-center">
            {lead.product || '-'}
          </span>
        );
      case 'campaign':
        return (
          <span className="text-gray-700 text-xs text-center">
            {lead.campaign || '-'}
          </span>
        );
      case 'source':
        return <span className="text-gray-700 text-xs capitalize text-center">{lead.source}</span>;
      case 'stage':
        return (
          <EditableLeadCell
            lead={lead}
            field="stage"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'assignedTo':
        return (
          <EditableLeadCell
            lead={lead}
            field="assignedTo"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'lastInteraction':
        return (
          <span className="text-gray-700 text-xs text-center">
            {format(new Date(lead.updatedAt), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      case 'value':
        return <span className="text-gray-800 font-medium text-xs text-center">${lead.value.toLocaleString()}</span>;
      case 'priority':
        return (
          <EditableLeadCell
            lead={lead}
            field="priority"
            onUpdate={() => onLeadUpdate?.()}
          />
        );
      case 'createdAt':
        return (
          <span className="text-center text-gray-700 text-xs">
            {format(new Date(lead.createdAt), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      case 'age':
        return <span className="text-center text-gray-700 text-xs">{lead.age || '-'}</span>;
      case 'gender':
        return <span className="text-center text-gray-700 text-xs">{lead.gender || '-'}</span>;
      case 'preferredContactChannel':
        return <span className="text-center text-gray-700 text-xs">{lead.preferredContactChannel || '-'}</span>;
      case 'documentType':
        return <span className="text-center text-gray-700 text-xs">{lead.documentType || '-'}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="leads-table-container-scroll">
      <div className="leads-table-scroll-wrapper">
        <div className="leads-table-inner-scroll">
          <Table 
            className="w-full"
            style={{ 
              width: `${calculateTableWidth()}px`,
              minWidth: `${calculateTableWidth()}px`
            }}
          >
            <TableHeader className="leads-table-header-sticky">
              <TableRow className="bg-[#fafafa] border-b border-[#fafafa]">
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={`cursor-pointer select-none px-4 py-3 text-center text-xs font-medium text-gray-600 capitalize tracking-wider ${
                      column.key === 'name' ? 'leads-name-column-sticky' : 'leads-regular-column'
                    }`}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center justify-center">
                      {column.label}
                      {renderSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLeads.map((lead, index) => (
                <TableRow 
                  key={lead.id}
                  className="hover:bg-[#fafafa] transition-colors border-[#fafafa]"
                >
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={column.key} 
                      className={`px-4 py-3 text-xs text-center ${
                        column.key === 'name' ? 'leads-name-column-sticky' : 'leads-regular-column'
                      }`}
                    >
                      {renderCellContent(lead, column.key)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
