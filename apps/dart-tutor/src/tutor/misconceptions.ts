import type { Misconception } from './types';

export type MisconceptionId =
  | 'NULLABLE_ACCESS'
  | 'WRONG_RETURN_TYPE'
  | 'MUTABLE_VS_FINAL'
  | 'ASYNC_NOT_AWAITED'
  | 'ITERABLE_VS_LIST_CONFUSION'
  | 'OFF_BY_ONE'
  | 'WRONG_BOOLEAN_CONDITION'
  | 'EXCEPTION_NOT_HANDLED'
  | 'STRING_CONCATENATION_VS_INTERPOLATION'
  | 'VAR_INSTEAD_OF_FINAL';

interface MisconceptionPattern {
  id: MisconceptionId;
  concept: string;
  patterns: string[];
  explanation: string;
}

const MISCONCEPTION_PATTERNS: MisconceptionPattern[] = [
  {
    id: 'NULLABLE_ACCESS',
    concept: 'null_safety',
    patterns: [
      'null check operator',
      'nullable',
      'null',
      'A value of type',
      "can't be assigned to",
    ],
    explanation: 'Đang truy cập giá trị nullable mà không kiểm tra null',
  },
  {
    id: 'STRING_CONCATENATION_VS_INTERPOLATION',
    concept: 'string_interpolation',
    patterns: ["+ '", "' +", 'concatenat'],
    explanation: 'Đang dùng string concatenation (+) thay vì interpolation ($)',
  },
  {
    id: 'VAR_INSTEAD_OF_FINAL',
    concept: 'immutability',
    patterns: ['var ', 'cannot be assigned'],
    explanation: 'Đang dùng var thay vì final/const',
  },
  {
    id: 'WRONG_RETURN_TYPE',
    concept: 'type_system',
    patterns: ['return type', 'Expected', 'but got'],
    explanation: 'Return type không đúng với khai báo',
  },
  {
    id: 'MUTABLE_VS_FINAL',
    concept: 'immutability',
    patterns: ['final', 'const', 'cannot be assigned', 'immutable'],
    explanation: 'Đang cố thay đổi giá trị final/const',
  },
  {
    id: 'OFF_BY_ONE',
    concept: 'indexing',
    patterns: ['index', 'out of range', 'RangeError'],
    explanation: 'Lỗi off-by-one khi truy cập index',
  },
  {
    id: 'WRONG_BOOLEAN_CONDITION',
    concept: 'conditionals',
    patterns: ['Expected: true', 'Expected: false', 'Actual:'],
    explanation: 'Điều kiện boolean không đúng',
  },
];

export function detectMisconceptions(
  errorMessage: string,
  userCode: string,
  conceptTags: string[]
): Misconception[] {
  const misconceptions: Misconception[] = [];

  for (const pattern of MISCONCEPTION_PATTERNS) {
    const evidence: string[] = [];
    let matchCount = 0;

    // Check error message
    for (const p of pattern.patterns) {
      if (errorMessage.toLowerCase().includes(p.toLowerCase())) {
        evidence.push(`Error contains: "${p}"`);
        matchCount++;
      }
    }

    // Check user code
    if (pattern.id === 'STRING_CONCATENATION_VS_INTERPOLATION') {
      if (userCode.includes("' +") || userCode.includes("+ '")) {
        evidence.push('Code uses string concatenation (+)');
        matchCount++;
      }
    }

    if (pattern.id === 'VAR_INSTEAD_OF_FINAL') {
      if (userCode.includes('var ') && conceptTags.includes('final')) {
        evidence.push('Code uses var instead of final');
        matchCount++;
      }
    }

    // If matched, calculate confidence
    if (matchCount > 0) {
      const confidence = Math.min(matchCount / pattern.patterns.length, 1.0);

      misconceptions.push({
        id: pattern.id,
        concept: pattern.concept,
        confidence,
        evidence,
      });
    }
  }

  // Sort by confidence (highest first)
  return misconceptions.sort((a, b) => b.confidence - a.confidence);
}

export function getMisconceptionExplanation(id: MisconceptionId): string {
  const pattern = MISCONCEPTION_PATTERNS.find((p) => p.id === id);
  return pattern?.explanation || 'Unknown misconception';
}
