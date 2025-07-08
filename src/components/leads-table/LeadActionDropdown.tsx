
import { Lead } from "@/types/crm";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, MessageSquare, Trash2 } from "lucide-react";

interface LeadActionDropdownProps {
  lead: Lead;
  onLeadClick: (lead: Lead) => void;
}

export function LeadActionDropdown({ lead, onLeadClick }: LeadActionDropdownProps) {
  const handleLeadAction = (action: string, lead: Lead, e: React.MouseEvent) => {
    e.stopPropagation();
    
    switch (action) {
      case 'edit':
        onLeadClick(lead);
        break;
      case 'profile':
        console.log('Ver perfil del lead:', lead.name);
        break;
      case 'notes':
        console.log('Ver notas del lead:', lead.name);
        break;
      case 'whatsapp':
        if (lead.phone) {
          window.open(`https://wa.me/${lead.phone}`, '_blank');
        }
        break;
      case 'delete':
        console.log('Eliminar lead:', lead.name);
        break;
      default:
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-gray-100 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="h-4 w-4 text-green-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
        <DropdownMenuItem onClick={(e) => handleLeadAction('edit', lead, e)}>
          <Edit className="mr-2 h-4 w-4" />
          Edición rápida
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => handleLeadAction('whatsapp', lead, e)}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Enviar WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={(e) => handleLeadAction('delete', lead, e)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Eliminar lead
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
