export type UserRole =
  | "admin"
  | "manager"
  | "agent"
  | "viewer"
  | "supervisor"
  | "analista"
  | "gestor"
  | "fp"
  | "seguridad"
  | "director"
  | "promotor"
  | "aliado"
  | "socio"
  | "ais"
  | "ejecutivo"
  | "supervisorComisiones"
  | "analistaComisiones"
  | "serviceDesk"
  | "sac"
  | "fpSac";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  phone?: string;
  department?: string;
  manager?: string;
  createdAt: string;
  updatedAt?: string;
  zone?: string;
  team?: string;
  jobTitle?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
  };
  // Additional fields from API
  countryCodeWhatsApp?: number;
  whatsappNumber?: string;
  idAgte?: number | null;
  idSociedad?: number | null;
  idPromotor?: number | null;
  idAliado?: number | null;
  wSaler?: string | null;
  preferredName?: string | null;
  birthDate?: string | null;
  dailyEmailLimit?: number;
  dailyWhatsAppLimit?: number;
  idSupervisor?: number | null;

  // Profile data from GET /api/profile
  gender?: string | null;
  maritalStatus?: string | null;
  childrenCount?: number;
  whatsappCountryCode?: string | null;
  whatsappPhone?: string | null;
  emailSignatureHtml?: string | null;
  primaryActionCode?: string | null;
  primaryActionRoute?: string | null;
}

export interface RolePermissions {
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign: boolean;
  canViewAll: boolean;
  canManageUsers: boolean;
  canAccessReports: boolean;
  canUploadLeads?: boolean;
  canBulkAssignLeads?: boolean;
  canBulkUpdateStage?: boolean;
  canAccessUserManagement?: boolean;
  canAssignRoles?: boolean;
  canSendEmail?: boolean;
  canSendWhatsApp?: boolean;
  canSendmassiveWhatsApp?: boolean;
  chatSami?: boolean;
  accessiblePages: string[];
}

// Add UserPermissions as alias for RolePermissions for backward compatibility
export type UserPermissions = RolePermissions;

export const getRolePermissions = (role: UserRole): RolePermissions => {
  switch (role) {
    case "admin":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canViewAll: true,
        canManageUsers: true,
        canAccessReports: true,
        canUploadLeads: true,
        canBulkAssignLeads: true,
        canBulkUpdateStage: true,
        canAccessUserManagement: true,
        canAssignRoles: true,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: true,
        chatSami: true,
        accessiblePages: [
          "dashboard",
          "leads",
          "leadstabbed",
          "ChatDali",
          "opportunities",
          "market-dali",
          "gamification",
          "reports",
          "informes",
          "users",
          "settings",
          "index",
          "comisiones",
          "motor-comisiones",
          "voice-insights",
          "calendar",
          "tasks",
          "ficha-360",
        ],
      };
    case "manager":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canViewAll: true,
        canManageUsers: false,
        canAccessReports: true,
        canUploadLeads: true,
        canBulkAssignLeads: true,
        canBulkUpdateStage: true,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["leads", "ChatDali", "reports", "informes", "opportunities"],
      };
    case "supervisor":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canViewAll: true,
        canManageUsers: false,
        canAccessReports: true,
        canUploadLeads: true,
        canBulkAssignLeads: true,
        canBulkUpdateStage: true,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["leads", "ChatDali", "reports", "informes", "opportunities"],
      };
    case "ejecutivo":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: true,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: true,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["leads", "ChatDali", "informes", "opportunities"],
      };
    case "supervisorComisiones":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: false,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["comisiones", "motor-comisiones"],
      };
    case "analistaComisiones":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: false,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["comisiones", "motor-comisiones"],
      };
    case "serviceDesk":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: false,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: true,
        canAssignRoles: true,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["users"],
      };
    case "sac":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canViewAll: true,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["leads", "ChatDali", "informes", "opportunities", "comisiones"],
      };
    case "agent":
    case "gestor":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["leads", "ChatDali", "informes", "opportunities"],
      };
    case "promotor":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["informes"],
      };
    case "aliado":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["informes"],
      };
    case "socio":
    case "director":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: true,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: true,
        canBulkUpdateStage: true,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["leads", "ChatDali", "informes", "opportunities"],
      };
    case "fp":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["leads", "ChatDali", "informes", "opportunities"],
      };
    case "fpSac":
      return {
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["leads", "ChatDali", "informes", "opportunities"],
      };
    case "ais":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: true,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: true,
        accessiblePages: ["informes"],
      };
    case "analista":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: true,
        canManageUsers: false,
        canAccessReports: true,
        canUploadLeads: false,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["leads", "reports", "informes", "opportunities"],
      };
    case "viewer":
    case "seguridad":
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: false,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: true,
        canSendWhatsApp: true,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["leads", "ChatDali", "informes", "opportunities"],
      };
    default:
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canAssign: false,
        canViewAll: false,
        canManageUsers: false,
        canAccessReports: false,
        canUploadLeads: false,
        canBulkAssignLeads: false,
        canBulkUpdateStage: false,
        canAccessUserManagement: false,
        canAssignRoles: false,
        canSendEmail: false,
        canSendWhatsApp: false,
        canSendmassiveWhatsApp: false,
        chatSami: false,
        accessiblePages: ["dashboard"],
      };
  }
};

