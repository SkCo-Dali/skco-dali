import { Lead } from "@/types/crm";
import { campaigns } from "./campaigns";
import { products } from "./products";

const companies = [
  "Company A", "Company B", "Company C", "Company D", "Company E",
  "Company F", "Company G", "Company H", "Company I", "Company J",
  "Company K", "Company L", "Company M", "Company N", "Company O", "Company P"
];

const sources: Lead['source'][] = ['Hubspot', 'web', 'social', 'referral', 'cold-call', 'event', 'campaign', 'DaliLM', 'DaliAI'];
const stages: Lead['stage'][] = ['Nuevo', 'Asignado', 'Localizado: Prospecto de venta FP', 'Localizado: Prospecto de venta AD', 'Contrato Creado', 'Localizado: No interesado'];
const priorities: Lead['priority'][] = ['low', 'medium', 'high', 'urgent'];

export function generateSampleLeads(): Lead[] {
  const leads: Lead[] = [];
  
  for (let i = 1; i <= 16; i++) {
    const lead: Lead = {
      id: i.toString(),
      name: `Lead ${i}`,
      email: `lead${i}@example.com`,
      phone: generatePhoneNumber(i),
      company: companies[i - 1],
      source: sources[i % sources.length],
      product: getProductsForLead(i),
      portfolios: getPortfoliosForLead(i),
      campaign: getCampaignForLead(i),
      stage: getStageForLead(i),
      priority: getPriorityForLead(i),
      value: getValueForLead(i),
      assignedTo: getAssignedToForLead(i),
      status: 'New', // Add required status property
      portfolio: getPortfoliosForLead(i)[0] || 'Portfolio A', // Add required portfolio property
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: getTagsForLead(i),
      interactions: [],
    };
    
    leads.push(lead);
  }
  
  return leads;
}

function generatePhoneNumber(index: number): string {
  const patterns = [
    "123-456-7890", "987-654-3210", "111-222-3333", "444-555-6666",
    "777-888-9999", "123-789-4560", "987-321-6540", "111-444-7777",
    "222-555-8888", "333-666-9999", "444-777-1111", "555-888-2222",
    "666-999-3333", "777-111-4444", "888-222-5555", "999-333-6666"
  ];
  return patterns[index - 1] || "000-000-0000";
}

function getProductsForLead(index: number): string[] {
  const productSelections = [
    ["Fondo Voluntario de Pensión"],
    ["Fondo Voluntario de Pensión", "Crea Ahorro"],
    ["Fondo de Pensiones Obligatorias"],
    ["Fondo de Pensiones Obligatorias", "Fondo de Cesantías"],
    ["Fondo de Pensiones Obligatorias"],
    ["Crea Retiro"],
    ["Crea Patrimonio"],
    ["Crea Patrimonio", "Inversiones Internacionales"],
    ["Fondo Voluntario de Pensión"],
    ["Fondo de Inversión Colectiva"],
    ["Fondo de Inversión Colectiva"],
    ["Fondo de Inversión Colectiva"],
    ["Fondo Voluntario de Pensión"],
    ["Fondo de Pensiones Obligatorias"],
    ["Fondo de Pensiones Obligatorias"],
    ["Fondo de Pensiones Obligatorias"]
  ];
  return productSelections[index - 1] || ["Fondo Voluntario de Pensión"];
}

function getCampaignForLead(index: number): string {
  if (index <= 4) return "Campaña4";
  if (index <= 8) return "Campaña3";
  if (index <= 12) return "Campaña2";
  return "Campaña1";
}

function getStageForLead(index: number): Lead['stage'] {
  const stagePattern = ['Nuevo', 'Asignado', 'Localizado: Prospecto de venta FP', 'Localizado: Prospecto de venta AD', 'Contrato Creado', 'Localizado: No interesado'];
  return stagePattern[(index - 1) % stagePattern.length] as Lead['stage'];
}

function getPriorityForLead(index: number): Lead['priority'] {
  const priorityPattern = ['high', 'medium', 'low', 'urgent'];
  return priorityPattern[(index - 1) % priorityPattern.length] as Lead['priority'];
}

function getValueForLead(index: number): number {
  const values = [
    150000, 80000, 120000, 200000, 300000, 90000, 110000, 180000,
    250000, 140000, 160000, 220000, 190000, 130000, 170000, 280000
  ];
  return values[index - 1] || 100000;
}

function getAssignedToForLead(index: number): string {
  // Leave some leads unassigned for bulk assignment testing
  const assignments = [
    "", "", "1", "", "2", "3", "", "", "3", "", "", "3", "", "", "3", ""
  ];
  return assignments[index - 1] || "";
}

function getPortfoliosForLead(index: number): string[] {
  const portfolioSelections = [
    ["Portfolio A"],
    ["Portfolio B"],
    ["Portfolio A", "Portfolio C"],
    ["Portfolio D"],
    ["Portfolio B", "Portfolio D"],
    ["Portfolio A"],
    ["Portfolio C"],
    ["Portfolio A", "Portfolio B"],
    ["Portfolio D"],
    ["Portfolio C"],
    ["Portfolio A"],
    ["Portfolio B"],
    ["Portfolio C"],
    ["Portfolio D"],
    ["Portfolio A", "Portfolio B"],
    ["Portfolio C", "Portfolio D"]
  ];
  return portfolioSelections[index - 1] || ["Portfolio A"];
}

function getTagsForLead(index: number): string[] {
  const tagSelections = [
    ["nuevo", "potencial"],
    ["seguimiento"],
    ["alta-prioridad", "empresa"],
    ["referido"],
    ["campaña-digital"],
    ["evento"],
    ["llamada-fría"],
    ["social-media"],
    ["web"],
    ["potencial", "seguimiento"],
    ["nueva-oportunidad"],
    ["cliente-existente"],
    ["prospecto"],
    ["interesado"],
    ["evaluación"],
    ["cierre-próximo"]
  ];
  return tagSelections[index - 1] || ["nuevo"];
}
