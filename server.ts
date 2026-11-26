import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

interface CachedAudio {
  buffer: Buffer;
  mimeType: string;
}

const ttsCache = new Map<string, CachedAudio>();
const MAX_CACHE_SIZE = 600;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function getSpeechStyle(lang: string): string {
  if (lang === 'en-US') {
    return 'Warm, sweet, gentle female kindergarten teacher speaking clearly at a calm, unhurried pace for a young child.';
  }
  if (lang === 'ar-SA') {
    return 'Warm, gentle, clear female teacher pronouncing Arabic letters and short duas slowly and distinctly for a child.';
  }
  return 'Warm, sweet, gentle Bangladeshi female preschool teacher speaking Bengali clearly at a calm, unhurried pace so a young child can easily listen and repeat every word.';
}

function mapLangToGoogleTts(lang: string): string {
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('ar')) return 'ar';
  return 'bn';
}

async function fetchGoogleTranslateTts(text: string, lang: string): Promise<CachedAudio | null> {
  const tl = mapLangToGoogleTts(lang);
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Referer: 'https://translate.google.com/',
    },
  });
  if (!res.ok) return null;
  const ab = await res.arrayBuffer();
  if (!ab || ab.byteLength < 100) return null;
  return {
    buffer: Buffer.from(ab),
    mimeType: 'audio/mpeg',
  };
}

async function generateTtsAudio(text: string, lang: string): Promise<CachedAudio | null> {
  const cacheKey = `${lang}::${text}`;
  const cached = ttsCache.get(cacheKey);
  if (cached) return cached;

  let result: CachedAudio | null = null;

  // 1. Try Gemini TTS first if GEMINI_API_KEY is configured
  const ai = getAiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text,
                speechMetadata: {
                  style: getSpeechStyle(lang),
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        result = {
          buffer: Buffer.from(base64Audio, 'base64'),
          mimeType: 'audio/wav',
        };
      }
    } catch {
      result = null;
    }
  }

  // 2. Reliable sweet female voice engine (Bangla, English, Arabic) with zero key requirement
  if (!result) {
    try {
      result = await fetchGoogleTranslateTts(text, lang);
    } catch {
      result = null;
    }
  }

  if (result) {
    if (ttsCache.size >= MAX_CACHE_SIZE) {
      const firstKey = ttsCache.keys().next().value;
      if (firstKey) ttsCache.delete(firstKey);
    }
    ttsCache.set(cacheKey, result);
  }

  return result;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  // Direct GET audio stream endpoint (allows synchronous HTMLAudioElement.play() on user gesture!)
  app.get('/api/tts', async (req, res) => {
    try {
      const text = typeof req.query.text === 'string' ? req.query.text.trim() : '';
      const lang = typeof req.query.lang === 'string' ? req.query.lang : 'bn-BD';

      if (!text || text.length > 400) {
        res.status(400).send('Valid text is required.');
        return;
      }

      const audio = await generateTtsAudio(text, lang);
      if (!audio) {
        res.status(503).send('TTS unavailable');
        return;
      }

      res.setHeader('Content-Type', audio.mimeType);
      res.setHeader('Content-Length', String(audio.buffer.length));
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(audio.buffer);
    } catch (err) {
      console.error('GET /api/tts error:', err);
      res.status(500).send('TTS error');
    }
  });

  // POST JSON endpoint kept for compatibility
  app.post('/api/tts', async (req, res) => {
    try {
      const body = req.body as { text?: string; lang?: string };
      const text = typeof body?.text === 'string' ? body.text.trim() : '';
      const lang = typeof body?.lang === 'string' ? body.lang : 'bn-BD';

      if (!text || text.length > 400) {
        res.status(400).json({ error: 'Valid text is required.' });
        return;
      }

      const audio = await generateTtsAudio(text, lang);
      if (!audio) {
        res.status(503).json({ error: 'TTS unavailable', fallback: true });
        return;
      }

      res.json({
        audioBase64: audio.buffer.toString('base64'),
        mimeType: audio.mimeType,
      });
    } catch (err) {
      console.error('POST /api/tts error:', err);
      res.status(500).json({ error: 'TTS generation failed', fallback: true });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distPath, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build not found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rihan Intelligence Book running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
