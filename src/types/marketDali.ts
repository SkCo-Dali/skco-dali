// Market Dali Types - E-commerce style (Rappi-like experience)

export interface MarketOpportunity {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  type: OpportunityCategory;
  priority: 'alta' | 'media' | 'baja';
  clientCount: number;
  potentialCommission: number;
  icon: string;
  tags: string[];
  coverImage?: string;
  rating?: number;
  isActive: boolean;
  isFavorite: boolean;
  timeWindow: {
    start: string;
    end: string;
  };
  lastCampaignName?: string | null;
}

export interface MarketClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  segment: string;
  currentProduct: string;
  score: number;
  age: number;
  gender: string;
  documentNumber: number;
  documentType: string;
  additionalInfo: Record<string, any>;
  opportunityId: string;
}

export interface CartItem {
  client: MarketClient;
  opportunityId: string;
  addedAt: Date;
}

export interface MarketCart {
  opportunityId: string | null;
  opportunityTitle: string | null;
  lastCampaignName: string | null;
  items: CartItem[];
}

export type OpportunityCategory = 
  | 'birthday'
  | 'cross-sell'
  | 'cross-sell-obligatoria'
  | 'cross-sell-voluntaria'
  | 'cross-sell-seguros'
  | 'cross-sell-fics'
  | 'retention'
  | 'reactivation'
  | 'campaign'
  | 'ai-recommendation'
  | 'churn-risk'
  | 'life-events';

export interface MarketFilters {
  search: string;
  categories: OpportunityCategory[];
  priorities: ('alta' | 'media' | 'baja')[];
  minClients: number;
  maxClients: number;
  minCommission: number;
  maxCommission: number;
  onlyFavorites: boolean;
}

export const CATEGORY_CONFIG: Record<OpportunityCategory, { label: string; icon: string; color: string }> = {
  'birthday': { label: 'Cumpleaños', icon: '🎂', color: 'bg-pink-500' },
  'cross-sell': { label: 'Cross-sell', icon: '🎯', color: 'bg-blue-500' },
  'cross-sell-obligatoria': { label: 'Cross-sell Obligatoria', icon: '📋', color: 'bg-blue-600' },
  'cross-sell-voluntaria': { label: 'Cross-sell Voluntaria', icon: '✋', color: 'bg-indigo-500' },
  'cross-sell-seguros': { label: 'Cross-sell Seguros', icon: '🛡️', color: 'bg-sky-500' },
  'cross-sell-fics': { label: 'Cross-sell FICs', icon: '📈', color: 'bg-violet-500' },
  'retention': { label: 'Retención', icon: '🔒', color: 'bg-green-500' },
  'reactivation': { label: 'Reactivación', icon: '♻️', color: 'bg-orange-500' },
  'campaign': { label: 'Campaña', icon: '📣', color: 'bg-purple-500' },
  'ai-recommendation': { label: 'IA', icon: '🤖', color: 'bg-cyan-500' },
  'churn-risk': { label: 'Riesgo', icon: '🚨', color: 'bg-red-500' },
  'life-events': { label: 'Eventos', icon: '🎉', color: 'bg-yellow-500' },
};

export const PRIORITY_CONFIG: Record<'alta' | 'media' | 'baja', { label: string; color: string }> = {
  'alta': { label: 'Alta prioridad', color: 'bg-red-100 text-red-800 border-red-200' },
  'media': { label: 'Media prioridad', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'baja': { label: 'Baja prioridad', color: 'bg-green-100 text-green-800 border-green-200' },
};

// Action types for the cart
export type CartAction = 
  | { type: 'ADD_ITEM'; payload: { client: MarketClient; opportunityId: string; opportunityTitle: string; lastCampaignName: string | null } }
  | { type: 'REMOVE_ITEM'; payload: { clientId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_OPPORTUNITY'; payload: { opportunityId: string; opportunityTitle: string; lastCampaignName: string | null } };
