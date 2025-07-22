
import { Lead } from "@/types/crm";

// Sample leads data for testing with all required properties
export const sampleLeads: Lead[] = [
  {
    id: "sample-1",
    name: "Juan Carlos Pérez",
    email: "juan.perez@email.com",
    phone: "+57 310 123 4567",
    documentNumber: 12345678,
    documentType: "CC",
    company: "Tech Solutions SAS",
    source: "web",
    campaign: "Digital Campaign Q1",
    product: "Fondo Voluntario de Pensión",
    portfolios: ["Portfolio A"],
    stage: "Nuevo",
    priority: "high",
    value: 5000000,
    assignedTo: "user-1",
    createdBy: "user-1",
    status: "New",
    portfolio: "Portfolio A",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    nextFollowUp: "2024-01-20T09:00:00Z",
    notes: "Cliente potencial con alto interés en productos de pensión",
    tags: ["VIP", "Tecnología"],
    age: 35,
    gender: "Masculino",
    campaignOwnerName: "María González",
    preferredContactChannel: "Correo",
    interactions: [],
    additionalInfo: {
      "empresa_sector": "Tecnología",
      "numero_empleados": "50-100",
      "facturacion_anual": "2-5 millones",
      "contacto_anterior": "Si"
    }
  },
  {
    id: "sample-2", 
    name: "Ana María López",
    email: "ana.lopez@empresa.com",
    phone: "+57 320 654 3210",
    documentNumber: 87654321,
    documentType: "CC",
    company: "Marketing Plus",
    source: "social",
    campaign: "Social Media Campaign",
    product: "Fondo de Inversión Colectiva",
    portfolios: ["Portfolio B"],
    stage: "Asignado",
    priority: "medium",
    value: 3000000,
    assignedTo: "user-2",
    createdBy: "user-1",
    status: "Contacted",
    portfolio: "Portfolio B",
    createdAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-16T11:15:00Z",
    nextFollowUp: "2024-01-22T15:00:00Z",
    notes: "Interesada en productos de inversión, requiere seguimiento personalizado",
    tags: ["Marketing", "Seguimiento"],
    age: 28,
    gender: "Femenino",
    campaignOwnerName: "Carlos Ruiz",
    preferredContactChannel: "WhatsApp",
    interactions: [],
    additionalInfo: {
      "experiencia_inversion": "Principiante",
      "objetivo_inversion": "Corto plazo",
      "monto_disponible": "1-3 millones"
    }
  }
];
