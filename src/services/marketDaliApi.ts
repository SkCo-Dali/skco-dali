// Market Dali API Service - Connects to existing backend
import {
  getOpportunitySummary,
  loadLeadsFromOpportunity,
  previewLeadsFromOpportunity,
  updateOpportunityFavourite,
} from "@/utils/opportunitiesApiClient";
import { ApiOpportunity, PreviewLeadFromOpportunity } from "@/types/opportunitiesApi";
import { MarketOpportunity, MarketClient, OpportunityCategory } from "@/types/marketDali";

// Helper to map API type to internal category
// Uses type + title to determine cross-sell subcategories since API only sends "cross-sell" in type
const mapTypeToCategory = (type: string, title?: string): OpportunityCategory => {
  const typeLower = type.toLowerCase();
  const titleLower = (title || "").toLowerCase();
  const combined = `${typeLower} ${titleLower}`;
  
  if (typeLower.includes("cumpleaños")) return "birthday";
  
  // Cross-sell: check title for subcategory since type only contains "cross-sell"
  if (typeLower.includes("cross-sell") || typeLower.includes("cross sell")) {
    if (combined.includes("obligatoria")) return "cross-sell-obligatoria";
    if (combined.includes("voluntaria")) return "cross-sell-voluntaria";
    if (combined.includes("seguros")) return "cross-sell-seguros";
    if (combined.includes("fics") || combined.includes("fic")) return "cross-sell-fics";
    // Default cross-sell without specific line
    return "cross-sell-obligatoria";
  }
  
  if (typeLower.includes("retención") || typeLower.includes("retencion")) return "retention";
  if (typeLower.includes("reactivación") || typeLower.includes("reactivacion")) return "reactivation";
  if (typeLower.includes("campaña") || typeLower.includes("campana")) return "campaign";
  if (typeLower.includes("riesgo")) return "churn-risk";
  if (typeLower.includes("eventos")) return "life-events";
  
  console.warn("📡 mapTypeToCategory: Unknown type:", type, "title:", title);
  return "ai-recommendation";
};

// Helper to map priority string
const mapPriority = (priority: string): "alta" | "media" | "baja" => {
  const p = priority.toLowerCase();
  if (p === "alta") return "alta";
  if (p === "media") return "media";
  return "baja";
};

// Generate mobile image URL by adding "xs" before .png extension
const generateMobileImageUrl = (desktopUrl: string | undefined): string | undefined => {
  if (!desktopUrl) return undefined;
  // Add "xs" before .png extension
  return desktopUrl.replace(/\.png$/i, 'xs.png');
};

// Transform API opportunity to Market opportunity
const transformOpportunity = (api: ApiOpportunity): MarketOpportunity => {
  const category = mapTypeToCategory(api.Type, api.Title);
  return {
    id: api.OpportunityId.toString(),
    title: api.Title,
    subtitle: api.Subtitle,
    description: api.Description,
    type: category,
    priority: mapPriority(api.Priority),
    clientCount: api.lead_count,
    potentialCommission: api.ComisionPotencial,
    icon: getIconForCategory(category),
    tags: api.Categories,
    isActive: api.IsActive,
    isFavorite: api.IsFavourite,
    timeWindow: {
      start: api.Beggining,
      end: api.End,
    },
    lastCampaignName: api.LastCampaignName,
    imageUrl: api.ImageUrl,
    imageUrlMobile: api.ImageUrlMobile || generateMobileImageUrl(api.ImageUrl),
  };
};

// Transform preview lead to Market client
const transformClient = (lead: PreviewLeadFromOpportunity): MarketClient => ({
  id: lead.id || `temp-${lead.documentNumber}`,
  name: lead.name,
  email: lead.email,
  phone: lead.phone,
  segment: lead.source || "General",
  currentProduct: lead.product?.length > 0 ? lead.product[0] : "Sin producto",
  score: Math.min(100, Math.max(0, lead.value || 50)),
  age: lead.Age,
  gender: lead.Gender,
  documentNumber: lead.documentNumber,
  documentType: lead.DocumentType,
  additionalInfo: lead.AdditionalInfo || {},
  opportunityId: lead.OpportunityId.toString(),
  alreadyLoaded: lead.AlreadyLoaded,
  lastCampaignName: lead.LastCampaignName,
});

const getIconForCategory = (category: OpportunityCategory): string => {
  const icons: Record<OpportunityCategory, string> = {
    birthday: "🎂",
    "cross-sell-obligatoria": "📋",
    "cross-sell-voluntaria": "✋",
    "cross-sell-seguros": "🛡️",
    "cross-sell-fics": "📈",
    retention: "🔒",
    reactivation: "♻️",
    campaign: "📣",
    "ai-recommendation": "🤖",
    "churn-risk": "🚨",
    "life-events": "🎉",
  };
  return icons[category] || "💼";
};

// ============ PUBLIC API METHODS ============

/**
 * Get all opportunities for the current advisor
 */
export const fetchOpportunities = async (): Promise<MarketOpportunity[]> => {
  try {
    console.log("📡 marketDaliApi: Calling getOpportunitySummary...");
    const apiOpportunities = await getOpportunitySummary();
    console.log("📡 marketDaliApi: Raw API response:", apiOpportunities);
    const transformed = apiOpportunities.map(transformOpportunity);
    console.log("📡 marketDaliApi: Transformed opportunities:", transformed);
    return transformed;
  } catch (error) {
    console.error("Error fetching opportunities:", error);
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
    console.error("Error fetching clients for opportunity:", error);
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
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

/**
 * Load selected clients as leads in the lead manager
 * @param opportunityId - The opportunity ID
 * @param clients - Array of clients with documentNumber and documentType to load
 */
export const loadClientsAsLeads = async (
  opportunityId: string,
  clients: Array<{ documentNumber: number; documentType: string }>,
): Promise<{ success: boolean; count: number }> => {
  try {
    const result = await loadLeadsFromOpportunity(parseInt(opportunityId), clients);
    return { success: true, count: result.length };
  } catch (error) {
    console.error("Error loading clients as leads:", error);
    throw error;
  }
};

/**
 * Send bulk email to selected clients (stub - ready for backend connection)
 */
export const sendBulkEmail = async (clientIds: string[], opportunityId: string): Promise<{ success: boolean }> => {
  // TODO: Connect to real email API
  console.log("📧 Sending bulk email to clients:", clientIds, "from opportunity:", opportunityId);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
  return { success: true };
};

/**
 * Send bulk WhatsApp to selected clients (stub - ready for backend connection)
 */
export const sendBulkWhatsApp = async (clientIds: string[], opportunityId: string): Promise<{ success: boolean }> => {
  // TODO: Connect to real WhatsApp API
  console.log("💬 Sending bulk WhatsApp to clients:", clientIds, "from opportunity:", opportunityId);
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
  return { success: true };
};
