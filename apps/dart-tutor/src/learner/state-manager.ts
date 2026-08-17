import type { ExerciseResult } from '../evaluator/types';
import { getNextState } from '../tutor/state-machine';
import type { TutorState } from '../tutor/types';
import type {
  ExerciseAttempt,
  LearnerConceptState,
  LearnerExerciseState,
  LearnerState,
} from './types';

const STORAGE_KEY = 'dart-tutor-learner-state';

export class LearnerStateManager {
  private state: LearnerState;

  constructor() {
    this.state = this.loadFromStorage();
  }

  getExerciseState(exerciseId: string): LearnerExerciseState | null {
    return this.state.exercises.get(exerciseId) || null;
  }

  recordAttempt(
    exerciseId: string,
    lessonId: string,
    result: ExerciseResult,
    concepts: string[],
    hintsUsed: number,
    solutionViewed: boolean
  ): void {
    const currentState = this.state.exercises.get(exerciseId);
    const currentTutorState: TutorState = currentState?.state || 'new';
    const consecutiveFailures =
      result.status === 'passed' ? 0 : (currentState?.consecutiveFailures || 0) + 1;

    const newTutorState = getNextState(currentTutorState, result.status, consecutiveFailures);

    const attempt: ExerciseAttempt = {
      exerciseId,
      lessonId,
      timestamp: result.timestamp,
      status:
        result.status === 'passed'
          ? 'passed'
          : result.status === 'compile_error'
            ? 'compile_error'
            : 'failed',
      durationMs: result.durationMs || 0,
      hintsUsed,
      solutionViewed,
    };

    const exerciseState: LearnerExerciseState = {
      exerciseId,
      lessonId,
      state: newTutorState,
      attemptCount: (currentState?.attemptCount || 0) + 1,
      consecutiveFailures,
      hintsRequested: currentState?.hintsRequested || 0,
      solutionRequested: solutionViewed || currentState?.solutionRequested || false,
      lastAttemptAt: result.timestamp,
      firstPassedAt:
        result.status === 'passed' && !currentState?.firstPassedAt
          ? result.timestamp
          : currentState?.firstPassedAt || null,
      bestScore:
        result.status === 'passed'
          ? Math.max(result.testsPassed / result.testsTotal, currentState?.bestScore || 0)
          : currentState?.bestScore || 0,
      attempts: [...(currentState?.attempts || []), attempt],
    };

    this.state.exercises.set(exerciseId, exerciseState);

    // Update concept states
    for (const concept of concepts) {
      this.updateConceptState(concept, result.status === 'passed');
    }

    this.saveToStorage();
  }

  requestHint(exerciseId: string): void {
    const exerciseState = this.state.exercises.get(exerciseId);
    if (exerciseState) {
      exerciseState.hintsRequested++;
      this.saveToStorage();
    }
  }

  requestSolution(exerciseId: string): void {
    const exerciseState = this.state.exercises.get(exerciseId);
    if (exerciseState) {
      exerciseState.solutionRequested = true;
      this.saveToStorage();
    }
  }

  getConceptMastery(concept: string): number {
    const conceptState = this.state.concepts.get(concept);
    return conceptState?.mastery || 0;
  }

  getProgress(lessonId: string): { completed: number; total: number } {
    let completed = 0;
    let total = 0;

    for (const [, exerciseState] of this.state.exercises) {
      if (exerciseState.lessonId === lessonId) {
        total++;
        if (exerciseState.state === 'passed' || exerciseState.state === 'mastered') {
          completed++;
        }
      }
    }

    return { completed, total };
  }

  private updateConceptState(concept: string, passed: boolean): void {
    const current = this.state.concepts.get(concept) || {
      concept,
      attempts: 0,
      passes: 0,
      consecutiveFailures: 0,
      lastAttemptAt: null,
      mastery: 0,
    };

    const updated: LearnerConceptState = {
      ...current,
      attempts: current.attempts + 1,
      passes: passed ? current.passes + 1 : current.passes,
      consecutiveFailures: passed ? 0 : current.consecutiveFailures + 1,
      lastAttemptAt: new Date().toISOString(),
      mastery: this.calculateMastery(
        current.attempts + 1,
        passed ? current.passes + 1 : current.passes
      ),
    };

    this.state.concepts.set(concept, updated);
  }

  private calculateMastery(attempts: number, passes: number): number {
    if (attempts === 0) return 0;

    const successRate = passes / attempts;
    const attemptFactor = Math.min(attempts / 5, 1); // Cap at 5 attempts

    return Math.min(successRate * attemptFactor, 1);
  }

  private loadFromStorage(): LearnerState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          exercises: new Map(Object.entries(parsed.exercises || {})),
          concepts: new Map(Object.entries(parsed.concepts || {})),
        };
      }
    } catch (error) {
      console.error('Failed to load learner state:', error);
    }

    return {
      exercises: new Map(),
      concepts: new Map(),
    };
  }

  private saveToStorage(): void {
    try {
      const serialized = {
        exercises: Object.fromEntries(this.state.exercises),
        concepts: Object.fromEntries(this.state.concepts),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to save learner state:', error);
    }
  }

  reset(): void {
    this.state = {
      exercises: new Map(),
      concepts: new Map(),
    };
    localStorage.removeItem(STORAGE_KEY);
  }
}
