// Bulletproof Multi-Language Voice & Offline Sound Effects Engine
// 1. Offline-ready static MP3 pack (./audio/*) for Bangla, English & Arabic
// 2. Same-origin /api/tts endpoint (Node/Express server)
// 3. No-referrer direct Google TTS HTMLAudioElement fallback
// 4. Web Speech API fallback
import { STATIC_AUDIO_MANIFEST } from '../data/audioManifest';

let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

const decodedBufferCache = new Map<string, AudioBuffer>();
const rawUrlBufferPromises = new Map<string, Promise<AudioBuffer | null>>();

let activeBufferSource: AudioBufferSourceNode | null = null;
let sharedVoiceAudio: HTMLAudioElement | null = null;
let speechGeneration = 0;
let cachedVoices: SpeechSynthesisVoice[] = [];
let serverTtsAvailable =
  typeof window !== 'undefined' && !window.location.hostname.endsWith('github.io');

if (typeof window !== 'undefined') {
  if ('speechSynthesis' in window) {
    const loadVoices = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
    loadVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
  }

  // Unlock AudioContext on first user interaction so SFX & voice never drop
  const unlockOnGesture = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx
        .resume()
        .then(() => {
          if (ctx.state === 'running') {
            window.removeEventListener('pointerdown', unlockOnGesture);
            window.removeEventListener('touchstart', unlockOnGesture);
            window.removeEventListener('keydown', unlockOnGesture);
          }
        })
        .catch(() => {});
    } else if (ctx && ctx.state === 'running') {
      window.removeEventListener('pointerdown', unlockOnGesture);
      window.removeEventListener('touchstart', unlockOnGesture);
      window.removeEventListener('keydown', unlockOnGesture);
    }
  };
  window.addEventListener('pointerdown', unlockOnGesture, { passive: true });
  window.addEventListener('touchstart', unlockOnGesture, { passive: true });
  window.addEventListener('keydown', unlockOnGesture, { passive: true });
}

function getSharedVoiceAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!sharedVoiceAudio) {
    sharedVoiceAudio = new Audio();
    sharedVoiceAudio.preload = 'auto';
    sharedVoiceAudio.defaultPlaybackRate = 0.88;
    sharedVoiceAudio.playbackRate = 0.88;
    sharedVoiceAudio.preservesPitch = true;
    try {
      (sharedVoiceAudio as HTMLAudioElement & { referrerPolicy?: string }).referrerPolicy =
        'no-referrer';
    } catch {
      // ignore if unsupported
    }
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

function withReadyAudioContext(fn: (ctx: AudioContext) => void) {
  if (isMutedGlobal) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    ctx
      .resume()
      .then(() => {
        if (!isMutedGlobal) fn(ctx);
      })
      .catch(() => {});
  } else {
    fn(ctx);
  }
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
  withReadyAudioContext((ctx) => {
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
  });
}

export function playTapSound() {
  withReadyAudioContext((ctx) => {
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
  });
}

export function playChimeSound() {
  withReadyAudioContext((ctx) => {
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
  });
}

export function playClapSound() {
  withReadyAudioContext((ctx) => {
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
  });

  playChimeSound();
}

export function playOopsSound() {
  withReadyAudioContext((ctx) => {
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
  });
}

export function playLullabyNote() {
  withReadyAudioContext((ctx) => {
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
  });
}

function mapLangCode(lang: 'bn-BD' | 'en-US' | 'ar-SA'): string {
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('ar')) return 'ar';
  return 'bn';
}

