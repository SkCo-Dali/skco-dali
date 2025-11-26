
import { Button } from "@/components/ui/button";

interface LeadsViewControlsProps {
  viewMode: "table" | "columns";
  setViewMode: (mode: "table" | "columns") => void;
}

export function LeadsViewControls({ viewMode, setViewMode }: LeadsViewControlsProps) {
  return (
    <div className="flex items-center justify-start mb-3 sm:mb-4">
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          Tabla
        </Button>
        <Button
          variant={viewMode === 'columns' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('columns')}
          className="text-xs sm:text-sm px-2 sm:px-3"
        >
          Columnas
        </Button>
      </div>
    </div>
  );
}
