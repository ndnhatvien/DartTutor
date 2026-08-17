import type { ExerciseResult } from '../evaluator/types';

export type TutorState =
  | 'new'
  | 'attempted'
  | 'first_failure'
  | 'second_failure'
  | 'repeated_failure'
  | 'passed'
  | 'mastered';

export interface Misconception {
  id: string;
  concept: string;
  confidence: number;
  evidence: string[];
}

export interface TutorContext {
  exerciseId: string;
  lessonId: string;
  currentState: TutorState;
  attemptCount: number;
  consecutiveFailures: number;
  hintsRequested: number;
  solutionRequested: boolean;
  lastResult?: ExerciseResult;
  userCode?: string;
  misconceptions: Misconception[];
  conceptsMastered: string[];
}

export interface TutorResponse {
  message: string;
  hint?: string;
  encouragement?: string;
  nextAction?: 'retry' | 'hint' | 'solution' | 'next_exercise';
  diagnosticQuestion?: string;
}

export interface DiagnosisResponse {
  misconceptions: Misconception[];
  suggestions: string[];
}

export interface TutorProvider {
  explain(context: TutorContext): Promise<TutorResponse>;
  diagnose(context: TutorContext): Promise<DiagnosisResponse>;
  askQuestion(context: TutorContext): Promise<TutorResponse>;
}
