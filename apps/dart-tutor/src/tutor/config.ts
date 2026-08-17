export interface TutorConfig {
  aiEnabled: boolean;
  apiBaseUrl: string;
  apiKey: string;
  model: string;
}

export function getTutorConfig(): TutorConfig {
  return {
    aiEnabled: import.meta.env.VITE_TUTOR_AI_ENABLED === 'true',
    apiBaseUrl: import.meta.env.VITE_TUTOR_API_BASE_URL || 'https://api.anthropic.com/v1',
    apiKey: import.meta.env.VITE_TUTOR_API_KEY || '',
    model: import.meta.env.VITE_TUTOR_MODEL || 'claude-sonnet-4-20250514',
  };
}

export function isAIAvailable(): boolean {
  const config = getTutorConfig();
  return config.aiEnabled && config.apiKey.length > 0;
}
