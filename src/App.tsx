import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { SidebarProvider } from "./contexts/SidebarContext";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import WeeklyContest from "./pages/WeeklyContest";
import Leaderboard from "./pages/Leaderboard";
import Problems from "./pages/Problems";
import Topics from "./pages/dsa_sheet";
import DSASheet from "./pages/topic";
import Placement100Sheet from "./pages/Placement75Sheet";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProblemDetail from "./pages/ProblemDetail";
import IDE from "./pages/IDE";
import ErrorTest from "./pages/ErrorTestClean";

const queryClient = new QueryClient();

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/weekly-contest" element={<WeeklyContest />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:id" element={<ProblemDetail />} />
              <Route path="/ide/:id" element={<IDE />} />
              <Route path="/dsa-sheet" element={<Topics />} />
              <Route path="/placement-75" element={<Placement100Sheet />} />
              <Route path="/topics" element={<DSASheet />} />
              <Route path="/topics/:id" element={<Problems />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Profile />} />
              <Route path="/error-test" element={<ErrorTest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SidebarProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
