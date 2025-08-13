export interface UserGamificationProfile {
  userId: string;
  userName: string;
  level: GamificationLevel;
  totalPoints: number;
  weeklyPoints: number;
  monthlyPoints: number;
  currentRank: number;
  leadsManaged: number;
  averageResponseTime: number; // in hours
  conversionRate: number; // percentage
  weeklyActivity: number; // days active this week
  chatDaliUsage: number;
  chatDaliDailyLimit: number;
  chatDaliUsedToday: number;
  createdAt: string;
  updatedAt: string;
}

export interface GamificationLevel {
  id: string;
  name: string;
  icon: string;
  color: string;
  pointsRequired: number;
  order: number;
}

export interface GamificationMetric {
  id: string;
  name: string;
  value: number;
  maxValue?: number;
  points: number;
  maxPointsPerDay?: number;
  description: string;
  icon: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  achievement: Achievement;
  earnedAt: string;
  points: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: 'leads' | 'activity' | 'performance' | 'chat';
  points: number;
  requirements: AchievementRequirement[];
}

export interface AchievementRequirement {
  metric: string;
  operator: 'gte' | 'lte' | 'eq';
  value: number;
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
}

export interface GamificationRanking {
  rank: number;
  userId: string;
  userName: string;
  userPhoto?: string;
  level: GamificationLevel;
  totalPoints: number;
  weeklyPoints: number;
  isCurrentUser: boolean;
}

export interface GamificationStats {
  totalUsers: number;
  averagePoints: number;
  topPerformer: {
    userId: string;
    userName: string;
    points: number;
  };
  weeklyLeader: {
    userId: string;
    userName: string;
    weeklyPoints: number;
  };
}

export interface ProgressNotification {
  id: string;
  type: 'level_up' | 'achievement' | 'limit_warning' | 'limit_reached';
  title: string;
  message: string;
  icon: string;
  color: string;
  timestamp: string;
}