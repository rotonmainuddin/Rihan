import React, { useCallback, useEffect, useState } from 'react';
import { RotateCcw, Volume2 } from 'lucide-react';
import { playChimeSound, playOopsSound, playPopSound, playTapSound, speakText } from '../utils/audio';

interface BalloonGameProps {
  onEarnStar: (amount: number, mascotMsg: string, celebrate?: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

type QuizCategory = 'mixed' | 'bangla' | 'english' | 'numbers';

interface BalloonItem {
  id: string;
  label: string;
  gradientStyle: string;
  stringHeight: number;
  delay: number;
  popped: boolean;
  wobble: boolean;
}

const BANGLA_POOL = ['অ', 'আ', 'ই', 'উ', 'ক', 'খ', 'গ', 'ম', 'চ', 'ত', 'প', 'ব'];
const ENGLISH_POOL = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M', 'S', 'T', 'Z'];
const NUMBER_POOL = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০', '1', '2', '3', '5'];

const BALLOON_3D_GRADIENTS = [
  'radial-gradient(circle at 32% 28%, #FDA4AF 0%, #F43F5E 48%, #9F1239 100%)',
  'radial-gradient(circle at 32% 28%, #7DD3FC 0%, #0EA5E9 48%, #0369A1 100%)',
  'radial-gradient(circle at 32% 28%, #FDE047 0%, #F59E0B 48%, #B45309 100%)',
  'radial-gradient(circle at 32% 28%, #6EE7B7 0%, #10B981 48%, #047857 100%)',
  'radial-gradient(circle at 32% 28%, #C4B5FD 0%, #8B5CF6 48%, #5B21B6 100%)',
  'radial-gradient(circle at 32% 28%, #FDBA74 0%, #F97316 48%, #C2410C 100%)',
  'radial-gradient(circle at 32% 28%, #F9A8D4 0%, #EC4899 48%, #9D174D 100%)',
];

function getPool(cat: QuizCategory): string[] {
  if (cat === 'bangla') return BANGLA_POOL;
  if (cat === 'english') return ENGLISH_POOL;
  if (cat === 'numbers') return NUMBER_POOL;
  return [...BANGLA_POOL.slice(0, 6), ...ENGLISH_POOL.slice(0, 6), ...NUMBER_POOL.slice(0, 5)];
}

export const BalloonGame: React.FC<BalloonGameProps> = ({ onEarnStar, onSpeakingChange }) => {
  const [category, setCategory] = useState<QuizCategory>('mixed');
  const [target, setTarget] = useState<string>('অ');
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [scoreRound, setScoreRound] = useState<number>(0);

  const announceTarget = useCallback(
    (char: string) => {
      const isEnglish = /^[A-Z0-9]+$/.test(char);
      if (isEnglish) {
        speakText(`Rihan, find ${char}`, {
          lang: 'en-US',
          onStart: () => onSpeakingChange(true),
          onEnd: () => onSpeakingChange(false),
        });
      } else {
        speakText(`রিহান, ${char} বেলুনটি ফাটাও`, {
          lang: 'bn-BD',
          onStart: () => onSpeakingChange(true),
          onEnd: () => onSpeakingChange(false),
        });
      }
    },
    [onSpeakingChange]
  );

  const startNewRound = useCallback(
    (cat: QuizCategory, shouldSpeak = true) => {
      const pool = getPool(cat);
      const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, 6);
      const chosenTarget = shuffled[Math.floor(Math.random() * shuffled.length)];

      const nextBalloons: BalloonItem[] = shuffled.map((label, idx) => ({
        id: `${label}-${idx}-${Date.now()}`,
        label,
        gradientStyle: BALLOON_3D_GRADIENTS[idx % BALLOON_3D_GRADIENTS.length],
        stringHeight: 34 + (idx % 3) * 10,
        delay: idx * 0.28,
        popped: false,
        wobble: false,
      }));

      setTarget(chosenTarget);
      setBalloons(nextBalloons);

      if (shouldSpeak) {
        announceTarget(chosenTarget);
      }
    },
    [announceTarget]
  );

  useEffect(() => {
    startNewRound(category, false);
  }, [category, startNewRound]);

  const handleBalloonClick = (balloon: BalloonItem) => {
    if (balloon.popped) return;

    if (balloon.label === target) {
      playPopSound();
      setTimeout(() => playChimeSound(), 90);

      setBalloons((prev) =>
        prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
      );
      setScoreRound((s) => s + 1);

      onEarnStar(5, `দারুণ রিহান! "${target}" বেলুনটি ফাটিয়েছো! +৫ তারা!`, true);

      setTimeout(() => {
        startNewRound(category, true);
      }, 950);
    } else {
      playOopsSound();
      setBalloons((prev) =>
        prev.map((b) => (b.id === balloon.id ? { ...b, wobble: true } : b))
      );
      onEarnStar(0, `ওটা "${balloon.label}"! আমরা "${target}" খুঁজছি রিহান!`);
      setTimeout(() => {
        setBalloons((prev) =>
          prev.map((b) => (b.id === balloon.id ? { ...b, wobble: false } : b))
        );
      }, 450);
    }
  };

  return (
    <div className="space-y-5">
      <div className="card-3d flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-indigo-200 rounded-3xl p-4 sm:p-5">
        <div>
          <h2 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900">
            রিহানের ৩ডি বেলুন গেম (Balloon Pop)
          </h2>
          <p className="font-bangla text-sm text-slate-600 mt-0.5">
            সঠিক বর্ণ বা সংখ্যার ৩ডি বেলুন ফাটিয়ে জিতে নাও +৫ তারা (⭐) · জয়ী রাউন্ড: {scoreRound}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-indigo-50 p-1.5 rounded-2xl border border-indigo-200">
          {(
            [
              { id: 'mixed', label: 'সবগুলো' },
              { id: 'bangla', label: 'বাংলা' },
              { id: 'english', label: 'English' },
              { id: 'numbers', label: 'সংখ্যা' },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                playTapSound();
                setCategory(m.id);
              }}
              className={`px-3.5 py-2 rounded-xl font-bangla text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                category === m.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-indigo-900 hover:bg-indigo-100'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3D Sky Arena */}
      <div className="card-3d relative rounded-3xl border-2 border-sky-300 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50 p-5 sm:p-8 overflow-hidden min-h-[440px] flex flex-col justify-between">
        <div className="pointer-events-none select-none opacity-80 flex justify-between text-5xl sm:text-6xl -mt-2">
          <span>☁️</span>
          <span className="mt-4">☁️</span>
          <span>☁️</span>
        </div>

        <div className="clay-badge-3d relative z-10 mx-auto bg-white/95 border-3 border-indigo-300 rounded-3xl px-6 py-4 flex flex-wrap items-center justify-center gap-4">
          <span className="font-bangla text-lg sm:text-2xl font-bold text-slate-800">
            খুঁজে বের করো (Find):
          </span>
          <span className="tile-3d w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-400 text-slate-950 font-bold text-3xl sm:text-4xl flex items-center justify-center border-2 border-amber-500">
            {target}
          </span>
          <button
            type="button"
            onClick={() => announceTarget(target)}
            aria-label="Repeat prompt"
            className="p-3 rounded-2xl bg-indigo-100 hover:bg-indigo-200 text-indigo-800 transition-colors cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              playTapSound();
              startNewRound(category, true);
            }}
            aria-label="New balloons"
            className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Glossy Balloons Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 py-8 place-items-center">
          {balloons.map((b) => (
            <div
              key={b.id}
              className="flex flex-col items-center animate-balloon"
              style={{ animationDelay: `${b.delay}s` }}
            >
              <button
                type="button"
                onClick={() => handleBalloonClick(b)}
                style={{ background: b.gradientStyle }}
                className={`relative w-24 h-28 sm:w-26 sm:h-32 rounded-t-[50%] rounded-b-[45%] shadow-xl flex items-center justify-center transition-all cursor-pointer select-none ${
                  b.popped
                    ? 'scale-150 opacity-0 pointer-events-none'
                    : b.wobble
                    ? 'animate-wiggle'
                    : 'hover:scale-110 active:scale-95'
                }`}
              >
                {/* 3D Specular Highlight */}
                <span className="absolute top-3.5 left-4 w-5 h-8 rounded-full bg-white/50 -rotate-20 pointer-events-none blur-[0.5px]" />
                <span className="text-4xl sm:text-5xl font-bold text-white drop-shadow-md">
                  {b.label}
                </span>
              </button>
              {!b.popped && (
                <div
                  className="w-0.5 bg-slate-500/60"
                  style={{ height: `${b.stringHeight}px` }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
