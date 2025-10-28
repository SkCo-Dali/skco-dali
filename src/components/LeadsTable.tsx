import { useState, useEffect, useMemo } from "react";
import { Lead } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  ChevronUp,
  ChevronDown,
  MoreVertical,
  Edit,
  Calendar,
  User as UserIcon,
  MessageCircle,
  Trash2,
  Mail,
  GripVertical,
} from "lucide-react";
import { formatBogotaDate } from "@/utils/dateUtils";
import { ColumnConfig } from "@/components/LeadsTableColumnSelector";
import { EditableLeadCell } from "@/components/EditableLeadCell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { useLeadDeletion } from "@/hooks/useLeadDeletion";
import { LeadDeleteConfirmDialog } from "@/components/LeadDeleteConfirmDialog";
import { useToast } from "@/hooks/use-toast";
import { ColumnFilter } from "@/components/ColumnFilter";
import { ServerSideColumnFilter } from "@/components/ServerSideColumnFilter";
import { ServerSideDateFilter } from "@/components/ServerSideDateFilter";
import { TextFilterCondition } from "@/components/TextFilter";
import { LeadsApiFilters } from "@/types/paginatedLeadsTypes";
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
import { SortableContext, useSortable, horizontalListSortingStrategy } from "@dnd-kit/sortable";
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
  columnFilters?: Record<string, string[]>;
  textFilters?: Record<string, any[]>;
  onColumnFilterChange?: (column: string, selectedValues: string[]) => void;
  onTextFilterChange?: (column: string, filters: any[]) => void;
  onClearColumnFilter?: (column: string) => void;
  hasFiltersForColumn?: (column: string) => boolean;
  searchTerm?: string; // Término de búsqueda principal
  // Props para ordenamiento desde el hook unificado
  sortBy?: string;
  setSortBy?: (sort: string) => void;
  sortDirection?: "asc" | "desc";
  setSortDirection?: (direction: "asc" | "desc") => void;
}

type SortConfig = {
  key: string;
  direction: "asc" | "desc";
} | null;

// Nueva configuración por defecto con solo 6 columnas visibles
const defaultColumns: ColumnConfig[] = [
  { key: "name", label: "Nombre", visible: true, sortable: true },
  { key: "campaign", label: "Campaña", visible: true, sortable: true },
  { key: "email", label: "Email", visible: true, sortable: true },
  { key: "alternateEmail", label: "Email Alternativo", visible: true, sortable: true },
  { key: "phone", label: "Teléfono", visible: true, sortable: false },
  { key: "stage", label: "Etapa", visible: true, sortable: true },
  { key: "assignedToName", label: "Asignado a", visible: true, sortable: true },
  { key: "lastGestorName", label: "Últ Gestor Asignado", visible: false, sortable: true },
  { key: "lastGestorInteractionAt", label: "Últ Fecha de Interaccion Gestor", visible: false, sortable: true },
  { key: "lastGestorInteractionStage", label: "Últ Estado Gestor", visible: false, sortable: true },
  { key: "lastGestorInteractionDescription", label: "Últ Descripción Gestor", visible: false, sortable: true },
  { key: "documentType", label: "Tipo documento", visible: false, sortable: true },
  { key: "documentNumber", label: "Número documento", visible: false, sortable: true },
  { key: "product", label: "Producto", visible: false, sortable: true },
  { key: "source", label: "Fuente", visible: false, sortable: true },
  { key: "campaignOwnerName", label: "Lead referido por", visible: false, sortable: true },
  { key: "tags", label: "Tags", visible: false, sortable: true },
  { key: "createdAt", label: "Fecha creación", visible: true, sortable: true },
  { key: "lastInteraction", label: "Últ. interacción", visible: true, sortable: true },
  { key: "nextFollowUp", label: "Próximo seguimiento", visible: true, sortable: true },
  { key: "priority", label: "Prioridad", visible: false, sortable: true },
  { key: "age", label: "Edad", visible: false, sortable: true },
  { key: "gender", label: "Género", visible: false, sortable: true },
  { key: "preferredContactChannel", label: "Medio de contacto preferido", visible: false, sortable: true },
  { key: "company", label: "Empresa", visible: false, sortable: true },
  { key: "occupation", label: "Ocupación", visible: false, sortable: true },
  { key: "value", label: "Valor", visible: false, sortable: true },
];

