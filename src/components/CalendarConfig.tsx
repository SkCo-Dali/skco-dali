
export const CALENDAR_CONFIG = {
  buttonText: {
    today: 'Hoy',
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    list: 'Lista'
  },
  locale: 'es',
  slotLabelFormat: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
    hour12: true
  },
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5],
    startTime: '07:00',
    endTime: '18:00'
  },
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'timeGridDay,timeGridWeek,dayGridMonth'
  }
};

export const TIME_CONFIG = {
  slotMinTime: "06:00:00",
  slotMaxTime: "22:00:00",
  timeZone: "local"
};
