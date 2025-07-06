
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { DayEventCard } from '@/components/DayEventCard';

interface TimeSlotProps {
  slot: {
    hour: number;
    minute: number;
    label: string;
    displayLabel: boolean;
  };
  events: (CalendarEvent | CalendlyEvent)[];
  onEventClick: (event: CalendarEvent | CalendlyEvent) => void;
}

export function TimeSlot({ slot, events, onEventClick }: TimeSlotProps) {
  return (
    <div className="flex border-b border-gray-200">
      {/* Columna de hora */}
      <div className="w-20 p-2 text-right text-xs font-medium text-muted-foreground bg-muted">
        {slot.displayLabel && slot.label}
      </div>
      
      {/* Columna de eventos */}
      <div className="flex-1 p-2 min-h-[40px] relative">
        {events.map((event, eventIndex) => (
          <DayEventCard
            key={`${event}-${eventIndex}`}
            event={event}
            eventIndex={eventIndex}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}
