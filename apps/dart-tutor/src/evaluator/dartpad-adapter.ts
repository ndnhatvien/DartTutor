import type { ExecutionStatus, ExerciseResult } from './types';

export interface TestOutput {
  passed: number;
  failed: number;
  messages: string[];
}

/**
 * Parse Dart test output to determine pass/fail status
 * Expected format from dart test package:
 * "00:00 +0: test description"
 * "00:00 +1: All tests passed!"
 * "00:00 +0 -1: Some tests failed."
 */
export function parseTestOutput(output: string): TestOutput {
  const lines = output.split('\n').filter((line) => line.trim());

  let passed = 0;
  let failed = 0;
  const messages: string[] = [];

  for (const line of lines) {
    messages.push(line);

    // Match test result patterns
    // +N = passed tests, -N = failed tests
    const passMatch = line.match(/\+(\d+)/);
    const failMatch = line.match(/-(\d+)/);

    if (passMatch?.[1]) {
      const count = Number.parseInt(passMatch[1], 10);
      if (!Number.isNaN(count)) {
        passed = Math.max(passed, count);
      }
    }

    if (failMatch?.[1]) {
      const count = Number.parseInt(failMatch[1], 10);
      if (!Number.isNaN(count)) {
        failed = Math.max(failed, count);
      }
    }

    // Check for "All tests passed!"
    if (line.includes('All tests passed')) {
      passed = Math.max(passed, 1);
    }
  }

  return { passed, failed, messages };
}

export function createExerciseResult(
  exerciseId: string,
  output: string,
  isCompilationError: boolean,
  startTime: number
): ExerciseResult {
  const durationMs = Date.now() - startTime;

  if (isCompilationError) {
    return {
      exerciseId,
      status: 'compile_error',
      testsPassed: 0,
      testsTotal: 0,
      messages: [output],
      durationMs,
      timestamp: new Date().toISOString(),
    };
  }

  const testOutput = parseTestOutput(output);
  const total = testOutput.passed + testOutput.failed;

  let status: ExecutionStatus;
  if (total === 0) {
    status = 'unavailable';
  } else if (testOutput.failed > 0) {
    status = 'failed';
  } else {
    status = 'passed';
  }

  return {
    exerciseId,
    status,
    testsPassed: testOutput.passed,
    testsTotal: total,
    messages: testOutput.messages,
    durationMs,
    timestamp: new Date().toISOString(),
  };
}
