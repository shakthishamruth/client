import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Send, 
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Code2,
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { api, Problem } from "@/lib/api";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";

export default function ProblemDetail() {
  const { id } = useParams();
  const location = useLocation();
  const { setCollapsed } = useSidebar();
  const { user } = useAuth();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [problemNumber, setProblemNumber] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    setCollapsed(true);
    
    // Check if we're viewing a submission
    const state = location.state as any;
    if (state?.viewMode && state?.submittedCode) {
      setViewMode(true);
      setCode(state.submittedCode);
      setLanguage(state.language || "python");
    }
  }, [setCollapsed, location.state]);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/problems/${id}`
        );
        if (!response.ok) throw new Error("Problem not found");
        const problemData = await response.json();
        setProblem(problemData);
        setProblemNumber(problemData.problemId); // IMPORTANT
        setCode(getStarterCode(problemData.title, language));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load problem");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

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
    if (problem && !viewMode) {
      setCode(getStarterCode(problem.title, language));
    }
  }, [language, problem, viewMode]);

  const executeCode = async (mode: "run" | "submit") => {
    if (!user || !id) return;

    setExecuting(true);
    setResults(null);
    try {
      const response = await api.post("/user/ide/execute", {
        problemId: problemNumber,
        userId: user.userId,
        code,
        language,
        mode,
      });

      setResults(response.data);
    } catch (error) {
      console.error("Error executing code:", error);
      setResults({ error: "Code execution failed" });
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="Loading Problem...">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !problem) {
    return (
      <MainLayout title="Problem Not Found">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">
            {error || "Problem not found"}
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </MainLayout>
    );
  }

  const difficultyColors = {
    beginner: "bg-success/10 text-success border-success/20",
    intermediate: "bg-warning/10 text-warning border-warning/20",
    expert: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <MainLayout title={problem.title}>
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)] animate-fade-in">
        {/* Left Panel - Problem Statement */}
        <div
          className={cn(
            "lg:w-[400px] shrink-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-300",
            isCollapsed && "lg:w-16"
          )}
        >
          {/* Problem Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                  <Code2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">
                    {problem.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={difficultyColors[problem.difficulty]}>
                      {problem.difficulty}
                    </Badge>
                    {problem.topics.slice(0, 2).map((topic, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-border text-muted-foreground"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="shrink-0"
            >
              {isCollapsed ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Problem Content */}
          {!isCollapsed && (
            <div className="flex-1 overflow-auto p-4 scrollbar-thin">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                  {problem.description}
                </div>
              </div>

              {/* Sample Test Cases */}
              {problem.sampleTestCases &&
                problem.sampleTestCases.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-foreground mb-3">
                      Examples:
                    </h3>
                    {problem.sampleTestCases.map((testCase, index) => (
                      <div
                        key={index}
                        className="mb-4 rounded-lg border border-border bg-secondary/30 p-3"
                      >
                        <div className="text-xs font-medium text-muted-foreground mb-2">
                          Example {index + 1}:
                        </div>
                        <div className="space-y-2 text-xs font-mono">
                          <div>
                            <span className="text-muted-foreground">
                              Input:{" "}
                            </span>
                            <span className="text-foreground">
                              {testCase.input}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">
                              Output:{" "}
                            </span>
                            <span className="text-foreground">
                              {testCase.output}
                            </span>
                          </div>
                          {testCase.explanation && (
                            <div>
                              <span className="text-muted-foreground">
                                Explanation:{" "}
                              </span>
                              <span className="text-foreground">
                                {testCase.explanation}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Constraints */}
              {problem.constraints && (
                <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    Constraints
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {problem.constraints}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={setLanguage} disabled={viewMode}>
                <SelectTrigger className="w-36 h-8 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  {/* <SelectItem value="cpp">C++</SelectItem> */}
                </SelectContent>
              </Select>
              {viewMode && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Viewing Submission
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => executeCode("run")}
                disabled={executing || viewMode}
              >
                <Play className="h-4 w-4" />
                {executing ? "Running..." : "Run"}
              </Button>
              <Button
                variant="glow"
                size="sm"
                className="gap-2"
                onClick={() => executeCode("submit")}
                disabled={executing || viewMode}
              >
                <Send className="h-4 w-4" />
                {executing ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 p-4 font-mono text-sm bg-background/50">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
              placeholder={viewMode ? "Viewing submitted code..." : "Write your solution here..."}
              spellCheck={false}
              readOnly={viewMode}
            />
          </div>

          {/* Output Console */}
          <div className="border-t border-border p-4 bg-secondary/30 max-h-64 overflow-y-auto">
            <div className="text-xs font-medium text-muted-foreground mb-2">
              Console Output
            </div>
            {!results ? (
              <pre className="text-xs text-foreground/70 font-mono">
                {"> Ready to run your code..."}
              </pre>
            ) : results.error ? (
              <pre className="text-xs text-red-400 font-mono">
                {results.error}
              </pre>
            ) : (
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-green-400">{results.passed}</span>{" "}
                  passed,
                  <span className="text-red-400 ml-1">
                    {results.failed}
                  </span>{" "}
                  failed
                </div>
                {results.results?.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`p-2 rounded text-xs ${
                      result.status === "PASS"
                        ? "bg-green-900/30"
                        : "bg-red-900/30"
                    }`}
                  >
                    <div>
                      <strong>Input:</strong> {result.input}
                    </div>
                    <div>
                      <strong>Expected:</strong> {result.expectedOutput}
                    </div>
                    <div>
                      <strong>Output:</strong> {result.output}
                    </div>
                    <div>
                      <strong>Status:</strong> {result.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}