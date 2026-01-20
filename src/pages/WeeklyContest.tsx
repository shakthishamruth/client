import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  Users, 
  Trophy,
  AlertCircle,
  Timer,
  Target,
  CheckCircle2,
  XCircle,
  Zap,
  Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function WeeklyContest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contest, setContest] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    fetchActiveContest();
  }, []);

  useEffect(() => {
    if (hasStarted && contest) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(contest.endTime).getTime();
        const diff = end - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
          setHasStarted(false);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining({ hours, minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [hasStarted, contest]);

  const fetchActiveContest = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/contest/active");
      const data = await response.json();
      
      if (data.active) {
        setIsActive(true);
        setContest(data.contest);
      } else {
        setIsActive(false);
      }
    } catch (error) {
      console.error("Error fetching contest:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartContest = async () => {
    try {
      console.log("Starting contest for user:", user?.userId);
      
      const response = await fetch("http://localhost:5000/api/contest/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.userId })
      });

      const data = await response.json();
      console.log("Start contest response:", data);
      
      if (response.ok && data.success) {
        setHasStarted(true);
        setContest(data.contest);
      } else {
        alert(data.message || data.error || "Failed to start contest");
      }
    } catch (error) {
      console.error("Error starting contest:", error);
      alert("Failed to start contest. Please try again.");
    }
  };

  const handleProblemClick = (problemId: string) => {
    window.open(`/ide/${problemId}?contest=true&endTime=${contest.endTime}`, '_blank');
  };

  if (loading) {
    return (
      <MainLayout title="Weekly Contest">
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Loading contest...</div>
        </div>
      </MainLayout>
    );
  }

  if (!isActive) {
    return (
      <MainLayout title="Weekly Contest">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <AlertCircle className="h-16 w-16 text-muted-foreground" />
          <h2 className="text-2xl font-semibold text-foreground">No Active Contest</h2>
          
        </div>
      </MainLayout>
    );
  }

  if (!hasStarted) {
    const getDifficultyColor = (difficulty: string) => {
      switch(difficulty?.toLowerCase()) {
        case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
        case 'medium': case 'intermediate': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
        case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
        default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      }
    };

    return (
      <MainLayout title="Weekly Contest">
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in p-6">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-primary/10 border border-primary/20">
              <Award className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Weekly Contest</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground">{contest?.title}</h1>
          </div>

          {/* Meta Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-foreground">1 Hour</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Penalty</p>
                <p className="text-lg font-semibold text-foreground">-10 Points</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Problems</p>
                <p className="text-lg font-semibold text-foreground">{contest?.problemIds?.length || 0}</p>
              </div>
            </div>
          </div>

          {/* Rules Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Contest Rules
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Solve Multiple Problems</p>
                  <p className="text-xs text-muted-foreground">Complete as many as you can in 1 hour</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Pass All Test Cases</p>
                  <p className="text-xs text-muted-foreground">Full credit requires 100% pass rate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Wrong Submission Penalty</p>
                  <p className="text-xs text-muted-foreground">-10 points per failed attempt</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Scoring Formula</p>
                  <p className="text-xs text-muted-foreground font-mono">score + tests + (60 - time)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Problems Section */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Contest Problems
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Solve fast for bonus points</span>
              </div>
            </div>
            <div className="space-y-3">
              {contest?.problemIds?.map((problem: any, index: number) => (
                <div key={problem._id} className="group p-4 rounded-lg border border-border bg-secondary/20 hover:bg-secondary/40 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{problem.title}</h4>
                    </div>
                    <Badge className={`${getDifficultyColor(problem.difficulty)} border`}>
                      {problem.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="rounded-xl border border-primary/20 bg-gradient-primary/5 p-6 text-center space-y-3">
            <Button 
              onClick={handleStartContest} 
              className="w-full md:w-auto px-8 gap-2 shadow-lg hover:shadow-xl transition-all" 
              size="lg"
            >
              <Play className="h-5 w-5" />
              Start Contest Now
            </Button>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" />
              Timer starts immediately after clicking
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medium': case 'intermediate': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'hard': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  return (
    <MainLayout title="Weekly Contest">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-6">
        {/* Header with Timer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
              <Trophy className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{contest?.title}</h1>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-primary/10 border border-primary/20">
              <Clock className="h-5 w-5 text-primary" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-0.5">Time Left</p>
                <span className="font-mono text-xl font-semibold text-foreground">
                  {String(timeRemaining.hours).padStart(2, '0')}:
                  {String(timeRemaining.minutes).padStart(2, '0')}:
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-card border border-border">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Participants</p>
                <p className="text-lg font-semibold text-foreground">{contest?.participants?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="grid gap-4">
          {contest?.problemIds?.map((problem: any, index: number) => (
            <div 
              key={problem._id}
              onClick={() => handleProblemClick(problem._id)}
              className="group p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{problem.description?.substring(0, 120)}...</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={`${getDifficultyColor(problem.difficulty)} border px-3 py-1`}>
                    {problem.difficulty}
                  </Badge>
                  <Play className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
