import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  CheckCircle2,
  Circle,
  Clock,
  ArrowRight,
  Filter,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ChevronsUp,
  ChevronsDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useParams } from "react-router-dom";
import { api, Problem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ProblemWithStatus extends Problem {
  status: "solved" | "attempted" | "unsolved";
  acceptance?: number;
}

const difficulties = ["All", "Beginner", "Intermediate", "Expert"];
const statuses = ["All", "Solved", "Attempted", "Unsolved"];

export default function Problems() {
  const { id: topicId } = useParams();
  const { user } = useAuth();
  const [problems, setProblems] = useState<ProblemWithStatus[]>([]);
  const [topics, setTopics] = useState<string[]>(["All Topics"]);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("All Topics");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [availableCompanies, setAvailableCompanies] = useState<string[]>(["All"]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllCompanies, setShowAllCompanies] = useState(false);
  const itemsPerPage = 25;

  useEffect(() => {
    const fetchProblems = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        let response;
        
        if (topicId) {
          response = await api.getProblemsByTopic(topicId, user.userId);
        } else {
          response = await api.getProblems(user.userId);
        }
        
        const data = response.problems || response;
        const stats = response.userStats || user?.stats;
        
        if (stats) {
          setUserStats(stats);
        }
        
        // Transform API data to include UI properties
        const problemsWithStatus: ProblemWithStatus[] = data.map((problem: Problem) => ({
          ...problem,
          status: (stats?.solvedProblemIds || user?.stats?.solvedProblemIds || []).includes(problem._id) 
            ? "solved" 
            : (stats?.attemptedProblemIds || user?.stats?.attemptedProblemIds || []).includes(problem._id) 
            ? "attempted" 
            : "unsolved",
          acceptance: Math.floor(Math.random() * 40) + 40
        }));
        
        console.log('Sample problem:', problemsWithStatus[0]);
        console.log('Company tags:', problemsWithStatus[0]?.companyTag);
        
        setProblems(problemsWithStatus);
        
        // Extract unique company tags from problems
        const allCompanyTags = new Set<string>();
        problemsWithStatus.forEach((problem: any) => {
          if (problem.companyTag && Array.isArray(problem.companyTag)) {
            problem.companyTag.forEach((tag: string) => allCompanyTags.add(tag));
          }
        });
        const sortedCompanies = ["All", ...Array.from(allCompanyTags).sort()];
        setAvailableCompanies(sortedCompanies);
        
        // Extract unique topics
        const uniqueTopics = Array.from(new Set(data.map((p: Problem) => p.topic).filter(Boolean)));
        const capitalizedTopics = uniqueTopics.map(topic => 
          topic.charAt(0).toUpperCase() + topic.slice(1)
        );
        setTopics(["All Topics", ...capitalizedTopics]);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [topicId, user]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus, selectedCompany]);

  if (loading) {
    return (
      <MainLayout title="Problems">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Problems">
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const filteredProblems = problems.filter((problem: any) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      problem.companyTag?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopic === "All Topics" || problem.topic === selectedTopic.toLowerCase();
    const matchesDifficulty = selectedDifficulty === "All" || problem.difficulty === selectedDifficulty.toLowerCase();
    const matchesStatus = selectedStatus === "All" || problem.status === selectedStatus.toLowerCase();
    const matchesCompany = selectedCompany === "All" || problem.companyTag?.includes(selectedCompany);
    
    return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus && matchesCompany;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProblems = filteredProblems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <MainLayout title="Problems">
      <div className="min-h-screen bg-slate-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Title & Stats */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Problems</h1>
                <p className="text-slate-600 mt-1">Practice coding problems to sharpen your skills</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-600">Total:</span>
                  <span className="font-semibold text-slate-900">{userStats?.totalProblems || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-slate-600">Solved:</span>
                  <span className="font-semibold text-emerald-700">{userStats?.solvedCount || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span className="text-slate-600">Attempted:</span>
                  <span className="font-semibold text-amber-700">{userStats?.attemptedCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Search & Primary Filters */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-white border-slate-200 focus:border-slate-300 focus:ring-0"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                {/* Topic Filter */}
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-slate-300 focus:ring-0"
                >
                  {topics.map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
                
                {/* Difficulty Filter */}
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-slate-300 focus:ring-0"
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
                
                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="h-10 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium focus:border-slate-300 focus:ring-0"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-slate-500">
                {filteredProblems.length} problems
              </div>
            </div>

            {/* Company Tags */}
            <div className="flex flex-wrap gap-2">
              {availableCompanies.slice(0, showAllCompanies ? availableCompanies.length : 12).map((company) => (
                <button
                  key={company}
                  onClick={() => setSelectedCompany(company)}
                  className={cn(
                    "px-3 py-1 text-sm font-medium rounded-full transition-all",
                    selectedCompany === company
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {company}
                </button>
              ))}
              {availableCompanies.length > 12 && (
                <button
                  onClick={() => setShowAllCompanies(!showAllCompanies)}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showAllCompanies ? (
                    <>
                      Show less
                      <ChevronsUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show more
                      <ChevronsDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Problems Table */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[48px_1fr_100px_120px_200px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-700">
              <div></div>
              <div>Problem</div>
              <div>Difficulty</div>
              <div>Status</div>
              <div>Topics</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100">
              {paginatedProblems.map((problem, index) => {
                const globalIndex = startIndex + index + 1;
                const difficultyConfig = {
                  beginner: { label: 'Easy', color: 'text-emerald-600' },
                  intermediate: { label: 'Medium', color: 'text-amber-600' },
                  expert: { label: 'Hard', color: 'text-red-600' }
                };
                
                return (
                  <Link
                    key={problem._id}
                    to={`/ide/${problem._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid grid-cols-[48px_1fr_100px_120px_200px] gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group items-center"
                  >
                    {/* Index */}
                    <div className="text-sm font-medium text-slate-500">
                      {globalIndex}
                    </div>

                    {/* Problem Title */}
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900 group-hover:text-slate-700 truncate">
                        {problem.title}
                      </h3>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <span className={cn(
                        "text-sm font-medium",
                        difficultyConfig[problem.difficulty].color
                      )}>
                        {difficultyConfig[problem.difficulty].label}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      {problem.status === 'solved' && (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-emerald-700">Solved</span>
                        </>
                      )}
                      {problem.status === 'attempted' && (
                        <>
                          <Clock className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-700">Attempted</span>
                        </>
                      )}
                      {problem.status === 'unsolved' && (
                        <>
                          <Circle className="h-4 w-4 text-slate-400" />
                          <span className="text-sm font-medium text-slate-500">Unsolved</span>
                        </>
                      )}
                    </div>

                    {/* Topics */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded">
                        {problem.topic}
                      </span>
                      {problem.tags && problem.tags.length > 0 && (
                        <span className="text-xs text-slate-400">
                          +{problem.tags.length}
                        </span>
                      )}
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors ml-auto" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {paginatedProblems.length === 0 && (
              <div className="text-center py-12">
                <Circle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No problems match your current filters</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredProblems.length)} of {filteredProblems.length}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8"
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
                        className="h-8 w-8 p-0"
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
                  className="h-8"
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
