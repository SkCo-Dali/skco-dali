import React from 'react';
import { Mail, MessageCircle, Phone, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InteractionStatus } from '@/hooks/useLeadInteractions';

interface InteractionIconsProps {
  status: InteractionStatus;
  loading?: boolean;
}

const formatDateColombia = (dateString?: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Convert to Colombia timezone (UTC-5)
    const colombiaOffset = -5 * 60; // minutes
    const utcOffset = date.getTimezoneOffset(); // minutes
    const colombiaTime = new Date(date.getTime() + (utcOffset + colombiaOffset) * 60 * 1000);
    
    const day = colombiaTime.getDate();
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const month = months[colombiaTime.getMonth()];
    const year = colombiaTime.getFullYear();
    const hours = colombiaTime.getHours().toString().padStart(2, '0');
    const minutes = colombiaTime.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return dateString;
  }
};

export const InteractionIcons: React.FC<InteractionIconsProps> = ({ status, loading }) => {
  if (loading) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="w-24 h-5 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const icons = [
    {
      key: 'email',
      Icon: Mail,
      sent: status.email.sent,
      lastDate: status.email.lastDate,
      description: status.email.description,
      label: 'Correo enviado',
    },
    {
      key: 'whatsapp',
      Icon: MessageCircle,
      sent: status.whatsapp.sent,
      lastDate: status.whatsapp.lastDate,
      description: status.whatsapp.description,
      label: 'WhatsApp enviado',
    },
    {
      key: 'call',
      Icon: Phone,
      sent: status.call.sent,
      lastDate: status.call.lastDate,
      description: status.call.description,
      label: 'Llamada realizada',
    },
    {
      key: 'meeting',
      Icon: Users,
      sent: status.meeting.sent,
      lastDate: status.meeting.lastDate,
      description: status.meeting.description,
      label: 'Reunión realizada',
    },
  ];

  // Only show icons that have been sent
  const sentIcons = icons.filter(icon => icon.sent);

  if (sentIcons.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-1">
        {sentIcons.map(({ key, Icon, lastDate, description, label }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium cursor-help w-fit">
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs max-w-xs">
              {lastDate && (
                <p className="font-medium">{formatDateColombia(lastDate)}</p>
              )}
              {description && (
                <p className="text-muted-foreground mt-0.5">{description}</p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};
