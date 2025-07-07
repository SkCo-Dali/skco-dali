
import { Lead } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, User, Mail, Smartphone } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useUsersApi } from "@/hooks/useUsersApi";

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
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

export function LeadCard({ lead, onClick }: LeadCardProps) {
  const { users } = useUsersApi();
  const assignedUser = users.find(u => u.id === lead.assignedTo);

  // WhatsApp
  const whatsappNumber = lead.phone?.replace(/\D/g, '');
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : null;

  // Email
  const mailtoLink = lead.email ? `mailto:${lead.email}` : null;

  // Calendario
  const calendarLink = `https://outlook.office.com/calendar/0/deeplink/compose?subject=Cita con ${encodeURIComponent(lead.name)}&body=Hola, me gustaría agendar una cita contigo.`;

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xs flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base truncate overflow-hidden whitespace-nowrap">{lead.name}</h3>
            <p className="text-sm text-muted-foreground truncate overflow-hidden whitespace-nowrap">{lead.email}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="text-xs text-muted-foreground truncate overflow-hidden whitespace-nowrap">
            <strong>Producto:</strong> {lead.product}
          </div>
          <div className="text-xs text-muted-foreground truncate overflow-hidden whitespace-nowrap">
            <strong>Campaña:</strong> {lead.campaign || 'Sin campaña'}
          </div>
          <div className="text-xs text-muted-foreground truncate overflow-hidden whitespace-nowrap capitalize">
            <strong>Fuente:</strong> {lead.source}
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <Badge 
            className={`text-xs px-2 py-1 ${stageColors[lead.stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}`}
            variant="secondary"
          >
            {lead.stage}
          </Badge>

          <div className="flex flex-col text-xs text-muted-foreground mt-3">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span className="truncate overflow-hidden whitespace-nowrap">
                {assignedUser?.name || (lead.assignedTo ? `Usuario ${lead.assignedTo}` : 'Sin asignar')}
              </span>
            </div>
            <div className="flex items-center space-x-1 mt-1">
              <Calendar className="h-3 w-3" />
              <span className="truncate overflow-hidden whitespace-nowrap">Últ. interacción: {format(new Date(lead.updatedAt), "dd/MM", { locale: es })}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
