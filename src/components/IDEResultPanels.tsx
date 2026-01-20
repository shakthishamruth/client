import React, { useState } from 'react';
import { TestResultsPanel } from './TestResultsPanel';

export const IDEResultPanels = () => {
  const [mode, setMode] = useState<'run' | 'submit'>('run');
  const [testResults] = useState([
    { id: 1, passed: true },
    { id: 2, passed: true },
    { id: 3, passed: false, input: "[1,2,3]", expected: "6", actual: "5" },
    { id: 4, passed: true },
    { id: 5, passed: false, input: "[4,5]", expected: "9", actual: "8" }
  ]);

  return (
    <div className="space-y-4">
      {/* Control buttons */}
      <div className="flex gap-2">
        <button 
          onClick={() => setMode('run')}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Run
        </button>
        <button 
          onClick={() => setMode('submit')}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Submit
        </button>
      </div>

      {/* Output Panel - only shows for Submit mode */}
      {mode === 'submit' && (
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-2">Output Panel</h3>
          <TestResultsPanel
            testCases={testResults}
            totalTests={10}
            passedTests={8}
            mode={mode}
            showInOutput={true}
          />
        </div>
      )}

      {/* Result Panel - always shows */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Result Panel</h3>
        <TestResultsPanel
          testCases={testResults}
          totalTests={10}
          passedTests={8}
          mode={mode}
          showInOutput={false}
        />
      </div>
    </div>
  );
};