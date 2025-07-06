
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { getEventId, getEventTitle, getEventStartTime, getEventEndTime } from '@/utils/eventTypeUtils';
import { convertToBogotaTime } from '@/utils/dateUtils';

interface DayEventCardProps {
  event: CalendarEvent | CalendlyEvent;
  eventIndex: number;
  onClick: (event: CalendarEvent | CalendlyEvent) => void;
}

export function DayEventCard({ event, eventIndex, onClick }: DayEventCardProps) {
  const eventTitle = getEventTitle(event);
  const startTime = getEventStartTime(event);
  const endTime = getEventEndTime(event);
  
  // Para eventos de Microsoft Calendar, convertir de UTC a Bogotá
  let displayStartTime: Date, displayEndTime: Date;
  
  if ('start' in event) {
    // Es un CalendarEvent de Microsoft - convertir de UTC
    displayStartTime = convertToBogotaTime(event.start.dateTime);
    displayEndTime = convertToBogotaTime(event.end.dateTime);
  } else {
    // Es un CalendlyEvent - usar directamente
    displayStartTime = new Date(startTime);
    displayEndTime = new Date(endTime);
  }
  
  const eventTime = `${displayStartTime.toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })} - ${displayEndTime.toLocaleTimeString('es-CO', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })}`;

  return (
    <div
      key={`${getEventId(event)}-${eventIndex}`}
      className="bg-[#00c83c] text-white p-2 rounded mb-1 text-sm cursor-pointer hover:bg-[#00c83c]/90 transition-colors"
      onClick={() => onClick(event)}
    >
      <div className="font-semibold">{eventTitle}</div>
      <div className="text-xs opacity-90">{eventTime}</div>
    </div>
  );
}
