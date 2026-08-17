import { z } from 'zod';

export const MisconceptionSchema = z.object({
  id: z.string(),
  concept: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(z.string()),
});

export const TutorResponseSchema = z.object({
  message: z.string(),
  hint: z.string().optional(),
  encouragement: z.string().optional(),
  nextAction: z.enum(['retry', 'hint', 'solution', 'next_exercise']).optional(),
  diagnosticQuestion: z.string().optional(),
});

export const DiagnosisResponseSchema = z.object({
  misconceptions: z.array(MisconceptionSchema),
  suggestions: z.array(z.string()),
});

export type TutorResponseDTO = z.infer<typeof TutorResponseSchema>;
export type DiagnosisResponseDTO = z.infer<typeof DiagnosisResponseSchema>;
