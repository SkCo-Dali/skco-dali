import { Lead } from "@/types/crm";
import { campaigns } from "./campaigns";
import { products } from "./products";

const companies = [
  "Company A", "Company B", "Company C", "Company D", "Company E",
  "Company F", "Company G", "Company H", "Company I", "Company J",
  "Company K", "Company L", "Company M", "Company N", "Company O", "Company P"
];

const sources: Lead['source'][] = ['Hubspot', 'web', 'social', 'referral', 'cold-call', 'event', 'campaign', 'DaliLM', 'DaliAI'];
const stages: Lead['stage'][] = ['Nuevo', 'Asignado', 'Localizado: Prospecto de venta FP', 'Localizado: Prospecto de venta AD', 'Localizado: Prospecto de venta - Pendiente','Contrato Creado', 'Localizado: No interesado'];
const priorities: Lead['priority'][] = ['low', 'medium', 'high', 'urgent'];

export function generateSampleLeads(): Lead[] {
  const leads: Lead[] = [];
  
  for (let i = 1; i <= 16; i++) {
    const createdDate = getDateForLead(i);
    const updatedDate = getUpdatedDateForLead(i, createdDate);
    
    const lead: Lead = {
      id: i.toString(),
      name: `Lead ${i}`,
      email: `lead${i}@example.com`,
      phone: generatePhoneNumber(i),
      company: companies[i - 1],
      source: sources[i % sources.length],
      product: getProductForLead(i),
      portfolios: getPortfoliosForLead(i),
      campaign: getCampaignForLead(i),
      stage: getStageForLead(i),
      priority: getPriorityForLead(i),
      value: getValueForLead(i),
      assignedTo: getAssignedToForLead(i),
      createdBy: getCreatedByForLead(i),
      status: 'New',
      portfolio: getPortfoliosForLead(i)[0] || 'Portfolio A',
      createdAt: createdDate,
      updatedAt: updatedDate,
      nextFollowUp: getNextFollowUpForLead(i, updatedDate),
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

function getProductForLead(index: number): string {
  const productSelections = [
    "Fondo Voluntario de Pensión",
    "Fondo Voluntario de Pensión, Crea Ahorro",
    "Fondo de Pensiones Obligatorias",
    "Fondo de Pensiones Obligatorias, Fondo de Cesantías",
    "Fondo de Pensiones Obligatorias",
    "Crea Retiro",
    "Crea Patrimonio",
    "Crea Patrimonio, Inversiones Internacionales",
    "Fondo Voluntario de Pensión",
    "Fondo de Inversión Colectiva",
    "Fondo de Inversión Colectiva",
    "Fondo de Inversión Colectiva",
    "Fondo Voluntario de Pensión",
    "Fondo de Pensiones Obligatorias",
    "Fondo de Pensiones Obligatorias",
    "Fondo de Pensiones Obligatorias"
  ];
  return productSelections[index - 1] || "Fondo Voluntario de Pensión";
}

function getCampaignForLead(index: number): string {
  if (index <= 4) return "Campaña4";
  if (index <= 8) return "Campaña3";
  if (index <= 12) return "Campaña2";
  return "Campaña1";
}

function getStageForLead(index: number): Lead['stage'] {
  const stagePattern = ['Nuevo', 'Asignado', 'Localizado: Prospecto de venta FP', 'Localizado: Prospecto de venta AD', 'Localizado: Prospecto de venta - Pendiente','Contrato Creado', 'Localizado: No interesado'];
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

function getCreatedByForLead(index: number): string {
  // Assign creators for sample leads
  const creators = [
    "1", "1", "1", "2", "2", "3", "1", "2", "3", "1", "2", "3", "1", "2", "3", "1"
  ];
  return creators[index - 1] || "1";
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

function getDateForLead(index: number): string {
  const now = new Date();
  const daysAgo = [
    0,    // today
    1,    // yesterday  
    2,    // 2 days ago
    7,    // last week
    8,    // last week
    15,   // 2 weeks ago
    30,   // last month
    35,   // last month
    45,   // last month
    60,   // 2 months ago
    90,   // 3 months ago (last quarter)
    120,  // 4 months ago
    150,  // 5 months ago
    180,  // 6 months ago
    300,  // 10 months ago (last year)
    365   // last year
  ];
  
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo[index - 1]);
  return date.toISOString();
}

function getUpdatedDateForLead(index: number, createdDate: string): string {
  const created = new Date(createdDate);
  const now = new Date();
  
  // Updated date is between created date and now
  const daysSinceCreated = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const randomDaysAfter = Math.floor(Math.random() * Math.min(daysSinceCreated + 1, 10));
  
  const updated = new Date(created);
  updated.setDate(updated.getDate() + randomDaysAfter);
  
  return updated.toISOString();
}

function getNextFollowUpForLead(index: number, updatedDate: string): string | undefined {
  // Only some leads have follow-up dates
  if (index % 3 === 0) {
    const updated = new Date(updatedDate);
    const followUpDays = [1, 3, 7, 14, 30][index % 5]; // Random follow-up intervals
    updated.setDate(updated.getDate() + followUpDays);
    return updated.toISOString();
  }
  return undefined;
}
