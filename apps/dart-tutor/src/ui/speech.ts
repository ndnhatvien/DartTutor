let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

const VOICE_STORAGE_KEY = 'dart-tutor-tts-voice';

function isVietnameseVoice(voice: SpeechSynthesisVoice): boolean {
  const lang = voice.lang.toLowerCase();
  return lang.startsWith('vi') || lang.includes('vi-vn');
}

function voiceQualityScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (/natural|online|neural|enhanced/.test(name)) score += 10;
  if (name.includes('google')) score += 5;
  if (voice.localService) score -= 3;
  if (/espeak|pico|festival|mimic/.test(name)) score -= 8;
  return score;
}

export function listVietnameseVoices(): SpeechSynthesisVoice[] {
  return loadVoices()
    .filter(isVietnameseVoice)
    .sort((a, b) => voiceQualityScore(b) - voiceQualityScore(a) || a.name.localeCompare(b.name));
}

export function pickVietnameseVoice(): SpeechSynthesisVoice | null {
  const voices = listVietnameseVoices();
  if (voices.length === 0) return null;
  const savedName = window.localStorage.getItem(VOICE_STORAGE_KEY);
  return voices.find((v) => v.name === savedName) ?? voices[0] ?? null;
}

export function saveVoicePreference(name: string) {
  window.localStorage.setItem(VOICE_STORAGE_KEY, name);
}

export function speakText(text: string, onEnd?: () => void, rate = 1) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'vi-VN';
  const voice = pickVietnameseVoice();
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = rate;
  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}
