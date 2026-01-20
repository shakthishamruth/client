import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Send, 
  Clock, 
  Users, 
  ChevronDown,
  ChevronUp,
  Trophy,
  Lightbulb,
  CheckCircle2,
  Code2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";
import { useEffect } from "react";

const problemStatement = `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

**Example 2:**
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

**Constraints:**
- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`;

const starterCode = `def twoSum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass`;

export default function DailyChallenge() {
  const { setCollapsed } = useSidebar();
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(starterCode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [timeRemaining] = useState({ hours: 4, minutes: 32, seconds: 15 });

  useEffect(() => {
    setCollapsed(true);
  }, [setCollapsed]);

  return (
    <MainLayout title="Daily Challenge">
      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)] animate-fade-in">
        {/* Left Panel - Problem Statement */}
        <div className={cn(
          "lg:w-[400px] shrink-0 flex flex-col rounded-xl border border-border bg-card overflow-hidden transition-all duration-300",
          isCollapsed && "lg:w-16"
        )}>
          {/* Problem Header */}
          <div className="flex items-center justify-between border-b border-border p-4">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                  <Code2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Two Sum</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-warning/10 text-warning border-warning/20">
                      Medium
                    </Badge>
                    <Badge variant="outline" className="border-border text-muted-foreground">
                      Arrays
                    </Badge>
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
              {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>

          {/* Problem Content */}
          {!isCollapsed && (
            <div className="flex-1 overflow-auto p-4 scrollbar-thin">
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm text-foreground/90 leading-relaxed">
                  {problemStatement}
                </div>
              </div>

              {/* Hints Section */}
              <div className="mt-6 rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <Lightbulb className="h-4 w-4 text-warning" />
                  Hint
                </div>
                <p className="text-xs text-muted-foreground">
                  Consider using a hash map to store values you've seen...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Center Panel - Code Editor */}
        <div className="flex-1 flex flex-col rounded-xl border border-border bg-card overflow-hidden">
          {/* Editor Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36 h-8 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Run
              </Button>
              <Button variant="glow" size="sm" className="gap-2">
                <Send className="h-4 w-4" />
                Submit
              </Button>
            </div>
          </div>

          {/* Code Editor Area */}
          <div className="flex-1 p-4 font-mono text-sm bg-background/50">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground"
              placeholder="Write your solution here..."
              spellCheck={false}
            />
          </div>

          {/* Output Console */}
          <div className="border-t border-border p-4 bg-secondary/30">
            <div className="text-xs font-medium text-muted-foreground mb-2">Console Output</div>
            <pre className="text-xs text-foreground/70 font-mono">
              {'> Ready to run your code...'}
            </pre>
          </div>
        </div>

        {/* Right Panel - Contest Info */}
        <div className="lg:w-[280px] shrink-0 space-y-4">
          {/* Timer Card */}
          <div className="rounded-xl border border-border bg-card p-4 card-glow">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Clock className="h-4 w-4 text-primary" />
              Time Remaining
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground glow-text">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">Hours</span>
              </div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground glow-text">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">Mins</span>
              </div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground glow-text">
                  {String(timeRemaining.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase">Secs</span>
              </div>
            </div>
          </div>

          {/* Participants Card */}
          <div className="rounded-xl border border-border bg-card p-4 card-glow">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Users className="h-4 w-4 text-primary" />
              Live Participants
            </div>
            <div className="text-2xl font-bold text-foreground">1,284</div>
            <div className="text-xs text-success mt-1">+47 in last hour</div>
          </div>

          {/* Scoring Rules */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
              <Trophy className="h-4 w-4 text-gold" />
              Scoring
            </div>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                <span>100 pts for correct solution</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                <span>Time bonus: 50 pts max (faster = more)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                <span>-10 pts per wrong submission</span>
              </li>
            </ul>
          </div>

          {/* Leaderboard Preview */}
          <Button variant="outline" className="w-full justify-center gap-2" disabled>
            <Trophy className="h-4 w-4" />
            View Leaderboard
            <Badge variant="outline" className="ml-auto text-[10px] border-border">
              After contest
            </Badge>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
