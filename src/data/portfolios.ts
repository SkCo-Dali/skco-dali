
export const portfolios = [
  "Portafolio Conservador",
  "Portafolio Moderado",
  "Portafolio Agresivo",
  "Portafolio Internacional",
  "Portafolio Inmobiliario",
  "Portafolio de Renta Fija",
  "Portafolio de Acciones",
  "Portafolio Diversificado"
] as const;

export type Portfolio = typeof portfolios[number];