const capitalizeWords = (text: string) => {
  return text.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function to clean product field
const cleanProductField = (value: any): string => {
  if (typeof value === "string") {
    // Clean all JSON-like characters and escape sequences
    let cleaned = value
      .replace(/\\"/g, '"') // Remove escape sequences
      .replace(/[\[\]"'\\]/g, "") // Remove all brackets and quotes
      .replace(/,+/g, ",") // Replace multiple commas with single comma
      .replace(/^,|,$/g, "") // Remove leading/trailing commas
      .trim();

    // Split by comma and rejoin with hyphens
    if (cleaned.includes(",")) {
      return cleaned
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item && item !== "")
        .join(" - ");
    }

    return cleaned;
  }
  if (Array.isArray(value)) return value.filter((item) => item && item.trim()).join(" - ");
  if (value === null || value === undefined) return "";
  return String(value);
};

// Función para cargar configuración de columnas desde sessionStorage
const loadColumnConfig = (): ColumnConfig[] => {
  try {
    const saved = sessionStorage.getItem("leads-table-columns");
    if (saved) {
      const savedColumns = JSON.parse(saved);
      // Merge saved config with default columns to handle new columns
      return defaultColumns.map((defaultCol) => {
        const savedCol = savedColumns.find((col: ColumnConfig) => col.key === defaultCol.key);
        return savedCol ? { ...defaultCol, visible: savedCol.visible } : defaultCol;
      });
    }
  } catch (error) {
    console.warn("Error loading column configuration:", error);
  }
  return defaultColumns;
};

// Función para guardar configuración de columnas en sessionStorage
const saveColumnConfig = (columns: ColumnConfig[]) => {
  try {
    sessionStorage.setItem("leads-table-columns", JSON.stringify(columns));
  } catch (error) {
    console.warn("Error saving column configuration:", error);
  }
};

interface SortableHeaderProps {
  column: ColumnConfig;
  onSort: (columnKey: string, direction?: "asc" | "desc") => void;
  onColumnHeaderClick: (columnKey: string, sortable: boolean, e: React.MouseEvent) => void;
  renderSortIcon: (columnKey: string) => React.ReactNode;
  leads: Lead[];
  columnFilters: Record<string, string[]>;
  textFilters: Record<string, TextFilterCondition[]>;
  onColumnFilterChange: (column: string, selectedValues: string[]) => void;
  onTextFilterChange: (column: string, filters: TextFilterCondition[]) => void;
  onClearFilter: (column: string) => void;
  isNameColumn?: boolean;
  searchTerm?: string; // Término de búsqueda principal
  // Server-side filters for distinct API calls
  currentApiFilters?: LeadsApiFilters;
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
  onClearFilter,
  isNameColumn = false,
  searchTerm,
  currentApiFilters = {},
}: SortableHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.key,
    disabled: isNameColumn,
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
        column.key === "name" ? "leads-name-column-sticky" : "leads-regular-column"
      } ${isDragging ? "opacity-50" : ""}`}
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
        {/* Use ServerSideColumnFilter for dropdown fields that need server-side distinct values */}
        {["name", "email", "campaign", "stage", "assignedToName", "source", "product", "priority"].includes(
          column.key,
        ) ? (
          <ServerSideColumnFilter
            field={column.key}
            label={column.label}
            currentFilters={currentApiFilters}
            searchTerm={searchTerm}
            onFilterChange={(field: string, values: string[]) => {
              onColumnFilterChange(field, values);
            }}
            onClearFilter={onClearFilter}
          />
        ) : ["createdAt", "updatedAt", "nextFollowUp", "lastInteraction", "lastGestorInteractionAt"].includes(column.key) ? (
          <ServerSideDateFilter
            field={column.key}
            label={column.label}
            currentFilters={currentApiFilters}
            onFilterChange={(field: string, values: string[]) => {
              onColumnFilterChange(field, values);
            }}
            onClearFilter={onClearFilter}
          />
        ) : (
          <ColumnFilter
            column={column.key}
            data={leads}
            onFilterChange={onColumnFilterChange}
            onTextFilterChange={onTextFilterChange}
            onSortChange={onSort}
            currentFilters={columnFilters[column.key] || []}
            currentTextFilters={textFilters[column.key] || []}
            tableColumnFilters={columnFilters}
            tableTextFilters={textFilters}
          />
        )}
        <span
          className={`${column.sortable ? "cursor-pointer hover:text-green-600" : ""}`}
          onClick={(e) => onColumnHeaderClick(column.key, column.sortable, e)}
        >
          {column.label}
        </span>
        {column.sortable && renderSortIcon(column.key)}
        {/* X button to clear filters - positioned after column name */}
        {(() => {
          // Para lastInteraction, buscar en lastInteractionAt
          const effectiveKey = column.key === "lastInteraction" ? "lastInteractionAt" : column.key;
          return (
            (columnFilters[column.key] && columnFilters[column.key].length > 0) ||
            (columnFilters[effectiveKey] && columnFilters[effectiveKey].length > 0) ||
            (textFilters[column.key] && textFilters[column.key].length > 0) ||
            (columnFilters[`${column.key}End`] && columnFilters[`${column.key}End`].length > 0) ||
            (columnFilters[`${effectiveKey}End`] && columnFilters[`${effectiveKey}End`].length > 0)
          );
        })() && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0 hover:bg-red-100 text-red-500 hover:text-red-600 ml-1"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilter(column.key);
            }}
          >
            <span className="text-xs font-bold">×</span>
          </Button>
        )}
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
  onFilteredLeadsChange,
  columnFilters = {},
  textFilters = {},
  onColumnFilterChange,
  onTextFilterChange,
  onClearColumnFilter,
  hasFiltersForColumn,
  searchTerm,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
}: LeadsTableProps) {
  const { toast } = useToast();
  // Removed local sortConfig - using unified sort from props
  const [leadsToDelete, setLeadsToDelete] = useState<Lead[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Convert UI filters to API format for server-side filtering
  const convertFiltersToApiFormat = useMemo((): LeadsApiFilters => {
    const apiFilters: LeadsApiFilters = {};

    // Special handling for date columns: createdAt, updatedAt, lastInteraction, nextFollowUp
    const createdAtFrom = columnFilters?.createdAt?.[0];
    const createdAtTo = columnFilters?.createdAtEnd?.[0];
    const updatedAtFrom = columnFilters?.updatedAt?.[0];
    const updatedAtTo = columnFilters?.updatedAtEnd?.[0];
    const lastInteractionFrom = columnFilters?.lastInteraction?.[0];
    const lastInteractionTo = columnFilters?.lastInteractionEnd?.[0];
    const nextFollowUpFrom = columnFilters?.nextFollowUp?.[0];
    const nextFollowUpTo = columnFilters?.nextFollowUpEnd?.[0];

    const normalizeToEndOfDay = (d?: string) => {
      if (!d) return undefined;
      return d.length === 10 ? `${d}T23:59:59` : d;
    };

    const applyDateFilter = (field: "CreatedAt" | "UpdatedAt" | "LastInteractionAt" | "NextFollowUp", from?: string, to?: string) => {
      const toNorm = normalizeToEndOfDay(to);
      if (from && toNorm) {
        (apiFilters as any)[field] = { op: "between", from, to: toNorm };
      } else if (from) {
        (apiFilters as any)[field] = { op: "gte", value: from };
      } else if (toNorm) {
        (apiFilters as any)[field] = { op: "lte", value: toNorm };
      }
    };

    applyDateFilter("CreatedAt", createdAtFrom, createdAtTo);
    applyDateFilter("UpdatedAt", updatedAtFrom, updatedAtTo);
    applyDateFilter("LastInteractionAt", lastInteractionFrom, lastInteractionTo);
    applyDateFilter("NextFollowUp", nextFollowUpFrom, nextFollowUpTo);

    // Convert non-date column filters (dropdown selections)
    if (columnFilters) {
      Object.entries(columnFilters).forEach(([column, values]) => {
        if (!values || values.length === 0) return;
        // Skip special date keys handled above
        if (
          [
            "createdAt",
            "createdAtEnd",
            "updatedAt",
            "updatedAtEnd",
            "lastInteraction",
            "lastInteractionEnd",
            "nextFollowUp",
            "nextFollowUpEnd",
          ].includes(column)
        ) {
          return;
        }
        const apiColumn = mapColumnNameToApi(column);
        (apiFilters as any)[apiColumn] = values.length === 1 ? { op: "eq", value: values[0] } : { op: "in", values };
      });
    }

    // Convert text filters
    if (textFilters) {
      Object.entries(textFilters).forEach(([column, conditions]) => {
        if (conditions && conditions.length > 0) {
          const apiColumn = mapColumnNameToApi(column);
          const condition = conditions[0];
          (apiFilters as any)[apiColumn] = convertTextConditionToApi(condition);
        }
      });
    }

    return apiFilters;
  }, [columnFilters, textFilters]);

  // Map UI column names to API column names (use function declaration to avoid TDZ)
  function mapColumnNameToApi(uiColumn: string): string {
    const mapping: Record<string, string> = {
      name: "Name",
      email: "Email",
      phone: "Phone",
      company: "Company",
      occupation: "Occupation",
      source: "Source",
      campaign: "Campaign",
      product: "Product",
      stage: "Stage",
      priority: "Priority",
      value: "Value",
      assignedTo: "AssignedTo",
      assignedToName: "AssignedToName",
      createdAt: "CreatedAt",
      updatedAt: "UpdatedAt",
      nextFollowUp: "NextFollowUp",
      notes: "Notes",
      tags: "Tags",
      alternateEmail: "AlternateEmail",
      lastGestorName: "LastGestorName",
      lastInteraction: "LastInteractionAt",
      lastGestorInteractionAt: "LastGestorInteractionAt",
      lastGestorInteractionStage: "LastGestorInteractionStage",
      lastGestorInteractionDescription: "LastGestorInteractionDescription",
    };
    return mapping[uiColumn] || uiColumn;
  }

  // Convert text condition to API format (function declaration to avoid TDZ)
  function convertTextConditionToApi(condition: TextFilterCondition): any {
    const operatorMapping: Record<string, string> = {
      equals: "eq",
      not_equals: "neq",
      contains: "contains",
      not_contains: "ncontains",
      starts_with: "startswith",
      ends_with: "endswith",
      is_empty: "isnull",
      is_not_empty: "notnull",
      greater_than: "gt",
      less_than: "lt",
      greater_equal: "gte",
      less_equal: "lte",
      after: "gt",
      before: "lt",
    };

    return {
      op: operatorMapping[condition.operator] as any,
      value: condition.value,
    };
  }

  // Los leads ya vienen completamente filtrados desde el hook unificado del padre
  // Solo necesitamos aplicar ordenamiento local en la tabla si es necesario
  const filteredLeads = leads;

  // Los leads ya vienen ordenados desde el hook unificado
  const sortedFilteredLeads = filteredLeads;

  // Notificar cambios en leads filtrados al componente padre
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

  // Usar configuración persistente si no se pasan columnas desde el padre
  const [activeColumns, setActiveColumns] = useState<ColumnConfig[]>(columns || loadColumnConfig());

  // Actualizar columnas activas cuando cambien las columnas del padre
  useEffect(() => {
    if (columns) {
      setActiveColumns(columns);
      saveColumnConfig(columns);
    }
  }, [columns]);

  // Sensors para el drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const { isDeleting, canDeleteLead, deleteSingleLead } = useLeadDeletion({
    onLeadDeleted: onLeadUpdate,
  });

  const visibleColumns = activeColumns.filter((col) => col.visible);

  // Separar columna de nombre de las demás
  const nameColumn = visibleColumns.find((col) => col.key === "name");
  const otherColumns = visibleColumns.filter((col) => col.key !== "name");

  const calculateTableWidth = () => {
    const checkboxColumnWidth = 50;
    const nameColumnWidth = 350;
    const regularColumnWidth = 250;
    const visibleRegularColumns = visibleColumns.length - 1;

    return checkboxColumnWidth + nameColumnWidth + visibleRegularColumns * regularColumnWidth;
  };

  const handleSelectAll = (checked: boolean) => {
    const currentPageLeadIds = paginatedLeads.map((lead) => lead.id);
    if (onLeadSelectionChange) {
      onLeadSelectionChange(currentPageLeadIds, checked);
    }
  };

  const handleSelectLead = (leadId: string, checked: boolean) => {
    if (onLeadSelectionChange) {
      onLeadSelectionChange([leadId], checked);
    }
  };

  const isAllSelected = paginatedLeads.length > 0 && paginatedLeads.every((lead) => selectedLeads.includes(lead.id));
  const isIndeterminate = paginatedLeads.some((lead) => selectedLeads.includes(lead.id)) && !isAllSelected;

  const handleSort = (columnKey: string, direction?: "asc" | "desc") => {
    if (!setSortBy || !setSortDirection) return;

    const newDirection = direction || (sortBy === columnKey && sortDirection === "asc" ? "desc" : "asc");
    console.log(`Sorting by ${columnKey} in ${newDirection} direction`);
    setSortBy(columnKey);
    setSortDirection(newDirection);
  };

  const handleColumnHeaderClick = (columnKey: string, sortable: boolean, e: React.MouseEvent) => {
    if (sortable && !e.defaultPrevented) {
      handleSort(columnKey);
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (!sortBy || sortBy !== columnKey) {
      return null;
    }

    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = otherColumns.findIndex((col) => col.key === active.id);
      const newIndex = otherColumns.findIndex((col) => col.key === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOtherColumns = [...otherColumns];
        const [reorderedColumn] = newOtherColumns.splice(oldIndex, 1);
        newOtherColumns.splice(newIndex, 0, reorderedColumn);

        const newActiveColumns = nameColumn ? [nameColumn, ...newOtherColumns] : newOtherColumns;
        setActiveColumns(newActiveColumns);
        saveColumnConfig(newActiveColumns);
      }
    }
  };

  const handleLeadAction = (action: string, lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();

    switch (action) {
      case "edit":
        onLeadClick(lead);
        break;
      case "email":
        if (onSendEmail) {
          onSendEmail(lead);
        }
        break;
      case "profile":
        if (onOpenProfiler) {
          onOpenProfiler(lead);
        }
        break;
      case "notes":
        console.log("Ver notas del lead:", lead.name);
        break;
      case "whatsapp":
        if (lead.phone) {
          const cleanPhone = lead.phone.replace(/\D/g, "");
          window.open(`https://wa.me/${cleanPhone}`, "_blank");
        } else {
          console.log("No hay número de teléfono disponible para este lead");
        }
        break;
      case "outlook":
        handleOutlookSchedule(lead);
        break;
      case "delete":
        handleDeleteLead(lead);
        break;
      default:
        break;
    }
  };

  const handleOutlookSchedule = (lead: Lead) => {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() + 1); // Una hora desde ahora

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1); // Duración de 1 hora

    const subject = `Reunión con ${lead.name}`;
    const body = `Reunión programada con el lead: ${lead.name}
    
Email: ${lead.email || "No disponible"}
Teléfono: ${lead.phone || "No disponible"}
Campaña: ${lead.campaign || "No disponible"}
Etapa: ${lead.stage}

Por favor, confirmar asistencia.`;

    const params = new URLSearchParams({
      subject: subject,
      body: body,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
    });

    // Si hay email del lead, agregarlo como invitado
    if (lead.email) {
      params.append("to", lead.email);
    }

    const outlookUrl = `https://outlook.office365.com/calendar/0/deeplink/compose?${params.toString()}`;
    window.open(outlookUrl, "_blank");
  };

  const handleDeleteLead = (lead: Lead) => {
    console.log("🗑️ LeadsTable: Attempting to delete lead:", lead.id, "canDelete:", canDeleteLead(lead));
    if (!canDeleteLead(lead)) {
      const message =
        "No tienes permisos para eliminar este lead. Solo puedes eliminar leads que hayas creado y tengas asignados.";
      console.log("❌ LeadsTable: Permission denied:", message);
      toast({
        title: "Permisos insuficientes",
        description: message,
        variant: "destructive",
      });
      return;
    }
    console.log("✅ LeadsTable: Permission granted, showing delete dialog");
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
    // Use assignedToName directly from API response - no need for user lookup

    // Manejar columnas dinámicas de additionalInfo
    if (columnKey.startsWith("additionalInfo.")) {
      const key = columnKey.replace("additionalInfo.", "");
      const value = lead.additionalInfo?.[key];
      return <span className="text-gray-700 text-xs text-center">{value || "-"}</span>;
    }

    switch (columnKey) {
      case "name":
        return (
          <div className="flex items-center justify-between w-full">
            <div
              className="text-gray-900 font-bold text-xs truncate pr-2 cursor-pointer hover:text-[#00C73D]"
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
                <DropdownMenuItem onClick={(e) => handleLeadAction("edit", lead, e)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edición rápida
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleLeadAction("email", lead, e)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Enviar Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleLeadAction("whatsapp", lead, e)}>
                  <FaWhatsapp className="mr-2 h-4 w-4" />
                  Enviar WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleLeadAction("outlook", lead, e)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar reunión
                </DropdownMenuItem>
                {onOpenProfiler && (
                  <DropdownMenuItem onClick={(e) => handleLeadAction("profile", lead, e)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Perfilar lead
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={(e) => handleLeadAction("delete", lead, e)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      case "email":
        return <div className="text-gray-700 text-xs text-center">{(lead.email || "").toLowerCase()}</div>;
      case "phone":
        return <div className="text-gray-700 text-xs text-center">{lead.phone || "-"}</div>;
      case "company":
        return <div className="text-gray-700 text-xs text-center">{lead.company || "-"}</div>;
      case "occupation":
        return <div className="text-gray-700 text-xs text-center">{lead.occupation || "-"}</div>;
      case "documentNumber":
        return <div className="text-gray-700 text-xs text-center">{lead.documentNumber || "-"}</div>;
      case "product":
        return <span className="text-gray-700 text-xs text-center">{cleanProductField(lead.product) || "-"}</span>;
      case "campaign":
        return <span className="text-gray-700 text-xs text-center">{lead.campaign || "-"}</span>;
      case "source":
        return <span className="text-gray-700 text-xs capitalize text-center">{lead.source}</span>;
      case "stage":
        return <EditableLeadCell lead={lead} field="stage" onUpdate={() => onLeadUpdate?.()} />;
      case "assignedTo":
        return <EditableLeadCell lead={lead} field="assignedTo" onUpdate={() => onLeadUpdate?.()} />;
      case "assignedToName":
        return <EditableLeadCell lead={lead} field="assignedToName" onUpdate={() => onLeadUpdate?.()} />;
      case "lastInteraction":
        return <span className="text-gray-700 text-xs text-center">{lead.lastInteractionAt ? formatBogotaDate(lead.lastInteractionAt) : "-"}</span>;
      case "value":
        return <span className="text-gray-800 font-medium text-xs text-center">${lead.value.toLocaleString()}</span>;
      case "priority":
        const priorityLabels = {
          low: "Baja",
          medium: "Media",
          high: "Alta",
          urgent: "Urgente",
        };
        return (
          <div className="text-gray-700 text-xs text-center">
            {priorityLabels[lead.priority as keyof typeof priorityLabels] || lead.priority || "-"}
          </div>
        );
      case "createdAt":
        return <span className="text-center text-gray-700 text-xs">{formatBogotaDate(lead.createdAt)}</span>;
      case "nextFollowUp":
        return (
          <span className="text-gray-700 text-xs text-center">
            {lead.nextFollowUp ? formatBogotaDate(lead.nextFollowUp) : "-"}
          </span>
        );
      case "tags":
        return (
          <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
            {lead.tags && lead.tags.length > 0 ? (
              lead.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-xs">-</span>
            )}
          </div>
        );
      case "age":
      case "gender":
      case "preferredContactChannel":
      case "documentType":
      case "alternateEmail":
        return <span className="text-center text-gray-700 text-xs">{lead[columnKey] || "-"}</span>;
      case "lastGestorName":
        return <span className="text-center text-gray-700 text-xs">{lead.lastGestorName || "-"}</span>;
      case "lastGestorInteractionAt":
        return (
          <span className="text-center text-gray-700 text-xs">
            {lead.lastGestorInteractionAt ? formatBogotaDate(lead.lastGestorInteractionAt) : "-"}
          </span>
        );
      case "lastGestorInteractionStage":
        return <span className="text-center text-gray-700 text-xs">{lead.lastGestorInteractionStage || "-"}</span>;
      case "lastGestorInteractionDescription":
        return (
          <span
            className="text-center text-gray-700 text-xs max-w-[200px] truncate"
            title={lead.lastGestorInteractionDescription || ""}
          >
            {lead.lastGestorInteractionDescription || "-"}
          </span>
        );
      default:
        return <span className="text-center text-gray-700 text-xs">{lead[columnKey] || "-"}</span>;
    }
  };

  return (
    <>
      <div className="leads-table-container-scroll">
        <div className="leads-table-scroll-wrapper shadow-sm border">
          <div className="leads-table-inner-scroll">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <Table
                className="w-full"
                style={{
                  width: `${calculateTableWidth()}px`,
                  minWidth: `${calculateTableWidth()}px`,
                }}
              >
                <TableHeader className="leads-table-header-sticky">
                  <TableRow className="bg-[#fafafa] border-b border-[#fafafa]">
                    <TableHead className="w-[50px] px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          className={
                            isIndeterminate
                              ? "data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground"
                              : ""
                          }
                          {...(isIndeterminate ? { "data-state": "indeterminate" } : {})}
                        />
                      </div>
                    </TableHead>

                    {nameColumn && (
                      <SortableHeader
                        column={nameColumn}
                        onSort={handleSort}
                        onColumnHeaderClick={handleColumnHeaderClick}
                        renderSortIcon={renderSortIcon}
                        leads={leads}
                        columnFilters={columnFilters || {}}
                        textFilters={textFilters || {}}
                        onColumnFilterChange={onColumnFilterChange || (() => {})}
                        onTextFilterChange={onTextFilterChange || (() => {})}
                        onClearFilter={onClearColumnFilter || (() => {})}
                        isNameColumn={true}
                        searchTerm={searchTerm}
                        currentApiFilters={convertFiltersToApiFormat}
                      />
                    )}

                    <SortableContext
                      items={otherColumns.map((col) => col.key)}
                      strategy={horizontalListSortingStrategy}
                    >
                      {otherColumns.map((column) => (
                        <SortableHeader
                          key={column.key}
                          column={column}
                          onSort={handleSort}
                          onColumnHeaderClick={handleColumnHeaderClick}
                          renderSortIcon={renderSortIcon}
                          leads={leads}
                          columnFilters={columnFilters || {}}
                          textFilters={textFilters || {}}
                          onColumnFilterChange={onColumnFilterChange || (() => {})}
                          onTextFilterChange={onTextFilterChange || (() => {})}
                          onClearFilter={onClearColumnFilter || (() => {})}
                          searchTerm={searchTerm}
                          currentApiFilters={convertFiltersToApiFormat}
                        />
                      ))}
                    </SortableContext>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead, index) => (
                    <TableRow key={lead.id} className="hover:bg-[#fafafa] transition-colors border-[#fafafa]">
                      <TableCell className="w-[50px] px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={selectedLeads.includes(lead.id)}
                            onCheckedChange={(checked) => handleSelectLead(lead.id, checked as boolean)}
                          />
                        </div>
                      </TableCell>

                      {nameColumn && (
                        <TableCell className="px-4 py-3 text-xs text-center leads-name-column-sticky">
                          {renderCellContent(lead, nameColumn.key)}
                        </TableCell>
                      )}

                      {otherColumns.map((column) => (
                        <TableCell key={column.key} className="px-4 py-3 text-xs text-center leads-regular-column">
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

export { loadColumnConfig, saveColumnConfig };
