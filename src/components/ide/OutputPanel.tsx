import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface OutputPanelProps {
  results: any;
  executing: boolean;
  isSubmitMode?: boolean;
}

export function OutputPanel({ results, executing, isSubmitMode = false }: OutputPanelProps) {
  if (executing) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600 font-medium">Executing...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="h-full flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">{isSubmitMode ? "Submit your code to see the results here" : "Run code to see results"}</p>
        </div>
      </div>
    );
  }

  // Handle execution errors - show as plain text
  if (results.error || (results.results && results.results.some((r: any) => ['CE', 'RE', 'TLE', 'MLE'].includes(r.status)))) {
    const errorResult = results.results?.find((r: any) => ['CE', 'RE', 'TLE', 'MLE'].includes(r.status));
    const errorType = errorResult?.status || 'CE';
    const errorMessage = errorResult?.error || results.error;
    
    const getErrorTitle = (type: string) => {
      switch (type) {
        case 'CE': return 'Compilation Error';
        case 'RE': return 'Runtime Error';
        case 'TLE': return 'Time Limit Exceeded';
        case 'MLE': return 'Memory Limit Exceeded';
        default: return 'Error';
      }
    };
    
    return (
      <div className="h-full overflow-auto bg-white p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-800">{getErrorTitle(errorType)}</h3>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <pre className="text-sm text-red-400 font-mono whitespace-pre-wrap leading-relaxed">
              {errorMessage}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  const allPassed = results.passed === results.total;
  const firstFailedTest = results.results?.find((r: any) => r.status === "FAIL");

  return (
    <div className="h-full overflow-auto bg-white p-6">
      <div className="space-y-6">
        {/* Status Header */}
        <div className={`border-2 rounded-xl p-6 text-center ${
          allPassed 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {allPassed ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <h2 className={`text-xl font-bold ${
              allPassed ? 'text-green-800' : 'text-red-800'
            }`}>
              {allPassed ? 'Accepted' : 'Wrong Answer'}
            </h2>
          </div>
          <p className="text-gray-600 font-medium">
            {results.passed}/{results.total} testcases passed
          </p>
        </div>

        {/* Failed Test Case Details */}
        {!allPassed && firstFailedTest && !firstFailedTest.hidden && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Test Case Failed At:</h3>
            
            {/* Input */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Input</h4>
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
                <pre className="text-sm font-mono text-gray-800 whitespace-pre-wrap">
                  {firstFailedTest.input}
                </pre>
              </div>
            </div>

            {/* Your Output */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Your Output</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <pre className="text-sm font-mono text-red-800 whitespace-pre-wrap">
                  {firstFailedTest.output}
                </pre>
              </div>
            </div>

            {/* Expected Output */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Expected Output</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <pre className="text-sm font-mono text-green-800 whitespace-pre-wrap">
                  {firstFailedTest.expectedOutput}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}