import { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Loader2, User as UserIcon } from "lucide-react";

interface SearchUser {
  Id: string;
  Name: string;
  PreferredName?: string;
  Email: string;
  Role: string;
  IsActive: boolean;
}

interface UserAccessSelectProps {
  value: string;
  users: SearchUser[];
  loading?: boolean;
  onSelect: (userId: string) => void;
  placeholder?: string;
}

export function UserAccessSelect({ 
  value, 
  users, 
  loading = false, 
  onSelect, 
  placeholder = "Seleccionar usuario" 
}: UserAccessSelectProps) {
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
    if (!query.trim()) return users;
    const q = query.toLowerCase();
    return users.filter(u =>
      (u.PreferredName || u.Name).toLowerCase().includes(q) ||
      u.Email.toLowerCase().includes(q) ||
      u.Role.toLowerCase().includes(q)
    );
  }, [users, query]);

  const selectedUser = useMemo(() => {
    return users.find(u => u.Id === value);
  }, [users, value]);

  const handlePick = (userId: string) => {
    onSelect(userId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm cursor-pointer flex items-center justify-between">
          <span className={selectedUser ? "text-foreground" : "text-muted-foreground"}>
            {selectedUser ? `${selectedUser.PreferredName || selectedUser.Name} · ${selectedUser.Email}` : placeholder}
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="bg-background border border-border shadow-lg z-50 p-3 w-[400px]"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-2" onKeyDownCapture={(e) => e.stopPropagation()}>
          <Input
            ref={inputRef}
            placeholder="Buscar usuario..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 text-sm"
            autoFocus
            onKeyDown={(e) => e.stopPropagation()}
            onKeyUp={(e) => e.stopPropagation()}
            onInput={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          />

          {loading ? (
            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando usuarios...
            </div>
          ) : (
            <ScrollArea className="h-64 pr-2">
              <ul className="space-y-1">
                {filtered.map(u => (
                  <li key={u.Id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 rounded hover:bg-accent text-sm flex items-center gap-2"
                      onClick={() => handlePick(u.Id)}
                    >
                      <UserIcon className="h-4 w-4 flex-shrink-0" /> 
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{u.PreferredName || u.Name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {u.Email} · {u.Role}
                        </div>
                      </div>
                      {value === u.Id && <Check className="h-4 w-4 flex-shrink-0 ml-auto" />}
                    </button>
                  </li>
                ))}

                {filtered.length === 0 && (
                  <li className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No se encontraron usuarios
                  </li>
                )}
              </ul>
            </ScrollArea>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
