import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Filter,
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useViewToggle } from "@/hooks/useViewToggle";

interface DSAProblem {
  problemId: string;
  title: string;
  isSolved: boolean;
}

interface DSASheet {
  beginner: Record<string, DSAProblem[]>;
  intermediate: Record<string, DSAProblem[]>;
  expert: Record<string, DSAProblem[]>;
}

const difficultyColors = {
  beginner: "bg-success text-success-foreground",
  intermediate: "bg-warning text-warning-foreground", 
  expert: "bg-destructive text-destructive-foreground",
};

export default function DSALevels() {
  const { user } = useAuth();
  const { isTopicsView, handleToggle } = useViewToggle();
  const [dsaSheet, setDsaSheet] = useState<DSASheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'expert'>('all');
  const [collapsedLevels, setCollapsedLevels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchDSASheet = async () => {
      if (!user) return;
      
      const cacheKey = `dsa_sheet_${user.userId}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        setDsaSheet(JSON.parse(cached));
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/user/dsa-sheet/${user.userId}`);
        if (!response.ok) throw new Error('Failed to fetch DSA sheet');
        
        const data = await response.json();
        setDsaSheet(data);
        sessionStorage.setItem(cacheKey, JSON.stringify(data));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load DSA sheet');
      } finally {
        setLoading(false);
      }
    };

    fetchDSASheet();
  }, [user]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getTotalStats = () => {
    const allProblems = [...Object.values(dsaSheet?.beginner || {}), ...Object.values(dsaSheet?.intermediate || {}), ...Object.values(dsaSheet?.expert || {})].flat();
    const solved = allProblems.filter(p => p.isSolved).length;
    return { total: allProblems.length, solved };
  };

  // Filter problems based on status
  const filterProblemsByStatus = (problems: DSAProblem[]) => {
    if (selectedStatus === 'all') return problems;
    return problems.filter(p => 
      selectedStatus === 'solved' ? p.isSolved : !p.isSolved
    );
  };

  // Toggle level collapse/expand
  const toggleLevel = (difficulty: string) => {
    setCollapsedLevels(prev => ({
      ...prev,
      [difficulty]: !prev[difficulty]
    }));
  };

  if (loading) {
    return (
      <MainLayout title="DSA Practice">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="DSA Practice">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!dsaSheet) return null;

  const stats = getTotalStats();

  // Render level sections
  const renderLevelSection = (difficulty: 'beginner' | 'intermediate' | 'expert') => {
    const topics = Object.entries(dsaSheet?.[difficulty] || {});
    const difficultyConfig = {
      beginner: { 
        label: 'Beginner', 
        color: 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200', 
        textColor: 'text-emerald-800', 
        progressColor: 'bg-emerald-500',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200'
      },
      intermediate: { 
        label: 'Intermediate', 
        color: 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200', 
        textColor: 'text-amber-800', 
        progressColor: 'bg-amber-500',
        badgeColor: 'bg-amber-100 text-amber-700 border-amber-200'
      },
      expert: { 
        label: 'Expert', 
        color: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200', 
        textColor: 'text-red-800', 
        progressColor: 'bg-red-500',
        badgeColor: 'bg-red-100 text-red-700 border-red-200'
      }
    };
    
    const allProblemsInLevel = topics.flatMap(([_, problems]) => problems);
    const filteredProblems = filterProblemsByStatus(allProblemsInLevel);
    const solvedInLevel = allProblemsInLevel.filter(p => p.isSolved).length;
    const progressPercentage = allProblemsInLevel.length > 0 
      ? Math.round((solvedInLevel / allProblemsInLevel.length) * 100) 
      : 0;

    const isLevelCollapsed = collapsedLevels[difficulty];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <button
          onClick={() => toggleLevel(difficulty)}
          className={cn(
            "w-full px-6 py-6 border-b border-slate-100 transition-all hover:shadow-sm",
            difficultyConfig[difficulty].color
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-2 rounded-lg border transition-colors",
                difficultyConfig[difficulty].badgeColor
              )}>
                {isLevelCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
              <div className="text-left">
                <h2 className={cn("text-2xl font-bold tracking-tight", difficultyConfig[difficulty].textColor)}>
                  {difficultyConfig[difficulty].label}
                </h2>
                <p className="text-slate-600 text-sm mt-1 font-medium">
                  {solvedInLevel} of {allProblemsInLevel.length} problems completed
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-3xl font-bold mb-2", difficultyConfig[difficulty].textColor)}>
                {progressPercentage}%
              </div>
              <div className="w-32">
                <Progress value={progressPercentage} className="h-3" />
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Progress
                </div>
              </div>
            </div>
          </div>
        </button>
        
        {!isLevelCollapsed && (
          <div className="divide-y divide-slate-100">
            {topics.map(([topicName, problems]) => {
              const filteredTopicProblems = filterProblemsByStatus(problems);
              if (filteredTopicProblems.length === 0) return null;
              
              const sectionKey = `${difficulty}-${topicName}`;
              const isExpanded = expandedSections[sectionKey];
              const solvedCount = problems.filter(p => p.isSolved).length;
              const topicProgress = Math.round((solvedCount / problems.length) * 100);

              return (
                <div key={topicName}>
                  <button
                    onClick={() => toggleSection(sectionKey)}
                    className="w-full px-6 py-4 hover:bg-slate-50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                        <h3 className="font-medium text-slate-900">{topicName}</h3>
                      </div>
                      <div className="text-sm text-slate-500">
                        {solvedCount}/{problems.length}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={topicProgress} className="w-20 h-1.5" />
                      <span className="text-sm font-medium text-slate-600 min-w-[35px] text-right">
                        {topicProgress}%
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="bg-slate-50/50 px-6 py-4">
                      <div className="space-y-2">
                        {filteredTopicProblems.map((problem) => (
                          <div
                            key={problem.problemId}
                            className="flex items-center gap-3 p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group"
                            onClick={() => window.open(`/ide/${problem.problemId}`, '_blank')}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {problem.isSolved ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-400" />
                              )}
                              <span className="text-sm font-medium text-slate-900 group-hover:text-slate-700">
                                {problem.title}
                              </span>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <MainLayout title="DSA Practice">
      <div className="min-h-screen bg-slate-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Progress Overview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">DSA Practice</h1>
                  <p className="text-slate-600 mt-1">Systematic approach to data structures and algorithms mastery</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{stats.solved}<span className="text-slate-400">/{stats.total}</span></div>
                  <div className="text-sm text-slate-500">problems completed</div>
                </div>
              </div>
              <div className="relative">
                <Progress value={stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0} className="h-2 bg-slate-100" />
                <div className="absolute -top-1 left-0 w-full flex justify-between text-xs text-slate-400">
                  <span>Start</span>
                  <span className="font-medium text-slate-600">{stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}%</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>

            {/* View Toggle & Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* View Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={handleToggle}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-all",
                      !isTopicsView
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Level-wise
                  </button>
                  <button
                    onClick={handleToggle}
                    className={cn(
                      "px-4 py-2 text-sm font-medium rounded-md transition-all",
                      isTopicsView
                        ? "bg-blue-500 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    Topic-wise
                  </button>
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center gap-3">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDifficulty('all')}
                      className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                        selectedDifficulty === 'all'
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      All Levels
                    </button>
                    {['beginner', 'intermediate', 'expert'].map((difficulty) => (
                      <button
                        key={difficulty}
                        onClick={() => setSelectedDifficulty(difficulty as any)}
                        className={cn(
                          "px-3 py-1.5 text-sm font-medium rounded-lg transition-all",
                          selectedDifficulty === difficulty
                            ? "bg-slate-900 text-white shadow-sm"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                        )}
                      >
                        {difficulty === 'beginner' ? 'Beginner' : difficulty === 'intermediate' ? 'Intermediate' : 'Advanced'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BarChart3 className="h-4 w-4" />
                <span>Level-wise View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="space-y-8">
            {(['beginner', 'intermediate', 'expert'] as const)
              .filter(difficulty => selectedDifficulty === 'all' || selectedDifficulty === difficulty)
              .map((difficulty) => (
              <div key={difficulty}>
                {renderLevelSection(difficulty)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
