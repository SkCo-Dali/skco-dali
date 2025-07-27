
import React from "react";
import { Lead } from "@/types/crm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building, 
  Mail, 
  Phone, 
  Calendar, 
  User,
  Edit,
  MoreHorizontal,
  Target
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WhatsAppActionsMenu } from "./WhatsAppActionsMenu";

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onSendEmail: (lead: Lead) => void;
  onSendWhatsApp?: (lead: Lead) => void;
  onOpenProfiler: (lead: Lead) => void;
  onLeadUpdate: () => void;
}

export function LeadCard({ 
  lead, 
  onClick, 
  onEdit, 
  onSendEmail, 
  onSendWhatsApp,
  onOpenProfiler,
  onLeadUpdate 
}: LeadCardProps) {
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'proposal': return 'bg-purple-100 text-purple-800';
      case 'negotiation': return 'bg-orange-100 text-orange-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageLabel = (stage: string) => {
    switch (stage) {
      case 'new': return 'En gestión';
      case 'contacted': return 'En asesoría';
      case 'qualified': return 'Vinculando';
      case 'proposal': return 'Propuesta';
      case 'negotiation': return 'Negociación';
      case 'won': return 'Ganado';
      case 'lost': return 'Perdido';
      default: return stage;
    }
  };

  const handleSendWithSami = (leadForWhatsApp: Lead) => {
    if (onSendWhatsApp) {
      onSendWhatsApp(leadForWhatsApp);
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow bg-white border border-gray-200 rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onClick(lead)}>
            <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
              {lead.name}
            </CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStageColor(lead.stage)}>
                {getStageLabel(lead.stage)}
              </Badge>
              <Badge className={getPriorityColor(lead.priority)}>
                {lead.priority}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <WhatsAppActionsMenu 
              lead={lead} 
              onSendWithSami={handleSendWithSami}
              variant="icon"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem onClick={() => onEdit(lead)} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edición rápida
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSendEmail(lead)} className="cursor-pointer">
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onOpenProfiler(lead)} className="cursor-pointer">
                  <Target className="h-4 w-4 mr-2" />
                  Perfilar lead
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0" onClick={() => onClick(lead)}>
        <div className="space-y-2">
          {lead.company && (
            <div className="flex items-center text-sm text-gray-600">
              <Building className="h-4 w-4 mr-2" />
              {lead.company}
            </div>
          )}
          {lead.email && (
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              {lead.email}
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {lead.phone}
            </div>
          )}
          {lead.product && (
            <div className="flex items-center text-sm text-gray-600">
              <Target className="h-4 w-4 mr-2" />
              {lead.product}
            </div>
          )}
          {lead.assignedTo && (
            <div className="flex items-center text-sm text-gray-600">
              <User className="h-4 w-4 mr-2" />
              {lead.assignedTo}
            </div>
          )}
          {lead.nextFollowUp && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              {new Date(lead.nextFollowUp).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