export const getRoleDisplayName = (role: UserRole): string => {
  const roleDisplayMap: Record<UserRole, string> = {
    admin: "Administrador",
    manager: "Gerente",
    agent: "Agente",
    viewer: "Visualizador",
    supervisor: "Supervisor",
    analista: "Analista",
    gestor: "Gestor",
    fp: "FP",
    seguridad: "Seguridad",
    director: "Director",
    promotor: "Promotor",
    aliado: "Aliado",
    socio: "Socio",
    ais: "AIS",
    ejecutivo: "Ejecutivo",
    supervisorComisiones: "Supervisor Comisiones",
    analistaComisiones: "Analista Comisiones",
    serviceDesk: "Service Desk",
    sac: "SAC",
    fpSac: "FP SAC",
  };
  return roleDisplayMap[role] || role;
};

export interface Interaction {
  id: string;
  leadId: string;
  type: "call" | "email" | "meeting" | "note";
  description: string;
  date: string;
  userId: string;
  outcome?: "positive" | "negative" | "neutral";
}

export interface Lead {
  id: string;
  name: string;
  firstName?: string; // Primer Nombre
  email: string;
  phone: string;
  status: LeadStatus;
  source: LeadSource;
  priority: Priority;
  campaign: Campaign;
  portfolio: Portfolio;
  product: string; // Changed from Product[] to string
  createdAt: string; // Changed to string for consistency
  updatedAt: string; // Changed to string for consistency
  lastInteractionAt?: string; // Última fecha de interacción
  stage: string;
  assignedTo: string;
  assignedToName?: string; // Name of the assigned user from API
  createdBy: string; // Added missing property
  company?: string;
  occupation?: string;
  value: number;
  type?: string;
  outcome?: string;
  notes?: string;
  documentType?: string;
  documentNumber?: number;
  age?: number;
  gender?: string;
  preferredContactChannel?: string;
  portfolios?: string[];
  tags?: string[];
  nextFollowUp?: string; // Changed to string for consistency
  campaignOwnerName?: string;
  alternateEmail?: string; // Email Alternativo
  lastGestorName?: string; // Últ Gestor Asignado
  lastGestorInteractionAt?: string; // Últ Fecha de Interaccion Gestor
  lastGestorInteractionStage?: string; // Últ Estado Gestor
  lastGestorInteractionDescription?: string; // Últ Descripción Gestor
  interactions?: Interaction[];
  [key: string]: any;
}

export const LeadDefaultProperties: string[] = [
  "id",
  "name",
  "firstName",
  "email",
  "phone",
  "status",
  "source",
  "priority",
  "campaign",
  "portfolio",
  "product",
  "createdAt",
  "updatedAt",
  "stage",
  "assignedTo",
  "assignedToName",
  "createdBy",
  "company",
  "occupation",
  "value",
  "type",
  "outcome",
  "notes",
  "documentType",
  "documentNumber",
  "age",
  "gender",
  "preferredContactChannel",
  "portfolios",
  "tags",
  "nextFollowUp",
  "campaignOwnerName",
  "alternateEmail",
  "interactions",
];

export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost" | "Won";
export type LeadSource =
  | "Web"
  | "Referral"
  | "Social Media"
  | "Other"
  | "campaign"
  | "web"
  | "Hubspot"
  | "DaliLM"
  | "DaliAI"
  | "social"
  | "referral"
  | "cold-call"
  | "event";
export type Priority = "High" | "Medium" | "Low" | "high" | "low" | "medium" | "urgent";
export type Campaign = "Campaign A" | "Campaign B" | "Campaign C" | string;
export type Portfolio = "Portfolio A" | "Portfolio B" | "Portfolio C" | string;
export type Product = "Product A" | "Product B" | "Product C" | string;
