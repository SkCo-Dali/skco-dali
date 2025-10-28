import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface AccessUsersSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export function AccessUsersSearch({ searchTerm, onSearchChange }: AccessUsersSearchProps) {
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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar por nombre, correo, rol o estado..."
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
