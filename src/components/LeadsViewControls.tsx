
import { Button } from "@/components/ui/button";

interface LeadsViewControlsProps {
  viewMode: "table" | "columns";
  setViewMode: (mode: "table" | "columns") => void;
}

export function LeadsViewControls({ viewMode, setViewMode }: LeadsViewControlsProps) {
  return (
    <div className="flex items-center justify-start mb-4">
      <div className="flex items-center space-x-2">
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
