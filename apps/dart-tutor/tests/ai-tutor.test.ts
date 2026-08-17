import { describe, expect, it, vi } from 'vitest';
import { isAIAvailable } from '../src/tutor/config';
import { DiagnosisResponseSchema, TutorResponseSchema } from '../src/tutor/schemas';

describe('Tutor Config', () => {
  it('should return false when AI not enabled', () => {
    vi.stubEnv('VITE_TUTOR_AI_ENABLED', 'false');
    expect(isAIAvailable()).toBe(false);
  });

  it('should return false when no API key', () => {
    vi.stubEnv('VITE_TUTOR_AI_ENABLED', 'true');
    vi.stubEnv('VITE_TUTOR_API_KEY', '');
    expect(isAIAvailable()).toBe(false);
  });

  it('should return true when enabled and has API key', () => {
    vi.stubEnv('VITE_TUTOR_AI_ENABLED', 'true');
    vi.stubEnv('VITE_TUTOR_API_KEY', 'sk-test-123');
    expect(isAIAvailable()).toBe(true);
  });
});

describe('Zod Schemas', () => {
  describe('TutorResponseSchema', () => {
    it('should validate minimal response', () => {
      const data = { message: 'Test message' };
      const result = TutorResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate full response', () => {
      const data = {
        message: 'Test message',
        hint: 'Test hint',
        encouragement: 'Keep going!',
        nextAction: 'retry' as const,
        diagnosticQuestion: 'What part is confusing?',
      };
      const result = TutorResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid nextAction', () => {
      const data = {
        message: 'Test',
        nextAction: 'invalid',
      };
      const result = TutorResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject missing message', () => {
      const data = { hint: 'Test hint' };
      const result = TutorResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('DiagnosisResponseSchema', () => {
    it('should validate response with misconceptions', () => {
      const data = {
        misconceptions: [
          {
            id: 'NULLABLE_ACCESS',
            concept: 'null_safety',
            confidence: 0.8,
            evidence: ['Error message contains null'],
          },
        ],
        suggestions: ['Check for null before accessing'],
      };
      const result = DiagnosisResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should validate empty misconceptions', () => {
      const data = {
        misconceptions: [],
        suggestions: ['Review the code'],
      };
      const result = DiagnosisResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject confidence out of range', () => {
      const data = {
        misconceptions: [
          {
            id: 'TEST',
            concept: 'test',
            confidence: 1.5,
            evidence: [],
          },
        ],
        suggestions: [],
      };
      const result = DiagnosisResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid structure', () => {
      const data = { misconceptions: 'not an array' };
      const result = DiagnosisResponseSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
