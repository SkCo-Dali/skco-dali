
import { Button } from "@/components/ui/button";

interface LeadsViewControlsProps {
  viewMode: "grid" | "table" | "columns";
  setViewMode: (mode: "grid" | "table" | "columns") => void;
}

export function LeadsViewControls({ viewMode, setViewMode }: LeadsViewControlsProps) {
  return (
    <div className="flex items-center justify-start mb-4">
      <div className="flex items-center space-x-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('grid')}
        >
          Grid
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('table')}
        >
          Tabla
        </Button>
        <Button
          variant={viewMode === 'columns' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('columns')}
        >
          Columnas
        </Button>
      </div>
    </div>
  );
}
