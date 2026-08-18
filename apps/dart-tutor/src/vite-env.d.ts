/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TUTOR_AI_ENABLED: string;
  readonly VITE_TUTOR_API_BASE_URL: string;
  readonly VITE_TUTOR_API_KEY: string;
  readonly VITE_TUTOR_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
