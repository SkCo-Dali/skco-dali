/**
 * Servicio de pre-check para leads PAC
 * Implementa verificación global de NIT con data minimization
 */

import { LeadType } from "@/types/leadTypes";

export interface PacPreCheckRequest {
  nit: string;
  userId: string; // Usuario que hace la consulta
}

export interface PacPreCheckResult {
  exists: boolean;
  tipoLead?: LeadType;
  estado?: string;
  // Datos siempre visibles
  leadId?: string;
  creadoEl?: string;
  // Datos solo si está en alcance del usuario
  inScope?: boolean;
  empresa?: string;
  nit?: string;
  asesorDisplayName?: string;
  asesorId?: string;
  email?: string;
  telefono?: string;
  numeroEmpleados?: number;
  sectorEmpresa?: string;
  notas?: string;
}

// Mock data para pruebas
const MOCK_PAC_LEADS = [
  {
    leadId: "pac-001",
    nit: "900123456",
    empresa: "Tech Solutions S.A.S",
    tipoLead: "pac" as LeadType,
    estado: "En Negociación",
    numeroEmpleados: 50,
    sectorEmpresa: "Tecnología",
    asesorId: "user-001",
    asesorDisplayName: "Carlos Rodríguez",
    createdBy: "user-001",
    email: "contacto@techsolutions.com",
    telefono: "3001234567",
    creadoEl: "2024-01-15",
  },
  {
    leadId: "pac-002",
    nit: "890456789",
    empresa: "Construcciones ABC Ltda",
    tipoLead: "pac" as LeadType,
    estado: "Prospecto",
    numeroEmpleados: 120,
    sectorEmpresa: "Construcción",
    asesorId: "user-002",
    asesorDisplayName: "María González",
    createdBy: "user-002",
    email: "info@construccionesabc.com",
    telefono: "3109876543",
    creadoEl: "2024-02-20",
  },
  {
    leadId: "pac-003",
    nit: "800789012",
    empresa: "Servicios Financieros XYZ",
    tipoLead: "pac" as LeadType,
    estado: "Cliente",
    numeroEmpleados: 200,
    sectorEmpresa: "Financiero",
    asesorId: "user-003",
    asesorDisplayName: "Ana Martínez",
    createdBy: "user-003",
    email: "ventas@financierosxyz.com",
    telefono: "3157654321",
    creadoEl: "2023-12-10",
  },
  {
    leadId: "generic-001",
    nit: "900555666",
    empresa: "Retail Express",
    tipoLead: "generic" as LeadType,
    estado: "Nuevo",
    asesorId: "user-001",
    asesorDisplayName: "Carlos Rodríguez",
    createdBy: "user-001",
    email: "contacto@retailexpress.com",
    telefono: "3201112222",
    creadoEl: "2024-03-01",
  },
];

/**
 * Normaliza un NIT removiendo puntos, guiones y espacios
 */
export function normalizeNit(nit: string): string {
  return nit.replace(/[.\-\s]/g, "").trim();
}

/**
 * Verifica si existe un lead PAC con el NIT dado
 * Implementa data minimization según alcance del usuario
 */
export async function verifyPacByNit(
  request: PacPreCheckRequest
): Promise<PacPreCheckResult> {
  // Simular latencia de red
  await new Promise((resolve) => setTimeout(resolve, 400));

  const normalizedNit = normalizeNit(request.nit);

  // Buscar coincidencia por NIT (búsqueda global, sin restricción de usuario)
  const match = MOCK_PAC_LEADS.find(
    (lead) => normalizeNit(lead.nit) === normalizedNit
  );

  if (!match) {
    return {
      exists: false,
    };
  }

  // Verificar si el lead está en alcance del usuario
  // Un lead está en alcance si fue creado por el usuario o está asignado a él
  const inScope =
    match.createdBy === request.userId || match.asesorId === request.userId;

  // Data minimization: solo exponer datos completos si está en alcance
  if (inScope) {
    return {
      exists: true,
      inScope: true,
      leadId: match.leadId,
      tipoLead: match.tipoLead,
      estado: match.estado,
      empresa: match.empresa,
      nit: match.nit,
      asesorDisplayName: match.asesorDisplayName,
      asesorId: match.asesorId,
      email: match.email,
      telefono: match.telefono,
      numeroEmpleados: match.numeroEmpleados,
      sectorEmpresa: match.sectorEmpresa,
      creadoEl: match.creadoEl,
    };
  }

  // Fuera de alcance: solo datos mínimos
  return {
    exists: true,
    inScope: false,
    leadId: match.leadId, // Enmascarado o hash
    tipoLead: match.tipoLead,
    estado: match.estado,
    asesorDisplayName: match.asesorDisplayName,
    creadoEl: match.creadoEl,
  };
}

/**
 * Registra auditoría de verificación (para implementar)
 */
export async function logPacPreCheck(
  userId: string,
  nit: string,
  result: PacPreCheckResult,
  decision: "create" | "open" | "cancel" | "convert"
): Promise<void> {
  console.log("PAC Pre-check Audit Log:", {
    userId,
    nit: normalizeNit(nit),
    timestamp: new Date().toISOString(),
    exists: result.exists,
    inScope: result.inScope,
    decision,
  });
  // TODO: Implementar guardado en base de datos
}
