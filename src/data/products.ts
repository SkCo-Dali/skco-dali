
export const products = [
  "Fondo Voluntario de Pensión",
  "Fondo de Pensiones Obligatorias",
  "Fondo de Cesantías",
  "Crea Ahorro",
  "Crea Retiro",
  "Crea Patrimonio",
  "Inversiones Internacionales",
  "Fondo de Inversión Colectiva"
] as const;

export type Product = typeof products[number];
