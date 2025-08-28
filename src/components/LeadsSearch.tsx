
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LeadsSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function LeadsSearch({ searchTerm, onSearchChange }: LeadsSearchProps) {
  return (
    <div className="relative max-w-md w-full">
      <Input
        placeholder="Ingresa un dato para tu búsqueda"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="!pl-10 box-border w-full h-8"
      />
    </div>
  );
}
