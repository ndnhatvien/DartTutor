import { describe, expect, it } from 'vitest';
import { createExerciseResult, parseTestOutput } from '../src/evaluator/dartpad-adapter';

describe('parseTestOutput', () => {
  it('should parse passing tests', () => {
    const output = `
00:00 +0: test description
00:00 +1: All tests passed!
    `;
    const result = parseTestOutput(output);

    expect(result.passed).toBeGreaterThanOrEqual(1);
    expect(result.failed).toBe(0);
  });

  it('should parse failing tests', () => {
    const output = `
00:00 +0: test one
00:00 +0 -1: test two failed
00:00 +1 -1: Some tests failed
    `;
    const result = parseTestOutput(output);

    expect(result.passed).toBeGreaterThanOrEqual(1);
    expect(result.failed).toBeGreaterThanOrEqual(1);
  });

  it('should handle empty output', () => {
    const result = parseTestOutput('');

    expect(result.passed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.messages).toEqual([]);
  });

  it('should collect all messages', () => {
    const output = 'Line 1\nLine 2\nLine 3';
    const result = parseTestOutput(output);

    expect(result.messages).toHaveLength(3);
    expect(result.messages[0]).toBe('Line 1');
  });
});

describe('createExerciseResult', () => {
  it('should create compile_error result', () => {
    const result = createExerciseResult('ex-1', 'Error: syntax error', true, Date.now() - 100);

    expect(result.exerciseId).toBe('ex-1');
    expect(result.status).toBe('compile_error');
    expect(result.testsPassed).toBe(0);
    expect(result.testsTotal).toBe(0);
    expect(result.messages[0]).toBe('Error: syntax error');
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('should create passed result', () => {
    const output = '00:00 +3: All tests passed!';
    const result = createExerciseResult('ex-1', output, false, Date.now() - 200);

    expect(result.status).toBe('passed');
    expect(result.testsPassed).toBeGreaterThanOrEqual(1);
    expect(result.testsTotal).toBeGreaterThan(0);
  });

  it('should create failed result', () => {
    const output = '00:00 +2 -1: Some tests failed';
    const result = createExerciseResult('ex-1', output, false, Date.now() - 150);

    expect(result.status).toBe('failed');
    expect(result.testsPassed).toBeGreaterThan(0);
    expect(result.testsTotal).toBeGreaterThan(result.testsPassed);
  });

  it('should create unavailable result for no test output', () => {
    const result = createExerciseResult('ex-1', 'Hello World', false, Date.now());

    expect(result.status).toBe('unavailable');
    expect(result.testsPassed).toBe(0);
    expect(result.testsTotal).toBe(0);
  });
});
