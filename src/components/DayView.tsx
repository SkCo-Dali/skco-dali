
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { getEventStartTime } from '@/utils/eventTypeUtils';
import { convertToBogotaTime } from '@/utils/dateUtils';
import { EventDetailDialog } from '@/components/EventDetailDialog';
import { DayViewHeader } from '@/components/DayViewHeader';
import { TimeSlot } from '@/components/TimeSlot';

interface DayViewProps {
  events: CalendarEvent[] | CalendlyEvent[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onEventDrop?: (eventId: string, newDate: Date, newHour: number, newMinute: number) => void;
}

export function DayView({ events, selectedDate, onDateSelect, onEventDrop }: DayViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | CalendlyEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  // Asegurar que selectedDate nunca sea null/undefined
  const currentSelectedDate = selectedDate || new Date();

  // Generar slots de tiempo para el día
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const ampm = hour < 12 ? 'AM' : 'PM';
      
      slots.push({
        hour,
        minute: 0,
        label: `${hour12}:00 ${ampm}`,
        displayLabel: true
      });
      slots.push({
        hour,
        minute: 30,
        label: `${hour12}:30 ${ampm}`,
        displayLabel: false
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Filtrar eventos para el día seleccionado - CORREGIDO para manejar UTC
  const dayEvents = events.filter(event => {
    const eventStartTime = getEventStartTime(event);
    
    // Para eventos de Microsoft Calendar, convertir de UTC a Bogotá
    let eventDateBogota: Date;
    if ('start' in event) {
      // Es un CalendarEvent de Microsoft
      eventDateBogota = convertToBogotaTime(event.start.dateTime);
    } else {
      // Es un CalendlyEvent, usar directamente
      eventDateBogota = new Date(eventStartTime);
    }
    
    // Comparar solo las fechas (año, mes, día)
    const eventDateOnly = new Date(eventDateBogota.getFullYear(), eventDateBogota.getMonth(), eventDateBogota.getDate());
    const targetDateOnly = new Date(currentSelectedDate.getFullYear(), currentSelectedDate.getMonth(), currentSelectedDate.getDate());
    
    const isMatch = eventDateOnly.getTime() === targetDateOnly.getTime();
    
    if (isMatch) {
      console.log('Day view - Event matches selected date:', {
        eventTitle: 'start' in event ? event.subject : event.name,
        eventDateBogota: eventDateBogota.toLocaleString(),
        selectedDate: currentSelectedDate.toDateString()
      });
    }
    
    return isMatch;
  });

  console.log('Day view filtering:', {
    selectedDate: currentSelectedDate.toDateString(),
    totalEvents: events.length,
    filteredEvents: dayEvents.length,
    events: dayEvents.map(e => 'start' in e ? e.subject : e.name)
  });

  const handleEventClick = (event: CalendarEvent | CalendlyEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  return (
    <div className="w-full">
      <DayViewHeader
        selectedDate={currentSelectedDate}
        onDateSelect={onDateSelect}
        eventCount={dayEvents.length}
      />

      <ScrollArea className="h-[600px]">
        <div className="space-y-0">
          {timeSlots.map((slot, index) => {
            const slotEvents = dayEvents.filter(event => {
              const eventStartTime = getEventStartTime(event);
              
              // Para eventos de Microsoft Calendar, convertir de UTC a Bogotá
              let eventStartBogota: Date;
              if ('start' in event) {
                eventStartBogota = convertToBogotaTime(event.start.dateTime);
              } else {
                eventStartBogota = new Date(eventStartTime);
              }
              
              // Verificar si el evento comienza en este slot
              const eventStartsInSlot = 
                eventStartBogota.getHours() === slot.hour &&
                (slot.minute === 0 ? eventStartBogota.getMinutes() < 30 : eventStartBogota.getMinutes() >= 30);
              
              return eventStartsInSlot;
            });

            return (
              <TimeSlot
                key={index}
                slot={slot}
                events={slotEvents}
                onEventClick={handleEventClick}
              />
            );
          })}
        </div>
      </ScrollArea>

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
