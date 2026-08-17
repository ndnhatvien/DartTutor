import { describe, expect, it } from 'vitest';
import { detectMisconceptions } from '../src/tutor/misconceptions';
import {
  getHintLevel,
  getNextState,
  shouldOfferSolution,
  shouldShowHint,
} from '../src/tutor/state-machine';

describe('State Machine', () => {
  describe('getNextState', () => {
    it('should transition from new to attempted on first failure', () => {
      const next = getNextState('new', 'failed', 0);
      expect(next).toBe('attempted');
    });

    it('should transition to first_failure after first fail', () => {
      const next = getNextState('attempted', 'failed', 0);
      expect(next).toBe('first_failure');
    });

    it('should transition to second_failure after second fail', () => {
      const next = getNextState('first_failure', 'failed', 1);
      expect(next).toBe('second_failure');
    });

    it('should transition to repeated_failure after multiple fails', () => {
      const next = getNextState('second_failure', 'failed', 2);
      expect(next).toBe('repeated_failure');
    });

    it('should transition to passed on success', () => {
      const next = getNextState('first_failure', 'passed', 0);
      expect(next).toBe('passed');
    });

    it('should transition to mastered after passing twice', () => {
      const next = getNextState('passed', 'passed', 0);
      expect(next).toBe('mastered');
    });
  });

  describe('shouldShowHint', () => {
    it('should not show hint for new state', () => {
      expect(shouldShowHint('new')).toBe(false);
    });

    it('should show hint for first_failure', () => {
      expect(shouldShowHint('first_failure')).toBe(true);
    });

    it('should show hint for repeated_failure', () => {
      expect(shouldShowHint('repeated_failure')).toBe(true);
    });

    it('should not show hint for passed state', () => {
      expect(shouldShowHint('passed')).toBe(false);
    });
  });

  describe('shouldOfferSolution', () => {
    it('should offer solution after 3 consecutive failures', () => {
      expect(shouldOfferSolution('repeated_failure', 3)).toBe(true);
    });

    it('should not offer solution before 3 failures', () => {
      expect(shouldOfferSolution('repeated_failure', 2)).toBe(false);
    });
  });

  describe('getHintLevel', () => {
    it('should return gentle for first_failure', () => {
      expect(getHintLevel('first_failure', 0)).toBe('gentle');
    });

    it('should return strong for second_failure', () => {
      expect(getHintLevel('second_failure', 1)).toBe('strong');
    });

    it('should return diagnostic for repeated_failure', () => {
      expect(getHintLevel('repeated_failure', 2)).toBe('diagnostic');
    });
  });
});

describe('Misconception Detection', () => {
  it('should detect nullable access error', () => {
    const errorMessage =
      "A value of type 'String?' can't be assigned to a variable of type 'String'";
    const userCode = 'String? title = null;';
    const result = detectMisconceptions(errorMessage, userCode, ['null_safety']);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.id).toBe('NULLABLE_ACCESS');
  });

  it('should detect string concatenation instead of interpolation', () => {
    const errorMessage = 'Test failed';
    const userCode = "return 'Hello, ' + name + '!';";
    const result = detectMisconceptions(errorMessage, userCode, ['string_interpolation']);

    const found = result.find((m) => m.id === 'STRING_CONCATENATION_VS_INTERPOLATION');
    expect(found).toBeDefined();
  });

  it('should detect var instead of final', () => {
    const errorMessage = 'Expected final';
    const userCode = 'var userName = "Alice";';
    const result = detectMisconceptions(errorMessage, userCode, ['final', 'immutability']);

    const found = result.find((m) => m.id === 'VAR_INSTEAD_OF_FINAL');
    expect(found).toBeDefined();
  });

  it('should return empty array when no misconceptions found', () => {
    const errorMessage = 'Some random error';
    const userCode = 'final x = 1;';
    const result = detectMisconceptions(errorMessage, userCode, []);

    expect(result).toEqual([]);
  });

  it('should sort misconceptions by confidence', () => {
    const errorMessage = 'null check operator nullable A value of type';
    const userCode = 'String? x = null;';
    const result = detectMisconceptions(errorMessage, userCode, ['null_safety']);

    if (result.length > 1) {
      expect(result[0]?.confidence).toBeGreaterThanOrEqual(result[1]?.confidence || 0);
    }
  });
});
