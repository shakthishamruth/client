import { Sparkles, ArrowRight, BookOpen, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, Problem } from "@/lib/api";

export function RecommendedProblems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const data = await api.getProblems();
        const allProblems: Problem[] = Array.isArray(data) ? data : (data as any).problems || [];
        
        // Shuffle and get 4 random problems
        const shuffled = [...allProblems].sort(() => 0.5 - Math.random());
        setProblems(shuffled.slice(0, 4));
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "expert":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const difficultyLabels: Record<string, string> = {
    beginner: "Easy",
    intermediate: "Medium",
    expert: "Hard",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Recommended for You</h3>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-900">Recommended for You</h3>
        </div>
        <Button variant="ghost" size="sm" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100" asChild>
          <Link to="/problems">
            Browse All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="px-6 pb-6">
        <div className="space-y-3">
          {problems.map((problem) => (
            <Link
              key={problem._id}
              to={`/problems/${problem._id}`}
              className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <BookOpen className="h-4 w-4 text-slate-600" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {problem.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`text-xs font-medium px-3 py-1 rounded-full ${getDifficultyStyle(problem.difficulty)} border`}>
                    {difficultyLabels[problem.difficulty] || problem.difficulty}
                  </Badge>
                  <span className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {problem.topic}
                  </span>
                  {problem.tags?.slice(0, 1).map((tag, idx) => (
                    <span key={idx} className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <span className="text-xs font-medium text-slate-600">
                {problem.points} pts
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
