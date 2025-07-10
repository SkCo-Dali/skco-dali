
import { Lead } from "@/types/crm";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Calendar, User, Mail, Smartphone, MoreVertical } from "lucide-react";
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

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all duration-200 w-full border border-gray-200 bg-white"
      onClick={onClick}
    >
      <CardHeader className="pb-2 px-4 pt-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-gray-900 mb-1">{lead.name}</h3>
            <p className="text-xs text-gray-500 mb-2">{lead.email}</p>
            <div className="flex items-center text-xs text-gray-400 mb-1">
              <User className="h-3 w-3 mr-1" />
              <span>{lead.documentType || 'CC'}.{lead.documentNumber || '111111111'}</span>
            </div>
          </div>
          <MoreVertical className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-3 pt-0">
        <div className="space-y-2">
          <Badge 
            className={`text-xs px-2 py-1 ${stageColors[lead.stage as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}`}
            variant="secondary"
          >
            {lead.stage}
          </Badge>
          
          <div className="text-xs text-gray-500">
            <div className="mb-1">
              <strong>Producto:</strong> {lead.product}
            </div>
            {lead.campaign && (
              <div className="mb-1">
                <strong>Campaña:</strong> {lead.campaign}
              </div>
            )}
            <div className="mb-1 capitalize">
              <strong>Fuente:</strong> {lead.source}
            </div>
            <div>
              <strong>Asignado:</strong> {assignedUser?.name || 'Sin asignar'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
