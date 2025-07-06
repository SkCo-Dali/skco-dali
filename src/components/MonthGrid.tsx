
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { MonthDayCell } from '@/components/MonthDayCell';

interface MonthGridProps {
  days: Array<{
    day: number;
    isCurrentMonth: boolean;
    date: Date;
  }>;
  events: (CalendarEvent | CalendlyEvent)[];
  selectedDate: Date;
  getEventsForDay: (date: Date) => (CalendarEvent | CalendlyEvent)[];
  onDateSelect: (date: Date) => void;
  onEventClick: (event: CalendarEvent | CalendlyEvent, e: React.MouseEvent) => void;
}

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export function MonthGrid({ 
  days, 
  events, 
  selectedDate, 
  getEventsForDay, 
  onDateSelect, 
  onEventClick 
}: MonthGridProps) {
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  return (
    <>
      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-muted">
        {dayNames.map(day => (
          <div key={day} className="p-3 text-center text-sm font-semibold">{day}</div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7">
        {days.map((dayInfo, index) => {
          const dayEvents = getEventsForDay(dayInfo.date);

          return (
            <MonthDayCell
              key={index}
              dayInfo={dayInfo}
              dayEvents={dayEvents}
              isToday={isToday(dayInfo.date)}
              isSelected={isSelected(dayInfo.date)}
              monthNames={monthNames}
              onDateSelect={onDateSelect}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </>
  );
}
