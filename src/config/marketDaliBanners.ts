import { OpportunityCategory } from "@/types/marketDali";
import bannerCumple from "@/assets/banner-cumple.png";

export interface BannerConfig {
  image?: string;
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
    gradient: 'from-blue-500/90 to-indigo-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'retention': {
    gradient: 'from-green-500/90 to-emerald-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'reactivation': {
    gradient: 'from-orange-500/90 to-amber-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'campaign': {
    gradient: 'from-purple-500/90 to-violet-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'ai-recommendation': {
    gradient: 'from-cyan-500/90 to-teal-600/90',
    overlayOpacity: 'bg-background/10',
  },
  'churn-risk': {
    gradient: 'from-red-500/90 to-rose-700/90',
    overlayOpacity: 'bg-background/10',
  },
  'life-events': {
    gradient: 'from-yellow-500/90 to-orange-500/90',
    overlayOpacity: 'bg-background/10',
  },
};

export const getCategoryBanner = (category: OpportunityCategory): BannerConfig => {
  return CATEGORY_BANNERS[category] || CATEGORY_BANNERS['campaign'];
};
