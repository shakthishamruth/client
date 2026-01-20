import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface Problem {
  _id: string;
  problemId: number;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  topic: string;
  tags?: string[];
  isSolved?: boolean;
}

export default function Placement100Sheet() {
  const { user } = useAuth();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedStatus]);

  useEffect(() => {
    const fetchFrequentlyAskedProblems = async () => {
      if (!user) return;
      
      const cacheKey = `placement_sheet_${user.userId}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        setProblems(JSON.parse(cached));
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/user/placementsheet?userId=${user.userId}`);
        if (!response.ok) throw new Error('Failed to fetch placement sheet problems');
        
        const data = await response.json();
        const problemsWithSolvedStatus = data.problems.map((problem: any) => ({
          ...problem,
          isSolved: data.userStats?.solvedProblemIds?.includes(problem._id) || false
        }));
        
        setProblems(problemsWithSolvedStatus);
        sessionStorage.setItem(cacheKey, JSON.stringify(problemsWithSolvedStatus));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problems');
      } finally {
        setLoading(false);
      }
    };

    fetchFrequentlyAskedProblems();
  }, [user]);

  if (loading) {
    return (
      <MainLayout title="Interview Prep">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Interview Prep">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const categories = Array.from(new Set(problems.map(p => p.topic).filter(Boolean))).sort();
  const solvedCount = problems.filter(p => p.isSolved).length;
  const totalCount = problems.length;
  const progressPercentage = Math.round((solvedCount / totalCount) * 100);

  // Sort problems by difficulty (easy, medium, hard)
  const sortedProblems = [...problems].sort((a, b) => {
    const difficultyOrder = { 'beginner': 0, 'intermediate': 1, 'expert': 2 };
    return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
  });

  // Filter by status and category
  const filteredProblems = sortedProblems.filter(problem => {
    const statusMatch = selectedStatus === 'all' || 
      (selectedStatus === 'solved' && problem.isSolved) ||
      (selectedStatus === 'unsolved' && !problem.isSolved);
    const categoryMatch = selectedCategory === null || problem.topic === selectedCategory;
    return statusMatch && categoryMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <MainLayout title="Interview Prep">
      <div className="min-h-screen bg-slate-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Progress Overview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Interview Preparation</h1>
                  <p className="text-slate-600 mt-1">Master essential coding problems for technical interviews</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{solvedCount}<span className="text-slate-400">/{totalCount}</span></div>
                  <div className="text-sm text-slate-500">problems completed</div>
                </div>
              </div>
              <div className="relative">
                <Progress value={progressPercentage} className="h-2 bg-slate-100" />
                <div className="absolute -top-1 left-0 w-full flex justify-between text-xs text-slate-400">
                  <span>Start</span>
                  <span className="font-medium text-slate-600">{progressPercentage}%</span>
                  <span>Complete</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-slate-400" />
                <div className="flex items-center gap-2">
                  {['all', 'solved', 'unsolved'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium rounded-lg transition-all",
                        selectedStatus === status
                          ? "bg-blue-500 text-white shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      )}
                    >
                      {status === 'all' ? 'All Problems' : status === 'solved' ? 'Completed' : 'Pending'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="text-sm text-slate-500">
                {filteredProblems.length} problems
              </div>
            </div>
          </div>
        </div>

        {/* Category Tags */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-full transition-all",
                  selectedCategory === null
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                All Topics
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-3 py-1.5 text-sm font-medium rounded-full transition-all",
                    selectedCategory === category
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid gap-3">
            {paginatedProblems.map((problem, index) => {
              const globalIndex = startIndex + index + 1;
              const difficultyConfig = {
                beginner: { label: 'Easy', color: 'text-emerald-600 bg-emerald-50' },
                intermediate: { label: 'Medium', color: 'text-amber-600 bg-amber-50' },
                expert: { label: 'Hard', color: 'text-red-600 bg-red-50' }
              };
              
              return (
                <div
                  key={problem._id}
                  className={cn(
                    "group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md cursor-pointer",
                    problem.isSolved 
                      ? "border-emerald-200 bg-emerald-50/30" 
                      : "border-slate-200 hover:border-slate-300"
                  )}
                  onClick={() => window.open(`/ide/${problem._id}`, '_blank')}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Status & Number */}
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold",
                            problem.isSolved 
                              ? "bg-emerald-100 text-emerald-700" 
                              : "bg-slate-100 text-slate-600"
                          )}>
                            {problem.isSolved ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              globalIndex
                            )}
                          </div>
                        </div>

                        {/* Problem Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                              {problem.title}
                            </h3>
                            <span className={cn(
                              "px-2 py-1 text-xs font-medium rounded-md",
                              difficultyConfig[problem.difficulty].color
                            )}>
                              {difficultyConfig[problem.difficulty].label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">{problem.topic}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          problem.isSolved
                            ? "text-emerald-700 bg-emerald-100 group-hover:bg-emerald-200"
                            : "text-slate-700 bg-slate-100 group-hover:bg-slate-200"
                        )}>
                          {problem.isSolved ? 'Review' : 'Solve'}
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {paginatedProblems.length === 0 && (
            <div className="text-center py-16">
              <Circle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No problems match your current filters</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200">
              <div className="text-sm text-slate-500">
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredProblems.length)} of {filteredProblems.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-9"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-9 w-9 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}