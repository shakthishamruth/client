import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Trophy, Flame, Code2, Calendar, TrendingUp, Target, Loader2, Zap, Award, ChevronDown, Activity, Brain, Sparkles, Eye, Copy, Check, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, UserProfile, Submission, Problem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { SkillDNARadar } from "@/components/SkillDNARadar";
import { useLocation } from "react-router-dom";

interface ProfileAnalytics {
  problemSolvingIntelligence: number;
  successRate: number;
  firstAttemptAccuracy: number;
  retryIntelligence: number;
  speedPercentile: number;
  totalSolved?: number;
  monthlyGrowth?: number;
}

export default function Profile() {
  const { user } = useAuth();
  const location = useLocation();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
  const [allProblems, setAllProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [profileResponse, submissionsResponse, analyticsResponse, problemsResponse] = await Promise.all([
          api.getUserProfile(user.userId),
          api.getUserSubmissions(user.userId),
          fetch(`http://localhost:5000/api/user/profile-analytics/${user.userId}`).then(res => res.json()),
          api.getProblems(user.userId)
        ]);
        setProfileData(profileResponse);
        setSubmissions(submissionsResponse.submissions);
        setAnalytics(analyticsResponse.success ? analyticsResponse.data : null);
        setAllProblems(problemsResponse.problems || problemsResponse);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // Handle hash navigation
  useEffect(() => {
    if (location.hash && profileData) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash, profileData]);

  if (loading) {
    return (
      <MainLayout title="Profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !profileData) {
    return (
      <MainLayout title="Profile">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || "No profile data"}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  const { basicInfo, problemStats, contestStats, leaderboard, activity, calendar } = profileData;
  
  // Calculate total problems by difficulty
  const totalEasy = allProblems.filter(p => p.difficulty === 'beginner').length;
  const totalMedium = allProblems.filter(p => p.difficulty === 'intermediate').length;
  const totalHard = allProblems.filter(p => p.difficulty === 'expert').length;
  
  const totalProblems = (problemStats.difficultyStats?.beginner || 0) + 
                        (problemStats.difficultyStats?.intermediate || 0) + 
                        (problemStats.difficultyStats?.expert || 0);
  
  const percentile = leaderboard.rank ? Math.max(1, Math.min(100, Math.round((1 - leaderboard.rank / 10000) * 100))) : 50;
  const momentumScore = Math.round((activity.activeDays * 2) + (totalProblems * 5) + (contestStats.totalScore / 10));
  
  const skillTags = [
    problemStats.difficultyStats?.expert > 10 ? "Expert Solver" : null,
    activity.activeDays > 30 ? "Consistent Coder" : null,
    Object.keys(problemStats.languageStats)[0] ? `${Object.keys(problemStats.languageStats)[0]} Pro` : null
  ].filter(Boolean);

  const solvedSubmissions = submissions.filter(s => s.status === 'SOLVED');
  const attemptedSubmissions = submissions.filter(s => s.status === 'ATTEMPTED');
  const avgRetries = attemptedSubmissions.length > 0 ? Math.round(attemptedSubmissions.length / solvedSubmissions.length * 10) / 10 : 0;

  // Get top language and sorted language entries
  const languageEntries = Object.entries(problemStats.languageStats).sort(([,a], [,b]) => b - a);
  const topLanguage = languageEntries[0]?.[0] || 'None';
  const totalLanguageCount = Object.values(problemStats.languageStats).reduce((sum, count) => sum + count, 0);

  const handleViewCode = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowCodeModal(true);
  };

  const getHeatmapColor = (count: number) => {
    if (count === 0) return "bg-secondary/30";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    if (count === 3) return "bg-primary/70";
    return "bg-primary";
  };

  const getRankColor = () => {
    if (percentile >= 95) return "from-amber-400 to-yellow-500";
    if (percentile >= 90) return "from-slate-300 to-slate-400";
    if (percentile >= 80) return "from-orange-400 to-amber-600";
    return "from-blue-400 to-indigo-500";
  };

  const achievements = [
    { name: "First Blood", desc: "Solved first problem", icon: "🎯", earned: totalProblems > 0, rarity: "Common" },
    { name: "Streak Master", desc: "7 day streak", icon: "🔥", earned: activity.activeDays >= 7, rarity: "Rare" },
    { name: "Speed Demon", desc: "Fast solver", icon: "⚡", earned: (analytics?.successRate || 0) > 70, rarity: "Epic" },
    { name: "Century", desc: "100 problems solved", icon: "💯", earned: totalProblems >= 100, rarity: "Legendary" },
    { name: "Expert Level", desc: "10+ expert problems", icon: "🏆", earned: (problemStats.difficultyStats?.expert || 0) >= 10, rarity: "Epic" },
    { name: "Polyglot", desc: "3+ languages", icon: "🌐", earned: Object.keys(problemStats.languageStats).length >= 3, rarity: "Rare" },
  ];

  return (
    <MainLayout title="Profile">
      <div className="space-y-8 pb-12">
        
        {/* 1. PROFILE HEADER */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
          <div className="flex flex-col md:flex-row items-start gap-6">
            
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border border-slate-200">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${basicInfo.userId}`} />
                <AvatarFallback className="text-lg font-semibold text-slate-700">{basicInfo.userId.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{basicInfo.userId}</h1>
                <p className="text-slate-600 text-sm mt-1">Software Engineer • DSA Enthusiast</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillTags.map((tag, i) => (
                    <Badge key={i} variant="outline" className="text-xs px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-8 ml-auto">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">#{leaderboard.rank || 'N/A'}</div>
                <div className="text-sm text-slate-600">Global Rank</div>
                <div className="text-xs text-slate-500 mt-1">Top {percentile}%</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-semibold text-emerald-600">{momentumScore}</div>
                <div className="text-sm text-slate-600">Momentum Score</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span>
                    {analytics?.monthlyGrowth ? 
                      `${analytics.monthlyGrowth > 0 ? '+' : ''}${analytics.monthlyGrowth}%` : 
                      'No data'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. SKILL DNA & STREAK STATS */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Skill DNA Chart */}
          <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Skill DNA</h2>
              </div>
              <Badge variant="outline" className="text-xs">
                Data-Driven
              </Badge>
            </div>

            <div className="h-80">
              <SkillDNARadar 
                data={{
                  solved_easy: problemStats.difficultyStats?.beginner || 0,
                  solved_medium: problemStats.difficultyStats?.intermediate || 0,
                  solved_hard: problemStats.difficultyStats?.expert || 0,
                  total_easy: totalEasy,
                  total_medium: totalMedium,
                  total_hard: totalHard,
                  total_submissions: submissions.length,
                  daily_submission_log: calendar?.data || [],
                  streak_history: {
                    current_streak: activity.activeDays,
                    max_streak: activity.activeDays
                  },
                  language_usage_stats: problemStats.languageStats,
                  avg_attempts_per_problem: avgRetries,
                  contest_data: contestStats.totalScore > 0 ? {
                    contest_start_time: Date.now() - 7200000,
                    contest_duration: 7200000,
                    problems_solved: Array.from({ length: Math.min(contestStats.totalScore / 100, 5) }, (_, i) => ({
                      solve_timestamp: Date.now() - 7200000 + (i + 1) * 1200000,
                      attempts: Math.floor(Math.random() * 3) + 1
                    }))
                  } : undefined
                }}
                className="h-full"
              />
            </div>
          </div>

          {/* Streak Stats Panel */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
            <div className="flex items-center gap-2 mb-6">
              <Flame className="h-5 w-5 text-orange-500" />
              <h3 className="text-lg font-semibold text-slate-900">Activity Stats</h3>
            </div>
            
            <div className="space-y-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-semibold text-orange-600">{activity.activeDays}</div>
                <div className="text-sm text-slate-600 mt-1">Current Streak</div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600">Active Days</span>
                  <span className="text-slate-900 font-medium">{activity.activeDays}/365</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((activity.activeDays / 365) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="text-center">
                  <div className="text-xl font-semibold text-slate-900">{analytics?.totalSolved || 0}</div>
                  <div className="text-xs text-slate-600 mt-1">Solved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-slate-900">{analytics?.successRate || 0}%</div>
                  <div className="text-xs text-slate-600 mt-1">Success</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-semibold text-slate-900">{contestStats.totalScore}</div>
                  <div className="text-xs text-slate-600 mt-1">Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ACTIVITY HEATMAP */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h2 className="text-lg font-semibold text-slate-900">Activity Heatmap</h2>
              <Badge variant="outline" className="ml-2 text-xs">
                {new Date().getFullYear()}
              </Badge>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              
              <span>Current: {activity.activeDays} days</span>
              <span>Max streak: {activity.activeDays} days</span>
            </div>
          </div>
          
          {/* Heatmap Grid - Month-by-Month Layout */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max">
              {(() => {
                const currentYear = new Date().getFullYear();
                const submissionMap = {};
                calendar?.data?.forEach(item => {
                  submissionMap[item.date] = item.count || 0;
                });
                
                const getColor = (count) => {
                  if (count === 0) return "bg-slate-100";
                  if (count <= 2) return "bg-slate-300";
                  if (count <= 6) return "bg-slate-600";
                  return "bg-slate-900";
                };
                
                return Array.from({ length: 12 }, (_, monthIndex) => {
                  const monthStart = new Date(currentYear, monthIndex, 1);
                  const monthEnd = new Date(currentYear, monthIndex + 1, 0);
                  const daysInMonth = monthEnd.getDate();
                  const startDayOfWeek = monthStart.getDay();
                  const mondayOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
                  
                  // Calculate weeks needed for this month only
                  const weeksNeeded = Math.ceil((daysInMonth + mondayOffset) / 7);
                  
                  // Create isolated grid for this month: 7 rows x weeksNeeded columns
                  const monthMatrix = Array.from({ length: 7 }, () => Array(weeksNeeded).fill(null));
                  
                  // Fill grid with dates belonging ONLY to this month
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateKey = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const count = submissionMap[dateKey] || 0;
                    
                    // Reset positioning for each month - no carryover from previous month
                    const dayPosition = mondayOffset + (day - 1);
                    const weekIndex = Math.floor(dayPosition / 7);
                    const dayOfWeekIndex = dayPosition % 7;
                    
                    // Only place if within this month's grid boundaries
                    if (weekIndex < weeksNeeded && dayOfWeekIndex < 7) {
                      monthMatrix[dayOfWeekIndex][weekIndex] = { date: dateKey, count };
                    }
                  }
                  
                  return (
                    <div key={monthIndex} className="flex flex-col">
                      <div className="text-xs text-muted-foreground mb-2 text-center font-medium">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex]}
                      </div>
                      <div className="flex flex-col gap-1">
                        {monthMatrix.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex gap-1">
                            {row.map((cell, colIndex) => {
                              if (!cell) {
                                return (
                                  <div 
                                    key={colIndex} 
                                    className="h-3 w-3 rounded-sm bg-transparent" 
                                  />
                                );
                              }
                              
                              const { date, count } = cell;
                              return (
                                <div 
                                  key={colIndex} 
                                  className={cn(
                                    "h-3 w-3 rounded-sm transition-all hover:ring-2 ring-primary cursor-pointer",
                                    getColor(count)
                                  )} 
                                  title={`${date}: ${count} submissions`} 
                                />
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-slate-600">
            <span>Less</span>
            {[0, 1, 3, 7].map((level, i) => (
              <div 
                key={i} 
                className={cn(
                  "h-3 w-3 rounded-sm",
                  level === 0 ? "bg-slate-100" :
                  level === 1 ? "bg-slate-300" :
                  level === 3 ? "bg-slate-600" :
                  "bg-slate-900"
                )} 
                title={`${level}${level === 7 ? '+' : level === 1 ? '-2' : level === 3 ? '-6' : ''} submissions`}
              />
            ))}
            <span>More</span>
          </div>
        </div>

        {/* 4. PROBLEM-SOLVING INTELLIGENCE */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
          <div className="flex items-center gap-2 mb-6">
            <Target className="h-5 w-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-slate-900">Problem-Solving Intelligence</h2>
          </div>

          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-sm transition-all duration-300 cursor-pointer group">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" strokeDasharray={`${analytics?.problemSolvingIntelligence || 0}, 100`} strokeWidth="3" fill="none" stroke="currentColor" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">{analytics?.problemSolvingIntelligence || 0}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Problem-Solving</div>
              <div className="text-xs text-slate-500 mt-1">Eventually solved</div>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-sm transition-all duration-300 cursor-pointer group">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-green-500" strokeDasharray={`${analytics?.successRate || 0}, 100`} strokeWidth="3" fill="none" stroke="currentColor" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">{analytics?.successRate || 0}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Success Rate</div>
              <div className="text-xs text-slate-500 mt-1">Submissions solved</div>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-sm transition-all duration-300 cursor-pointer group">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-purple-500" strokeDasharray={`${analytics?.firstAttemptAccuracy || 0}, 100`} strokeWidth="3" fill="none" stroke="currentColor" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">{analytics?.firstAttemptAccuracy || 0}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">First Attempt</div>
              <div className="text-xs text-slate-500 mt-1">Solved on first try</div>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-sm transition-all duration-300 cursor-pointer group">
              <div className="text-2xl font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{analytics?.retryIntelligence || 0}</div>
              <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Avg Retries</div>
              <div className="text-xs text-slate-500 mt-1">Before success</div>
            </div>

            <div className="text-center p-4 bg-slate-50 rounded-lg hover:bg-slate-100 hover:shadow-sm transition-all duration-300 cursor-pointer group">
              <div className="relative w-16 h-16 mx-auto mb-2">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeDasharray="100, 100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-orange-500" strokeDasharray={`${analytics?.speedPercentile || 0}, 100`} strokeWidth="3" fill="none" stroke="currentColor" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-900">{analytics?.speedPercentile || 0}%</span>
                </div>
              </div>
              <div className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Speed</div>
              <div className="text-xs text-slate-500 mt-1">Faster than others</div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4 flex items-center gap-2 text-slate-700">
              <Activity className="h-4 w-4" />
              Difficulty Journey
            </h3>
            <div className="flex justify-between">
              {[
                { label: "Beginner", count: problemStats.difficultyStats?.beginner || 0, color: "text-emerald-600" },
                { label: "Intermediate", count: problemStats.difficultyStats?.intermediate || 0, color: "text-amber-600" },
                { label: "Expert", count: problemStats.difficultyStats?.expert || 0, color: "text-red-600" }
              ].map((stage, i) => (
                <div key={i} className="text-center">
                  <div className={cn("text-2xl font-semibold mb-1", stage.color)}>
                    {stage.count}
                  </div>
                  <div className="text-sm font-medium text-slate-700">{stage.label}</div>
                  <div className="text-xs text-slate-500">{stage.count} solved</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. ACHIEVEMENTS */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
          <div className="flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((ach, i) => (
              <div key={i} className={cn(
                "relative rounded-lg border p-4 text-center transition-all",
                ach.earned 
                  ? "bg-slate-50 border-slate-200" 
                  : "bg-slate-50/50 border-slate-100 opacity-50"
              )}>
                {!ach.earned && (
                  <div className="absolute top-2 right-2">
                    <Lock className="h-3 w-3 text-slate-400" />
                  </div>
                )}
                <div className={cn(
                  "text-3xl mb-2",
                  !ach.earned && "grayscale"
                )}>{ach.icon}</div>
                <div className={cn(
                  "font-medium text-sm",
                  ach.earned ? "text-slate-900" : "text-slate-500"
                )}>{ach.name}</div>
                <div className="text-xs text-slate-500 mt-1">{ach.desc}</div>
                <div className="text-xs text-slate-400 mt-2 font-medium">{ach.rarity}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
          <div className="flex items-center gap-2 mb-6">
            <Code2 className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-semibold text-slate-900">Language Breakdown</h2>
          </div>

          {/* Top Language Highlight */}
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-amber-500" />
                <div>
                  <div className="text-sm font-medium text-slate-600">Top Language</div>
                  <div className="text-xl font-semibold text-slate-900">{topLanguage}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-slate-900">{languageEntries[0]?.[1] || 0}</div>
                <div className="text-sm text-slate-600">problems solved</div>
              </div>
            </div>
          </div>

          {/* Other Languages */}
          <div className="space-y-4">
            {languageEntries.slice(1).map(([language, count]) => {
              const percentage = totalLanguageCount > 0 ? (count / totalLanguageCount) * 100 : 0;
              return (
                <div key={language} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{language}</span>
                    <span className="font-medium text-slate-700">{count} problems</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Submissions */}
        <div id="recent-submissions" className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:border-slate-300">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="h-5 w-5 text-teal-600" />
            <h2 className="text-lg font-semibold text-slate-900">Recent Submissions</h2>
          </div>
          
          <div className="space-y-3">
            {submissions.slice(0, 10).map((submission, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn("w-3 h-3 rounded-full", 
                    submission.status === 'SOLVED' ? "bg-emerald-500" : 
                    submission.status === 'ATTEMPTED' ? "bg-red-500" : "bg-slate-400"
                  )} />
                  <div>
                    <div className="font-medium text-slate-900">{submission.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">{submission.language}</Badge>
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        submission.status === 'SOLVED' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        submission.status === 'ATTEMPTED' ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-slate-50 text-slate-700 border-slate-200"
                      )}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewCode(submission)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Code Viewer Modal */}
        <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between pr-8">
                <div className="flex items-center gap-3">
                  <Code2 className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-lg font-bold">{selectedSubmission?.title}</div>
                    <div className="text-sm font-normal text-muted-foreground mt-0.5">
                      {selectedSubmission?.language} • {selectedSubmission?.status === 'SOLVED' ? 'Solved' : 'Attempted'}
                    </div>
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              {/* Submission Info */}
              <div className="flex items-center gap-4 px-1">
                <Badge variant="outline" className={cn(
                  "text-xs",
                  selectedSubmission?.status === 'SOLVED' 
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400" 
                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400"
                )}>
                  {selectedSubmission?.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedSubmission?.passedCount}/{selectedSubmission?.totalCount} test cases passed
                </span>
                <span className="text-sm text-muted-foreground ml-auto">
                  {selectedSubmission?.submittedAt && new Date(selectedSubmission.submittedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Code Display */}
              <div className="flex-1 relative rounded-lg border-2 border-blue-500 bg-secondary/30 overflow-hidden">
                <div className="absolute top-3 right-3 z-10">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => {
                      if (selectedSubmission?.submittedCode) {
                        navigator.clipboard.writeText(selectedSubmission.submittedCode);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                
                <pre className="h-full overflow-auto p-4 text-sm font-mono">
                  <code className={`language-${selectedSubmission?.language}`}>
                    {selectedSubmission?.submittedCode}
                  </code>
                </pre>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </MainLayout>
  );
}
