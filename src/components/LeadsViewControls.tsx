
import { Button } from "@/components/ui/button";
import { ColumnConfig } from "./LeadsTableColumnSelector";
import { LeadsTableColumnSelector } from "./LeadsTableColumnSelector";

interface LeadsViewControlsProps {
  viewMode: "table" | "columns";
  onViewModeChange: (mode: "table" | "columns") => void;
  groupBy: string;
  onGroupByChange: (groupBy: string) => void;
  columns: ColumnConfig[];
  onColumnsChange: (columns: ColumnConfig[]) => void;
}

export function LeadsViewControls({ 
  viewMode, 
  onViewModeChange, 
  groupBy, 
  onGroupByChange, 
  columns, 
  onColumnsChange 
}: LeadsViewControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('table')}
        >
          Tabla
        </Button>
        <Button
          variant={viewMode === 'columns' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onViewModeChange('columns')}
        >
          Columnas
        </Button>
      </div>
      
      {viewMode === 'table' && (
        <LeadsTableColumnSelector
          columns={columns}
          onColumnsChange={onColumnsChange}
        />
      )}
    </div>
  );
}
