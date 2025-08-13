import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  UserGamificationProfile, 
  GamificationRanking, 
  GamificationLevel,
  UserAchievement,
  GamificationStats,
  ProgressNotification
} from '@/types/gamification';

// Mock data for development
const mockLevels: GamificationLevel[] = [
  { id: '1', name: 'Bronce', icon: '🥉', color: '#CD7F32', pointsRequired: 0, order: 1 },
  { id: '2', name: 'Plata', icon: '🥈', color: '#C0C0C0', pointsRequired: 100, order: 2 },
  { id: '3', name: 'Oro', icon: '🥇', color: '#FFD700', pointsRequired: 250, order: 3 },
  { id: '4', name: 'Platino', icon: '💎', color: '#E5E4E2', pointsRequired: 500, order: 4 },
  { id: '5', name: 'Elite', icon: '👑', color: '#B8860B', pointsRequired: 1000, order: 5 },
];

const mockProfile: UserGamificationProfile = {
  userId: 'current-user',
  userName: 'Usuario Actual',
  level: mockLevels[1],
  totalPoints: 175,
  weeklyPoints: 45,
  monthlyPoints: 175,
  currentRank: 3,
  leadsManaged: 25,
  averageResponseTime: 2.5,
  conversionRate: 15.5,
  weeklyActivity: 5,
  chatDaliUsage: 8,
  chatDaliDailyLimit: 10,
  chatDaliUsedToday: 3,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockRankings: GamificationRanking[] = [
  {
    rank: 1,
    userId: 'user-1',
    userName: 'Ana García',
    level: mockLevels[2],
    totalPoints: 320,
    weeklyPoints: 85,
    isCurrentUser: false,
  },
  {
    rank: 2,
    userId: 'user-2',
    userName: 'Carlos Rodríguez',
    level: mockLevels[2],
    totalPoints: 280,
    weeklyPoints: 72,
    isCurrentUser: false,
  },
  {
    rank: 3,
    userId: 'current-user',
    userName: 'Usuario Actual',
    level: mockLevels[1],
    totalPoints: 175,
    weeklyPoints: 45,
    isCurrentUser: true,
  },
  {
    rank: 4,
    userId: 'user-4',
    userName: 'María López',
    level: mockLevels[1],
    totalPoints: 165,
    weeklyPoints: 38,
    isCurrentUser: false,
  },
  {
    rank: 5,
    userId: 'user-5',
    userName: 'José Martínez',
    level: mockLevels[1],
    totalPoints: 142,
    weeklyPoints: 29,
    isCurrentUser: false,
  },
];

export function useGamification() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserGamificationProfile | null>(null);
  const [rankings, setRankings] = useState<GamificationRanking[]>([]);
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [notifications, setNotifications] = useState<ProgressNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API loading
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfile(mockProfile);
        setRankings(mockRankings);
        setStats({
          totalUsers: 25,
          averagePoints: 145,
          topPerformer: {
            userId: 'user-1',
            userName: 'Ana García',
            points: 320,
          },
          weeklyLeader: {
            userId: 'user-1',
            userName: 'Ana García',
            weeklyPoints: 85,
          },
        });
        
        setError(null);
      } catch (err) {
        setError('Error al cargar datos de gamificación');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const getNextLevel = (currentLevel: GamificationLevel) => {
    const currentOrder = currentLevel.order;
    return mockLevels.find(level => level.order === currentOrder + 1);
  };

  const getProgressToNextLevel = () => {
    if (!profile) return { progress: 0, pointsNeeded: 0, nextLevel: null };
    
    const nextLevel = getNextLevel(profile.level);
    if (!nextLevel) return { progress: 100, pointsNeeded: 0, nextLevel: null };
    
    const pointsInCurrentLevel = profile.totalPoints - profile.level.pointsRequired;
    const pointsForNextLevel = nextLevel.pointsRequired - profile.level.pointsRequired;
    const progress = (pointsInCurrentLevel / pointsForNextLevel) * 100;
    const pointsNeeded = nextLevel.pointsRequired - profile.totalPoints;
    
    return { progress, pointsNeeded, nextLevel };
  };

  const recordChatDaliUsage = async () => {
    if (!profile) return false;
    
    if (profile.chatDaliUsedToday >= profile.chatDaliDailyLimit) {
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        type: 'limit_reached',
        title: 'Límite alcanzado',
        message: 'Has alcanzado el límite diario de Chat Dali',
        icon: '⚠️',
        color: 'text-yellow-600',
        timestamp: new Date().toISOString(),
      }]);
      return false;
    }

    // Update profile
    const updatedProfile = {
      ...profile,
      chatDaliUsedToday: profile.chatDaliUsedToday + 1,
      chatDaliUsage: profile.chatDaliUsage + 1,
      totalPoints: profile.totalPoints + 5,
      weeklyPoints: profile.weeklyPoints + 5,
    };

    setProfile(updatedProfile);

    // Check for notifications
    if (updatedProfile.chatDaliUsedToday === updatedProfile.chatDaliDailyLimit - 2) {
      setNotifications(prev => [...prev, {
        id: Date.now().toString(),
        type: 'limit_warning',
        title: 'Quedan 2 usos',
        message: 'Te quedan 2 usos de Chat Dali por hoy',
        icon: '💬',
        color: 'text-blue-600',
        timestamp: new Date().toISOString(),
      }]);
    }

    return true;
  };

  return {
    profile,
    rankings,
    stats,
    notifications,
    loading,
    error,
    levels: mockLevels,
    getNextLevel,
    getProgressToNextLevel,
    recordChatDaliUsage,
    setNotifications,
  };
}