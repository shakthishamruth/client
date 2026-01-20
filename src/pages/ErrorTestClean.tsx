import React, { useState } from 'react';
import { OutputPanel } from '../components/ide/OutputPanel';
import { Button } from '../components/ui/button';

const ErrorTestPage = () => {
  const [currentError, setCurrentError] = useState(null);
  const [executing, setExecuting] = useState(false);

  const errorExamples = {
    CE: {
      error: "Main.java:3: error: ')' expected\n        System.out.println(\"Hello World\"  // Missing semicolon\n                                        ^\n1 error",
      results: [{
        status: "CE",
        error: "Main.java:3: error: ')' expected\n        System.out.println(\"Hello World\"  // Missing semicolon\n                                        ^\n1 error",
        output: "",
        hidden: false
      }],
      passed: 0,
      total: 1
    },
    RE: {
      error: "Exception in thread \"main\" java.lang.ArrayIndexOutOfBoundsException: Index 10 out of bounds for length 5\n\tat Main.main(Main.java:4)",
      results: [{
        status: "RE",
        error: "Exception in thread \"main\" java.lang.ArrayIndexOutOfBoundsException: Index 10 out of bounds for length 5\n\tat Main.main(Main.java:4)",
        output: "",
        hidden: false
      }],
      passed: 0,
      total: 1
    },
    TLE: {
      error: "Time limit exceeded",
      results: [{
        status: "TLE",
        error: "Time limit exceeded",
        output: "",
        hidden: false
      }],
      passed: 0,
      total: 1
    },
    MLE: {
      error: "Memory limit exceeded",
      results: [{
        status: "MLE",
        error: "Memory limit exceeded",
        output: "",
        hidden: false
      }],
      passed: 0,
      total: 1
    },
    SUCCESS: {
      results: [{
        status: "PASS",
        input: "5",
        expectedOutput: "25",
        output: "25",
        hidden: false
      }],
      passed: 1,
      total: 1
    }
  };

  const simulateExecution = (errorType) => {
    setExecuting(true);
    setTimeout(() => {
      setCurrentError(errorExamples[errorType]);
      setExecuting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Error Display Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Different Error Types</h2>
            <div className="space-y-3">
              <Button 
                onClick={() => simulateExecution('CE')}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={executing}
              >
                Test Compilation Error (CE)
              </Button>
              <Button 
                onClick={() => simulateExecution('RE')}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={executing}
              >
                Test Runtime Error (RE)
              </Button>
              <Button 
                onClick={() => simulateExecution('TLE')}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                disabled={executing}
              >
                Test Time Limit Exceeded (TLE)
              </Button>
              <Button 
                onClick={() => simulateExecution('MLE')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={executing}
              >
                Test Memory Limit Exceeded (MLE)
              </Button>
              <Button 
                onClick={() => simulateExecution('SUCCESS')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={executing}
              >
                Test Success Case
              </Button>
              <Button 
                onClick={() => setCurrentError(null)}
                variant="outline"
                className="w-full"
                disabled={executing}
              >
                Clear Output
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center px-4">
              <h3 className="text-sm font-semibold text-gray-900">Output Panel Preview</h3>
            </div>
            <div className="h-96">
              <OutputPanel 
                results={currentError} 
                executing={executing} 
                isSubmitMode={false}
              />
            </div>
          </div>
        </div>

        {currentError && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Error Data Structure</h3>
            <pre className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 overflow-auto">
              {JSON.stringify(currentError, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorTestPage;