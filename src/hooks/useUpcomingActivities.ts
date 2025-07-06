
import { useState, useEffect } from 'react';
import { useMicrosoftCalendar, CalendarEvent } from '@/hooks/useMicrosoftCalendar';
import { useCalendly } from '@/hooks/useCalendly';
import { useTasks } from '@/hooks/useTasks';
import { CalendlyEvent } from '@/types/calendly';
import { Task } from '@/types/tasks';
import { getEventStartTime, getEventTitle } from '@/utils/eventTypeUtils';

export interface UpcomingActivity {
  id: string;
  title: string;
  startTime: Date;
  source: 'microsoft' | 'calendly' | 'task';
  originalEvent: CalendarEvent | CalendlyEvent | Task;
}

export function useUpcomingActivities() {
  // Desactivar Microsoft Calendar
  const msEvents: CalendarEvent[] = [];
  const msLoading = false;
  
  const { events: calendlyEvents, fetchEvents: fetchCalendlyEvents, loading: calendlyLoading } = useCalendly();
  const { getUpcomingTasks } = useTasks();
  const [upcomingActivities, setUpcomingActivities] = useState<UpcomingActivity[]>([]);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      const now = new Date();
      const futureDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días adelante

      // Solo fetch events de Calendly
      console.log('📅 Cargando solo eventos de Calendly - Microsoft desactivado');
      await fetchCalendlyEvents(now, futureDate);
    };

    fetchUpcomingEvents();
  }, [fetchCalendlyEvents]);

  useEffect(() => {
    const now = new Date();
    
    // Combinar eventos solo de Calendly y tareas
    const allActivities: UpcomingActivity[] = [];

    // No agregar eventos de Microsoft (desactivado)
    console.log('📅 Microsoft Calendar desactivado - solo usando Calendly y tareas');

    // Agregar eventos de Calendly
    calendlyEvents.forEach(event => {
      const startTime = getEventStartTime(event);
      if (startTime > now) {
        allActivities.push({
          id: event.uri,
          title: getEventTitle(event),
          startTime,
          source: 'calendly',
          originalEvent: event
        });
      }
    });

    // Agregar tareas próximas
    const upcomingTasks = getUpcomingTasks(30);
    upcomingTasks.forEach(task => {
      allActivities.push({
        id: task.id,
        title: task.title,
        startTime: new Date(task.dueDate),
        source: 'task',
        originalEvent: task
      });
    });

    // Ordenar por fecha más cercana y tomar las primeras 5
    const sortedActivities = allActivities
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
      .slice(0, 5);

    setUpcomingActivities(sortedActivities);
  }, [calendlyEvents, getUpcomingTasks]);

  return {
    upcomingActivities,
    loading: calendlyLoading
  };
}
