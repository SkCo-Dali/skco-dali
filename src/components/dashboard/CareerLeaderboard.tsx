import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, HelpCircle } from "lucide-react";
import careerBanner from "@/assets/career-banner.png";
import { useNavigate } from "react-router-dom";

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  isCurrentUser?: boolean;
}

interface CareerLeaderboardProps {
  topUsers?: LeaderboardEntry[];
  argentinaMeRanking?: number;
  japanRanking?: number;
}

export function CareerLeaderboard({
  topUsers = [
    { rank: 1, name: "María Camila Rojas", points: 135000 },
    { rank: 2, name: "Claudia Torres (Tú)", points: 112000, isCurrentUser: true },
    { rank: 3, name: "Sergio Ruiz", points: 107000 },
  ],
  argentinaMeRanking = 200,
  japanRanking = 50,
}: CareerLeaderboardProps) {
  const navigate = useNavigate();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold";
    if (rank === 1) return `${baseClasses} bg-green-500 text-white`;
    if (rank === 2) return `${baseClasses} bg-blue-500 text-white`;
    if (rank === 3) return `${baseClasses} bg-orange-500 text-white`;
    return baseClasses;
  };

  return (
    <Card className="overflow-hidden">
      {/* Banner Image */}
      <div className="relative h-32 w-full overflow-hidden">
        <img src={careerBanner} alt="Career Banner" className="w-full h-full object-cover" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <h3 className="font-semibold text-lg">La carrera de los mejores</h3>
        </div>

        {/* Top 3 Users */}
        <div className="space-y-2">
          {topUsers.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-3 rounded-lg ${
                entry.isCurrentUser ? "bg-blue-50" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={getRankBadge(entry.rank)}>
                  {entry.rank}
                </div>
                <span className="font-medium text-sm">{entry.name}</span>
              </div>
              <span className="font-bold text-sm">{entry.points.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Rankings */}
        <div className="space-y-3 pt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">Ranking general Argentina</span>
              <span className="text-lg">🇦🇷</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ¡Estás a <span className="font-semibold">{argentinaMeRanking}</span> posiciones del
              primer puesto!
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">Ranking general Japón</span>
              <span className="text-lg">🇯🇵</span>
            </div>
            <p className="text-sm text-muted-foreground">
              ¡Estás a <span className="font-semibold">{japanRanking}</span> posiciones del primer
              puesto!
            </p>
          </div>
        </div>

        {/* Help Link */}
        <button
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          onClick={() => {
            // Navigate to help or show modal
          }}
        >
          <HelpCircle className="w-4 h-4" />
          <span>¿Cómo mejorar tu ranking?</span>
        </button>

        {/* CTA Button */}
        <Button
          className="w-full bg-green-500 hover:bg-green-600 text-white"
          onClick={() => navigate("/gamification")}
        >
          Ir a la Carrera de los mejores
        </Button>
      </div>
    </Card>
  );
}
