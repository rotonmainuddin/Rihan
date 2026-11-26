// Guaranteed Female Voice & Offline Sound Effects Engine
// Uses a single persistent HTMLAudioElement unlocked synchronously on user click + GET /api/tts audio/mpeg stream
// with cached Blob prefetching and hardened Web Speech API female fallback.

let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

const clientBlobUrlCache = new Map<string, string>();
const inFlightPrefetches = new Map<string, Promise<string | null>>();

let sharedVoiceAudio: HTMLAudioElement | null = null;
let speechGeneration = 0;
let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

function getSharedVoiceAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!sharedVoiceAudio) {
    sharedVoiceAudio = new Audio();
    sharedVoiceAudio.preload = 'auto';
  }
  return sharedVoiceAudio;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function setMuted(muted: boolean) {
  isMutedGlobal = muted;
  if (muted) {
    stopSpeech();
  }
}

export function getMuted(): boolean {
  return isMutedGlobal;
}

export function playPopSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(280, now);
  osc.frequency.exponentialRampToValueAtTime(780, now + 0.09);

  gain.gain.setValueAtTime(0.24, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

export function playTapSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(520, now);
  osc.frequency.exponentialRampToValueAtTime(340, now + 0.05);

  gain.gain.setValueAtTime(0.14, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.07);
}

export function playChimeSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5];
  const now = ctx.currentTime;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.07;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(start);
    osc.stop(start + 0.36);
  });
}

export function playClapSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const bufferSize = ctx.sampleRate * 0.12;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
  }

  const now = ctx.currentTime;
  [0, 0.12, 0.24, 0.38].forEach((offset) => {
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now + offset);
    filter.Q.setValueAtTime(1.2, now + offset);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.12);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now + offset);
  });

  playChimeSound();
}

export function playOopsSound() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, now);
  osc.frequency.exponentialRampToValueAtTime(190, now + 0.2);

  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.24);
}

export function playLullabyNote() {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [392.0, 329.63, 261.63];
  const now = ctx.currentTime;
  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + idx * 0.38;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.linearRampToValueAtTime(0.14, start + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.65);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.7);
  });
}

