
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { cn } from '@/lib/utils';
import { MonthEventCard } from '@/components/MonthEventCard';

interface MonthDayCellProps {
  dayInfo: {
    day: number;
    isCurrentMonth: boolean;
    date: Date;
  };
  dayEvents: (CalendarEvent | CalendlyEvent)[];
  isToday: boolean;
  isSelected: boolean;
  monthNames: string[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent | CalendlyEvent, e: React.MouseEvent) => void;
}

export function MonthDayCell({ 
  dayInfo, 
  dayEvents, 
  isToday, 
  isSelected, 
  monthNames, 
  onDateSelect, 
  onEventClick 
}: MonthDayCellProps) {
  return (
    <div
      className={cn(
        "min-h-[100px] p-2 border-r border-b cursor-pointer hover:bg-muted/50 transition-colors",
        !dayInfo.isCurrentMonth && "bg-muted/30 text-muted-foreground",
        isToday && "bg-blue-50 border-blue-200",
        isSelected && "bg-[#00c83c]/10 border-[#00c83c]"
      )}
      onClick={() => onDateSelect(dayInfo.date)}
      title={`${dayInfo.day} ${monthNames[dayInfo.date.getMonth()]} ${dayInfo.date.getFullYear()}`}
    >
      <div className="flex justify-between items-start mb-1">
        <span className={cn(
          "text-sm font-medium",
          isToday && "text-blue-600 font-bold",
          isSelected && "text-[#00c83c] font-bold"
        )}>
          {dayInfo.day}
        </span>
        {dayEvents.length > 0 && (
          <span className="text-xs bg-[#00c83c] text-white rounded-full px-1.5 py-0.5">
            {dayEvents.length}
          </span>
        )}
      </div>

      {/* Eventos del día (máximo 3 visibles) */}
      <div className="space-y-1">
        {dayEvents.slice(0, 3).map((event, eventIndex) => (
          <MonthEventCard
            key={`${event}-${eventIndex}`}
            event={event}
            eventIndex={eventIndex}
            onClick={onEventClick}
          />
        ))}
        {dayEvents.length > 3 && (
          <div className="text-xs text-muted-foreground">
            +{dayEvents.length - 3} más
          </div>
        )}
      </div>
    </div>
  );
}
