import type { ExecutionStatus } from '../evaluator/types';
import type { TutorState } from './types';

export function getNextState(
  currentState: TutorState,
  result: ExecutionStatus,
  consecutiveFailures: number
): TutorState {
  if (result === 'passed') {
    if (currentState === 'passed') {
      return 'mastered';
    }
    return 'passed';
  }

  // Failed states
  if (result === 'failed' || result === 'compile_error' || result === 'runtime_error') {
    if (currentState === 'new') {
      return 'attempted';
    }

    if (currentState === 'attempted' && consecutiveFailures === 0) {
      return 'first_failure';
    }

    if (currentState === 'first_failure' || consecutiveFailures === 1) {
      return 'second_failure';
    }

    if (consecutiveFailures >= 2) {
      return 'repeated_failure';
    }

    return 'attempted';
  }

  return currentState;
}

export function shouldShowHint(state: TutorState): boolean {
  if (state === 'new' || state === 'passed' || state === 'mastered') {
    return false;
  }

  // Allow hints on failure states
  return state === 'first_failure' || state === 'second_failure' || state === 'repeated_failure';
}

export function shouldOfferSolution(state: TutorState, consecutiveFailures: number): boolean {
  return state === 'repeated_failure' && consecutiveFailures >= 3;
}

export function getHintLevel(
  state: TutorState,
  hintsRequested: number
): 'gentle' | 'strong' | 'diagnostic' {
  if (state === 'first_failure' || hintsRequested === 0) {
    return 'gentle';
  }

  if (state === 'second_failure' || hintsRequested === 1) {
    return 'strong';
  }

  return 'diagnostic';
}