function buildDirectGoogleTtsUrl(text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA'): string {
  const tl = mapLangCode(lang);
  const safeText = text.length > 175 ? text.slice(0, 175).trim() : text;
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(safeText)}`;
}

function buildServerTtsUrl(text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA'): string {
  return `./api/tts?lang=${encodeURIComponent(lang)}&text=${encodeURIComponent(text)}`;
}

function resolveSameOriginAudioUrl(
  cleanText: string,
  lang: 'bn-BD' | 'en-US' | 'ar-SA'
): string | null {
  const cacheKey = `${lang}::${cleanText}`;
  const staticUrl = STATIC_AUDIO_MANIFEST[cacheKey];
  if (staticUrl) return staticUrl;
  if (serverTtsAvailable) return buildServerTtsUrl(cleanText, lang);
  return null;
}

// Use XMLHttpRequest instead of fetch() so browser extensions that patch window.fetch cannot break audio
function loadDecodedAudioBuffer(url: string): Promise<AudioBuffer | null> {
  const cached = decodedBufferCache.get(url);
  if (cached) return Promise.resolve(cached);

  const existing = rawUrlBufferPromises.get(url);
  if (existing) return existing;

  const ctx = getAudioContext();
  if (!ctx || typeof XMLHttpRequest === 'undefined') {
    return Promise.resolve(null);
  }

  const promise = new Promise<AudioBuffer | null>((resolve) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.timeout = 8000;

      xhr.onload = () => {
        if (xhr.status === 404 && url.startsWith('./api/tts')) {
          serverTtsAvailable = false;
          resolve(null);
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response instanceof ArrayBuffer) {
          const ab = xhr.response;
          if (ab.byteLength < 100) {
            resolve(null);
            return;
          }
          ctx
            .decodeAudioData(ab.slice(0))
            .then((decoded) => {
              if (decodedBufferCache.size > 260) {
                const firstKey = decodedBufferCache.keys().next().value;
                if (firstKey) decodedBufferCache.delete(firstKey);
              }
              decodedBufferCache.set(url, decoded);
              resolve(decoded);
            })
            .catch(() => resolve(null));
        } else {
          resolve(null);
        }
      };

      xhr.onerror = () => resolve(null);
      xhr.ontimeout = () => resolve(null);
      xhr.send();
    } catch {
      resolve(null);
    }
  }).finally(() => {
    rawUrlBufferPromises.delete(url);
  });

  rawUrlBufferPromises.set(url, promise);
  return promise;
}

export function prefetchSpeech(text: string, lang: 'bn-BD' | 'en-US' | 'ar-SA' = 'bn-BD') {
  const cleanText = text.trim();
  if (typeof window === 'undefined' || !cleanText) return;
  const url = resolveSameOriginAudioUrl(cleanText, lang);
  if (url) {
    loadDecodedAudioBuffer(url);
  }
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
  if (speechGeneration !== genId) return;

  if (isMutedGlobal || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onStart?.();
    const waitMs = Math.max(1500, Math.min(3600, text.length * 95));
    setTimeout(() => {
      if (speechGeneration === genId) onEnd?.();
    }, waitMs);
    return;
  }

  try {
    const synth = window.speechSynthesis;
    const needsCancel = synth.speaking || synth.pending;
    if (needsCancel) {
      synth.cancel();
    }
    if (synth.paused) {
      synth.resume();
    }

    const startUtterance = () => {
      if (speechGeneration !== genId || isMutedGlobal) return;
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
      synth.speak(utterance);
    };

    if (needsCancel) {
      setTimeout(startUtterance, 40);
    } else {
      startUtterance();
    }
  } catch {
    onStart?.();
    setTimeout(() => {
      if (speechGeneration === genId) onEnd?.();
    }, 1800);
  }
}

export function stopSpeech() {
  speechGeneration += 1;
  if (activeBufferSource) {
    try {
      activeBufferSource.onended = null;
      activeBufferSource.stop();
      activeBufferSource.disconnect();
    } catch {
      // ignore already-stopped node
    }
    activeBufferSource = null;
  }
  if (sharedVoiceAudio) {
    try {
      sharedVoiceAudio.onended = null;
      sharedVoiceAudio.onerror = null;
      sharedVoiceAudio.onloadedmetadata = null;
      sharedVoiceAudio.onplay = null;
      sharedVoiceAudio.pause();
    } catch {
      // ignore
    }
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  }
}

export interface SpeakOptions {
  lang?: 'bn-BD' | 'en-US' | 'ar-SA';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

function playWithHtmlAudioElement(
  cleanText: string,
  lang: 'bn-BD' | 'en-US' | 'ar-SA',
  primaryUrl: string,
  genId: number,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (speechGeneration !== genId) return;

  const audio = getSharedVoiceAudio();
  if (!audio) {
    speakWithWebSpeechFallback(cleanText, lang, genId, onStart, onEnd);
    return;
  }

  let settled = false;
  let triedDirectGoogle = primaryUrl.startsWith('https://translate.google.com/');

  const finishOnce = () => {
    if (!settled) {
      settled = true;
      if (speechGeneration === genId) onEnd?.();
    }
  };

  const applyRate = () => {
    audio.defaultPlaybackRate = 0.88;
    audio.playbackRate = 0.88;
    audio.preservesPitch = true;
  };

  const handleFailure = () => {
    if (settled || speechGeneration !== genId) return;

    if (!triedDirectGoogle) {
      triedDirectGoogle = true;
      audio.src = buildDirectGoogleTtsUrl(cleanText, lang);
      applyRate();
      audio.play().catch((err: unknown) => {
        const errName = (err as { name?: string })?.name;
        if (errName === 'AbortError' || speechGeneration !== genId) return;
        if (!settled && speechGeneration === genId) {
          settled = true;
          speakWithWebSpeechFallback(cleanText, lang, genId, onStart, onEnd);
        }
      });
      return;
    }

    settled = true;
    speakWithWebSpeechFallback(cleanText, lang, genId, onStart, onEnd);
  };

  audio.onended = finishOnce;
  audio.onerror = handleFailure;
  audio.onloadedmetadata = applyRate;
  audio.onplay = applyRate;

  try {
    audio.src = primaryUrl;
    applyRate();
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err: unknown) => {
        const errName = (err as { name?: string })?.name;
        if (errName === 'AbortError' || speechGeneration !== genId) return;
        handleFailure();
      });
    }
  } catch {
    handleFailure();
  }
}

export function speakText(text: string, options: SpeakOptions = {}) {
  const { lang = 'bn-BD', onStart, onEnd } = options;
  const cleanText = text.trim();

  stopSpeech();
  const genId = speechGeneration;

  const ctx = getAudioContext();

  if (!cleanText || isMutedGlobal) {
    onStart?.();
    setTimeout(() => {
      if (speechGeneration === genId) onEnd?.();
    }, Math.max(1200, cleanText.length * 80));
    return;
  }

  const sameOriginUrl = resolveSameOriginAudioUrl(cleanText, lang);
  onStart?.();

  // Tier 1 & 2: Play same-origin static MP3 pack (./audio/*) or /api/tts via Web Audio API
  // (bypasses window.fetch extensions, HTMLAudioElement range bugs, and iframe gesture limits)
  if (sameOriginUrl && ctx) {
    const playDecoded = (decoded: AudioBuffer) => {
      if (speechGeneration !== genId || isMutedGlobal) return;
      try {
        const source = ctx.createBufferSource();
        source.buffer = decoded;
        source.playbackRate.value = 0.88;
        source.connect(ctx.destination);
        activeBufferSource = source;
        source.onended = () => {
          if (activeBufferSource === source) {
            activeBufferSource = null;
          }
          if (speechGeneration === genId) {
            onEnd?.();
          }
        };
        source.start(0);
      } catch {
        playWithHtmlAudioElement(cleanText, lang, sameOriginUrl, genId, undefined, onEnd);
      }
    };

    const cachedBuffer = decodedBufferCache.get(sameOriginUrl);
    if (cachedBuffer && ctx.state === 'running') {
      playDecoded(cachedBuffer);
      return;
    }

    loadDecodedAudioBuffer(sameOriginUrl).then(async (decoded) => {
      if (speechGeneration !== genId || isMutedGlobal) return;
      if (decoded) {
        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }
        if (speechGeneration !== genId || isMutedGlobal) return;
        if (ctx.state === 'running') {
          playDecoded(decoded);
          return;
        }
      }

      // Fallback if Web Audio decode failed or ctx wasn't running
      const fallbackUrl =
        STATIC_AUDIO_MANIFEST[`${lang}::${cleanText}`] ||
        (serverTtsAvailable ? buildServerTtsUrl(cleanText, lang) : buildDirectGoogleTtsUrl(cleanText, lang));
      playWithHtmlAudioElement(cleanText, lang, fallbackUrl, genId, undefined, onEnd);
    });
    return;
  }

  // Tier 3 & 4: Direct HTMLAudioElement -> Web Speech API
  const url = sameOriginUrl || buildDirectGoogleTtsUrl(cleanText, lang);
  playWithHtmlAudioElement(cleanText, lang, url, genId, undefined, onEnd);
}
