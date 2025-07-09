
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LeadsSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function LeadsSearch({ searchTerm, onSearchChange }: LeadsSearchProps) {
  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input
        placeholder="Buscar por nombre, email, teléfono, documento..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="!pl-10 box-border w-full"
      />
    </div>
  );
}
