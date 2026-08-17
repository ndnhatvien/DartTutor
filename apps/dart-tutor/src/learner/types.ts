import type { TutorState } from '../tutor/types';

export interface LearnerConceptState {
  concept: string;
  attempts: number;
  passes: number;
  consecutiveFailures: number;
  lastAttemptAt: string | null;
  mastery: number;
}

export interface ExerciseAttempt {
  exerciseId: string;
  lessonId: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'compile_error';
  durationMs: number;
  hintsUsed: number;
  solutionViewed: boolean;
}

export interface LearnerExerciseState {
  exerciseId: string;
  lessonId: string;
  state: TutorState;
  attemptCount: number;
  consecutiveFailures: number;
  hintsRequested: number;
  solutionRequested: boolean;
  lastAttemptAt: string | null;
  firstPassedAt: string | null;
  bestScore: number;
  attempts: ExerciseAttempt[];
}

export interface LearnerState {
  exercises: Map<string, LearnerExerciseState>;
  concepts: Map<string, LearnerConceptState>;
}
