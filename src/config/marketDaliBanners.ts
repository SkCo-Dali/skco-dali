import { OpportunityCategory } from "@/types/marketDali";

export interface BannerConfig {
  image: string;
  gradient: string;
  overlayOpacity: string;
}

const AZURE_BASE_URL = "https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons";

export const CATEGORY_BANNERS: Record<OpportunityCategory, BannerConfig> = {
  'birthday': {
    image: `${AZURE_BASE_URL}/cumple.png`,
    gradient: 'from-pink-500/80 to-rose-600/80',
    overlayOpacity: 'bg-background/20',
  },
  'cross-sell': {
    image: `${AZURE_BASE_URL}/cross.png`,
    gradient: 'from-blue-500/90 to-indigo-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'retention': {
    image: `${AZURE_BASE_URL}/retention.png`,
    gradient: 'from-green-500/90 to-emerald-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'reactivation': {
    image: `${AZURE_BASE_URL}/reactivation.png`,
    gradient: 'from-orange-500/90 to-amber-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'campaign': {
    image: `${AZURE_BASE_URL}/campaign.png`,
    gradient: 'from-purple-500/90 to-violet-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'ai-recommendation': {
    image: `${AZURE_BASE_URL}/ai-recommendation.png`,
    gradient: 'from-cyan-500/90 to-teal-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'churn-risk': {
    image: `${AZURE_BASE_URL}/churn-risk.png`,
    gradient: 'from-red-500/90 to-rose-700/90',
    overlayOpacity: 'bg-background/10',
  },
  'life-events': {
    image: `${AZURE_BASE_URL}/life-events.png`,
    gradient: 'from-yellow-500/90 to-orange-500/90',
    overlayOpacity: 'bg-background/10',
  },
};

export const getCategoryBanner = (category: OpportunityCategory): BannerConfig => {
  return CATEGORY_BANNERS[category] || CATEGORY_BANNERS['campaign'];
};
