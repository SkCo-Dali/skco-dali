
// Generar array de horas con medias horas (12AM a 11PM)
export const generateTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    const hourLabel = i === 0 ? "12AM" : i < 12 ? `${i}AM` : i === 12 ? "12PM" : `${i - 12}PM`;
    
    // Agregar slot para la hora exacta (ej: 2:00 PM)
    slots.push({
      hour: i,
      minute: 0,
      label: hourLabel,
      displayLabel: true
    });
    
    // Agregar slot para la media hora (ej: 2:30 PM)
    slots.push({
      hour: i,
      minute: 30,
      label: `${hourLabel}:30`,
      displayLabel: false
    });
  }
  return slots;
};
