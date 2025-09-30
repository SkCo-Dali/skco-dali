import { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AssignableUser } from "@/utils/leadAssignmentApiClient";
import { Check, Loader2, User } from "lucide-react";

interface LeadAssigneeSelectProps {
  value: string;
  displayName: string;
  users: AssignableUser[];
  loading?: boolean;
  onSelect: (newValue: string) => void;
}

export function LeadAssigneeSelect({ value, displayName, users, loading = false, onSelect }: LeadAssigneeSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      // Defer to ensure content is mounted
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return users; // Cambio: mostrar todos los usuarios si no hay búsqueda
    const q = query.toLowerCase();
    return users.filter(u =>
      u.Name.toLowerCase().includes(q) ||
      u.Email.toLowerCase().includes(q) ||
      u.Role.toLowerCase().includes(q)
    );
  }, [users, query]);

  const showUnassigned = useMemo(() => /^(sin|ning|unass)/i.test(query.trim()), [query]);

  const handlePick = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full border-none shadow-none p-2 h-8 cursor-pointer bg-white rounded text-xs truncate flex items-center text-left" title="Click para reasignar">
          {displayName || "Sin asignar"}
        </div>
      </PopoverTrigger>
        <PopoverContent
          align="start"
          className="bg-background border border-border shadow-lg z-50 p-3 w-80"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
        <div className="space-y-2" onKeyDownCapture={(e) => e.stopPropagation()}>
          <Input
            ref={inputRef}
            placeholder="Buscar usuario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 text-xs"
            autoFocus
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onInput={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />

          {loading ? (
            <div className="flex items-center justify-center py-6 text-xs text-gray-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando usuarios...
            </div>
          ) : (
            <>
              {!query.trim() ? (
                <ScrollArea className="h-48 pr-2">
                  <ul className="space-y-1">
                    {users.map(u => (
                      <li key={u.Id}>
                        <button
                          type="button"
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-xs flex items-center"
                          onClick={() => handlePick(u.Id)}
                        >
                          <User className="h-3.5 w-3.5 mr-2" /> {u.Name} <span className="ml-1 text-[10px] text-gray-500">({u.Role})</span>
                          {value === u.Id && <Check className="h-3.5 w-3.5 ml-auto" />}
                        </button>
                      </li>
                    ))}

                    {users.length === 0 && (
                      <li className="px-2 py-2 text-center text-xs text-gray-500">No hay usuarios disponibles</li>
                    )}
                  </ul>
                </ScrollArea>
              ) : (
                <ScrollArea className="h-48 pr-2">
                  <ul className="space-y-1">
                    {filtered.map(u => (
                      <li key={u.Id}>
                        <button
                          type="button"
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 text-xs flex items-center"
                          onClick={() => handlePick(u.Id)}
                        >
                          <User className="h-3.5 w-3.5 mr-2" /> {u.Name} <span className="ml-1 text-[10px] text-gray-500">({u.Role})</span>
                          {value === u.Id && <Check className="h-3.5 w-3.5 ml-auto" />}
                        </button>
                      </li>
                    ))}

                    {filtered.length === 0 && query.trim() && (
                      <li className="px-2 py-2 text-center text-xs text-gray-500">No se encontraron usuarios</li>
                    )}
                  </ul>
                </ScrollArea>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
