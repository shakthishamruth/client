import { Trophy, TrendingUp, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api, LeaderboardEntry } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function WeeklySnapshot() {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard(1, 10);
        setTopUsers(data.leaderboard.slice(0, 3));
        
        const currentUser = data.leaderboard.find(entry => entry.userId === user?.userId);
        if (currentUser) {
          setUserRank(currentUser.rank);
          setUserPoints(currentUser.totalScore);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeaderboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow p-6 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-5 w-5 text-slate-600" />
        <h3 className="text-xs font-bold text-slate-900 tracking-wide">GREATEST OF ALL TIME</h3>
      </div>

      <div className="space-y-9 mb-6 flex-1">
        {topUsers.map((user) => (
          <div key={user.rank} className="flex items-center gap-3">
            <span className="w-8 text-sm font-semibold text-slate-500">#{user.rank}</span>
            <Avatar className="h-9 w-9">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.userId}`} />
              <AvatarFallback>{user.userId[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="flex-1 text-sm font-semibold text-slate-900">{user.userId}</span>
            <span className="text-sm font-medium text-slate-500">{user.totalScore} pts</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 pt-4 mt-auto">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Your Rank: <span className="font-bold text-slate-900">{userRank ? `#${userRank}` : 'N/A'}</span></span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-900">{userPoints} pts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
