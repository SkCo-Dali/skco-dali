import { OpportunityCategory } from "@/types/marketDali";
import bannerCumple from "@/assets/banner-cumple.png";
import bannerCrossSell from "@/assets/banner-cross-sell.png";
import bannerRetention from "@/assets/banner-retention.png";
import bannerReactivation from "@/assets/banner-reactivation.png";
import bannerCampaign from "@/assets/banner-campaign.png";
import bannerAiRecommendation from "@/assets/banner-ai-recommendation.png";
import bannerChurnRisk from "@/assets/banner-churn-risk.png";
import bannerLifeEvents from "@/assets/banner-life-events.png";

export interface BannerConfig {
  image: string;
  gradient: string;
  overlayOpacity: string;
}

export const CATEGORY_BANNERS: Record<OpportunityCategory, BannerConfig> = {
  'birthday': {
    image: bannerCumple,
    gradient: 'from-pink-500/80 to-rose-600/80',
    overlayOpacity: 'bg-background/20',
  },
  'cross-sell': {
    image: bannerCrossSell,
    gradient: 'from-blue-500/90 to-indigo-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'retention': {
    image: bannerRetention,
    gradient: 'from-green-500/90 to-emerald-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'reactivation': {
    image: bannerReactivation,
    gradient: 'from-orange-500/90 to-amber-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'campaign': {
    image: bannerCampaign,
    gradient: 'from-purple-500/90 to-violet-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'ai-recommendation': {
    image: bannerAiRecommendation,
    gradient: 'from-cyan-500/90 to-teal-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'churn-risk': {
    image: bannerChurnRisk,
    gradient: 'from-red-500/90 to-rose-700/90',
    overlayOpacity: 'bg-background/10',
  },
  'life-events': {
    image: bannerLifeEvents,
    gradient: 'from-yellow-500/90 to-orange-500/90',
    overlayOpacity: 'bg-background/10',
  },
};

export const getCategoryBanner = (category: OpportunityCategory): BannerConfig => {
  return CATEGORY_BANNERS[category] || CATEGORY_BANNERS['campaign'];
};
