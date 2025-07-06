
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { getEventId, getEventTitle, getEventStartTime } from '@/utils/eventTypeUtils';
import { convertToBogotaTime } from '@/utils/dateUtils';

interface MonthEventCardProps {
  event: CalendarEvent | CalendlyEvent;
  eventIndex: number;
  onClick: (event: CalendarEvent | CalendlyEvent, e: React.MouseEvent) => void;
}

export function MonthEventCard({ event, eventIndex, onClick }: MonthEventCardProps) {
  const eventTitle = getEventTitle(event);
  const eventStartRaw = getEventStartTime(event);
  
  // Para eventos de Microsoft Calendar, convertir de UTC a Bogotá
  let eventStartBogota: Date;
  if ('start' in event) {
    eventStartBogota = convertToBogotaTime(event.start.dateTime);
  } else {
    eventStartBogota = new Date(eventStartRaw);
  }
  
  const timeString = eventStartBogota.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      key={`${getEventId(event)}-${eventIndex}`}
      className="text-xs bg-[#00c83c] text-white p-1 rounded truncate cursor-pointer hover:bg-[#00c83c]/90 transition-colors"
      title={`${timeString} - ${eventTitle}`}
      onClick={(e) => onClick(event, e)}
    >
      <span className="font-semibold">{timeString}</span> {eventTitle}
    </div>
  );
}
