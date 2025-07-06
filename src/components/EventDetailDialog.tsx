
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, Mail } from 'lucide-react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { getEventTitle, getEventStartTime, getEventEndTime, isCalendlyEvent } from '@/utils/eventTypeUtils';
import { convertToBogotaTime } from '@/utils/dateUtils';

interface EventDetailDialogProps {
  event: CalendarEvent | CalendlyEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EventDetailDialog({ event, isOpen, onClose }: EventDetailDialogProps) {
  if (!event) return null;

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startTime = getEventStartTime(event);
  const endTime = getEventEndTime(event);
  const title = getEventTitle(event);

  const displayStartTime = convertToBogotaTime(startTime.toISOString());
  const displayEndTime = convertToBogotaTime(endTime.toISOString());

  // Get event-specific data based on type
  const getEventData = () => {
    if (isCalendlyEvent(event)) {
      return {
        location: event.location?.location,
        organizer: event.event_memberships?.[0]?.user_name,
        organizerEmail: event.event_memberships?.[0]?.user_email,
        eventType: 'Calendly',
        status: event.status === 'active' ? 'Activo' : 'Cancelado',
        description: `Invitados: ${event.invitees_counter?.active || 0}`,
        joinUrl: event.location?.type === 'zoom' ? event.location.location : undefined
      };
    } else {
      return {
        location: event.location?.displayName,
        organizer: event.organizer?.emailAddress?.name,
        organizerEmail: event.organizer?.emailAddress?.address,
        eventType: 'Microsoft Calendar',
        status: 'Programado',
        description: event.bodyPreview,
        joinUrl: event.onlineMeeting?.joinUrl
      };
    }
  };

  const eventData = getEventData();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-fit p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#00c83c]" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de evento */}
          <div className="flex justify-between items-center flex-wrap gap-2">
            <Badge variant="default">{eventData.eventType}</Badge>
            <Badge variant="outline">{eventData.status}</Badge>
          </div>

          {/* Fecha y hora */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm break-words">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDateTime(displayStartTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm break-words">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatTime(startTime)} - {formatTime(endTime)}
              </span>
            </div>
          </div>

          {/* Ubicación */}
          {eventData.location && (
            <div className="flex items-center gap-2 text-sm break-words">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{eventData.location}</span>
            </div>
          )}

          {/* Organizador */}
          {eventData.organizer && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm break-words">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{eventData.organizer}</span>
              </div>
              {eventData.organizerEmail && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground break-words">
                  <Mail className="h-4 w-4" />
                  <span>{eventData.organizerEmail}</span>
                </div>
              )}
            </div>
          )}

          {/* Descripción */}
          {eventData.description && (
            <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
              {eventData.description}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between pt-4 flex-wrap gap-2">
            {eventData.joinUrl && (
              <Button 
                variant="default" 
                size="sm"
                onClick={() => window.open(eventData.joinUrl, '_blank')}
              >
                Unirse a la reunión
              </Button>
            )}
            <Button onClick={onClose} variant="outline">
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
