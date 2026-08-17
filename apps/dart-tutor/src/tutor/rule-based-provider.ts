import type { Exercise } from '../content/types';
import { detectMisconceptions, getMisconceptionExplanation } from './misconceptions';
import type { DiagnosisResponse, TutorContext, TutorProvider, TutorResponse } from './types';

export class RuleBasedTutorProvider implements TutorProvider {
  constructor(private exercise: Exercise) {}

  async explain(context: TutorContext): Promise<TutorResponse> {
    const { currentState, hintsRequested, consecutiveFailures } = context;

    // Handle passed state
    if (currentState === 'passed') {
      return {
        message: '🎉 Chúc mừng! Bạn đã hoàn thành bài tập này.',
        encouragement: 'Code của bạn đã pass tất cả test cases.',
        nextAction: 'next_exercise',
      };
    }

    if (currentState === 'mastered') {
      return {
        message: '⭐ Tuyệt vời! Bạn đã thành thạo bài tập này.',
        encouragement: 'Tiếp tục với bài tập tiếp theo nhé!',
        nextAction: 'next_exercise',
      };
    }

    // Handle failure states
    if (currentState === 'first_failure') {
      const hint = this.getProgressiveHint('gentle', hintsRequested);
      return {
        message: '💭 Có vẻ chưa đúng. Đừng lo, hãy thử lại!',
        hint,
        encouragement: 'Đọc kỹ yêu cầu và thử lại xem.',
        nextAction: 'hint',
      };
    }

    if (currentState === 'second_failure') {
      const hint = this.getProgressiveHint('strong', hintsRequested);
      return {
        message: '🤔 Vẫn chưa đúng. Hãy xem gợi ý chi tiết hơn.',
        hint,
        encouragement: 'Bạn đã gần đúng rồi, cố gắng thêm một chút!',
        nextAction: 'hint',
      };
    }

    if (currentState === 'repeated_failure') {
      if (consecutiveFailures >= 3) {
        return {
          message: '🆘 Có vẻ bạn đang gặp khó khăn.',
          hint: 'Nếu vẫn chưa hiểu, bạn có thể xem solution để học cách làm.',
          encouragement: 'Đừng nản! Học từ solution cũng là một cách học tốt.',
          nextAction: 'solution',
          diagnosticQuestion: 'Bạn đã hiểu yêu cầu của bài tập chưa?',
        };
      }

      const hint = this.getProgressiveHint('diagnostic', hintsRequested);
      return {
        message: '🔍 Hãy phân tích lỗi kỹ hơn.',
        hint,
        diagnosticQuestion: 'Phần nào của bài toán bạn đang gặp khó khăn?',
        nextAction: 'hint',
      };
    }

    // Default: new or attempted
    return {
      message: '👋 Hãy thử viết code để giải bài tập này!',
      encouragement: 'Đọc kỹ yêu cầu và bắt đầu code thôi.',
      nextAction: 'retry',
    };
  }

  async diagnose(context: TutorContext): Promise<DiagnosisResponse> {
    const { lastResult, userCode } = context;

    if (!lastResult || !userCode) {
      return {
        misconceptions: [],
        suggestions: ['Hãy chạy code để xem kết quả'],
      };
    }

    const errorMessage = lastResult.messages.join('\n');
    const misconceptions = detectMisconceptions(errorMessage, userCode, this.exercise.conceptTags);

    const suggestions: string[] = [];

    if (misconceptions.length > 0) {
      const topMisconception = misconceptions[0];
      if (topMisconception) {
        const explanation = getMisconceptionExplanation(topMisconception.id as never);
        suggestions.push(explanation);

        // Add concept-specific suggestions
        const commonMistake = this.exercise.commonMistakes.find(
          (m) => m.id === topMisconception.id
        );
        if (commonMistake) {
          suggestions.push(commonMistake.hint);
        }
      }
    } else {
      suggestions.push('Kiểm tra lại logic của code');
      suggestions.push('So sánh output thực tế với output mong đợi');
    }

    return {
      misconceptions,
      suggestions,
    };
  }

  async askQuestion(context: TutorContext): Promise<TutorResponse> {
    const { currentState, consecutiveFailures } = context;

    if (currentState === 'repeated_failure' && consecutiveFailures >= 2) {
      return {
        message: '❓ Để giúp bạn tốt hơn, hãy trả lời:',
        diagnosticQuestion: this.getDiagnosticQuestion(),
        nextAction: 'hint',
      };
    }

    return {
      message: '💡 Hãy thử suy nghĩ về vấn đề theo cách khác.',
      nextAction: 'retry',
    };
  }

  private getProgressiveHint(
    level: 'gentle' | 'strong' | 'diagnostic',
    hintsRequested: number
  ): string {
    const hints = this.exercise.hints;

    if (hints.length === 0) {
      return 'Đọc lại yêu cầu và thử lại.';
    }

    if (level === 'gentle') {
      return hints[0] ?? 'Đọc lại yêu cầu và thử lại.';
    }

    if (level === 'strong') {
      const index = Math.min(1, hints.length - 1);
      return hints[index] ?? hints[0] ?? 'Kiểm tra lại code của bạn.';
    }

    // diagnostic
    const index = Math.min(hintsRequested, hints.length - 1);
    return hints[index] ?? hints[hints.length - 1] ?? 'Xem lại solution nếu cần.';
  }

  private getDiagnosticQuestion(): string {
    const questions = [
      'Bạn đã hiểu yêu cầu của bài tập chưa?',
      'Phần nào của code bạn nghĩ đang sai?',
      'Bạn đã test code với các ví dụ trong đề bài chưa?',
      'Output bạn nhận được khác gì so với mong đợi?',
    ];

    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex] ?? questions[0] ?? 'Bạn gặp khó khăn ở đâu?';
  }
}
