import { ApiOpportunity } from '@/types/opportunitiesApi';
import { IOpportunity, Priority, OpportunityType } from '@/types/opportunities';

// Helper function to map priority number to priority enum
const mapPriorityFromApi = (priority: number): Priority => {
  if (priority <= 1) return 'alta';
  if (priority <= 2) return 'media';
  return 'baja';
};

// Helper function to map categories to opportunity type
const mapCategoriestoType = (categories: string[]): OpportunityType => {
  const categoryLower = categories[0]?.toLowerCase() || '';
  
  if (categoryLower.includes('cumpleaños') || categoryLower.includes('birthday')) return 'birthday';
  if (categoryLower.includes('fidelización') || categoryLower.includes('retención')) return 'retention';
  if (categoryLower.includes('venta cruzada') || categoryLower.includes('cross')) return 'cross-sell';
  if (categoryLower.includes('reactivación')) return 'reactivation';
  if (categoryLower.includes('campaña')) return 'campaign';
  if (categoryLower.includes('contacto')) return 'recent-contact';
  if (categoryLower.includes('riesgo')) return 'churn-risk';
  if (categoryLower.includes('declaración') || categoryLower.includes('renta')) return 'life-events';
  
  return 'ai-recommendation';
};

// Map API opportunity to internal opportunity format
export const mapApiOpportunityToOpportunity = (apiOpportunity: ApiOpportunity): IOpportunity => {
  const mappedOpportunity: IOpportunity = {
    id: apiOpportunity.OpportunityId.toString(),
    title: apiOpportunity.Title,
    subtitle: apiOpportunity.Subtitle,
    description: apiOpportunity.Description,
    type: mapCategoriestoType(apiOpportunity.Categories),
    priority: mapPriorityFromApi(apiOpportunity.Priority),
    score: Math.min(100, Math.max(0, (4 - apiOpportunity.Priority) * 25)), // Convert priority to score (0-100)
    customerCount: apiOpportunity.lead_count,
    icon: getIconForType(mapCategoriestoType(apiOpportunity.Categories)),
    tags: apiOpportunity.Categories,
    suggestedProduct: 'Producto recomendado', // Default value, could be enhanced
    trigger: 'Análisis automático', // Default value
    timeWindow: {
      start: new Date().toISOString(),
      end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    },
    strategy: {
      email: {
        subject: `Oportunidad: ${apiOpportunity.Title}`,
        body: apiOpportunity.Description,
      },
      whatsapp: {
        template: 'opportunity_template',
        message: apiOpportunity.Subtitle,
      },
      call: {
        script: `Llamar para ${apiOpportunity.Title}`,
      },
    },
    metrics: {
      conversionRate: 15 + Math.random() * 20, // Random value between 15-35%
      ctrEstimated: 2 + Math.random() * 5, // Random value between 2-7%
      estimatedSales: apiOpportunity.lead_count * (50000 + Math.random() * 100000), // Random estimation
    },
    isHighlighted: apiOpportunity.Priority <= 1, // High priority opportunities are highlighted
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
  };

  return mappedOpportunity;
};

// Helper function to get icon for opportunity type
const getIconForType = (type: OpportunityType): string => {
  const iconMap: Record<OpportunityType, string> = {
    'birthday': '🎂',
    'cross-sell': '🎯',
    'retention': '🔒',
    'reactivation': '♻️',
    'campaign': '📣',
    'ai-recommendation': '🤖',
    'recent-contact': '📞',
    'risk-advisory': '⚠️',
    'churn-risk': '🚨',
    'life-events': '🎉',
  };
  
  return iconMap[type] || '💼';
};