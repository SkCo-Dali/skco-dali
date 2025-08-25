
import { Grid, Table } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InformesViewControlsProps {
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
}

export function InformesViewControls({ viewMode, onViewModeChange }: InformesViewControlsProps) {
  return (
    <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className={viewMode === "grid" ? "bg-[#00C73D] hover:bg-[#00C73D]/90" : ""}
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={viewMode === "table" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("table")}
        className={viewMode === "table" ? "bg-[#00C73D] hover:bg-[#00C73D]/90" : ""}
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  );
}
