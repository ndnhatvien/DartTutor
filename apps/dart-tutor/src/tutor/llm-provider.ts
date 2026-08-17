import type { Exercise } from '../content/types';
import { getTutorConfig } from './config';
import { DiagnosisResponseSchema, TutorResponseSchema } from './schemas';
import type { DiagnosisResponse, TutorContext, TutorProvider, TutorResponse } from './types';

export class LLMTutorProvider implements TutorProvider {
  private config = getTutorConfig();

  constructor(private exercise: Exercise) {}

  async explain(context: TutorContext): Promise<TutorResponse> {
    try {
      const prompt = this.buildExplainPrompt(context);
      const response = await this.callLLM(prompt);
      const parsed = TutorResponseSchema.parse(response);
      return parsed;
    } catch (error) {
      console.error('LLM explain failed:', error);
      throw error;
    }
  }

  async diagnose(context: TutorContext): Promise<DiagnosisResponse> {
    try {
      const prompt = this.buildDiagnosePrompt(context);
      const response = await this.callLLM(prompt);
      const parsed = DiagnosisResponseSchema.parse(response);
      return parsed;
    } catch (error) {
      console.error('LLM diagnose failed:', error);
      throw error;
    }
  }

  async askQuestion(context: TutorContext): Promise<TutorResponse> {
    try {
      const prompt = this.buildQuestionPrompt(context);
      const response = await this.callLLM(prompt);
      const parsed = TutorResponseSchema.parse(response);
      return parsed;
    } catch (error) {
      console.error('LLM askQuestion failed:', error);
      throw error;
    }
  }

  private buildExplainPrompt(context: TutorContext): string {
    const { currentState, attemptCount, consecutiveFailures, lastResult } = context;

    return `Bạn là một tutor Dart kinh nghiệm. Học viên đang làm bài tập sau:

**Tiêu đề**: ${this.exercise.title}
**Mô tả**: ${this.exercise.instructions}
**Concepts**: ${this.exercise.conceptTags.join(', ')}

**Trạng thái học viên**:
- State: ${currentState}
- Số lần thử: ${attemptCount}
- Failures liên tiếp: ${consecutiveFailures}

${
  lastResult
    ? `**Kết quả lần thử gần nhất**:
- Status: ${lastResult.status}
- Tests passed: ${lastResult.testsPassed}/${lastResult.testsTotal}
- Messages: ${lastResult.messages.join('\n')}
`
    : ''
}

Hãy đưa ra feedback phù hợp với trạng thái hiện tại. Trả về JSON object theo format:
{
  "message": "Thông điệp chính cho học viên",
  "hint": "Gợi ý cụ thể (nếu cần)",
  "encouragement": "Lời động viên (nếu cần)",
  "nextAction": "retry" | "hint" | "solution" | "next_exercise",
  "diagnosticQuestion": "Câu hỏi chẩn đoán (nếu cần)"
}

Nguyên tắc:
- first_failure: gợi ý nhẹ nhàng
- second_failure: gợi ý mạnh hơn
- repeated_failure (3+ fails): đề xuất xem solution
- passed: chúc mừng + next action
- Luôn động viên và tích cực
- Gợi ý phải cụ thể, không chung chung`;
  }

  private buildDiagnosePrompt(context: TutorContext): string {
    const { lastResult, userCode } = context;

    return `Phân tích lỗi của học viên trong bài tập Dart:

**Bài tập**: ${this.exercise.title}
**Concepts**: ${this.exercise.conceptTags.join(', ')}

**Code của học viên**:
\`\`\`dart
${userCode || 'Chưa có code'}
\`\`\`

**Error messages**:
${lastResult?.messages.join('\n') || 'Không có lỗi'}

Phân tích misconceptions và đưa ra suggestions. Trả về JSON:
{
  "misconceptions": [
    {
      "id": "MISCONCEPTION_ID",
      "concept": "concept_name",
      "confidence": 0.8,
      "evidence": ["Evidence 1", "Evidence 2"]
    }
  ],
  "suggestions": ["Suggestion 1", "Suggestion 2"]
}

Các misconception IDs phổ biến:
- NULLABLE_ACCESS
- STRING_CONCATENATION_VS_INTERPOLATION
- VAR_INSTEAD_OF_FINAL
- WRONG_RETURN_TYPE
- MUTABLE_VS_FINAL
- OFF_BY_ONE`;
  }

  private buildQuestionPrompt(context: TutorContext): string {
    const { consecutiveFailures } = context;

    return `Học viên đang gặp khó khăn với bài tập Dart (${consecutiveFailures} failures).

**Bài tập**: ${this.exercise.title}

Đặt một câu hỏi chẩn đoán để hiểu rõ hơn khó khăn của học viên. Trả về JSON:
{
  "message": "Thông điệp giới thiệu",
  "diagnosticQuestion": "Câu hỏi chẩn đoán cụ thể",
  "nextAction": "hint"
}

Câu hỏi nên:
- Cụ thể về bài tập này
- Giúp xác định phần học viên chưa hiểu
- Không quá khó hoặc quá dễ`;
  }

  private async callLLM(prompt: string): Promise<unknown> {
    const response = await fetch(`${this.config.apiBaseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      throw new Error('No content in LLM response');
    }

    // Extract JSON from response (may be wrapped in markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }

    return JSON.parse(jsonMatch[0]);
  }
}
