import { useState, useEffect } from "react"; 
import { Lead } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { User, ChevronUp, ChevronDown, MoreVertical, Edit, Calendar, User as UserIcon, MessageCircle, Trash2, Mail, GripVertical } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUsersApi } from "@/hooks/useUsersApi";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { useLeadDeletion } from "@/hooks/useLeadDeletion";
import { LeadDeleteConfirmDialog } from "@/components/LeadDeleteConfirmDialog";
import { toast } from "sonner";
import { ColumnFilter } from "@/components/ColumnFilter";
import { useColumnFilters } from "@/hooks/useColumnFilters";
import { TextFilterCondition } from "@/components/TextFilter";
import { extractDynamicColumns, getDynamicColumnValue, groupDynamicColumns } from "@/utils/dynamicColumnsUtils";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface LeadsTableProps {
  leads: Lead[];
  paginatedLeads: Lead[];
  onLeadClick: (lead: Lead) => void;
  onLeadUpdate?: () => void;
  columns?: ColumnConfig[];
  onSortedLeadsChange?: (sortedLeads: Lead[]) => void;
  onSendEmail?: (lead: Lead) => void;
  onOpenProfiler?: (lead: Lead) => void;
  selectedLeads?: string[];
  onLeadSelectionChange?: (leadIds: string[], isSelected: boolean) => void;
  onFilteredLeadsChange?: (filteredLeads: Lead[]) => void;
}

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

// Nueva configuración por defecto con solo 6 columnas visibles
const defaultColumns: ColumnConfig[] = [
  { key: 'name', label: 'Nombre', visible: true, sortable: true },
  { key: 'campaign', label: 'Campaña', visible: true, sortable: true },
  { key: 'email', label: 'Email', visible: true, sortable: true },
  { key: 'phone', label: 'Teléfono', visible: true, sortable: false },
  { key: 'stage', label: 'Etapa', visible: true, sortable: true },
  { key: 'assignedTo', label: 'Asignado a', visible: true, sortable: true },
  { key: 'documentType', label: 'Tipo documento', visible: false, sortable: true },
  { key: 'documentNumber', label: 'Número documento', visible: false, sortable: true },
  { key: 'product', label: 'Producto', visible: false, sortable: true },
  { key: 'source', label: 'Fuente', visible: false, sortable: true },
  { key: 'createdAt', label: 'Fecha creación', visible: false, sortable: true },
  { key: 'lastInteraction', label: 'Últ. interacción', visible: false, sortable: true },
  { key: 'priority', label: 'Prioridad', visible: false, sortable: true },
  { key: 'age', label: 'Edad', visible: false, sortable: true },
  { key: 'gender', label: 'Género', visible: false, sortable: true },
  { key: 'preferredContactChannel', label: 'Medio de contacto preferido', visible: false, sortable: true },
  { key: 'company', label: 'Empresa', visible: false, sortable: true },
  { key: 'value', label: 'Valor', visible: false, sortable: true },
];

