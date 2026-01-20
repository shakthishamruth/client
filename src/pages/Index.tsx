import { MainLayout } from "@/components/layout/MainLayout";
import { WeeklyContestCard } from "@/components/dashboard/DailyChallengeCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { WeeklySnapshot } from "@/components/dashboard/WeeklySnapshot";
import { RecentSubmissions } from "@/components/dashboard/RecentSubmissions";
import { RecommendedProblems } from "@/components/dashboard/RecommendedProblems";
import { Code2, Trophy, Zap, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    problemsSolved: 0,
    globalRank: null as number | null,
    totalUsers: 0,
    points: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [profileData, leaderboardData] = await Promise.all([
          api.getUserProfile(user.userId),
          api.getLeaderboard(1, 100)
        ]);

        const currentUser = leaderboardData.leaderboard.find(entry => entry.userId === user.userId);
        
        setStats({
          problemsSolved: profileData.problemStats.totalSolved,
          globalRank: currentUser?.rank || null,
          totalUsers: leaderboardData.totalUsers,
          points: currentUser?.totalScore || 0
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const calculatePercentile = () => {
    if (!stats.globalRank || !stats.totalUsers) return "N/A";
    const percentile = ((stats.totalUsers - stats.globalRank) / stats.totalUsers * 100).toFixed(0);
    return `Top ${100 - Number(percentile)}%`;
  };

  return (
    <MainLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Hero Section - Weekly Contest */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyContestCard />
          </div>
          <div className="lg:col-span-1">
            <WeeklySnapshot />
          </div>
        </section>

        {/* Stats Grid */}
        {loading ? (
          <section className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Problems Solved"
              value={stats.problemsSolved}
              subtitle="Keep going!"
              icon={Code2}
            />
            <StatsCard
              title="Global Rank"
              value={stats.globalRank ? `#${stats.globalRank}` : "N/A"}
              subtitle={calculatePercentile()}
              icon={Trophy}
              variant="gold"
            />
            <StatsCard
              title="XP Earned"
              value={(stats.points * 10).toLocaleString()}
              subtitle={`${stats.points} points`}
              icon={Zap}
            />
          </section>
        )}

        {/* Content Grid */}
        <section className="grid gap-6 lg:grid-cols-2">
          <RecentSubmissions />
          <RecommendedProblems />
        </section>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
