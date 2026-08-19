const TTS_ENDPOINT = 'https://translate.google.com/translate_tts';
const MAX_CHARS = 150;
const MAX_RETRIES = 3;

let currentAudio: HTMLAudioElement | null = null;
let cancelled = false;

function buildTtsUrl(text: string): string {
  const params = new URLSearchParams({
    ie: 'UTF-8',
    q: text,
    tl: 'vi',
    client: 'tw-ob',
    rd: `${Date.now()}${Math.floor(Math.random() * 1e6)}`,
  });
  return `${TTS_ENDPOINT}?${params.toString()}`;
}

function chunkText(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length === 0) return [];
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let buffer = '';
  for (const sentence of sentences) {
    const candidate = buffer ? `${buffer} ${sentence}` : sentence;
    if (candidate.length > MAX_CHARS) {
      if (buffer) chunks.push(buffer);
      buffer = sentence;
    } else {
      buffer = candidate;
    }
  }
  if (buffer) chunks.push(buffer);
  return chunks;
}

function playChunk(url: string, rate: number): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = url;
    audio.playbackRate = rate;
    currentAudio = audio;
    audio.addEventListener('ended', () => resolve(true), { once: true });
    audio.addEventListener('error', () => resolve(false), { once: true });
    audio.play().catch(() => resolve(false));
  });
}

async function playChunkWithRetry(url: string, rate: number): Promise<void> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    if (cancelled) return;
    const ok = await playChunk(url, rate);
    if (ok || cancelled) return;
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }
}

export function speakText(text: string, onEnd?: () => void, rate = 0.75) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis?.cancel();
  stopSpeaking();
  cancelled = false;
  const chunks = chunkText(text);
  const playSequence = async () => {
    for (const chunk of chunks) {
      if (cancelled) break;
      await playChunkWithRetry(buildTtsUrl(chunk), rate);
      if (cancelled) break;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    onEnd?.();
  };
  void playSequence();
}

export function stopSpeaking() {
  cancelled = true;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

export function listVietnameseVoices(): SpeechSynthesisVoice[] {
  return [];
}

export function pickVietnameseVoice(): SpeechSynthesisVoice | null {
  return null;
}

export function saveVoicePreference(_name: string) {
  // no-op: gTTS has a single fixed Vietnamese voice
}
