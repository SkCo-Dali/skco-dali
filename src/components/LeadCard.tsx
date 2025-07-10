
import { Lead } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Mail, Edit, Trash2, MoreVertical, CircleUserRound,  Smartphone } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUsersApi } from "@/hooks/useUsersApi";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onSendEmail?: (lead: Lead) => void;
  onSendWhatsApp?: (lead: Lead) => void;
}

const stageColors = {
  'Nuevo': 'bg-blue-100 text-blue-800',
  'Asignado': 'bg-yellow-100 text-yellow-800',
  'Localizado: No interesado': 'bg-red-100 text-red-800',
  'Localizado: Prospecto de venta FP': 'bg-green-100 text-green-800',
  'Localizado: Prospecto de venta AD': 'bg-purple-100 text-purple-800',
  'Localizado: Volver a llamar': 'bg-orange-100 text-orange-800',
  'Localizado: No vuelve a contestar': 'bg-gray-100 text-gray-800',
  'No localizado: No contesta': 'bg-gray-100 text-gray-800',
  'No localizado: Número equivocado': 'bg-red-100 text-red-800',
  'Contrato Creado': 'bg-green-100 text-green-800',
  'Registro de Venta (fondeado)': 'bg-green-100 text-green-800'
};

export function LeadCard({ 
  lead, 
  onClick, 
  onEdit, 
  onDelete, 
  onSendEmail, 
  onSendWhatsApp 
}: LeadCardProps) {
  const { users } = useUsersApi();
  const assignedUser = users.find(u => u.id === lead.assignedTo);

  const handleMenuClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as Element;
    if (!target.closest('[data-dropdown]')) {
      onClick();
    }
  };

  const handleWhatsAppClick = () => {
    if (lead.phone) {
      const cleanPhone = lead.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}`, '_blank');
    } else {
      console.log('No hay número de teléfono disponible para este lead');
    }
  };

  return (
    <div className="relative">
      <Card 
        className="cursor-pointer transition-all duration-200 mt-0 mx-4 pt-6 rounded-lg max-w-md shadow-none"
        style={{ backgroundColor: '#fafafa'}}
        onClick={handleCardClick}
      >
        {/* Muesca con estado pegada al borde superior izquierdo */}
        <div className="absolute top-0 left-6 z-20">
          <Badge 
            className={`text-xs px-3 py-1 whitespace-nowrap rounded-none rounded-br-lg shadow-sm ${stageColors[lead.stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}`}
            variant="secondary"
          >
            {lead.stage}
          </Badge>
        </div>

        <CardHeader className="pb-2 px-4 pt-8">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 space-y-2">
              <h3 className="font-medium text-sm text-gray-900 mb-1">{lead.name}</h3>
              <div className="flex items-center text-xs text-gray-900 mb-1">
                <CircleUserRound className="h-3 w-3 mr-1" />
                <span>{lead.documentType || 'CC'}.{lead.documentNumber || '111111111'}</span>
              </div>
              <div className="flex items-center text-xs text-gray-900 mb-1">
                <Smartphone className="h-3 w-3 mr-1" />
                <span>{lead.phone || '3333333333'}</span>
              </div>
              <div className="flex items-center text-xs text-gray-900">
                <Mail className="h-3 w-3 mr-1" />
                <span>{lead.email || 'xxx@xxx'}</span>
              </div> 
              <div className="flex items-center text-xs text-gray-900">
                <User className="h-3 w-3 mr-1" />
                <span>{assignedUser?.name || 'Sin asignar'}</span>
              </div> 
              <div className="flex items-center text-xs text-gray-900">
                <User className="h-3 w-3 mr-1" />
                <span>{lead.campaign || ''}</span>
              </div> 
            </div>
            
            <div data-dropdown>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="h-6 w-6 flex-shrink-0 hover:bg-gray-100 rounded flex items-center justify-center"
                    style={{ color: '#00c83c' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-6 w-6" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg z-50">
                  {onEdit && (
                    <DropdownMenuItem 
                      onClick={(e) => handleMenuClick(e, () => onEdit(lead))}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      Edición rápida
                    </DropdownMenuItem>
                  )}
                  {onSendEmail && (
                    <DropdownMenuItem 
                      onClick={(e) => handleMenuClick(e, () => onSendEmail(lead))}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <Mail className="h-4 w-4" />
                      Enviar Email
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={(e) => handleMenuClick(e, handleWhatsAppClick)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Enviar WhatsApp
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={(e) => handleMenuClick(e, () => onDelete(lead))}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 cursor-pointer text-red-600 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar lead
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-3 pt-0">
          
        </CardContent>
      </Card>
    </div>
  );
}
