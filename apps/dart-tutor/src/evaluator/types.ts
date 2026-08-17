export type ExecutionStatus =
  | 'passed'
  | 'failed'
  | 'compile_error'
  | 'runtime_error'
  | 'timeout'
  | 'unavailable';

export interface ExerciseResult {
  exerciseId: string;
  status: ExecutionStatus;
  testsPassed: number;
  testsTotal: number;
  messages: string[];
  durationMs?: number;
  timestamp: string;
}

export interface DartPadMessage {
  type: 'ready' | 'compilationResult' | 'testResult' | 'consoleOutput';
  payload?: unknown;
}
