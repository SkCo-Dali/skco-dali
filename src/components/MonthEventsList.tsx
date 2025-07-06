
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

interface MonthEventsListProps {
  events: CalendarEvent[];
  selectedDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
}

export function MonthEventsList({ events, selectedDate, onEventClick }: MonthEventsListProps) {
  // Filtrar eventos por fecha seleccionada si existe
  const filteredEvents = selectedDate 
    ? events.filter(event => {
        const eventDate = new Date(event.start.dateTime);
        
        // Ajustar para timezone de Bogotá si es UTC
        const isUTC = event.start.dateTime.endsWith('Z') || event.start.dateTime.includes('+');
        let adjustedEventDate = eventDate;
        
        if (isUTC) {
          adjustedEventDate = new Date(eventDate.getTime() - (5 * 60 * 60 * 1000));
        }
        
        const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        const eventDateOnly = new Date(adjustedEventDate.getFullYear(), adjustedEventDate.getMonth(), adjustedEventDate.getDate());
        
        return eventDateOnly.getTime() === selectedDateOnly.getTime();
      })
    : events;

  // Ordenar eventos por fecha y hora
  const sortedEvents = [...filteredEvents].sort((a, b) => 
    new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
  );

  
const formatEventTime = (dateTime: string) => {
  const date = new Date(dateTime);
  // Restar 5 horas directamente
  date.setHours(date.getHours() - 5);

  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};


  const formatEventDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const isUTC = dateTime.endsWith('Z') || dateTime.includes('+');
    
    let localDate = date;
    if (isUTC) {
      localDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
    }
    
    return localDate.toLocaleDateString('es-CO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short'
    });
  };

  return (
    <Card className="w-80 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-[#00c83c]">
          {selectedDate ? 'Eventos del Día' : 'Todos los Eventos'}
        </CardTitle>
        {selectedDate && (
          <p className="text-sm text-muted-foreground">
            {selectedDate.toLocaleDateString('es-CO', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        )}
        <Badge variant="secondary" className="w-fit">
          {sortedEvents.length} evento{sortedEvents.length !== 1 ? 's' : ''}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[600px] px-4">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay eventos para mostrar</p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {sortedEvents.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onEventClick?.(event)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-sm leading-tight pr-2">
                      {event.subject}
                    </h4>
                    {!selectedDate && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {formatEventDate(event.start.dateTime)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {formatEventTime(event.start.dateTime)} - {formatEventTime(event.end.dateTime)}
                      </span>
                    </div>
                    
                    {event.location?.displayName && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">{event.location.displayName}</span>
                      </div>
                    )}
                    
                    {event.organizer?.emailAddress && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span className="truncate">{event.organizer.emailAddress.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
