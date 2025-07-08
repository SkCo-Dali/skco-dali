
import { useState } from "react"; 
import { Lead } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, ChevronUp, ChevronDown, MoreVertical, Edit, Calendar, User as UserIcon, MessageSquare, MessageCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUsersApi } from "@/hooks/useUsersApi";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  onSortedLeadsChange?: (sortedLeads: Lead[]) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

const defaultColumns: ColumnConfig[] = [
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

export function LeadsTable({ 
  leads, 
  paginatedLeads, 
  onLeadClick, 
  onLeadUpdate, 
  columns = defaultColumns, 
  onSortedLeadsChange 
}: LeadsTableProps) {
  const { users } = useUsersApi();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const visibleColumns = columns.filter(col => col.visible);

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
      case 'profile':
        console.log('Ver perfil del lead:', lead.name);
        break;
      case 'notes':
        console.log('Ver notas del lead:', lead.name);
        break;
      case 'whatsapp':
        if (lead.phone) {
          window.open(`https://wa.me/${lead.phone}`, '_blank');
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
                <DropdownMenuItem onClick={(e) => handleLeadAction('whatsapp', lead, e)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
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
          <span className="text-gray-700 text-xs">
            {lead.product || '-'}
          </span>
        );
      case 'campaign':
        return (
          <span className="text-gray-700 text-xs">
            {lead.campaign || '-'}
          </span>
        );
      case 'source':
        return <span className="text-gray-700 text-xs capitalize">{lead.source}</span>;
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
          <span className="text-gray-700 text-xs">
            {format(new Date(lead.updatedAt), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      case 'value':
        return <span className="text-gray-800 font-medium text-xs">${lead.value.toLocaleString()}</span>;
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
          <span className="text-gray-700 text-xs">
            {format(new Date(lead.createdAt), "dd/MM/yyyy", { locale: es })}
          </span>
        );
      case 'age':
        return <span className="text-gray-700 text-xs">{lead.age || '-'}</span>;
      case 'gender':
        return <span className="text-gray-700 text-xs">{lead.gender || '-'}</span>;
      case 'preferredContactChannel':
        return <span className="text-gray-700 text-xs">{lead.preferredContactChannel || '-'}</span>;
      case 'documentType':
        return <span className="text-gray-700 text-xs">{lead.documentType || '-'}</span>;
      default:
        return null;
    }
  };

  return (
      
      <div className="bg-gray-100 rounded-lg style={{ backgroundColor: '#fafafa'; borderColor: #fafafa }}">
        <style>{`
        .leads-table-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .leads-table-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .leads-table-scroll::-webkit-scrollbar-thumb {
          background: #00c83c;
          border-radius: 4px;
        }
        .leads-table-scroll::-webkit-scrollbar-thumb:hover {
          background: #00b835;
        }
        .leads-table-scroll::-webkit-scrollbar-corner {
          background: #f1f1f1;
        }
        .name-column-sticky {
          position: sticky;
          left: 0;
          z-index: 20;
          background: transparent;
          border-right: 0px solid #e5e7eb;
        }
      `}</style>
        <div className="bg-transparent rounded-lg border border-white overflow-hidden">
          <div 
            className="leads-table-scroll overflow-auto"
            style={{ 
              maxHeight: '500px',
              maxWidth: '100%'
            }}
          >
            <div style={{ minWidth: `${300 + (visibleColumns.length - 1) * 150}px` }}>
              <Table className="w-full">
                <TableHeader className="top-0 z-10 bg-white">
                  <TableRow className="bg-gray-100 border-b border-gray-100">
                    {visibleColumns.map((column) => (
                      <TableHead 
                        key={column.key}
                        className={`cursor-pointer select-none px-4 py-3 text-center text-xs font-medium text-gray-600 capitalize tracking-wider ${
                          column.key === 'name' ? 'name-column-sticky' : ''
                        }`}
                        style={{ 
                          minWidth: column.key === 'name' ? '300px' : '150px', 
                          maxWidth: column.key === 'name' ? '300px' : '150px', 
                          width: column.key === 'name' ? '300px' : '150px'
                        }}
                        onClick={() => handleSort(column.key)}
                      >
                        <div className="flex items-center">
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
                      className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      {visibleColumns.map((column) => (
                        <TableCell 
                          key={column.key} 
                          className={`px-4 py-3 text-xs ${
                            column.key === 'name' ? 'name-column-sticky' : ''
                          }`}
                          style={{ 
                            minWidth: column.key === 'name' ? '200px' : '150px', 
                            maxWidth: column.key === 'name' ? '200px' : '150px', 
                            width: column.key === 'name' ? '200px' : '150px'
                          }}
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
      </div>
  );
}
