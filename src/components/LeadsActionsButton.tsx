
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreVertical, 
  Plus, 
  Users, 
  Mail, 
  Trash 
} from "lucide-react";

interface LeadsActionsButtonProps {
  onCreateLead: () => void;
  onBulkAssign: () => void;
  onMassEmail: () => void;
  onDeleteLeads: () => void;
  selectedLeadsCount: number;
  isDeleting?: boolean;
}

export function LeadsActionsButton({
  onCreateLead,
  onBulkAssign,
  onMassEmail,
  onDeleteLeads,
  selectedLeadsCount,
  isDeleting = false
}: LeadsActionsButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline"
          size="sm"
          className="text-[#3f3f3f] w-8 h-8 bg-white border border-gray-300 rounded-md hover:bg-white hover:border-gray-300 p-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white rounded-2xl shadow-lg border border-gray-200" align="end">
        <DropdownMenuItem onClick={onCreateLead} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Crear Lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onBulkAssign} className="cursor-pointer">
          <Users className="h-4 w-4 mr-2" />
          Asignación masiva
          {selectedLeadsCount > 0 && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
              {selectedLeadsCount}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onMassEmail} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2" />
          Enviar email
          {selectedLeadsCount > 0 && (
            <span className="ml-auto text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
              {selectedLeadsCount}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={onDeleteLeads} 
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
          disabled={isDeleting}
        >
          <Trash className="h-4 w-4 mr-2" />
          Eliminar
          {selectedLeadsCount > 0 && (
            <span className="ml-auto text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
              {selectedLeadsCount}
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
