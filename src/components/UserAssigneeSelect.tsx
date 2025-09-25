import { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/types/crm";
import { Check, Loader2, User as UserIcon } from "lucide-react";

interface UserAssigneeSelectProps {
  value: string;
  users: User[];
  loading?: boolean;
  onSelect: (userId: string) => void;
  placeholder?: string;
}

export function UserAssigneeSelect({ 
  value, 
  users, 
  loading = false, 
  onSelect, 
  placeholder = "Seleccionar usuario" 
}: UserAssigneeSelectProps) {
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
    if (!query.trim()) return [] as User[];
    const q = query.toLowerCase();
    return users.filter(u =>
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  }, [users, query]);

  const selectedUser = useMemo(() => {
    return users.find(u => u.id === value);
  }, [users, value]);

  const handlePick = (userId: string) => {
    onSelect(userId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full border border-input bg-background hover:text-accent-foreground rounded-md px-3 py-2 text-sm cursor-pointer flex items-center justify-between">
          <span className={selectedUser ? "text-foreground" : "text-muted-foreground"}>
            {selectedUser ? `${selectedUser.name} (${selectedUser.role})` : placeholder}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="bg-background z-50 p-2 w-80"
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
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando usuarios...
            </div>
          ) : (
            <>
              {!query.trim() ? (
                <div className="py-4 text-center text-xs text-muted-foreground">
                  Empieza a escribir para ver opciones
                </div>
              ) : (
                <ScrollArea className="h-48 pr-2">
                  <ul className="space-y-1">
                    {filtered.map(u => (
                      <li key={u.id}>
                        <button
                          type="button"
                          className="w-full text-left px-2 py-1.5 rounded hover:bg-accent text-xs flex items-center"
                          onClick={() => handlePick(u.id)}
                        >
                          <UserIcon className="h-3.5 w-3.5 mr-2" /> 
                          <div className="flex-1">
                            <div className="font-medium">{u.name}</div>
                            <div className="text-[10px] text-muted-foreground">
                              {u.email} - {u.role}
                            </div>
                          </div>
                          {value === u.id && <Check className="h-3.5 w-3.5 ml-auto" />}
                        </button>
                      </li>
                    ))}

                    {filtered.length === 0 && query.trim() && (
                      <li className="px-2 py-2 text-center text-xs text-muted-foreground">
                        No se encontraron usuarios
                      </li>
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