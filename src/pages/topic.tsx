import { API_BASE_URL } from '@/config/api';
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronRight, ArrowRight, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useViewToggle } from '@/hooks/useViewToggle';

interface DSAProblem {
  problemId: string;
  title: string;
  isSolved: boolean;
}

interface TopicData {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  icon: string;
  color: string;
  problems: {
    easy: DSAProblem[];
    medium: DSAProblem[];
    hard: DSAProblem[];
  };
}

interface DSASheetData {
  beginner: Record<string, DSAProblem[]>;
  intermediate: Record<string, DSAProblem[]>;
  expert: Record<string, DSAProblem[]>;
}

export default function DSATopics() {
  const { user } = useAuth();
  const { isTopicsView, handleToggle } = useViewToggle();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'solved' | 'unsolved'>('all');
  const [expandedDifficulties, setExpandedDifficulties] = useState<Set<string>>(new Set());
  const [dsaSheet, setDsaSheet] = useState<DSASheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDSASheet = async () => {
      if (!user) return;
      
      const cacheKey = `dsa_sheet_topic_${user.userId}`;
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

  // Transform backend data to topic cards format
  const getTopicsFromData = (): TopicData[] => {
    if (!dsaSheet) return [];

    const topicMap: Record<string, TopicData> = {};
    
    // Process each difficulty level
    Object.entries(dsaSheet).forEach(([difficultyLevel, topics]) => {
      Object.entries(topics).forEach(([topicName, problems]) => {
        if (!topicMap[topicName]) {
          topicMap[topicName] = {
            id: topicName.toLowerCase().replace(/\s+/g, '-'),
            title: topicName,
            description: getTopicDescription(topicName),
            difficulty: getDifficultyFromLevel(difficultyLevel),
            icon: getTopicIcon(topicName),
            color: getTopicColor(topicName),
            problems: { easy: [], medium: [], hard: [] }
          };
        }
        
        // Categorize problems by difficulty within topic
        const difficultyKey = getDifficultyKey(difficultyLevel);
        topicMap[topicName].problems[difficultyKey] = problems;
      });
    });

    return Object.values(topicMap);
  };

  const getTopicDescription = (topicName: string): string => {
    const descriptions: Record<string, string> = {
      'Arrays': 'Master array manipulation and hash maps',
      'Two Pointers': 'Efficient array traversal techniques',
      'Sliding Window': 'Subarray and substring problems',
      'Stack': 'LIFO data structure mastery',
      'Binary Search': 'Divide and conquer search',
      'Linked List': 'Node-based data structures',
      'Trees': 'Hierarchical data structures',
      'Dynamic Programming': 'Optimization problem solving',
      'Graphs': 'Network and connectivity problems'
    };
    return descriptions[topicName] || 'Master this fundamental concept';
  };

  const getDifficultyFromLevel = (level: string): 'Beginner' | 'Intermediate' | 'Expert' => {
    switch (level) {
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'expert': return 'Expert';
      default: return 'Beginner';
    }
  };

  const getDifficultyKey = (level: string): 'easy' | 'medium' | 'hard' => {
    switch (level) {
      case 'beginner': return 'easy';
      case 'intermediate': return 'medium';
      case 'expert': return 'hard';
      default: return 'easy';
    }
  };

  const getTopicIcon = (topicName: string): string => {
    const icons: Record<string, string> = {
      'if-else': '🔀',
      'sorting': '🔢',
      'loops': '🔄',
      'pattern printing': '🎨',
      'function': '⚙️',
      'math': '🧮',
      'array': '📊',
      'searching': '🔍',
      'recursion': '🔄',
      'linkedlist': '🔗',
      'string': '📝',
      'bit-manipulation': '🔧',
      'binary search': '🎯',
      'stack and queue': '📚',
      'greedy': '💰',
      'heap': '⛰️',
      '2d-array': '🗂️',
      'list': '📋',
      'hashmap': '🗃️',
      'sliding-window': '🪟',
      'linked-list': '🔗',
      'two-pointer': '👆',
      'graph': '🕸️',
      'trie': '🌲',
      'tree': '🌳',
      'binary-search-tree': '🌲',
      'dynamic-programming': '⚡'
    };
    return icons[topicName] || '🎯';
  };

  const getTopicColor = (topicName: string): string => {
    const colors: Record<string, string> = {
      'Arrays': 'bg-gradient-to-br from-blue-500 to-blue-600',
      'Two Pointers': 'bg-gradient-to-br from-green-500 to-green-600',
      'Sliding Window': 'bg-gradient-to-br from-orange-500 to-orange-600',
      'Stack': 'bg-gradient-to-br from-purple-500 to-purple-600',
      'Binary Search': 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      'Linked List': 'bg-gradient-to-br from-red-500 to-red-600',
      'Trees': 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      'Dynamic Programming': 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      'Graphs': 'bg-gradient-to-br from-pink-500 to-pink-600'
    };
    return colors[topicName] || 'bg-gradient-to-br from-gray-500 to-gray-600';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200';
      case 'expert': return 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200';
      default: return 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border-slate-200';
    }
  };

  const getProgressPercentage = (solved: number, total: number) => {
    return total > 0 ? Math.round((solved / total) * 100) : 0;
  };

  const getTotalStats = () => {
    if (!dsaSheet) return { total: 0, solved: 0 };
    
    const allProblems = [
      ...Object.values(dsaSheet.beginner || {}),
      ...Object.values(dsaSheet.intermediate || {}),
      ...Object.values(dsaSheet.expert || {})
    ].flat();
    
    const solved = allProblems.filter(p => p.isSolved).length;
    return { total: allProblems.length, solved };
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

  const topics = getTopicsFromData();
  const currentTopic = topics.find(t => t.id === selectedTopic);
  const stats = getTotalStats();

  // Filter problems based on difficulty and status
  const filterProblems = (problems: any[]) => {
    return problems.filter(p => {
      const statusMatch = selectedStatus === 'all' || 
        (selectedStatus === 'solved' ? p.isSolved : !p.isSolved);
      const difficultyMatch = selectedDifficulty === 'all' || p.difficulty === selectedDifficulty;
      return statusMatch && difficultyMatch;
    });
  };

  // Filter topics based on status
  const getFilteredTopics = () => {
    if (selectedStatus === 'all') return topics;
    return topics.filter(topic => {
      const allProblems = [...topic.problems.easy, ...topic.problems.medium, ...topic.problems.hard];
      const filteredProblems = filterProblemsByStatus(allProblems);
      return filteredProblems.length > 0;
    });
  };



  if (selectedTopic && currentTopic) {
    return (
      <MainLayout title="DSA Practice">
        <div className="min-h-screen bg-slate-50">
          {/* Header */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTopic(null)}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Topics
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl text-white", currentTopic.color)}>
                    <span className="text-2xl">{currentTopic.icon}</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900">{currentTopic.title}</h1>
                    <p className="text-slate-600 mt-1">{currentTopic.description}</p>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">Difficulty:</span>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      {['all', 'Easy', 'Medium', 'Hard'].map((difficulty) => (
                        <button
                          key={difficulty}
                          onClick={() => setSelectedDifficulty(difficulty as any)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            selectedDifficulty === difficulty
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          )}
                        >
                          {difficulty === 'all' ? 'All' : difficulty}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 font-medium">Status:</span>
                    <div className="flex items-center bg-slate-100 rounded-lg p-1">
                      {['all', 'solved', 'unsolved'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatus(status as any)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            selectedStatus === status
                              ? "bg-blue-500 text-white shadow-sm"
                              : "text-slate-600 hover:text-slate-900"
                          )}
                        >
                          {status === 'all' ? 'All' : status === 'solved' ? 'Solved' : 'Unsolved'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-6 space-y-3">
                {(() => {
                  const allProblems = [
                    ...currentTopic.problems.easy.map(p => ({ ...p, difficulty: 'Easy' })),
                    ...currentTopic.problems.medium.map(p => ({ ...p, difficulty: 'Medium' })),
                    ...currentTopic.problems.hard.map(p => ({ ...p, difficulty: 'Hard' }))
                  ];
                  const filteredProblems = filterProblems(allProblems);
                  
                  return filteredProblems.map((problem) => (
                    <div
                      key={problem.problemId}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:bg-slate-50/50 transition-all cursor-pointer group"
                      onClick={() => window.open(`/ide/${problem.problemId}`, '_blank')}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {problem.isSolved ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400" />
                        )}
                        <span className="font-medium text-slate-900 group-hover:text-slate-700">
                          {problem.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          problem.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                          problem.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        )}>
                          {problem.difficulty}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                <Progress value={getProgressPercentage(stats.solved, stats.total)} className="h-2 bg-slate-100" />
                <div className="absolute -top-1 left-0 w-full flex justify-between text-xs text-slate-400">
                  <span>Start</span>
                  <span className="font-medium text-slate-600">{getProgressPercentage(stats.solved, stats.total)}%</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between">
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
              
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <BarChart3 className="h-4 w-4" />
                <span>Topic-wise View</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => {
              const allProblems = [...topic.problems.easy, ...topic.problems.medium, ...topic.problems.hard];
              const solved = allProblems.filter(p => p.isSolved).length;
              const total = allProblems.length;
              const percentage = getProgressPercentage(solved, total);
              const isCompleted = percentage === 100;
              
              // Get next unsolved problem for context-aware action
              const nextUnsolved = allProblems.find(p => !p.isSolved);
              const actionText = isCompleted ? 'Review' : nextUnsolved ? 'Continue' : 'Start';

              return (
                <div
                  key={topic.id}
                  className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-2xl hover:border-slate-300 hover:bg-gradient-to-br hover:from-slate-50/50 hover:to-gray-50/50 hover:-translate-y-2 transition-all duration-300 cursor-pointer group shadow-lg"
                  onClick={() => setSelectedTopic(topic.id)}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 group-hover:from-slate-200 group-hover:to-slate-300 group-hover:scale-110 transition-all duration-300 shadow-sm">
                          <span className="text-xl">{topic.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-slate-900 group-hover:text-slate-700 transition-colors duration-300 capitalize font-sans>">
                            {topic.title.replace(/-/g, ' ')}
                          </h3>
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="bg-emerald-100 p-2 rounded-full group-hover:bg-emerald-200 group-hover:scale-110 transition-all duration-300">
                          <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors">{topic.description}</p>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 font-bold">Progress</span>
                        <span className="font-black text-2xl text-slate-900">{solved}/{total}</span>
                      </div>
                      <div className="space-y-3 relative pb-4">
                        <Progress value={percentage} className="h-3 group-hover:h-4 transition-all duration-300 [&>div]:bg-green-500" />
                        <div className="absolute -bottom-1 left-0">
                          <span className="text-xs font-medium text-slate-400">{percentage}% Complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}