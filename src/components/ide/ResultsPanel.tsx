import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, Clock, Bug, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsPanelProps {
  results: any;
  executing: boolean;
  isSubmitMode?: boolean;
}

export function ResultsPanel({ results, executing, isSubmitMode = false }: ResultsPanelProps) {
  const [selectedCase, setSelectedCase] = useState(0);

  if (executing) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 font-medium">Running tests...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Click "Run" to execute your code and see results here</p>
        </div>
      </div>
    );
  }

  // Handle compilation/runtime errors
  if (results.error || (results.results && results.results.some((r: any) => ['CE', 'RE', 'TLE', 'MLE'].includes(r.status)))) {
    const errorResult = results.results?.find((r: any) => ['CE', 'RE', 'TLE', 'MLE'].includes(r.status));
    const errorType = errorResult?.status || 'CE';
    const errorMessage = errorResult?.error || results.error;
    
    const getErrorIcon = (type: string) => {
      switch (type) {
        case 'CE': return AlertCircle;
        case 'RE': return Bug;
        case 'TLE': return Clock;
        default: return XCircle;
      }
    };

    const getErrorTitle = (type: string) => {
      switch (type) {
        case 'CE': return 'Compilation Error';
        case 'RE': return 'Runtime Error';
        case 'TLE': return 'Time Limit Exceeded';
        case 'MLE': return 'Memory Limit Exceeded';
        default: return 'Error';
      }
    };

    const ErrorIcon = getErrorIcon(errorType);

    return (
      <div className="h-full overflow-auto bg-white p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <ErrorIcon className="h-5 w-5 text-red-600" />
            <span className="font-semibold text-red-800">{getErrorTitle(errorType)}</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap">
              {errorMessage}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const testResults = results.results || [];
  const visibleResults = testResults.filter((r: any) => !r.hidden);

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Test Case Tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-1 p-3 overflow-x-auto">
          {visibleResults.map((result: any, index: number) => {
            const isPassed = result.status === 'PASS' || result.status === 'RUN';
            const isFailed = result.status === 'FAIL';
            
            return (
              <button
                key={index}
                onClick={() => setSelectedCase(index)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                  selectedCase === index
                    ? isPassed
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : isFailed
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-blue-100 text-blue-800 border border-blue-300"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                )}
              >
                {isPassed ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                ) : isFailed ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                )}
                Case {index + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Test Case Details */}
      <div className="flex-1 overflow-auto p-6">
        {visibleResults[selectedCase] && (
          <div className="space-y-6">
            {/* Input Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Input</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {visibleResults[selectedCase].input || 'No input'}
                </pre>
              </div>
            </div>

            {/* Output Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Output</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {visibleResults[selectedCase].output || 'No output'}
                </pre>
              </div>
            </div>

            {/* Expected Output Section (only if available) */}
            {visibleResults[selectedCase].expectedOutput && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Expected Output</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                    {visibleResults[selectedCase].expectedOutput}
                  </pre>
                </div>
              </div>
            )}

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {visibleResults[selectedCase].status === 'PASS' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Test Passed</span>
                </>
              ) : visibleResults[selectedCase].status === 'FAIL' ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Test Failed</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </div>
                  <span className="text-sm font-medium text-blue-800">Test Executed</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}