const capitalizeWords = (text: string) => {
  return text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

// Función para cargar configuración de columnas desde sessionStorage incluyendo columnas dinámicas
const loadColumnConfig = (leads: Lead[]): ColumnConfig[] => {
  console.log('🔄 Loading column config for leads:', leads.length);
  
  try {
    const saved = sessionStorage.getItem('leads-table-columns');
    
    // Extraer columnas dinámicas de los leads actuales
    const dynamicColumns = groupDynamicColumns(extractDynamicColumns(leads));
    console.log('🔄 Dynamic columns extracted in loadColumnConfig:', dynamicColumns);
    
    if (saved) {
      const savedColumns = JSON.parse(saved);
      console.log('📁 Saved columns found:', savedColumns.length);
      
      // Merge saved config with default columns
      const mergedStaticColumns = defaultColumns.map(defaultCol => {
        const savedCol = savedColumns.find((col: ColumnConfig) => col.key === defaultCol.key);
        return savedCol ? { ...defaultCol, visible: savedCol.visible } : defaultCol;
      });
      
      // Merge dynamic columns with saved visibility
      const mergedDynamicColumns = dynamicColumns.map(dynCol => {
        const savedCol = savedColumns.find((col: ColumnConfig) => col.key === dynCol.key);
        return savedCol ? { ...dynCol, visible: savedCol.visible } : dynCol;
      });
      
      const finalColumns = [...mergedStaticColumns, ...mergedDynamicColumns];
      console.log('✅ Final columns loaded from storage:', finalColumns.length);
      console.log('✅ Dynamic columns in final result:', finalColumns.filter(c => c.isDynamic).length);
      return finalColumns;
    }
    
    // Si no hay configuración guardada, usar la configuración por defecto + columnas dinámicas
    const finalColumns = [...defaultColumns, ...dynamicColumns];
    console.log('🆕 Using default columns + dynamic:', finalColumns.length);
    console.log('🆕 Dynamic columns in default result:', finalColumns.filter(c => c.isDynamic).length);
    return finalColumns;
  } catch (error) {
    console.warn('Error loading column configuration:', error);
    const dynamicColumns = groupDynamicColumns(extractDynamicColumns(leads));
    return [...defaultColumns, ...dynamicColumns];
  }
};

// Función para guardar configuración de columnas en sessionStorage
const saveColumnConfig = (columns: ColumnConfig[]) => {
  try {
    sessionStorage.setItem('leads-table-columns', JSON.stringify(columns));
    console.log('💾 Column configuration saved to storage');
  } catch (error) {
    console.warn('Error saving column configuration:', error);
  }
};

interface SortableHeaderProps {
  column: ColumnConfig;
  onSort: (columnKey: string, direction?: 'asc' | 'desc') => void;
  onColumnHeaderClick: (columnKey: string, sortable: boolean, e: React.MouseEvent) => void;
  renderSortIcon: (columnKey: string) => React.ReactNode;
  leads: Lead[];
  columnFilters: Record<string, string[]>;
  textFilters: Record<string, TextFilterCondition[]>;
  onColumnFilterChange: (column: string, selectedValues: string[]) => void;
  onTextFilterChange: (column: string, filters: TextFilterCondition[]) => void;
  isNameColumn?: boolean;
}

function SortableHeader({ 
  column, 
  onSort, 
  onColumnHeaderClick, 
  renderSortIcon, 
  leads, 
  columnFilters, 
  textFilters,
  onColumnFilterChange,
  onTextFilterChange,
  isNameColumn = false
}: SortableHeaderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: column.key,
    disabled: isNameColumn // Desactivar drag para la columna de nombre
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHead 
      ref={setNodeRef}
      style={style}
      className={`px-4 py-3 text-center text-xs font-medium text-gray-600 capitalize tracking-wider ${
        column.key === 'name' ? 'leads-name-column-sticky' : 'leads-regular-column'
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-center space-x-1">
        {!isNameColumn && (
          <div 
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>
        )}
        <ColumnFilter
          column={column.key}
          data={leads}
          onFilterChange={onColumnFilterChange}
          onTextFilterChange={onTextFilterChange}
          onSortChange={onSort}
          currentFilters={columnFilters[column.key] || []}
          currentTextFilters={textFilters[column.key] || []}
        />
        <span 
          className={`${column.sortable ? 'cursor-pointer hover:text-green-600' : ''}`}
          onClick={(e) => onColumnHeaderClick(column.key, column.sortable, e)}
        >
          {column.label}
        </span>
        {column.sortable && renderSortIcon(column.key)}
      </div>
    </TableHead>
  );
}

export function LeadsTable({ 
  leads, 
  paginatedLeads, 
  onLeadClick, 
  onLeadUpdate, 
  columns, 
  onSortedLeadsChange,
  onSendEmail,
  onOpenProfiler,
  selectedLeads = [],
  onLeadSelectionChange,
  onFilteredLeadsChange
}: LeadsTableProps) {
  const { users } = useUsersApi();
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [leadsToDelete, setLeadsToDelete] = useState<Lead[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Usar filtros por columna con filtros de texto integrados
  const { columnFilters, textFilters, filteredLeads, handleColumnFilterChange, handleTextFilterChange } = useColumnFilters(leads);
  
  // Aplicar ordenamiento a los leads filtrados
  const sortedFilteredLeads = sortConfig ? 
    [...filteredLeads].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Manejar columnas dinámicas
      if (sortConfig.key.startsWith('additionalInfo.')) {
        aValue = getDynamicColumnValue(a, sortConfig.key).toLowerCase();
        bValue = getDynamicColumnValue(b, sortConfig.key).toLowerCase();
      } else {
        switch (sortConfig.key) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'email':
            aValue = (a.email || '').toLowerCase();
            bValue = (b.email || '').toLowerCase();
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
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    }) : filteredLeads;
  
  useEffect(() => {
    if (onFilteredLeadsChange) {
      onFilteredLeadsChange(sortedFilteredLeads);
    }
  }, [sortedFilteredLeads, onFilteredLeadsChange]);
  
  // Notificar cambios en leads ordenados al componente padre
  useEffect(() => {
    if (onSortedLeadsChange) {
      onSortedLeadsChange(sortedFilteredLeads);
    }
  }, [sortedFilteredLeads, onSortedLeadsChange]);
  
  // Usar configuración persistente si no se pasan columnas desde el padre, incluyendo columnas dinámicas
  const [activeColumns, setActiveColumns] = useState<ColumnConfig[]>(() => {
    if (columns) {
      console.log('🔄 Using columns from props:', columns.length);
      console.log('🔄 Dynamic columns from props:', columns.filter(c => c.isDynamic).length);
      return columns;
    }
    const loadedColumns = loadColumnConfig(leads);
    console.log('🔄 Loaded columns from config:', loadedColumns.length);
    console.log('🔄 Dynamic columns loaded:', loadedColumns.filter(c => c.isDynamic).length);
    return loadedColumns;
  });
  
  // Actualizar columnas cuando los leads cambien (para capturar nuevas columnas dinámicas)
  useEffect(() => {
    console.log('🔄 Leads changed, updating columns. New leads count:', leads.length);
    
    if (!columns) {
      const updatedColumns = loadColumnConfig(leads);
      console.log('🔄 Updated columns due to leads change:', updatedColumns.length);
      console.log('🔄 New dynamic columns:', updatedColumns.filter(c => c.isDynamic).length);
      
      // Solo actualizar si hay diferencias en las columnas dinámicas
      const currentDynamicColumns = activeColumns.filter(c => c.isDynamic);
      const newDynamicColumns = updatedColumns.filter(c => c.isDynamic);
      
      if (currentDynamicColumns.length !== newDynamicColumns.length || 
          !currentDynamicColumns.every(col => newDynamicColumns.some(newCol => newCol.key === col.key))) {
        console.log('📝 Dynamic columns changed, updating state');
        setActiveColumns(updatedColumns);
      }
    }
  }, [leads, columns, activeColumns]);

  // Función para manejar cambios en las columnas
  const handleColumnsChange = (newColumns: ColumnConfig[]) => {
    console.log('🔄 Handling columns change:', newColumns.length);
    console.log('🔄 Dynamic columns in change:', newColumns.filter(c => c.isDynamic).length);
    setActiveColumns(newColumns);
    saveColumnConfig(newColumns);
  };

  // Sensors para el drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const { isDeleting, canDeleteLead, deleteSingleLead } = useLeadDeletion({
    onLeadDeleted: onLeadUpdate
  });

  const visibleColumns = activeColumns.filter(col => col.visible);

  // Separar columna de nombre de las demás
  const nameColumn = visibleColumns.find(col => col.key === 'name');
  const otherColumns = visibleColumns.filter(col => col.key !== 'name');

  const calculateTableWidth = () => {
    const checkboxColumnWidth = 50; // Nueva columna de checkbox
    const nameColumnWidth = 350; // Columna nombre siempre 350px
    const regularColumnWidth = 250; // Todas las demás columnas 250px
    const visibleRegularColumns = visibleColumns.length - 1; // Restar la columna nombre
    
    return checkboxColumnWidth + nameColumnWidth + (visibleRegularColumns * regularColumnWidth);
  };

  const handleSelectAll = (checked: boolean) => {
    // Usar sortedFilteredLeads en lugar de filteredLeads para la selección
    const currentPageLeadIds = sortedFilteredLeads.slice(0, paginatedLeads.length).map(lead => lead.id);
    if (onLeadSelectionChange) {
      onLeadSelectionChange(currentPageLeadIds, checked);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (onLeadSelectionChange) {
      onLeadSelectionChange([leadId], checked);
    }
  };

  // Usar sortedFilteredLeads para determinar si todos están seleccionados
  const currentPageSortedLeads = sortedFilteredLeads.slice(0, paginatedLeads.length);
  const isAllSelected = currentPageSortedLeads.length > 0 && currentPageSortedLeads.every(lead => selectedLeads.includes(lead.id));
  const isIndeterminate = currentPageSortedLeads.some(lead => selectedLeads.includes(lead.id)) && !isAllSelected;

  const handleSort = (columnKey: string, direction?: 'asc' | 'desc') => {
    const newDirection = direction || (sortConfig?.key === columnKey && sortConfig?.direction === 'asc' ? 'desc' : 'asc');
    console.log(`Sorting by ${columnKey} in ${newDirection} direction`);
    setSortConfig({ key: columnKey, direction: newDirection });
  };

  // Nueva función específica para manejar el clic en el nombre de la columna
  const handleColumnHeaderClick = (columnKey: string, sortable: boolean, e: React.MouseEvent) => {
    // Solo ordenar si es sortable y no se está haciendo clic en el icono de filtro
    if (sortable && !e.defaultPrevented) {
      handleSort(columnKey);
    }
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

  // Función para manejar el reordenamiento de columnas
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = otherColumns.findIndex(col => col.key === active.id);
      const newIndex = otherColumns.findIndex(col => col.key === over?.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOtherColumns = [...otherColumns];
        const [reorderedColumn] = newOtherColumns.splice(oldIndex, 1);
        newOtherColumns.splice(newIndex, 0, reorderedColumn);
        
        // Reconstruir la lista completa con la columna de nombre al principio
        const newActiveColumns = nameColumn ? [nameColumn, ...newOtherColumns] : newOtherColumns;
        setActiveColumns(newActiveColumns);
        
        // Guardar la nueva configuración
        saveColumnConfig(newActiveColumns);
      }
    }
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
        if (onOpenProfiler) {
          onOpenProfiler(lead);
        }
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
        handleDeleteLead(lead);
        break;
      default:
        break;
    }
  };

  const handleDeleteLead = (lead: Lead) => {
    if (!canDeleteLead(lead)) {
      toast.error('No tienes permisos para eliminar este lead');
      return;
    }
    setLeadsToDelete([lead]);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (leadsToDelete.length === 1) {
      const success = await deleteSingleLead(leadsToDelete[0].id);
      if (success) {
        setShowDeleteDialog(false);
        setLeadsToDelete([]);
      }
    }
  };

  const renderCellContent = (lead: Lead, columnKey: string) => {
    const assignedUser = users.find(u => u.id === lead.assignedTo);

    // Manejar columnas dinámicas
    if (columnKey.startsWith('additionalInfo.')) {
      const value = getDynamicColumnValue(lead, columnKey);
      return (
        <span className="text-gray-700 text-xs text-center">
          {value || '-'}
        </span>
      );
    }

    switch (columnKey) {
      case 'name':
        return (
          <div className="flex items-center justify-between w-full">
            <div 
              className="text-gray-900 font-bold text-xs truncate pr-2 cursor-pointer hover:text-[#00c83c]"
              onClick={(e) => {
                e.stopPropagation();
                onLeadClick(lead);
              }}
            >
              {capitalizeWords(lead.name)}
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
                {onOpenProfiler && (
                  <DropdownMenuItem onClick={(e) => handleLeadAction('profile', lead, e)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Perfilar lead
                  </DropdownMenuItem>
                )}
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
          <div className="text-gray-700 text-xs text-center">
            {(lead.email || '').toLowerCase()}
          </div>
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

  // Usar sortedFilteredLeads para el render
  const leadsToRender = sortedFilteredLeads.slice(0, paginatedLeads.length);

  return (
    <>
      <div className="leads-table-container-scroll">
        <div className="leads-table-scroll-wrapper">
          <div className="leads-table-inner-scroll">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table 
                className="w-full"
                style={{ 
                  width: `${calculateTableWidth()}px`,
                  minWidth: `${calculateTableWidth()}px`
                }}
              >
                <TableHeader className="leads-table-header-sticky">
                  <TableRow className="bg-[#fafafa] border-b border-[#fafafa]">
                    <TableHead className="w-[50px] px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          className={isIndeterminate ? "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground" : ""}
                          {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
                        />
                      </div>
                    </TableHead>
                    
                    {/* Columna de nombre fija */}
                    {nameColumn && (
                      <SortableHeader
                        column={nameColumn}
                        onSort={handleSort}
                        onColumnHeaderClick={handleColumnHeaderClick}
                        renderSortIcon={renderSortIcon}
                        leads={leads}
                        columnFilters={columnFilters}
                        textFilters={textFilters}
                        onColumnFilterChange={handleColumnFilterChange}
                        onTextFilterChange={handleTextFilterChange}
                        isNameColumn={true}
                      />
                    )}
                    
                    {/* Columnas reorganizables */}
                    <SortableContext items={otherColumns.map(col => col.key)} strategy={horizontalListSortingStrategy}>
                      {otherColumns.map((column) => (
                        <SortableHeader
                          key={column.key}
                          column={column}
                          onSort={handleSort}
                          onColumnHeaderClick={handleColumnHeaderClick}
                          renderSortIcon={renderSortIcon}
                          leads={leads}
                          columnFilters={columnFilters}
                          textFilters={textFilters}
                          onColumnFilterChange={handleColumnFilterChange}
                          onTextFilterChange={handleTextFilterChange}
                        />
                      ))}
                    </SortableContext>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leadsToRender.map((lead, index) => (
                    <TableRow 
                      key={lead.id}
                      className="hover:bg-[#fafafa] transition-colors border-[#fafafa]"
                    >
                      <TableCell className="w-[50px] px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                          />
                        </div>
                      </TableCell>
                      
                      {/* Columna de nombre */}
                      {nameColumn && (
                        <TableCell className="px-4 py-3 text-xs text-center leads-name-column-sticky">
                          {renderCellContent(lead, nameColumn.key)}
                        </TableCell>
                      )}
                      
                      {/* Otras columnas en el orden actual */}
                      {otherColumns.map((column) => (
                        <TableCell 
                          key={column.key} 
                          className="px-4 py-3 text-xs text-center leads-regular-column"
                        >
                          {renderCellContent(lead, column.key)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DndContext>
          </div>
        </div>
      </div>

      <LeadDeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setLeadsToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        leads={leadsToDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

// Función utilitaria para usar desde el componente padre
export { loadColumnConfig, saveColumnConfig };
