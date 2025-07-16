
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
  Trash,
  Brain
} from "lucide-react";

interface LeadsActionsButtonProps {
  onCreateLead: () => void;
  onBulkAssign: () => void;
  onMassEmail: () => void;
  onDeleteLeads: () => void;
  onStartProfiling?: () => void;
  selectedLeadsCount: number;
  isDeleting?: boolean;
}

export function LeadsActionsButton({
  onCreateLead,
  onBulkAssign,
  onMassEmail,
  onDeleteLeads,
  onStartProfiling,
  selectedLeadsCount,
  isDeleting = false
}: LeadsActionsButtonProps) {
  const handleCreateLead = () => {
    console.log('LeadsActionsButton: handleCreateLead called');
    onCreateLead();
  };

  const handleBulkAssign = () => {
    console.log('LeadsActionsButton: handleBulkAssign called');
    onBulkAssign();
  };

  const handleMassEmail = () => {
    console.log('LeadsActionsButton: handleMassEmail called');
    onMassEmail();
  };

  const handleDeleteLeads = () => {
    console.log('LeadsActionsButton: handleDeleteLeads called');
    onDeleteLeads();
  };

  const handleStartProfiling = () => {
    console.log('LeadsActionsButton: handleStartProfiling called');
    onStartProfiling?.();
  };

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
      <DropdownMenuContent className="w-56 bg-white rounded-2xl shadow-lg border border-gray-200 z-50" align="end">
        <DropdownMenuItem onClick={handleCreateLead} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          Crear Lead
        </DropdownMenuItem>
        {onStartProfiling && (
          <DropdownMenuItem onClick={handleStartProfiling} className="cursor-pointer">
            <Brain className="h-4 w-4 mr-2" />
            Iniciar Asesoría
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleBulkAssign} className="cursor-pointer">
          <Users className="h-4 w-4 mr-2" />
          Asignación masiva
          {selectedLeadsCount > 0 && (
            <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
              {selectedLeadsCount}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleMassEmail} className="cursor-pointer">
          <Mail className="h-4 w-4 mr-2" />
          Enviar email
          {selectedLeadsCount > 0 && (
            <span className="ml-auto text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
              {selectedLeadsCount}
            </span>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDeleteLeads} 
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
