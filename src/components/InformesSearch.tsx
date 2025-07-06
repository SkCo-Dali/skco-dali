
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface InformesSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function InformesSearch({ searchTerm, onSearchChange }: InformesSearchProps) {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Buscar por nombre, email o campaña..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
