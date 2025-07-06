
import React from 'react';
import { CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { CalendlyEvent } from '@/types/calendly';
import { getEventId, getEventTitle, getEventStartTime } from '@/utils/eventTypeUtils';
import { convertToBogotaTime } from '@/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface DayEventsListProps {
  selectedDate: Date;
  events: (CalendarEvent | CalendlyEvent)[];
  onEventClick: (event: CalendarEvent | CalendlyEvent) => void;
}

export function DayEventsList({ selectedDate, events, onEventClick }: DayEventsListProps) {
  // Filtrar eventos para el día seleccionado
  const dayEvents = events.filter(event => {
    const eventStartRaw = getEventStartTime(event);
    const eventStartBogota = convertToBogotaTime(eventStartRaw.toISOString());

    // Comparar solo las fechas (año, mes, día) sin considerar las horas
    const eventDateOnly = new Date(eventStartBogota.getFullYear(), eventStartBogota.getMonth(), eventStartBogota.getDate());
    const targetDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());

    return eventDateOnly.getTime() === targetDateOnly.getTime();
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {formatDate(selectedDate)}
        </CardTitle>
        <Badge variant="secondary" className="w-fit">
          {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-2 p-4">
            {dayEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay eventos programados</p>
                <p className="text-sm">para este día</p>
              </div>
            ) : (
              dayEvents.map((event, index) => {
                const eventTitle = getEventTitle(event);
                const eventStartRaw = getEventStartTime(event);
                const eventStartBogota = convertToBogotaTime(eventStartRaw.toISOString());
                const timeString = eventStartBogota.toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <Card 
                    key={`${getEventId(event)}-${index}`}
                    className="cursor-pointer hover:bg-muted/50 transition-colors border-l-4 border-l-[#00c83c]"
                    onClick={() => onEventClick(event)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1 line-clamp-2">
                            {eventTitle}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{timeString}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
