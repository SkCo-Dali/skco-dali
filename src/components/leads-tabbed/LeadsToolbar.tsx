import { Button } from "@/components/ui/button";
import { LeadsSearch } from "@/components/LeadsSearch";
import { LeadsViewControls } from "@/components/LeadsViewControls";
import { LeadsTableColumnSelector } from "@/components/LeadsTableColumnSelector";
import { LeadsFilters } from "@/components/LeadsFilters";
import { LeadType } from "@/types/leadTypes";
import { ColumnConfig } from "@/types/crm";
import { LeadsApiFilters } from "@/types/paginatedLeadsTypes";
import { 
  Plus, 
  Upload, 
  Mail, 
  MessageSquare, 
  UserPlus, 
  Edit, 
  Trash2,
  Filter
} from "lucide-react";

interface LeadsToolbarProps {
  leadType: LeadType;
  viewMode: "table" | "columns";
  setViewMode: (mode: "table" | "columns") => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onCreateLead: () => void;
  onUploadLeads: () => void;
  onMassEmail: () => void;
  onMassWhatsApp: () => void;
  onBulkAssign: () => void;
  onBulkStatusUpdate: () => void;
  onDeleteSelected: () => void;
  selectedCount: number;
  columns: ColumnConfig[];
  onColumnToggle: (columnKey: string) => void;
  filters: LeadsApiFilters;
  onFiltersChange: (filters: LeadsApiFilters) => void;
  uniqueValues: Record<string, any[]>;
}

export function LeadsToolbar({
  leadType,
  viewMode,
  setViewMode,
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onCreateLead,
  onUploadLeads,
  onMassEmail,
  onMassWhatsApp,
  onBulkAssign,
  onBulkStatusUpdate,
  onDeleteSelected,
  selectedCount,
  columns,
  onColumnToggle,
  filters,
  onFiltersChange,
  uniqueValues
}: LeadsToolbarProps) {
  
  const getCreateButtonText = () => {
    switch (leadType) {
      case 'pac': return 'Crear Lead PAC';
      case 'corporate': return 'Crear Lead Corporativo';
      default: return 'Crear Lead';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and View Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <LeadsSearch 
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
        />
        
        <LeadsViewControls 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          onClick={onToggleFilters}
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>

        {viewMode === "table" && (
          <LeadsTableColumnSelector
            columns={columns}
            onColumnToggle={onColumnToggle}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button onClick={onCreateLead} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {getCreateButtonText()}
        </Button>

        <Button onClick={onUploadLeads} variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          Cargar Leads
        </Button>

        {selectedCount > 0 && (
          <>
            <Button onClick={onMassEmail} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email ({selectedCount})
            </Button>

            <Button onClick={onMassWhatsApp} variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar WhatsApp ({selectedCount})
            </Button>

            <Button onClick={onBulkAssign} variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar ({selectedCount})
            </Button>

            <Button onClick={onBulkStatusUpdate} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Cambiar Estado ({selectedCount})
            </Button>

            <Button 
              onClick={onDeleteSelected} 
              variant="destructive" 
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar ({selectedCount})
            </Button>
          </>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <LeadsFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          uniqueValues={uniqueValues}
        />
      )}
    </div>
  );
}
