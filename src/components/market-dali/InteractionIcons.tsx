import React from 'react';
import { Mail, MessageCircle, Phone, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InteractionStatus } from '@/hooks/useLeadInteractions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface InteractionIconsProps {
  status: InteractionStatus;
  loading?: boolean;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), "d MMM yyyy, HH:mm", { locale: es });
  } catch {
    return dateString;
  }
};

export const InteractionIcons: React.FC<InteractionIconsProps> = ({ status, loading }) => {
  if (loading) {
    return (
      <div className="flex gap-1.5 items-center">
        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const icons = [
    {
      key: 'email',
      Icon: Mail,
      sent: status.email.sent,
      lastDate: status.email.lastDate,
      label: 'Correo',
    },
    {
      key: 'whatsapp',
      Icon: MessageCircle,
      sent: status.whatsapp.sent,
      lastDate: status.whatsapp.lastDate,
      label: 'WhatsApp',
    },
    {
      key: 'call',
      Icon: Phone,
      sent: status.call.sent,
      lastDate: status.call.lastDate,
      label: 'Llamada',
    },
    {
      key: 'meeting',
      Icon: Users,
      sent: status.meeting.sent,
      lastDate: status.meeting.lastDate,
      label: 'Reunión',
    },
  ];

  // Only show icons that have been sent
  const sentIcons = icons.filter(icon => icon.sent);

  if (sentIcons.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex gap-1.5 items-center">
        {sentIcons.map(({ key, Icon, lastDate, label }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <div className="p-1 rounded-full bg-green-100 text-green-600 cursor-help">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              <p className="font-medium">{label} enviado</p>
              {lastDate && (
                <p className="text-muted-foreground">{formatDate(lastDate)}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
