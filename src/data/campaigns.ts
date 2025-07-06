
export const campaigns = [
  "Campaña1",
  "Campaña2", 
  "Campaña3",
  "Campaña4"
] as const;

export type Campaign = typeof campaigns[number];
