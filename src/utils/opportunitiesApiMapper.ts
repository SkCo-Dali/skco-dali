import { ApiOpportunity } from '@/types/opportunitiesApi';
import { IOpportunity, Priority, OpportunityType } from '@/types/opportunities';

// Helper function to map priority string to priority enum
const mapPriorityFromApi = (priority: string): Priority => {
  const priorityLower = priority.toLowerCase();
  if (priorityLower === 'alta') return 'alta';
  if (priorityLower === 'media') return 'media';
  return 'baja';
};

// Helper function to map API Type to opportunity type enum
const mapTypeFromApi = (type: string): OpportunityType => {
  if (type.includes('Cumpleaños')) return 'birthday';
  if (type.includes('Cross-sell')) return 'cross-sell';
  if (type.includes('Retención')) return 'retention';
  if (type.includes('Reactivación')) return 'reactivation';
  if (type.includes('Campaña')) return 'campaign';
  if (type.includes('Contacto')) return 'recent-contact';
  if (type.includes('Riesgo')) return 'churn-risk';
  if (type.includes('Eventos')) return 'life-events';
  
  return 'ai-recommendation';
};

// Map API opportunity to internal opportunity format
export const mapApiOpportunityToOpportunity = (apiOpportunity: ApiOpportunity): IOpportunity => {
  const opportunityType = mapTypeFromApi(apiOpportunity.Type);
  
  const mappedOpportunity: IOpportunity = {
    id: apiOpportunity.OpportunityId.toString(),
    title: apiOpportunity.Title,
    subtitle: apiOpportunity.Subtitle,
    description: apiOpportunity.Description,
    type: opportunityType,
    priority: mapPriorityFromApi(apiOpportunity.Priority),
    score: apiOpportunity.Priority === 'Alta' ? 90 : apiOpportunity.Priority === 'Media' ? 60 : 30,
    customerCount: apiOpportunity.lead_count,
    icon: getIconForType(opportunityType),
    tags: apiOpportunity.Categories,
    suggestedProduct: 'Producto recomendado', // Default value, could be enhanced
    trigger: 'Análisis automático', // Default value
    timeWindow: {
      start: apiOpportunity.Beggining,
      end: apiOpportunity.End,
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
    metrics: apiOpportunity.ComisionPotencial > 0 ? {
      conversionRate: 15 + Math.random() * 20, // Random value between 15-35%
      ctrEstimated: 2 + Math.random() * 5, // Random value between 2-7%
      estimatedSales: apiOpportunity.ComisionPotencial,
    } : undefined,
    isHighlighted: apiOpportunity.Priority === 'Alta',
    isFavorite: apiOpportunity.IsFavourite,
    isActive: apiOpportunity.IsActive,
    createdAt: new Date().toISOString(),
    expiresAt: apiOpportunity.End,
    lastCampaignName: apiOpportunity.LastCampaignName,
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