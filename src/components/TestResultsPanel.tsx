import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestCase {
  id: number;
  passed: boolean;
  input?: string;
  expected?: string;
  actual?: string;
}

interface TestResultsPanelProps {
  testCases: TestCase[];
  totalTests: number;
  passedTests: number;
  mode: 'run' | 'submit';
  showInOutput?: boolean;
}

export const TestResultsPanel: React.FC<TestResultsPanelProps> = ({
  testCases,
  totalTests,
  passedTests,
  mode,
  showInOutput = false
}) => {
  // For Run mode: only show in result panel
  // For Submit mode: show in both output and result panels
  if (mode === 'run' && showInOutput) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">
          {mode === 'run' ? 'Test Results' : 'Submission Results'}
        </h3>
        <span className="text-xs text-muted-foreground">
          {passedTests}/{totalTests} passed
        </span>
      </div>

      {/* Test Cases Grid */}
      <div className="grid grid-cols-10 gap-1">
        {Array.from({ length: totalTests }, (_, index) => {
          const testCase = testCases.find(tc => tc.id === index + 1);
          const passed = testCase?.passed ?? false;
          
          return (
            <div
              key={index}
              className={cn(
                "w-6 h-6 rounded-full border-2 border-dashed flex items-center justify-center",
                passed 
                  ? "border-green-500 bg-green-50 dark:bg-green-950" 
                  : "border-red-500 bg-red-50 dark:bg-red-950"
              )}
              title={`Test Case ${index + 1}: ${passed ? 'Passed' : 'Failed'}`}
            >
              {passed ? (
                <CheckCircle className="w-3 h-3 text-green-600" />
              ) : (
                <XCircle className="w-3 h-3 text-red-600" />
              )}
            </div>
          );
        })}
      </div>

      {/* Failed Test Details */}
      {testCases.some(tc => !tc.passed) && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Failed Tests:</h4>
          {testCases
            .filter(tc => !tc.passed)
            .map(tc => (
              <div key={tc.id} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded p-2 text-xs">
                <div className="font-medium text-red-700 dark:text-red-400">Test Case {tc.id}</div>
                {tc.input && <div className="text-muted-foreground">Input: {tc.input}</div>}
                {tc.expected && <div className="text-muted-foreground">Expected: {tc.expected}</div>}
                {tc.actual && <div className="text-muted-foreground">Actual: {tc.actual}</div>}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};