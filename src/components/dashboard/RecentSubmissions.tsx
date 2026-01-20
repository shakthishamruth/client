import { CheckCircle2, XCircle, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { api, Submission } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export function RecentSubmissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await api.getUserSubmissions(user.userId);
        setSubmissions(response.submissions.slice(0, 5)); // Show only 5 recent
      } catch (error) {
        console.error('Failed to fetch submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const statusConfig = {
    SOLVED: {
      icon: CheckCircle2,
      iconClass: "text-green-600",
      label: "Solved",
      badgeClass: "bg-green-100 text-green-700 border-green-200"
    },
    ATTEMPTED: {
      icon: XCircle,
      iconClass: "text-red-600",
      label: "Attempted",
      badgeClass: "bg-red-100 text-red-700 border-red-200"
    },
    RUN: {
      icon: Clock,
      iconClass: "text-orange-600",
      label: "Run",
      badgeClass: "bg-orange-100 text-orange-700 border-orange-200"
    },
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between p-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Submissions</h3>
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
        <h3 className="text-lg font-semibold text-slate-900">Recent Submissions</h3>
        <Button variant="ghost" size="sm" className="text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100" asChild>
          <Link to="/profile#recent-submissions">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="px-6 pb-6">
        {submissions.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm font-medium">
            No submissions yet
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission, index) => {
              const config = statusConfig[submission.status];
              const StatusIcon = config.icon;

              return (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <StatusIcon className={cn("h-4 w-4 shrink-0", config.iconClass)} />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {submission.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-medium text-slate-500">
                        {submission.language}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-medium text-slate-500">
                        {submission.passedCount}/{submission.totalCount}
                      </span>
                    </div>
                  </div>

                  <Badge 
                    variant="outline" 
                    className={cn("text-xs font-medium px-3 py-1 rounded-full border", config.badgeClass)}
                  >
                    {config.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
