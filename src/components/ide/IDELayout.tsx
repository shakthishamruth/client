import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { 
  Play, 
  Send, 
  Loader2,
  BookOpen,
  FileOutput,
  Clock,
  Maximize2,
  RotateCcw,
  Brain,
  Code2,
  FlaskConical,
  CheckCircle2,
  ChevronDown,
  Timer,
  Pause,
  RefreshCw,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, Problem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { ProblemDescription } from "./ProblemDescription";
import { OutputPanel } from "./OutputPanel";
import { CodeEditor } from "./CodeEditor";
import { ResultsPanel } from "./ResultsPanel";

export default function IDELayout() {
  const { id } = useParams();
  const location = useLocation();
  const { setCollapsed } = useSidebar();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [problemNumber, setProblemNumber] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [rightTab, setRightTab] = useState("testcase");
  const [isSubmitMode, setIsSubmitMode] = useState(false);
  const [isContest, setIsContest] = useState(false);
  const [contestStartTime, setContestStartTime] = useState<Date | null>(null);
  const [contestEndTime, setContestEndTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [customTestCases, setCustomTestCases] = useState<Array<{[key: string]: string}>>([]);
  const [selectedTestCase, setSelectedTestCase] = useState(0);
  const [selectedResultCase, setSelectedResultCase] = useState(0);
  const [isOutputFullscreen, setIsOutputFullscreen] = useState(false);
  const [isLeftPanelFullscreen, setIsLeftPanelFullscreen] = useState(false);
  const outputPanelRef = useRef<any>(null);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerMode, setTimerMode] = useState<'stopwatch' | 'timer'>('stopwatch');
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [timerHours, setTimerHours] = useState(1);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  const parseInputFormat = (input: string) => {
    const params: {[key: string]: string} = {};
    const parts = input.split(',');
    let currentParam = '';
    let currentValue = '';
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part.includes('=')) {
        if (currentParam) {
          params[currentParam] = currentValue.trim();
        }
        const [param, ...valueParts] = part.split('=');
        currentParam = param.trim();
        currentValue = valueParts.join('=').trim();
      } else {
        currentValue += ',' + part;
      }
    }
    
    if (currentParam) {
      params[currentParam] = currentValue.trim();
    }
    
    return params;
  };

  const getInputParams = () => {
    if (problem && problem.sampleTestCases.length > 0) {
      return parseInputFormat(problem.sampleTestCases[0].input);
    }
    return {};
  };

  const validateInput = (paramName: string, value: string) => {
    if (!value.trim()) return true; // Allow empty for now
    
    // Basic validation - can be enhanced based on parameter types
    try {
      // Try to parse as JSON for arrays/objects
      if (value.startsWith('[') || value.startsWith('{')) {
        JSON.parse(value);
      }
      return true;
    } catch {
      // If not JSON, check if it's a valid number or string
      return !isNaN(Number(value)) || typeof value === 'string';
    }
  };

  const deleteCustomTestCase = (index: number) => {
    const newCustomCases = customTestCases.filter((_, i) => i !== index);
    setCustomTestCases(newCustomCases);
    
    // Adjust selected test case if needed
    const totalSampleCases = problem.sampleTestCases.length;
    if (selectedTestCase >= totalSampleCases + index) {
      setSelectedTestCase(Math.max(0, selectedTestCase - 1));
    }
  };

  useEffect(() => {
    setCollapsed(true);
    
    const searchParams = new URLSearchParams(location.search);
    const contestMode = searchParams.get('contest') === 'true';
    const endTime = searchParams.get('endTime');
    
    setIsContest(contestMode);
    if (contestMode) {
      setContestStartTime(new Date());
      if (endTime) {
        setContestEndTime(new Date(endTime));
      }
    }
    
    const state = location.state as any;
    if (state?.viewMode && state?.submittedCode) {
      setViewMode(true);
      setCode(state.submittedCode);
      setLanguage(state.language || "python");
    }
  }, [setCollapsed, location.state, location.search]);

  useEffect(() => {
    if (isContest && contestEndTime) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(contestEndTime).getTime();
        const diff = end - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeRemaining({ hours: 0, minutes: 0, seconds: 0 });
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining({ hours, minutes, seconds });
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isContest, contestEndTime]);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/user/problems/${id}`
        );
        if (!response.ok) throw new Error("Problem not found");
        const problemData = await response.json();
        setProblem(problemData);
        setProblemNumber(problemData.problemId);
        
        const savedCode = localStorage.getItem(`code_${id}_${language}`);
        setCode(savedCode || getStarterCode(problemData.title, language));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, language]);

  const getStarterCode = (title: string, lang: string) => {
    const templates = {
      python: `def solution():\n    # Your code here\n    pass`,
      javascript: `function solution() {\n    // Your code here\n}`,
      java: `public class Solution {\n    public void solution() {\n        // Your code here\n    }\n}`,
      cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
    };
    return templates[lang as keyof typeof templates] || templates.python;
  };

  useEffect(() => {
    if (problem && !viewMode && id) {
      const savedCode = localStorage.getItem(`code_${id}_${language}`);
      setCode(savedCode || getStarterCode(problem.title, language));
    }
  }, [language, problem, viewMode, id]);

  useEffect(() => {
    if (code && id && !viewMode) {
      localStorage.setItem(`code_${id}_${language}`, code);
    }
  }, [code, id, language, viewMode]);

  useEffect(() => {
    if (isStopwatchRunning) {
      timerIntervalRef.current = setInterval(() => {
        setStopwatchTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev > 0) return prev - 1;
          if (timerMinutes > 0) {
            setTimerMinutes(m => m - 1);
            return 59;
          }
          if (timerHours > 0) {
            setTimerHours(h => h - 1);
            setTimerMinutes(59);
            return 59;
          }
          setIsTimerRunning(false);
          return 0;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, timerHours, timerMinutes]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleReset = () => {
    if (problem && id) {
      const starterCode = getStarterCode(problem.title, language);
      setCode(starterCode);
      localStorage.setItem(`code_${id}_${language}`, starterCode);
    }
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const executeCode = async (mode: "run" | "submit") => {
    if (!user || !id) return;

    setExecuting(true);
    setIsSubmitMode(mode === "submit");
    setResults(null);
    setSelectedResultCase(0);
    
    try {
      if (isContest && mode === "submit") {
        const timeTaken = contestStartTime 
          ? Math.floor((new Date().getTime() - contestStartTime.getTime()) / (1000 * 60))
          : 0;
        
        const response = await fetch("http://localhost:5000/api/contest/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            problemId: id,
            code,
            language,
            timeTaken
          })
        });
        
        const data = await response.json();
        setResults(data);
        setActiveTab("output");
      } else {
        // Format custom test cases for backend
        const formattedCustomCases = customTestCases
          .filter(tc => {
            const params = Object.entries(tc);
            return params.every(([_, val]) => val.trim() !== '');
          })
          .map(tc => {
            const inputStr = Object.entries(tc)
              .map(([key, val]) => `${key} = ${val}`)
              .join(', ');
            return {
              input: inputStr,
              expectedOutput: null // No expected output for custom cases
            };
          });

        const data = await api.post("/user/ide/execute", {
          problemId: problemNumber,
          userId: user.userId,
          code,
          language,
          mode,
          customTestCases: mode === "run" ? formattedCustomCases : undefined
        });
        
        console.log('Execution result:', data);
        setResults(data);
        
        // Auto-switch tabs based on mode and results
        if (mode === "submit") {
          setActiveTab("output");
        } else {
          // For Run mode, always show results in Test Case Result tab
          setRightTab("result");
        }
      }
    } catch (error) {
      console.error("Error executing code:", error);
      setResults({ 
        error: "Code execution failed",
        results: [{
          status: "RE",
          error: "Network or server error occurred",
          output: '',
          hidden: false
        }],
        passed: 0,
        total: 1
      });
      
      // Show error in appropriate tab based on mode
      if (mode === "submit") {
        setActiveTab("output");
      } else {
        setRightTab("result");
      }
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Problem not found"}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#f9fafb] flex flex-col">
      {/* Redesigned Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center px-6 justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-blue-600" />
          <h1 className="text-gray-900 font-bold text-base">AlgoVerse IDE</h1>
          {isContest && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 ml-6">
              <Clock className={`h-3.5 w-3.5 ${
                timeRemaining.hours === 0 && timeRemaining.minutes < 20 
                  ? 'text-red-600' 
                  : timeRemaining.hours === 0 && timeRemaining.minutes < 50
                  ? 'text-amber-600'
                  : 'text-green-600'
              }`} />
              <span className="font-mono text-xs font-semibold text-gray-900">
                {String(timeRemaining.hours).padStart(2, '0')}:
                {String(timeRemaining.minutes).padStart(2, '0')}:
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
        
        {/* Center: Language Selector */}
        <div className="flex items-center">
          <Select value={language} onValueChange={setLanguage} disabled={viewMode}>
            <SelectTrigger className="h-8 w-32 bg-gray-50 border-gray-200 text-gray-700 hover:border-gray-300 focus:ring-0 text-sm font-medium px-3 rounded-lg transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border border-gray-200 shadow-xl rounded-lg">
              <SelectItem value="python" className="text-sm hover:bg-gray-50 cursor-pointer py-2">Python</SelectItem>
              <SelectItem value="javascript" className="text-sm hover:bg-gray-50 cursor-pointer py-2">JavaScript</SelectItem>
              <SelectItem value="java" className="text-sm hover:bg-gray-50 cursor-pointer py-2">Java</SelectItem>
              <SelectItem value="cpp" className="text-sm hover:bg-gray-50 cursor-pointer py-2">C++</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Right: Actions with Clear Hierarchy */}
        <div className="flex items-center gap-3">
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <div className="relative">
            {(isStopwatchRunning || timerStarted || stopwatchTime > 0) ? (
              <div className="flex items-center gap-1.5 h-6 px-2 bg-gray-50 rounded-lg border border-gray-200">
                <Timer className="h-3 w-3 text-blue-600" />
                <span className="text-xs font-mono font-semibold text-gray-900">
                  {timerStarted ? `${String(timerHours).padStart(2, '0')}:${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}` : formatTime(stopwatchTime)}
                </span>
                <button
                  onClick={() => {
                    if (timerStarted) {
                      setIsTimerRunning(!isTimerRunning);
                    } else {
                      setIsStopwatchRunning(!isStopwatchRunning);
                    }
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                  title={isStopwatchRunning || isTimerRunning ? "Pause" : "Resume"}
                >
                  {(isStopwatchRunning || isTimerRunning) ? <Pause className="h-2.5 w-2.5 text-gray-700" /> : <Play className="h-2.5 w-2.5 text-gray-700" />}
                </button>
                <button
                  onClick={() => {
                    if (timerStarted) {
                      setTimerHours(1);
                      setTimerMinutes(0);
                      setTimerSeconds(0);
                      setIsTimerRunning(false);
                      setTimerStarted(false);
                    } else {
                      setStopwatchTime(0);
                      setIsStopwatchRunning(false);
                    }
                  }}
                  className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                  title="Reset"
                >
                  <RefreshCw className="h-2.5 w-2.5 text-gray-700" />
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTimerModal(!showTimerModal)}
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
                title="Timer/Stopwatch"
              >
                <Timer className="h-4 w-4" />
              </Button>
            )}
            {showTimerModal && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[280px]">
                {/* Enhanced Tab Design */}
                <div className="flex gap-1 mb-4 p-1 bg-gray-100 rounded-lg">
                  <button
                    onClick={() => setTimerMode('stopwatch')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      timerMode === 'stopwatch'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Timer className="h-4 w-4" />
                    Stopwatch
                  </button>
                  <button
                    onClick={() => setTimerMode('timer')}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      timerMode === 'timer'
                        ? 'bg-orange-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Timer className="h-4 w-4" />
                    Timer
                  </button>
                </div>

                {timerMode === 'stopwatch' ? (
                  <button
                    onClick={() => {
                      setIsStopwatchRunning(true);
                      setShowTimerModal(false);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
                  >
                    <Play className="h-4 w-4" />
                    Start Stopwatch
                  </button>
                ) : (
                  <div>
                    <div className="flex gap-3 justify-center mb-4">
                      <div className="text-center">
                        <input
                          type="number"
                          value={timerHours}
                          onChange={(e) => setTimerHours(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 h-16 text-xl font-mono font-bold text-center bg-gray-50 text-gray-900 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                          min="0"
                          max="23"
                        />
                        <div className="text-xs text-gray-500 mt-1 font-medium">hours</div>
                      </div>
                      <div className="text-center">
                        <input
                          type="number"
                          value={timerMinutes}
                          onChange={(e) => setTimerMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          className="w-16 h-16 text-xl font-mono font-bold text-center bg-gray-50 text-gray-900 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none transition-colors"
                          min="0"
                          max="59"
                        />
                        <div className="text-xs text-gray-500 mt-1 font-medium">minutes</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setTimerStarted(true);
                        setIsTimerRunning(true);
                        setShowTimerModal(false);
                      }}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-sm"
                    >
                      <Play className="h-4 w-4" />
                      Start Timer
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => executeCode("run")}
            disabled={executing || viewMode}
            className="h-9 px-4 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 font-medium text-sm rounded-lg transition-all hover:scale-105 hover:shadow-sm"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Run
          </Button>
          
          {/* Primary Action - Submit */}
          <Button
            size="sm"
            onClick={() => executeCode("submit")}
            disabled={executing || viewMode}
            className="h-9 px-5 bg-green-600 text-white hover:bg-green-700 font-semibold text-sm rounded-lg transition-all hover:scale-105 hover:shadow-lg shadow-sm"
          >
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Submit
          </Button>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="flex-1 overflow-hidden bg-[#f9fafb] p-4">
        <ResizablePanelGroup direction="horizontal" className="gap-4">
          {/* Left Panel - Problem with Enhanced Design */}
          <ResizablePanel defaultSize={35} minSize={25} maxSize={50}>
            <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                {/* Enhanced Tabs */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
                  <TabsList className="inline-flex bg-gray-50 rounded-xl p-1 gap-1">
                    <TabsTrigger 
                      value="description" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 font-semibold text-sm px-5 py-2.5 transition-all hover:text-gray-900"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Description
                    </TabsTrigger>
                    <TabsTrigger 
                      value="output"
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 font-semibold text-sm px-5 py-2.5 transition-all hover:text-gray-900"
                    >
                      <FileOutput className="h-4 w-4 mr-2" />
                      Output
                    </TabsTrigger>
                  </TabsList>
                  <button
                    onClick={() => setIsLeftPanelFullscreen(!isLeftPanelFullscreen)}
                    className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
                    title="Fullscreen"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
                
                <TabsContent value="description" className="flex-1 m-0 overflow-hidden">
                  <ProblemDescription problem={problem} />
                </TabsContent>
                
                <TabsContent value="output" className="flex-1 m-0 overflow-auto">
                  <OutputPanel results={results} executing={executing} isSubmitMode={isSubmitMode} />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle className="w-2 bg-gray-200 hover:bg-blue-400 transition-colors rounded-full" />

          {/* Right Panel - Editor with Smooth Curves */}
          <ResizablePanel defaultSize={65} minSize={50}>
            <ResizablePanelGroup direction="vertical" className="gap-3">
              {/* Code Editor */}
              <ResizablePanel defaultSize={65} minSize={40}>
                <div className="h-full bg-[#0d1117] rounded-xl overflow-hidden flex flex-col">
                  {/* Professional IDE-Style Code Editor Header */}
                  <div className="h-11 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center px-4 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                      <Code2 className="h-4 w-4 text-slate-300" />
                      <span className="text-slate-200 font-medium text-sm tracking-wide">Code Editor</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-[#0d1117] ">
                    <CodeEditor
                      code={code}
                      onChange={setCode}
                      language={language}
                      readOnly={viewMode}
                    />
                  </div>
                </div>
              </ResizablePanel>

              <ResizableHandle className="h-2 bg-gray-200 hover:bg-blue-400 transition-colors rounded-full" />
              
              {/* Bottom Panel - Testcases */}
              <ResizablePanel 
                ref={outputPanelRef}
                defaultSize={35} 
                minSize={8} 
                maxSize={95}
                collapsible={true}
                collapsedSize={8}
              >
                <div className="h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <Tabs value={rightTab} onValueChange={setRightTab} className="h-full flex flex-col">
                    <TabsList className="w-full justify-start rounded-none bg-white border-b border-gray-200 p-0 h-12">
                      <TabsTrigger 
                        value="testcase" 
                        className="rounded-none data-[state=active]:text-gray-900 text-gray-600 border-b-2 border-transparent data-[state=active]:border-blue-600 font-semibold text-sm px-5 h-12 hover:text-gray-900 hover:bg-gray-50"
                      >
                        <FlaskConical className="h-4 w-4 mr-2" />
                        Test Cases
                      </TabsTrigger>
                      <TabsTrigger 
                        value="result"
                        className="rounded-none data-[state=active]:text-gray-900 text-gray-600 border-b-2 border-transparent data-[state=active]:border-blue-600 font-semibold text-sm px-5 h-12 hover:text-gray-900 hover:bg-gray-50"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Results
                      </TabsTrigger>
                      <div className="ml-auto flex items-center gap-2 pr-4">
                        <button
                          onClick={() => setIsOutputFullscreen(!isOutputFullscreen)}
                          className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
                          title="Fullscreen"
                        >
                          <Maximize2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (outputPanelRef.current) {
                              if (outputPanelRef.current.isCollapsed()) {
                                outputPanelRef.current.expand();
                              } else {
                                outputPanelRef.current.collapse();
                              }
                            }
                          }}
                          className="h-8 w-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all hover:scale-105"
                          title="Collapse"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </TabsList>
                        <TabsContent value="testcase" className="flex-1 m-0 overflow-auto p-6 bg-[#f8fafc]">
                      <div className="flex gap-3 mb-6">
                        {problem.sampleTestCases.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedTestCase(index)}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                              selectedTestCase === index
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm'
                            }`}
                          >
                            Case {index + 1}
                          </button>
                        ))}
                        {customTestCases.map((_, index) => (
                          <div key={`custom-${index}`} className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedTestCase(problem.sampleTestCases.length + index)}
                              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition-all ${
                                selectedTestCase === problem.sampleTestCases.length + index
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm'
                              }`}
                            >
                              Case {problem.sampleTestCases.length + index + 1}
                            </button>
                            <button
                              onClick={() => deleteCustomTestCase(index)}
                              className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete test case"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => {
                            const template = getInputParams();
                            const newCase: {[key: string]: string} = {};
                            Object.keys(template).forEach(key => {
                              newCase[key] = '';
                            });
                            setCustomTestCases([...customTestCases, newCase]);
                            setSelectedTestCase(problem.sampleTestCases.length + customTestCases.length);
                          }}
                          className="px-4 py-2 text-sm font-semibold rounded-xl border border-dashed border-gray-400 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        >
                          + Add Case
                        </button>
                      </div>
                      {selectedTestCase < problem.sampleTestCases.length ? (
                        problem.sampleTestCases[selectedTestCase] && (
                          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="text-[12px] text-gray-600 font-semibold mb-2">Input</div>
                            <div className="w-full px-3 py-2 text-[13px] font-mono bg-gray-50 border border-gray-200 rounded-lg text-gray-800 leading-relaxed whitespace-pre-line">
                              {problem.sampleTestCases[selectedTestCase].input.replace(/\[([^\]]+)\]/g, (match, content) => 
                                '[' + content.replace(/\s+/g, ' ').trim() + ']'
                              )}
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                          {Object.keys(getInputParams()).map((paramName) => (
                            <div key={paramName}>
                              <label className="text-[12px] text-gray-600 font-semibold mb-2 block">{paramName}</label>
                              <input
                                type="text"
                                value={customTestCases[selectedTestCase - problem.sampleTestCases.length]?.[paramName] || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const newCustomCases = [...customTestCases];
                                  newCustomCases[selectedTestCase - problem.sampleTestCases.length][paramName] = value;
                                  setCustomTestCases(newCustomCases);
                                }}
                                className="w-full px-3 py-2 text-[13px] font-mono bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none"
                                placeholder={`[1,2,3]`}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="result" className="flex-1 m-0 overflow-hidden">
                      <ResultsPanel results={results} executing={executing} isSubmitMode={false} />
                    </TabsContent>
                  </Tabs>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Fullscreen Output Modal */}
      {isOutputFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
          <div className="h-11 bg-gray-800 border-b border-gray-700 flex items-center px-3 justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <h1 className="text-white font-bold text-[15px]">Test Results - Fullscreen</h1>
            </div>
            <button
              onClick={() => setIsOutputFullscreen(false)}
              className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              title="Exit Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-800 p-3">
            <div className="h-full bg-white rounded-xl shadow-md overflow-hidden">
              <Tabs value={rightTab} onValueChange={setRightTab} className="h-full flex flex-col">
                <TabsList className="w-full justify-start rounded-none bg-white border-b border-gray-200 p-0 h-10">
                  <TabsTrigger 
                    value="testcase" 
                    className="rounded-none data-[state=active]:text-gray-900 text-gray-600 border-b-2 border-transparent data-[state=active]:border-blue-600 font-semibold text-[13px] px-4 h-10 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <FlaskConical className="h-4 w-4 mr-2" />
                    Testcases
                  </TabsTrigger>
                  <TabsTrigger 
                    value="result"
                    className="rounded-none data-[state=active]:text-gray-900 text-gray-600 border-b-2 border-transparent data-[state=active]:border-blue-600 font-semibold text-[13px] px-4 h-10 hover:text-gray-900 hover:bg-gray-50"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Test Result
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="testcase" className="flex-1 m-0 overflow-auto p-4 bg-gray-50">
                  <div className="flex gap-2 mb-4">
                    {problem.sampleTestCases.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedTestCase(index)}
                        className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all ${
                          selectedTestCase === index
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm'
                        }`}
                      >
                        Case {index + 1}
                      </button>
                    ))}
                    {customTestCases.map((_, index) => (
                      <div key={`custom-${index}`} className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTestCase(problem.sampleTestCases.length + index)}
                          className={`px-3 py-1.5 text-[12px] font-semibold rounded-lg border transition-all ${
                            selectedTestCase === problem.sampleTestCases.length + index
                              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm'
                          }`}
                        >
                          Case {problem.sampleTestCases.length + index + 1}
                        </button>
                        <button
                          onClick={() => deleteCustomTestCase(index)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                          title="Delete test case"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const template = getInputParams();
                        const newCase: {[key: string]: string} = {};
                        Object.keys(template).forEach(key => {
                          newCase[key] = '';
                        });
                        setCustomTestCases([...customTestCases, newCase]);
                        setSelectedTestCase(problem.sampleTestCases.length + customTestCases.length);
                      }}
                      className="px-3 py-1.5 text-[12px] font-semibold rounded-lg border border-dashed border-gray-400 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
                    >
                      + Add Case
                    </button>
                  </div>
                  {selectedTestCase < problem.sampleTestCases.length ? (
                    problem.sampleTestCases[selectedTestCase] && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <div className="text-[12px] text-gray-600 font-semibold mb-2">Input</div>
                        <div className="w-full px-3 py-2 text-[13px] font-mono bg-gray-50 border border-gray-200 rounded-lg text-gray-800 leading-relaxed whitespace-pre-line">
                          {problem.sampleTestCases[selectedTestCase].input.replace(/\[([^\]]+)\]/g, (match, content) => 
                            '[' + content.replace(/\s+/g, ' ').trim() + ']'
                          )}
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
                      {Object.keys(getInputParams()).map((paramName) => (
                        <div key={paramName}>
                          <label className="text-[12px] text-gray-600 font-semibold mb-2 block">{paramName}</label>
                          <input
                            type="text"
                            value={customTestCases[selectedTestCase - problem.sampleTestCases.length]?.[paramName] || ''}
                            onChange={(e) => {
                              const newCustomCases = [...customTestCases];
                              newCustomCases[selectedTestCase - problem.sampleTestCases.length][paramName] = e.target.value;
                              setCustomTestCases(newCustomCases);
                            }}
                            className="w-full px-3 py-2 text-[13px] font-mono bg-gray-50 border border-gray-200 rounded-lg text-gray-800 focus:border-blue-500 focus:outline-none"
                            placeholder={`[1,2,3]`}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="result" className="flex-1 m-0 overflow-hidden">
                  <ResultsPanel results={results} executing={executing} isSubmitMode={false} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Left Panel Modal */}
      {isLeftPanelFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
          <div className="h-11 bg-gray-800 border-b border-gray-700 flex items-center px-3 justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-400" />
              <h1 className="text-white font-bold text-[15px]">{activeTab === 'description' ? 'Problem Description' : 'Output'} - Fullscreen</h1>
            </div>
            <button
              onClick={() => setIsLeftPanelFullscreen(false)}
              className="h-7 w-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
              title="Exit Fullscreen"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden bg-gray-800 p-3">
            <div className="h-full bg-white rounded-xl shadow-md">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <div className="px-6 pt-5 pb-3">
                  <TabsList className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
                    <TabsTrigger 
                      value="description" 
                      className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 font-semibold text-sm px-4 py-2 transition-all hover:text-gray-900"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Description
                    </TabsTrigger>
                    <TabsTrigger 
                      value="output"
                      className="rounded-full data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 font-semibold text-sm px-4 py-2 transition-all hover:text-gray-900"
                    >
                      <FileOutput className="h-4 w-4 mr-2" />
                      Output
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="description" className="flex-1 m-0 overflow-hidden">
                  <ProblemDescription problem={problem} />
                </TabsContent>
                
                <TabsContent value="output" className="flex-1 m-0 overflow-auto">
                  <OutputPanel results={results} executing={executing} isSubmitMode={isSubmitMode} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}