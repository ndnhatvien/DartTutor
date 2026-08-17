import type { Exercise } from '../content/types';
import { isAIAvailable } from './config';
import { LLMTutorProvider } from './llm-provider';
import { RuleBasedTutorProvider } from './rule-based-provider';
import type { DiagnosisResponse, TutorContext, TutorProvider, TutorResponse } from './types';

/**
 * HybridTutorProvider attempts to use LLM, falls back to rule-based on error
 */
export class HybridTutorProvider implements TutorProvider {
  private llmProvider: LLMTutorProvider | null;
  private ruleBasedProvider: RuleBasedTutorProvider;

  constructor(exercise: Exercise) {
    this.ruleBasedProvider = new RuleBasedTutorProvider(exercise);
    this.llmProvider = isAIAvailable() ? new LLMTutorProvider(exercise) : null;
  }

  async explain(context: TutorContext): Promise<TutorResponse> {
    if (!this.llmProvider) {
      return this.ruleBasedProvider.explain(context);
    }

    try {
      return await this.llmProvider.explain(context);
    } catch (error) {
      console.warn('LLM explain failed, falling back to rule-based:', error);
      return this.ruleBasedProvider.explain(context);
    }
  }

  async diagnose(context: TutorContext): Promise<DiagnosisResponse> {
    if (!this.llmProvider) {
      return this.ruleBasedProvider.diagnose(context);
    }

    try {
      return await this.llmProvider.diagnose(context);
    } catch (error) {
      console.warn('LLM diagnose failed, falling back to rule-based:', error);
      return this.ruleBasedProvider.diagnose(context);
    }
  }

  async askQuestion(context: TutorContext): Promise<TutorResponse> {
    if (!this.llmProvider) {
      return this.ruleBasedProvider.askQuestion(context);
    }

    try {
      return await this.llmProvider.askQuestion(context);
    } catch (error) {
      console.warn('LLM askQuestion failed, falling back to rule-based:', error);
      return this.ruleBasedProvider.askQuestion(context);
    }
  }
}