function buildTtsUrl(text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA'): string {
  return `/api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
}

export function prefetchSpeech(text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA' = 'bn-BD') {
  const cleanText = text.trim();
  if (typeof window === 'undefined' || !cleanText) return;

  const cacheKey = `${lang}::${cleanText}`;
  if (clientBlobUrlCache.has(cacheKey) || inFlightPrefetches.has(cacheKey)) return;

  const p = fetch(buildTtsUrl(cleanText, lang))
    .then(async (res) => {
      if (!res.ok) return null;
      const blob = await res.blob();
      if (!blob || blob.size < 100) return null;
      const objUrl = URL.createObjectURL(blob);
      if (clientBlobUrlCache.size > 250) {
        const firstKey = clientBlobUrlCache.keys().next().value;
        if (firstKey) {
          const old = clientBlobUrlCache.get(firstKey);
          if (old) URL.revokeObjectURL(old);
          clientBlobUrlCache.delete(firstKey);
        }
      }
      clientBlobUrlCache.set(cacheKey, objUrl);
      return objUrl;
    })
    .catch(() => null)
    .finally(() => {
      inFlightPrefetches.delete(cacheKey);
    });

  inFlightPrefetches.set(cacheKey, p);
}

function pickBestFemaleVoice(lang: 'bn-BD' | 'en-US' | 'ar-SA'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const langPrefix = lang.split('-')[0].toLowerCase();
  const matching = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
  if (!matching.length) return null;

  const femaleHints = [
    'female',
    'woman',
    'tanisha',
    'nabanita',
    'samantha',
    'zira',
    'aria',
    'jenny',
    'victoria',
    'karen',
    'moira',
    'laila',
    'salma',
    'mariam',
    'google',
    'natural',
  ];

  const scored = matching
    .map((v) => {
      const name = v.name.toLowerCase();
      let score = 0;
      if (v.lang.toLowerCase() === lang.toLowerCase()) score += 5;
      femaleHints.forEach((hint, idx) => {
        if (name.includes(hint)) score += 20 - idx * 0.5;
      });
      if (name.includes('male') && !name.includes('female')) score -= 30;
      return { voice: v, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice ?? matching[0];
}

function speakWithWebSpeechFallback(
  text: string,
  lang: 'bn-BD' | 'en-US' | 'ar-SA',
  genId: number,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (isMutedGlobal || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onStart?.();
    const waitMs = Math.max(1500, Math.min(3600, text.length * 95));
    setTimeout(() => {
      if (speechGeneration === genId) onEnd?.();
    }, waitMs);
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.78;
    utterance.pitch = 1.08;
    utterance.volume = 1;

    const voice = pickBestFemaleVoice(lang);
    if (voice) {
      utterance.voice = voice;
    }

    let finished = false;
    const finishOnce = () => {
      if (!finished) {
        finished = true;
        if (speechGeneration === genId) onEnd?.();
      }
    };

    const safetyTimeout = setTimeout(
      finishOnce,
      Math.max(2600, text.length * 165 + 1500)
    );

    utterance.onstart = () => {
      if (speechGeneration === genId) onStart?.();
    };
    utterance.onend = () => {
      clearTimeout(safetyTimeout);
      finishOnce();
    };
    utterance.onerror = () => {
      clearTimeout(safetyTimeout);
      finishOnce();
    };

    onStart?.();
    window.speechSynthesis.speak(utterance);
  } catch {
    onStart?.();
    setTimeout(() => {
      if (speechGeneration === genId) onEnd?.();
    }, 1800);
  }
}

export function stopSpeech() {
  speechGeneration += 1;
  if (sharedVoiceAudio) {
    try {
      sharedVoiceAudio.onended = null;
      sharedVoiceAudio.onerror = null;
      sharedVoiceAudio.pause();
      sharedVoiceAudio.currentTime = 0;
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export interface SpeakOptions {
  lang?: 'bn-BD' | 'en-US' | 'ar-SA';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speakText(text: string, options: SpeakOptions = {}) {
  const { lang = 'bn-BD', onStart, onEnd } = options;
  const cleanText = text.trim();

  stopSpeech();
  const genId = speechGeneration;

  // Unlock AudioContext synchronously on click
  getAudioContext();

  if (!cleanText || isMutedGlobal) {
    onStart?.();
    setTimeout(() => {
      if (speechGeneration === genId) onEnd?.();
    }, Math.max(1200, cleanText.length * 80));
    return;
  }

  const audio = getSharedVoiceAudio();
  if (!audio) {
    speakWithWebSpeechFallback(cleanText, lang, genId, onStart, onEnd);
    return;
  }

  const cacheKey = `${lang}::${cleanText}`;
  const cachedBlobUrl = clientBlobUrlCache.get(cacheKey);
  const srcUrl = cachedBlobUrl || buildTtsUrl(cleanText, lang);

  let settled = false;
  const finishOnce = () => {
    if (!settled) {
      settled = true;
      if (speechGeneration === genId) onEnd?.();
    }
  };

  const fallbackOnce = () => {
    if (!settled && speechGeneration === genId) {
      settled = true;
      speakWithWebSpeechFallback(cleanText, lang, genId, onStart, onEnd);
    }
  };

  audio.onended = finishOnce;
  audio.onerror = fallbackOnce;

  try {
    audio.src = srcUrl;
    // Calm, normal child-friendly reading speed while preserving natural female pitch
    audio.playbackRate = 0.88;
    audio.preservesPitch = true;

    onStart?.();
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        fallbackOnce();
      });
    }

    // Background cache for next instant replay if not already cached
    if (!cachedBlobUrl) {
      prefetchSpeech(cleanText, lang);
    }
  } catch {
    fallbackOnce();
  }
}
