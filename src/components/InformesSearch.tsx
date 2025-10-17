import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface InformesSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function InformesSearch({ searchTerm, onSearchChange }: InformesSearchProps) {
  const [localValue, setLocalValue] = useState(searchTerm);

  // Sync with external searchTerm changes
  useEffect(() => {
    setLocalValue(searchTerm);
  }, [searchTerm]);

  // Debounce: wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== searchTerm) {
        onSearchChange(localValue);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localValue, searchTerm, onSearchChange]);

  return (
    <div className="relative w-full">
      <Input
        placeholder="Buscar informes por nombre, descripción o workspace..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
