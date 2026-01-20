import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Trophy, 
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Code2,
  TrendingUp,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, LeaderboardResponse } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import jsPDF from 'jspdf';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalScore: number;
  isCurrentUser?: boolean;
  problemsSolved?: number;
  mostUsedLanguage?: string;
}

interface EnrichedLeaderboardData {
  page: number;
  limit: number;
  totalUsers: number;
  totalPages: number;
  leaderboard: LeaderboardEntry[];
}

const languageColors: Record<string, string> = {
  javascript: "bg-amber-50 text-amber-700 border-amber-200",
  python: "bg-blue-50 text-blue-700 border-blue-200",
  java: "bg-red-50 text-red-700 border-red-200",
  cpp: "bg-purple-50 text-purple-700 border-purple-200",
  c: "bg-slate-50 text-slate-700 border-slate-200",
  default: "bg-slate-50 text-slate-600 border-slate-200"
};

export default function Leaderboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("alltime");
  const [currentPage, setCurrentPage] = useState(1);
  const [leaderboardData, setLeaderboardData] = useState<EnrichedLeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const cacheKey = `leaderboard_${currentPage}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        setLeaderboardData(JSON.parse(cached));
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await api.getLeaderboard(currentPage, itemsPerPage);
        
        const enrichedLeaderboard = await Promise.all(
          data.leaderboard.map(async (entry) => {
            try {
              const profile = await api.getUserProfile(entry.userId);
              const languageStats = profile.problemStats.languageStats;
              const mostUsedLanguage = Object.keys(languageStats).length > 0 
                ? Object.keys(languageStats).reduce((a, b) => 
                    languageStats[a] > languageStats[b] ? a : b
                  )
                : null;
              
              return {
                ...entry,
                isCurrentUser: user ? entry.userId === user.userId : false,
                problemsSolved: profile.problemStats.totalSolved,
                mostUsedLanguage
              };
            } catch {
              return {
                ...entry,
                isCurrentUser: user ? entry.userId === user.userId : false,
                problemsSolved: 0,
                mostUsedLanguage: null
              };
            }
          })
        );
        
        const enrichedData = { ...data, leaderboard: enrichedLeaderboard };
        setLeaderboardData(enrichedData);
        sessionStorage.setItem(cacheKey, JSON.stringify(enrichedData));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [currentPage, user]);

  if (loading) {
    return (
      <MainLayout title="Leaderboard">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Leaderboard">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  if (!leaderboardData) return null;

  const { leaderboard, totalPages, totalUsers } = leaderboardData;

  // Find current user's rank
  const currentUserEntry = leaderboard.find(entry => entry.isCurrentUser);

  const handleDownload = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('DSA Course Leaderboard', 20, 20);
    
    // Date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Table headers
    doc.setFontSize(12);
    const headers = ['Rank', 'User', 'Problems', 'Language', 'Points'];
    let y = 50;
    
    headers.forEach((header, i) => {
      doc.text(header, 20 + (i * 35), y);
    });
    
    // Table data
    doc.setFontSize(10);
    leaderboard.forEach((entry, index) => {
      y += 10;
      doc.text(entry.rank.toString(), 20, y);
      doc.text(entry.userId.substring(0, 15), 55, y);
      doc.text((entry.problemsSolved || 0).toString(), 90, y);
      doc.text((entry.mostUsedLanguage || 'N/A').substring(0, 8), 125, y);
      doc.text(entry.totalScore.toString(), 160, y);
    });
    
    doc.save(`leaderboard-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleShare = async () => {
    const shareText = `Check out the DSA Course Leaderboard! 🏆\n\nTop 3:\n${leaderboard.slice(0, 3).map((entry, i) => `${i + 1}. ${entry.userId} - ${entry.totalScore} points`).join('\n')}\n\nJoin the competition!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DSA Course Leaderboard',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareText + `\n\n${window.location.href}`);
      alert('Leaderboard link copied to clipboard!');
    }
  };

  return (
    <MainLayout title="Leaderboard">
      <div className="min-h-screen bg-slate-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Performance Rankings</h1>
                <p className="text-slate-600 mt-1">Track progress and celebrate achievements across the community</p>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-slate-600 hover:text-slate-900"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-slate-600 hover:text-slate-900"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Participants</p>
                    <p className="text-xl font-semibold text-slate-900">{totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Top Score</p>
                    <p className="text-xl font-semibold text-slate-900">{leaderboard[0]?.totalScore.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
              {user && currentUserEntry && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Trophy className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Your Position</p>
                      <p className="text-xl font-semibold text-blue-900">#{currentUserEntry.rank}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-slate-100">
                  <TabsTrigger 
                    value="alltime" 
                    className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  >
                    All-Time Rankings
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Top 3 Section */}
          {leaderboard.length >= 3 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Top Performers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {leaderboard.slice(0, 3).map((entry, index) => {
                  const position = index + 1;
                  const isFirst = position === 1;
                  
                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        "bg-white rounded-2xl border p-6 transition-all",
                        isFirst 
                          ? "border-amber-200 bg-gradient-to-br from-amber-50 to-white shadow-lg" 
                          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      )}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative">
                          <Avatar className={cn(
                            "h-12 w-12 border-2",
                            isFirst ? "border-amber-300" : "border-slate-200"
                          )}>
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`} />
                            <AvatarFallback>{entry.userId[0].toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className={cn(
                            "absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                            position === 1 ? "bg-amber-500" : position === 2 ? "bg-slate-400" : "bg-orange-400"
                          )}>
                            {position}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{entry.userId}</h3>
                          <p className="text-sm text-slate-600">{entry.problemsSolved || 0} problems solved</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Score</span>
                          <span className={cn(
                            "text-lg font-bold",
                            isFirst ? "text-amber-600" : "text-slate-900"
                          )}>
                            {entry.totalScore.toLocaleString()}
                          </span>
                        </div>
                        {entry.mostUsedLanguage && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600">Primary Language</span>
                            <Badge className={cn(
                              "text-xs",
                              languageColors[entry.mostUsedLanguage?.toLowerCase().replace(/\+/g, 'p')] || languageColors.default
                            )}>
                              {entry.mostUsedLanguage}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Rankings Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Complete Rankings</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Participant
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Problems Solved
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-slate-600">
                      Language
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-medium text-slate-600">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaderboard.map((entry) => {
                    const langKey = entry.mostUsedLanguage?.toLowerCase().replace(/\+/g, 'p') || 'default';
                    const langColor = languageColors[langKey] || languageColors.default;
                    
                    return (
                      <tr
                        key={entry.userId}
                        className={cn(
                          "transition-colors hover:bg-slate-50",
                          entry.isCurrentUser && "bg-blue-50 border-l-4 border-l-blue-500"
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-semibold",
                              entry.rank <= 3 ? "text-slate-900" : "text-slate-600"
                            )}>
                              #{entry.rank}
                            </span>
                            {entry.rank === 1 && <Trophy className="h-4 w-4 text-amber-500" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-slate-200">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.userId}`} />
                              <AvatarFallback className="text-xs">{entry.userId[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-900">
                              {entry.userId}
                            </span>
                            {entry.isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">You</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {entry.problemsSolved || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {entry.mostUsedLanguage ? (
                            <Badge className={cn("text-xs", langColor)}>
                              {entry.mostUsedLanguage}
                            </Badge>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-sm font-semibold text-slate-900">
                            {entry.totalScore.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <span className="text-sm text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} participants
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="text-slate-600"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-slate-900 px-3">
                  {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="text-slate-600"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
