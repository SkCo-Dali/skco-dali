// Market Dali API Service - Connects to existing backend
import { 
  getOpportunitySummary, 
  loadLeadsFromOpportunity, 
  previewLeadsFromOpportunity,
  updateOpportunityFavourite 
} from '@/utils/opportunitiesApiClient';
import { ApiOpportunity, PreviewLeadFromOpportunity } from '@/types/opportunitiesApi';
import { MarketOpportunity, MarketClient, OpportunityCategory } from '@/types/marketDali';

// Helper to map API type to internal category
const mapTypeToCategory = (type: string): OpportunityCategory => {
  if (type.includes('Cumpleaños')) return 'birthday';
  if (type.includes('Cross-sell')) return 'cross-sell';
  if (type.includes('Retención')) return 'retention';
  if (type.includes('Reactivación')) return 'reactivation';
  if (type.includes('Campaña')) return 'campaign';
  if (type.includes('Riesgo')) return 'churn-risk';
  if (type.includes('Eventos')) return 'life-events';
  return 'ai-recommendation';
};

// Helper to map priority string
const mapPriority = (priority: string): 'alta' | 'media' | 'baja' => {
  const p = priority.toLowerCase();
  if (p === 'alta') return 'alta';
  if (p === 'media') return 'media';
  return 'baja';
};

// Transform API opportunity to Market opportunity
const transformOpportunity = (api: ApiOpportunity): MarketOpportunity => ({
  id: api.OpportunityId.toString(),
  title: api.Title,
  subtitle: api.Subtitle,
  description: api.Description,
  type: mapTypeToCategory(api.Type),
  priority: mapPriority(api.Priority),
  clientCount: api.lead_count,
  potentialCommission: api.ComisionPotencial,
  icon: getIconForCategory(mapTypeToCategory(api.Type)),
  tags: api.Categories,
  isActive: api.IsActive,
  isFavorite: api.IsFavourite,
  timeWindow: {
    start: api.Beggining,
    end: api.End,
  },
  lastCampaignName: api.LastCampaignName,
});

// Transform preview lead to Market client
const transformClient = (lead: PreviewLeadFromOpportunity): MarketClient => ({
  id: lead.id || `temp-${lead.documentNumber}`,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  segment: lead.source || 'General',
  currentProduct: lead.product?.length > 0 ? lead.product[0] : 'Sin producto',
  score: Math.min(100, Math.max(0, lead.value || 50)),
  age: lead.Age,
  gender: lead.Gender,
  documentNumber: lead.documentNumber,
  documentType: lead.DocumentType,
  additionalInfo: lead.AdditionalInfo || {},
  opportunityId: lead.OpportunityId.toString(),
});

const getIconForCategory = (category: OpportunityCategory): string => {
  const icons: Record<OpportunityCategory, string> = {
    'birthday': '🎂',
    'cross-sell': '🎯',
    'retention': '🔒',
    'reactivation': '♻️',
    'campaign': '📣',
    'ai-recommendation': '🤖',
    'churn-risk': '🚨',
    'life-events': '🎉',
  };
  return icons[category] || '💼';
};

// ============ PUBLIC API METHODS ============

/**
 * Get all opportunities for the current advisor
 */
export const fetchOpportunities = async (): Promise<MarketOpportunity[]> => {
  try {
    const apiOpportunities = await getOpportunitySummary();
    return apiOpportunities.map(transformOpportunity);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    throw error;
  }
};

/**
 * Get clients (preview) for a specific opportunity
 */
export const fetchClientsForOpportunity = async (opportunityId: string): Promise<MarketClient[]> => {
  try {
    const previewLeads = await previewLeadsFromOpportunity(parseInt(opportunityId));
    return previewLeads.map(transformClient);
  } catch (error) {
    console.error('Error fetching clients for opportunity:', error);
    throw error;
  }
};

/**
 * Toggle favorite status for an opportunity
 */
export const toggleOpportunityFavorite = async (opportunityId: string, isFavorite: boolean): Promise<boolean> => {
  try {
    const result = await updateOpportunityFavourite(parseInt(opportunityId), isFavorite);
    return result.success;
  } catch (error) {
    console.error('Error toggling favorite:', error);
    throw error;
  }
};

/**
 * Load selected clients as leads in the lead manager
 */
export const loadClientsAsLeads = async (opportunityId: string): Promise<{ success: boolean; count: number }> => {
  try {
    const result = await loadLeadsFromOpportunity(parseInt(opportunityId));
    return { success: true, count: result.length };
  } catch (error) {
    console.error('Error loading clients as leads:', error);
    throw error;
  }
};

/**
 * Send bulk email to selected clients (stub - ready for backend connection)
 */
export const sendBulkEmail = async (clientIds: string[], opportunityId: string): Promise<{ success: boolean }> => {
  // TODO: Connect to real email API
  console.log('📧 Sending bulk email to clients:', clientIds, 'from opportunity:', opportunityId);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return { success: true };
};

/**
 * Send bulk WhatsApp to selected clients (stub - ready for backend connection)
 */
export const sendBulkWhatsApp = async (clientIds: string[], opportunityId: string): Promise<{ success: boolean }> => {
  // TODO: Connect to real WhatsApp API
  console.log('💬 Sending bulk WhatsApp to clients:', clientIds, 'from opportunity:', opportunityId);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return { success: true };
};
