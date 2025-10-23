import { UserRole } from "@/types/crm";

/**
 * Define la página por defecto para cada rol
 * Puedes modificar este mapeo según las necesidades del negocio
 */
export const DEFAULT_PAGE_BY_ROLE: Record<UserRole, string> = {
  admin: "/index",
  seguridad: "/",
  analista: "/leads",
  supervisor: "/leads",
  gestor: "/leads",
  director: "/leads",
  promotor: "/leads",
  aliado: "/leads",
  socio: "/leads",
  fp: "/informes",
  ejecutivo: "/leads",
  supervisorComisiones: "/comisiones",
  analistaComisiones: "/comisiones",
  serviceDesk: "/informes",
  sac: "/informes",
  manager: "/",
  agent: "/leads",
  viewer: "/informes",
  ais: "/leads",
};

/**
 * Obtiene la página por defecto para un rol específico
 * @param role - El rol del usuario
 * @returns La ruta de la página por defecto
 */
export const getDefaultPageForRole = (role: UserRole): string => {
  return DEFAULT_PAGE_BY_ROLE[role] || "/";
};
