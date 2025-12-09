import { OpportunityCategory } from "@/types/marketDali";

export interface BannerConfig {
  image: string;
  mobileImage: string;
  gradient: string;
  overlayOpacity: string;
}

const AZURE_BASE_URL = "https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons";

export const CATEGORY_BANNERS: Record<OpportunityCategory, BannerConfig> = {
  birthday: {
    image: `${AZURE_BASE_URL}/cumple.png`,
    mobileImage: `${AZURE_BASE_URL}/cumplexs.png`,
    gradient: "from-pink-500/80 to-rose-600/80",
    overlayOpacity: "opacity-100",
  },
  "cross-sell": {
    image: `${AZURE_BASE_URL}/cross.png`,
    mobileImage: `${AZURE_BASE_URL}/crossxs.png`,
    gradient: "from-blue-500/90 to-indigo-600/90",
    overlayOpacity: "bg-background/10",
  },
  "cross-sell-obligatoria": {
    image: `${AZURE_BASE_URL}/crossfpob.png`,
    mobileImage: `${AZURE_BASE_URL}/crossfpobxs.png`,
    gradient: "from-blue-600/90 to-blue-800/90",
    overlayOpacity: "bg-background/10",
  },
  "cross-sell-voluntaria": {
    image: `${AZURE_BASE_URL}/crossfvol.png`,
    mobileImage: `${AZURE_BASE_URL}/crossfvolxs.png`,
    gradient: "from-indigo-500/90 to-indigo-700/90",
    overlayOpacity: "bg-background/10",
  },
  "cross-sell-seguros": {
    image: `${AZURE_BASE_URL}/cross-seguros.png`,
    mobileImage: `${AZURE_BASE_URL}/cross-segurosxs.png`,
    gradient: "from-sky-500/90 to-sky-700/90",
    overlayOpacity: "bg-background/10",
  },
  "cross-sell-fics": {
    image: `${AZURE_BASE_URL}/cross-fics.png`,
    mobileImage: `${AZURE_BASE_URL}/cross-ficsxs.png`,
    gradient: "from-violet-500/90 to-violet-700/90",
    overlayOpacity: "bg-background/10",
  },
  retention: {
    image: `${AZURE_BASE_URL}/retention.png`,
    mobileImage: `${AZURE_BASE_URL}/retentionxs.png`,
    gradient: "from-green-500/90 to-emerald-600/90",
    overlayOpacity: "bg-background/10",
  },
  reactivation: {
    image: `${AZURE_BASE_URL}/reactivation.png`,
    mobileImage: `${AZURE_BASE_URL}/reactivationxs.png`,
    gradient: "from-orange-500/90 to-amber-600/90",
    overlayOpacity: "bg-background/10",
  },
  campaign: {
    image: `${AZURE_BASE_URL}/campaign.png`,
    mobileImage: `${AZURE_BASE_URL}/campaignxs.png`,
    gradient: "from-purple-500/90 to-violet-600/90",
    overlayOpacity: "bg-background/10",
  },
  "ai-recommendation": {
    image: `${AZURE_BASE_URL}/ai-recommendation.png`,
    mobileImage: `${AZURE_BASE_URL}/ai-recommendationxs.png`,
    gradient: "from-cyan-500/90 to-teal-600/90",
    overlayOpacity: "bg-background/10",
  },
  "churn-risk": {
    image: `${AZURE_BASE_URL}/churn-risk.png`,
    mobileImage: `${AZURE_BASE_URL}/churn-riskxs.png`,
    gradient: "from-red-500/90 to-rose-700/90",
    overlayOpacity: "bg-background/10",
  },
  "life-events": {
    image: `${AZURE_BASE_URL}/life-events.png`,
    mobileImage: `${AZURE_BASE_URL}/life-eventsxs.png`,
    gradient: "from-yellow-500/90 to-orange-500/90",
    overlayOpacity: "bg-background/10",
  },
};

export const getCategoryBanner = (category: OpportunityCategory): BannerConfig => {
  return CATEGORY_BANNERS[category] || CATEGORY_BANNERS["campaign"];
};
