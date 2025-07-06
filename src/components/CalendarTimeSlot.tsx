import React from "react";
import { CalendarEvent } from "@/utils/eventUtils";
import { convertToBogotaTime } from "@/utils/dateUtils";

interface CalendarTimeSlotProps {
  timeSlot: {
    hour: number;
    minute: number;
    label: string;
    displayLabel: boolean;
  };
  dateRange: Date[];
  events: CalendarEvent[];
  slotIndex: number;
  allTimeSlots: any[];
}

const SLOT_HEIGHT = 80; // Altura por slot de 30 minutos

export function CalendarTimeSlot({ 
  timeSlot, 
  dateRange, 
  events, 
  slotIndex, 
  allTimeSlots 
}: CalendarTimeSlotProps) {
  
  // Función para calcular eventos superpuestos y su posicionamiento
  const getEventLayout = (dayEvents: CalendarEvent[], targetEvent: CalendarEvent) => {
    const targetStart = convertToBogotaTime(targetEvent.start.dateTime);
    const targetEnd = convertToBogotaTime(targetEvent.end.dateTime);
    
    // Encontrar eventos que se superponen temporalmente
    const overlappingEvents = dayEvents.filter(event => {
      if (event.id === targetEvent.id) return false;
      
      const eventStart = convertToBogotaTime(event.start.dateTime);
      const eventEnd = convertToBogotaTime(event.end.dateTime);
      
      return (eventStart < targetEnd && eventEnd > targetStart);
    });
    
    // Incluir el evento actual en la lista para calcular posiciones
    const allOverlappingEvents = [targetEvent, ...overlappingEvents];
    
    // Ordenar eventos por hora de inicio, luego por duración (más largos primero)
    allOverlappingEvents.sort((a, b) => {
      const aStart = convertToBogotaTime(a.start.dateTime);
      const bStart = convertToBogotaTime(b.start.dateTime);
      const aDuration = convertToBogotaTime(a.end.dateTime).getTime() - aStart.getTime();
      const bDuration = convertToBogotaTime(b.end.dateTime).getTime() - bStart.getTime();
      
      if (aStart.getTime() !== bStart.getTime()) {
        return aStart.getTime() - bStart.getTime();
      }
      // Si empiezan a la misma hora, los más largos van primero (izquierda)
      return bDuration - aDuration;
    });
    
    const totalColumns = allOverlappingEvents.length;
    const columnIndex = allOverlappingEvents.findIndex(e => e.id === targetEvent.id);
    
    return {
      totalColumns,
      columnIndex,
      overlappingCount: overlappingEvents.length
    };
  };

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: "100px repeat(5, 1fr)" }}
    >
      {/* Columna de hora */}
      <div className="p-2 text-right text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 flex items-center justify-end">
        {timeSlot.displayLabel ? (
          <span className="text-sm font-semibold text-gray-800">
            {timeSlot.label}
          </span>
        ) : (
          <span className="text-xs text-gray-400">
            :{timeSlot.minute.toString().padStart(2, '0')}
          </span>
        )}
      </div>

      {/* Columnas de días laborales */}
      {dateRange.map((date, dayIndex) => {
        const slotStart = new Date(date);
        slotStart.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + 30);

        // Obtener todos los eventos del día para calcular superposiciones
        const dayEvents = events.filter(event => {
          const eventStart = convertToBogotaTime(event.start.dateTime);
          const eventDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
          const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          return eventDate.getTime() === targetDate.getTime();
        });

        // Filtrar eventos que se solapan con este slot específico
        const slotEvents = dayEvents.filter(event => {
          const eventStart = convertToBogotaTime(event.start.dateTime);
          const eventEnd = convertToBogotaTime(event.end.dateTime);

          return eventStart < slotEnd && eventEnd > slotStart;
        });

        return (
          <div
            key={dayIndex}
            className="relative border border-gray-200 bg-white hover:bg-gray-50 transition-colors overflow-hidden"
            style={{ height: SLOT_HEIGHT, minHeight: SLOT_HEIGHT }}
          >
            {slotEvents.map(event => {
              const eventStart = convertToBogotaTime(event.start.dateTime);
              const eventEnd = convertToBogotaTime(event.end.dateTime);
              
              // Solo mostrar el evento en el slot donde inicia
              const eventStartsInThisSlot = 
                eventStart.getHours() === timeSlot.hour &&
                (timeSlot.minute === 0 ? eventStart.getMinutes() < 30 : eventStart.getMinutes() >= 30);

              if (!eventStartsInThisSlot) return null;

              // Calcular duración correcta en minutos y convertir a slots
              const durationMinutes = Math.max(30, Math.round((eventEnd.getTime() - eventStart.getTime()) / (1000 * 60)));
              const durationSlots = durationMinutes / 30;
              
              // Altura corregida: multiplicar slots por altura de slot y restar un pequeño margen
              const heightPx = (durationSlots * SLOT_HEIGHT) - 6;

              // Calcular posición vertical dentro del slot
              const minutesIntoSlot = eventStart.getMinutes() % 30;
              const topPx = Math.min((minutesIntoSlot / 30) * SLOT_HEIGHT + 2, SLOT_HEIGHT - 20);

              // Calcular layout para eventos superpuestos
              const layout = getEventLayout(dayEvents, event);

              const widthPercentage = layout.totalColumns === 1 ? 100 : Math.max(100 / layout.totalColumns, 20);
              const leftPercentage = layout.totalColumns === 1 ? 0 : (layout.columnIndex / layout.totalColumns) * 100;

              return (
                <div
                  key={event.id}
                  className="absolute bg-[#00c83c] text-white text-xs rounded px-2 py-1 shadow-sm border border-green-600"
                  title={`${event.subject} - ${eventStart.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} - ${eventEnd.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}${event.location ? ` - ${event.location.displayName}` : ''}`}
                  style={{
                    top: topPx,
                    left: `${leftPercentage}%`,
                    width: `${widthPercentage - 2}%`,
                    height: heightPx,
                    maxHeight: heightPx, // Permitir que el evento se extienda completamente
                    zIndex: 20 + layout.columnIndex,
                    fontSize: '10px',
                    lineHeight: '12px',
                    overflow: 'hidden' // Permitir que el evento se extienda fuera del slot inicial
                  }}
                >
                  <div className="font-bold truncate text-white" title={event.subject}>
                    {event.subject}
                  </div>
                  
                  {heightPx > 24 && (
                    <div className="text-xs opacity-90 truncate text-white">
                      {eventStart.toLocaleTimeString("es-CO", { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </div>
                  )}
                  
                  {heightPx > 36 && event.location && (
                    <div className="text-xs opacity-80 truncate text-white">
                      📍 {event.location.displayName}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
