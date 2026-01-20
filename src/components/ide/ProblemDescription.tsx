import { Badge } from "@/components/ui/badge";
import { Lightbulb, BookOpen, CheckCircle } from "lucide-react";
import { Problem } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ProblemDescriptionProps {
  problem: Problem;
}

export function ProblemDescription({ problem }: ProblemDescriptionProps) {
  const { user } = useAuth();
  
  const isSolved = user?.stats?.solvedProblemIds?.includes(problem._id);

  const difficultyColors = {
    beginner: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200",
    intermediate: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200",
    expert: "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200",
  };

  const difficultyLabels = {
    beginner: "Easy",
    intermediate: "Medium",
    expert: "Hard",
  };

  return (
    <div className="h-full overflow-auto bg-white">
      {/* Problem Title Section */}
      <div className="px-6 py-6 border-b border-gray-100">
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-gray-900 text-xl font-semibold leading-tight">
            {problem.title}
          </h1>
          {isSolved && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium text-xs">Solved</span>
            </div>
          )}
        </div>
        
        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
            problem.difficulty === 'beginner' ? 'bg-green-50 text-green-700 border border-green-200' :
            problem.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {difficultyLabels[problem.difficulty]}
          </Badge>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
            {problem.topic}
          </span>
          {problem.tags?.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="px-2.5 py-1 rounded-lg bg-gray-50 text-gray-700 border border-gray-200 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Problem Description Section */}
      <div className="px-6 py-6 space-y-6">
        <div>
          <h2 className="text-gray-900 text-sm font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-600" />
            Problem Description
          </h2>
          <div className="text-gray-700 text-sm leading-relaxed space-y-3 whitespace-pre-wrap">
            {(() => {
              const isTNEBProblem = problem.title.toLowerCase().includes('tneb') || 
                                   problem.slug?.toLowerCase().includes('tneb') ||
                                   problem.description.toLowerCase().includes('tneb');
              
              let description = problem.description.split('Examples:')[0].trim().replace(/\\n/g, '\n');
              
              if (!isTNEBProblem) {
                // Remove calculation logic sections for non-TNEB problems
                description = description
                  .replace(/calculation[\s\S]*?(?=\n\n|$)/gi, '')
                  .replace(/formula[\s\S]*?(?=\n\n|$)/gi, '')
                  .replace(/algorithm[\s\S]*?(?=\n\n|$)/gi, '')
                  .replace(/approach[\s\S]*?(?=\n\n|$)/gi, '')
                  .replace(/solution[\s\S]*?(?=\n\n|$)/gi, '')
                  .replace(/\n\s*\n/g, '\n\n')
                  .trim();
              }
              
              return description;
            })()}
          </div>
        </div>

        {/* Test Cases Section */}
        {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
          <div className="space-y-4">
            {problem.sampleTestCases.map((testCase, index) => (
              <div key={index}>
                <div className="text-sm font-semibold text-gray-900 mb-3">
                  Example {index + 1}
                </div>
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Input:</div>
                    <div className="bg-white rounded-md px-3 py-2 font-mono text-sm text-gray-900 border border-gray-200">
                      {testCase.input}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-600 mb-2">Output:</div>
                    <div className="bg-white rounded-md px-3 py-2 font-mono text-sm text-gray-900 border border-gray-200">
                      {testCase.output}
                    </div>
                  </div>
                </div>
                {index === 0 && testCase.explanation && (
                  <div className="mt-4">
                    <h3 className="text-gray-900 text-sm font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Explanation
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-3">
                      {testCase.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Constraints */}
      {problem.constraints && (
        <div className="px-6 pb-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-gray-900 text-sm font-semibold mb-3">Constraints</h3>
            <div className="text-sm text-gray-700 font-mono leading-relaxed whitespace-pre-wrap">
              {problem.constraints}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}