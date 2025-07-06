
// ✅ Formato personalizado: 9a, 1p, 9:30a, 1:30p
export const formatCompactTime = (date: Date): string => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const isPM = hours >= 12;
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  const suffix = isPM ? 'p' : 'a';

  return minutes === 0
    ? `${hour12}${suffix}`
    : `${hour12}:${minutes.toString().padStart(2, '0')}${suffix}`;
};

export const createValidRange = () => {
  const now = new Date();
  const validStart = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const validEnd = new Date(now.getTime() + (60 * 24 * 60 * 60 * 1000));
  
  return {
    start: validStart.toISOString().split('T')[0],
    end: validEnd.toISOString().split('T')[0]
  };
};
