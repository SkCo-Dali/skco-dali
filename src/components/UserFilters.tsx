import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { roles } from "@/utils/userRoleUtils";

interface UserFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
}

export function UserFilters({ searchTerm, setSearchTerm, roleFilter, setRoleFilter }: UserFiltersProps) {
  const getRoleDisplayName = (role: string): string => {
    const foundRole = roles.find((r) => r.value === role);
    return foundRole ? foundRole.label : role;
  };

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="search"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="!pl-10"
          />
        </div>
      </div>
      <div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <Label htmlFor="role-filter">Filtrar por rol</Label>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
