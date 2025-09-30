
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
  MessageSquare,
  Smartphone
} from "lucide-react";
import { RolePermissions, Lead } from "@/types/crm";
import { FaWhatsapp } from "react-icons/fa";
import { useState } from "react";
import { WhatsAppPropioManager } from "@/components/whatsapp/WhatsAppPropioManager";

interface LeadsActionsButtonProps {
  onCreateLead: () => void;
  onBulkAssign: () => void;
  onMassEmail: () => void;
  onMassWhatsApp: () => void;
  onDeleteLeads: () => void;
  selectedLeadsCount: number;
  isDeleting?: boolean;
  permissions: RolePermissions;
  leads: Lead[];
  userEmail: string;
}

export function LeadsActionsButton({
  onCreateLead,
  onBulkAssign,
  onMassEmail,
  onMassWhatsApp,
  onDeleteLeads,
  selectedLeadsCount,
  isDeleting = false,
  permissions,
  leads,
  userEmail
}: LeadsActionsButtonProps) {
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);

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

  const handleMassWhatsApp = () => {
    console.log('LeadsActionsButton: handleMassWhatsApp called');
    onMassWhatsApp();
  };

  const handleWhatsAppPropio = () => {
    console.log('LeadsActionsButton: handleWhatsAppPropio called');
    setIsWhatsAppOpen(true);
  };

  const handleDeleteLeads = () => {
    console.log('LeadsActionsButton: handleDeleteLeads called');
    onDeleteLeads();
  };

  return (
    <>
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
          {permissions.canCreate && (
            <DropdownMenuItem onClick={handleCreateLead} className="cursor-pointer">
              <Plus className="h-4 w-4 mr-2" />
              Crear Lead
            </DropdownMenuItem>
          )}
          {permissions.canBulkAssignLeads && (
            <DropdownMenuItem onClick={handleBulkAssign} className="cursor-pointer">
              <Users className="h-4 w-4 mr-2" />
              Asignación masiva
              {selectedLeadsCount > 0 && (
                <span className="ml-auto text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                  {selectedLeadsCount}
                </span>
              )}
            </DropdownMenuItem>
          )}
          {permissions.canSendEmail && (
            <DropdownMenuItem onClick={handleMassEmail} className="cursor-pointer">
              <Mail className="h-4 w-4 mr-2" />
              Enviar email
              {selectedLeadsCount > 0 && (
                <span className="ml-auto text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                  {selectedLeadsCount}
                </span>
              )}
            </DropdownMenuItem>
          )}
          {permissions.canSendmassiveWhatsApp && (
            <DropdownMenuItem onClick={handleWhatsAppPropio} className="cursor-pointer">
              <FaWhatsapp className="h-4 w-4 mr-2" />
              Enviar WhatsApp
              {selectedLeadsCount > 0 && (
                <span className="ml-auto text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
                  {selectedLeadsCount}
                </span>
              )}
            </DropdownMenuItem>
          )}
          {permissions.canDelete && (
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
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <WhatsAppPropioManager
        leads={leads}
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}
