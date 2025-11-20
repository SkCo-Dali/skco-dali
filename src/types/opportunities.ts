export interface IOpportunity {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: OpportunityType;
  priority: Priority;
  score: number;
  customerCount: number;
  potentialCommission?: number;
  icon: string;
  tags: string[];
  segment?: string;
  suggestedProduct: string;
  trigger: string;
  timeWindow: {
    start: string;
    end: string;
  };
  strategy: {
    email: {
      subject: string;
      body: string;
    };
    whatsapp: {
      template: string;
      message: string;
    };
    call: {
      script: string;
    };
  };
  metrics?: {
    conversionRate: number;
    ctrEstimated: number;
    estimatedSales: number;
  };
  isHighlighted: boolean;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
  lastCampaignName?: string | null;
}

export interface ICustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  age: number;
  products: string[];
  tags: string[];
  opportunityId: string;
}

export type OpportunityType = 
  | 'birthday'
  | 'cross-sell'
  | 'retention'
  | 'reactivation'
  | 'campaign'
  | 'ai-recommendation'
  | 'recent-contact'
  | 'risk-advisory'
  | 'churn-risk'
  | 'life-events';

export type Priority = 'alta' | 'media' | 'baja';

export interface OpportunityFilters {
  type?: OpportunityType[];
  priority?: Priority[];
  product?: string[];
  customerCount?: {
    min: number;
    max: number;
  };
  score?: {
    min: number;
    max: number;
  };
  search?: string;
  tags?: string[];
  onlyFavorites?: boolean;
}

export type SortOption = 'relevance' | 'customers' | 'recent' | 'expiring';

export interface OpportunityStats {
  totalOpportunities: number;
  totalCustomers: number;
  favoritesCount: number;
  avgScore: number;
  totalCommissionPotential: number;
}

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  'birthday': '🎂 Cumpleaños',
  'cross-sell': '🎯 Cross-sell',
  'retention': '🔒 Retención',
  'reactivation': '♻️ Reactivación',
  'campaign': '📣 Campaña',
  'ai-recommendation': '🤖 IA',
  'recent-contact': '📞 Contacto Reciente',
  'risk-advisory': '⚠️ Riesgo Asesoría',
  'churn-risk': '🚨 Riesgo Cancelación',
  'life-events': '🎉 Eventos de Vida'
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  'alta': 'bg-red-100 text-red-800 border-red-200',
  'media': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'baja': 'bg-green-100 text-green-800 border-green-200'
};