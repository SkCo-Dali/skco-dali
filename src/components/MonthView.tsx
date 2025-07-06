
import React, { useState } from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { getEventTitle, getEventStartTime } from '@/utils/eventTypeUtils';
import { convertToBogotaTime } from '@/utils/dateUtils';
import { EventDetailDialog } from '@/components/EventDetailDialog';
import { DayEventsList } from '@/components/DayEventsList';
import { MonthViewHeader } from '@/components/MonthViewHeader';
import { MonthGrid } from '@/components/MonthGrid';

interface MonthViewProps {
  events: CalendarEvent[] | CalendlyEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function MonthView({ events, selectedDate, onDateSelect }: MonthViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | CalendlyEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  // Generar días del mes para el grid (solo días del mes actual más días previos necesarios)
  const getDaysInMonth = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();

    const firstDayOfWeek = firstDay.getDay();
    // Convertir domingo (0) a 7 para facilitar cálculos
    const mondayBasedFirstDay = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;
    
    const days = [];

    // Agregar días del mes anterior solo si es necesario (para completar la primera semana)
    if (mondayBasedFirstDay > 1) {
      const prevMonth = new Date(currentYear, currentMonth - 1, 0);
      const prevDaysInMonth = prevMonth.getDate();
      const daysToAdd = mondayBasedFirstDay - 1;
      
      for (let i = daysToAdd; i > 0; i--) {
        const dayNum = prevDaysInMonth - i + 1;
        days.push({ 
          day: dayNum, 
          isCurrentMonth: false, 
          date: new Date(currentYear, currentMonth - 1, dayNum) 
        });
      }
    }

    // Agregar todos los días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ 
        day: i, 
        isCurrentMonth: true, 
        date: new Date(currentYear, currentMonth, i) 
      });
    }

    // Solo completar con días del siguiente mes si no tenemos suficientes semanas completas
    // y solo hasta completar 6 semanas máximo (42 días)
    const totalDays = days.length;
    const weeksNeeded = Math.ceil(totalDays / 7);
    
    if (weeksNeeded < 6) {
      const remainingDays = (weeksNeeded * 7) - totalDays;
      for (let i = 1; i <= remainingDays; i++) {
        days.push({ 
          day: i, 
          isCurrentMonth: false, 
          date: new Date(currentYear, currentMonth + 1, i) 
        });
      }
    }

    return days;
  };

  const days = getDaysInMonth();

  // Obtener eventos para un día específico con conversión correcta de timezone
  const getEventsForDay = (date: Date) => {
    console.log(`Month view - Filtering events for ${date.toDateString()}`);

    return events.filter(event => {
      const eventStartRaw = getEventStartTime(event);
      
      // Para eventos de Microsoft Calendar, convertir de UTC a Bogotá
      let eventStartBogota: Date;
      if ('start' in event) {
        eventStartBogota = convertToBogotaTime(event.start.dateTime);
      } else {
        eventStartBogota = new Date(eventStartRaw);
      }

      // Crear fechas normalizadas para comparación (solo año, mes, día)
      const eventDateOnly = new Date(eventStartBogota.getFullYear(), eventStartBogota.getMonth(), eventStartBogota.getDate());
      const targetDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      const isMatch = eventDateOnly.getTime() === targetDateOnly.getTime();
      
      if (isMatch) {
        console.log(`Month view - Event "${getEventTitle(event)}" matches ${date.toDateString()}: event date ${eventStartBogota.toDateString()}`);
      }

      return isMatch;
    });
  };

  const handlePrevMonth = () => {
    onDateSelect(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    onDateSelect(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleEventClick = (event: CalendarEvent | CalendlyEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  return (
    <div className="flex gap-6 h-full">
      {/* Calendario principal */}
      <div className="flex-1">
        <MonthViewHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        <MonthGrid
          days={days}
          events={events}
          selectedDate={selectedDate}
          getEventsForDay={getEventsForDay}
          onDateSelect={onDateSelect}
          onEventClick={handleEventClick}
        />
      </div>

      {/* Panel lateral con eventos del día */}
      <div className="w-80 flex-shrink-0">
        <DayEventsList
          selectedDate={selectedDate}
          events={events}
          onEventClick={(event) => {
            setSelectedEvent(event);
            setIsEventDialogOpen(true);
          }}
        />
      </div>

      {/* Event Detail Dialog */}
      <EventDetailDialog
        event={selectedEvent}
        isOpen={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
}
