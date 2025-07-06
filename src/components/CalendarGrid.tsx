import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarEvent } from "@/hooks/useMicrosoftCalendar";
import { convertToBogotaTime, generateWorkingDaysRange } from "@/utils/dateUtils";

interface CalendarGridProps {
  events: CalendarEvent[];
  startDate: string; // ISO yyyy-mm-dd (lunes)
  endDate: string;   // ISO yyyy-mm-dd (viernes)
}

const SLOT_HEIGHT = 60;
const HEADER_HEIGHT = 60;

function generateTimeSlots() {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? "AM" : "PM";
    const label = `${hour12}:00 ${ampm}`;
    slots.push({ hour, minute: 0, label, displayLabel: true });
    slots.push({ hour, minute: 30, label: `${hour12}:30 ${ampm}`, displayLabel: false });
  }
  return slots;
}

const WEEK_DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie"];

export function CalendarGrid({ events, startDate, endDate }: CalendarGridProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Generar días laborales - CORREGIDO
  const days = generateWorkingDaysRange(startDate, endDate);
  const timeSlots = generateTimeSlots();

  console.log('CalendarGrid - Fixed range calculation:', {
    startDate,
    endDate,
    days: days.map(d => ({ date: d.toDateString(), day: d.getDay() })),
    totalDays: days.length
  });

  // Filtrar eventos correctamente - CORREGIDO CON NUEVA CONVERSIÓN
  function getEventsForSlot(date: Date, slotStart: Date, slotEnd: Date) {
    return events.filter((event) => {
      const eventStartBogota = convertToBogotaTime(event.start.dateTime);
      const eventEndBogota = convertToBogotaTime(event.end.dateTime);

      // Comparar solo fechas (sin horas) para verificar si es el mismo día
      const eventDate = new Date(eventStartBogota.getFullYear(), eventStartBogota.getMonth(), eventStartBogota.getDate());
      const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const sameDay = eventDate.getTime() === targetDate.getTime();

      if (!sameDay) return false;

      // Crear horarios del slot para el día específico usando las horas convertidas
      const eventStartTime = new Date(date);
      eventStartTime.setHours(eventStartBogota.getHours(), eventStartBogota.getMinutes(), 0, 0);
      
      const eventEndTime = new Date(date);
      eventEndTime.setHours(eventEndBogota.getHours(), eventEndBogota.getMinutes(), 0, 0);

      // Verificar si el evento se superpone con el slot
      const overlaps = eventStartTime < slotEnd && eventEndTime > slotStart;
      
      console.log('Event filtering (fixed):', {
        eventTitle: event.subject,
        eventStartBogota: eventStartBogota.toLocaleString('es-CO'),
        targetDate: targetDate.toDateString(),
        sameDay,
        overlaps
      });

      return overlaps;
    });
  }

  // Scroll automático para mostrar primero 7 AM o primer evento visible
  useEffect(() => {
    if (scrollAreaRef.current) {
      let scrollToSlot = 14; // 7 AM (7*2)

      if (events.length > 0) {
        let earliestSlot = 48; // máximo slots (24h * 2)

        events.forEach(event => {
          const startBogota = convertToBogotaTime(event.start.dateTime);
          days.forEach(date => {
            if (
              startBogota.getFullYear() === date.getFullYear() &&
              startBogota.getMonth() === date.getMonth() &&
              startBogota.getDate() === date.getDate()
            ) {
              const slotIndex = startBogota.getHours() * 2 + (startBogota.getMinutes() < 30 ? 0 : 1);
              if (slotIndex < earliestSlot) earliestSlot = slotIndex;
            }
          });
        });

        if (earliestSlot !== 48) {
          scrollToSlot = Math.max(0, earliestSlot - 2);
        }
      }

      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = scrollToSlot * SLOT_HEIGHT;
      }
    }
  }, [events, days]);

  return (
    <div className="w-full relative">
      {/* Header fijo */}
      <div
        className="sticky top-0 bg-white z-50 border-b border-gray-300 shadow-sm grid"
        style={{
          gridTemplateColumns: "80px repeat(5, 1fr)",
          height: HEADER_HEIGHT,
        }}
      >
        <div className="bg-gray-50 border-r border-gray-300 flex items-center justify-center">
          <span className="text-sm font-semibold">Hora</span>
        </div>
        {days.map((date, i) => (
          <div
            key={i}
            className="bg-gray-50 border-r border-gray-300 p-3 text-center font-semibold text-sm flex flex-col justify-center"
          >
            <div>{WEEK_DAYS[i]}</div>
            <div className="text-xs text-gray-600">
              {date.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit" })}
            </div>
          </div>
        ))}
      </div>

      {/* Contenido scrollable */}
      <ScrollArea className="w-full h-[540px]" ref={scrollAreaRef}>
        <div
          className="grid min-w-[700px]"
          style={{ gridTemplateColumns: "80px repeat(5, 1fr)" }}
        >
          {/* Columna horas */}
          <div className="bg-gray-50 border-r border-gray-300">
            {timeSlots.map((slot, i) => (
              <div
                key={i}
                className="p-2 text-right text-xs font-medium border-b border-gray-300 bg-gray-50"
                style={{ height: SLOT_HEIGHT }}
              >
                {slot.displayLabel ? slot.label : ""}
              </div>
            ))}
          </div>

          {/* Columnas días */}
          {days.map((date, colIndex) => (
            <div
              key={colIndex}
              className="relative bg-white border-r border-gray-300"
            >
              {timeSlots.map((slot, slotIndex) => {
                const slotStart = new Date(date);
                slotStart.setHours(slot.hour, slot.minute, 0, 0);
                const slotEnd = new Date(slotStart);
                slotEnd.setMinutes(slotEnd.getMinutes() + 30);

                const slotEvents = getEventsForSlot(date, slotStart, slotEnd);

                return (
                  <div
                    key={slotIndex}
                    className="relative border-b border-gray-300 bg-white hover:bg-gray-50 transition-colors"
                    style={{ height: SLOT_HEIGHT, minHeight: SLOT_HEIGHT }}
                  >
                    {slotEvents.map(event => {
                      const eventStartBogota = convertToBogotaTime(event.start.dateTime);
                      const eventEndBogota = convertToBogotaTime(event.end.dateTime);

                      const eventStartsInThisSlot =
                        eventStartBogota.getHours() === slot.hour &&
                        (slot.minute === 0 ? eventStartBogota.getMinutes() < 30 : eventStartBogota.getMinutes() >= 30);

                      if (!eventStartsInThisSlot) return null;

                      const durationMinutes = (eventEndBogota.getTime() - eventStartBogota.getTime()) / (1000 * 60);
                      const durationSlots = Math.max(1, Math.ceil(durationMinutes / 30));
                      const heightPx = (durationSlots * SLOT_HEIGHT) - 6;
                      const minutesIntoSlot = eventStartBogota.getMinutes() % 30;
                      const topPx = Math.min((minutesIntoSlot / 30) * SLOT_HEIGHT + 2, SLOT_HEIGHT - 20);

                      return (
                        <div
                          key={event.id}
                          className="absolute bg-[#00c83c] text-white text-xs rounded px-2 py-1 shadow-sm border border-green-600 overflow-hidden"
                          title={`${event.subject} - ${eventStartBogota.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })} - ${eventEndBogota.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}${event.location ? ` - ${event.location.displayName}` : ''}`}
                          style={{
                            top: topPx,
                            left: 0,
                            width: "100%",
                            height: heightPx,
                            maxHeight: heightPx,
                            zIndex: 10,
                            fontSize: "10px",
                            lineHeight: "12px",
                            overflow: "hidden",
                          }}
                        >
                          <div className="font-bold truncate" title={event.subject}>
                            {event.subject}
                          </div>
                          {heightPx > 24 && (
                            <div className="text-xs opacity-90 truncate">
                              {eventStartBogota.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          )}
                          {heightPx > 36 && event.location && (
                            <div className="text-xs opacity-80 truncate">
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
