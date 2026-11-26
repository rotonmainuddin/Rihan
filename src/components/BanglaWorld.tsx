import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Play, Square, BookOpen, Music } from 'lucide-react';
import { BANGLA_BYANJANBARNA, BANGLA_RHYMES, BANGLA_SWARABARNA } from '../data/learningData';
import { BanglaLetter, Rhyme } from '../types';
import {
  playChimeSound,
  playClapSound,
  playPopSound,
  playTapSound,
  prefetchSpeech,
  speakText,
  stopSpeech,
} from '../utils/audio';

interface BanglaWorldProps {
  onEarnStar: (amount: number, mascotMsg: string, celebrate?: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

export const BanglaWorld: React.FC<BanglaWorldProps> = ({ onEarnStar, onSpeakingChange }) => {
  const [section, setSection] = useState<'alphabets' | 'rhymes'>('alphabets');
  const [alphabetGroup, setAlphabetGroup] = useState<'swara' | 'byanjan'>('swara');
  const [selectedLetter, setSelectedLetter] = useState<BanglaLetter>(BANGLA_SWARABARNA[0]);

  const [activeRhymeId, setActiveRhymeId] = useState<string | null>(null);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const rhymeCancelledRef = useRef<boolean>(false);

  const letters = alphabetGroup === 'swara' ? BANGLA_SWARABARNA : BANGLA_BYANJANBARNA;

  const stopRhyme = () => {
    rhymeCancelledRef.current = true;
    stopSpeech();
    setActiveRhymeId(null);
    setActiveLineIdx(-1);
    onSpeakingChange(false);
  };

  useEffect(() => {
    return () => {
      rhymeCancelledRef.current = true;
      stopSpeech();
      onSpeakingChange(false);
    };
  }, [onSpeakingChange]);

  const handleLetterClick = (item: BanglaLetter) => {
    stopRhyme();
    playPopSound();
    setSelectedLetter(item);
    speakText(item.speech, {
      lang: 'bn-BD',
      onStart: () => onSpeakingChange(true),
      onEnd: () => onSpeakingChange(false),
    });
    onEarnStar(1, `সাবাশ রিহান! ${item.speech}!`);
  };

  const handleSingleLineClick = (line: string) => {
    stopRhyme();
    playTapSound();
    speakText(line, {
      lang: 'bn-BD',
      onStart: () => onSpeakingChange(true),
      onEnd: () => onSpeakingChange(false),
    });
  };

  const playRhymeKaraoke = (rhyme: Rhyme) => {
    if (activeRhymeId === rhyme.id) {
      stopRhyme();
      playTapSound();
      return;
    }

    stopRhyme();
    playChimeSound();
    rhymeCancelledRef.current = false;
    setActiveRhymeId(rhyme.id);

    // Prefetch all lines in background so playback flows seamlessly
    rhyme.lines.forEach((line) => prefetchSpeech(line, 'bn-BD'));

    const readLine = (idx: number) => {
      if (rhymeCancelledRef.current) return;
      if (idx >= rhyme.lines.length) {
        setActiveRhymeId(null);
        setActiveLineIdx(-1);
        onSpeakingChange(false);
        playClapSound();
        onEarnStar(3, `দারুণ রিহান! "${rhyme.title}" ছড়াটি খুব সুন্দর শুনেছো!`, true);
        return;
      }

      setActiveLineIdx(idx);
      speakText(rhyme.lines[idx], {
        lang: 'bn-BD',
        onStart: () => onSpeakingChange(true),
        onEnd: () => {
          if (!rhymeCancelledRef.current) {
            setTimeout(() => readLine(idx + 1), 240);
          }
        },
      });
    };

    readLine(0);
  };

  return (
    <div className="space-y-6">
      {/* 3D Bangla World Banner */}
      <div className="card-3d bg-gradient-to-r from-amber-50 via-white to-emerald-50 border-2 border-amber-200 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-emerald-100">
              <img
                src="/src/assets/images/bangla_3d_storybook_1795732382992.jpg"
                alt="3D Bangla Storybook Garden"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900">
                রিহানের বাংলা জগৎ (Bangla World)
              </h2>
              <p className="font-bangla text-sm text-slate-600 mt-0.5">
                মিষ্টি কণ্ঠে ৫০টি বর্ণমালা ও ৮টি ছড়া শুনো · যেকোনো লাইনে ক্লিক করলেও পড়বে!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-amber-100/70 p-1.5 rounded-2xl border border-amber-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopRhyme();
                playTapSound();
                setSection('alphabets');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bangla text-sm sm:text-base font-bold transition-all cursor-pointer whitespace-nowrap ${
                section === 'alphabets'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>বর্ণমালা (৫০টি)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSection('rhymes');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bangla text-sm sm:text-base font-bold transition-all cursor-pointer whitespace-nowrap ${
                section === 'rhymes'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-900 hover:bg-rose-100'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>বাংলা ছড়া ({BANGLA_RHYMES.length}টি)</span>
            </button>
          </div>
        </div>
      </div>

      {section === 'alphabets' ? (
        <div className="space-y-6">
          {/* 3D Spotlight Card */}
          <div className="card-3d bg-gradient-to-br from-amber-50 via-white to-orange-50 border-2 border-amber-300 rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 sm:gap-7">
                <button
                  type="button"
                  onClick={() => handleLetterClick(selectedLetter)}
                  className="tile-3d w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-white to-amber-50 border-3 border-amber-400 flex items-center justify-center cursor-pointer"
                >
                  <span className="font-bangla text-6xl sm:text-7xl font-bold text-amber-600 drop-shadow-sm">
                    {selectedLetter.letter}
                  </span>
                </button>
                <div>
                  <div className="text-sm font-bangla font-semibold text-amber-700">
                    {alphabetGroup === 'swara' ? 'স্বরবর্ণ · রিহানের বই' : 'ব্যঞ্জনবর্ণ · রিহানের বই'}
                  </div>
                  <h3 className="font-bangla text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                    {selectedLetter.letter} - {selectedLetter.word}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleLetterClick(selectedLetter)}
                    className="tile-3d mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bangla font-bold text-sm sm:text-base cursor-pointer whitespace-nowrap"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>আবার শুনো</span>
                  </button>
                </div>
              </div>

              <div className="clay-badge-3d flex flex-col items-center justify-center bg-gradient-to-b from-white to-amber-50 border-2 border-amber-200 rounded-3xl px-8 py-4 min-w-[148px]">
                <span
                  className="text-6xl sm:text-7xl animate-float-slow select-none drop-shadow-md"
                  role="img"
                  aria-label={selectedLetter.word}
                >
                  {selectedLetter.emoji}
                </span>
                <span className="font-bangla text-lg font-bold text-slate-700 mt-2">
                  {selectedLetter.word}
                </span>
              </div>
            </div>
          </div>

          {/* Swarabarna / Byanjanbarna Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setAlphabetGroup('swara');
                setSelectedLetter(BANGLA_SWARABARNA[0]);
              }}
              className={`tile-3d px-5 py-2.5 rounded-2xl font-bangla text-base font-bold border-2 cursor-pointer whitespace-nowrap ${
                alphabetGroup === 'swara'
                  ? 'bg-amber-500 text-white border-amber-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
              }`}
            >
              স্বরবর্ণ (অ - ঔ) · ১১টি
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setAlphabetGroup('byanjan');
                setSelectedLetter(BANGLA_BYANJANBARNA[0]);
              }}
              className={`tile-3d px-5 py-2.5 rounded-2xl font-bangla text-base font-bold border-2 cursor-pointer whitespace-nowrap ${
                alphabetGroup === 'byanjan'
                  ? 'bg-emerald-500 text-white border-emerald-700'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
              }`}
            >
              ব্যঞ্জনবর্ণ (ক - ঁ) · ৩৯টি
            </button>
          </div>

          {/* 3D Interactive Letter Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4">
            {letters.map((item) => {
              const isSelected = selectedLetter.letter === item.letter;
              return (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => handleLetterClick(item)}
                  className={`tile-3d group flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 cursor-pointer min-h-[108px] ${
                    item.color
                  } ${isSelected ? 'ring-4 ring-amber-400 scale-[1.04]' : ''}`}
                >
                  <span className="font-bangla text-3xl sm:text-4xl font-bold leading-none drop-shadow-xs">
                    {item.letter}
                  </span>
                  <span className="text-2xl mt-1.5 group-hover:scale-115 transition-transform drop-shadow-xs">
                    {item.emoji}
                  </span>
                  <span className="font-bangla text-xs font-semibold mt-1 truncate max-w-full">
                    {item.word}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Bangla Rhymes Karaoke Grid (8 Classic Rhymes) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BANGLA_RHYMES.map((rhyme) => {
            const isPlaying = activeRhymeId === rhyme.id;
            return (
              <div
                key={rhyme.id}
                className={`card-3d rounded-3xl border-2 p-5 sm:p-6 transition-all ${rhyme.bgTint} ${
                  isPlaying ? 'ring-4 ring-rose-400' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bangla text-xs font-semibold text-slate-600">
                      {rhyme.subtitle}
                    </p>
                    <h3 className="font-bangla text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {rhyme.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 text-2xl sm:text-3xl select-none">
                    {rhyme.emojis.map((em, i) => (
                      <span
                        key={i}
                        className={isPlaying ? 'animate-bounce' : 'animate-float-slow'}
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        {em}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Clickable Karaoke Lines */}
                <div className="mt-4 space-y-1.5 bg-white/90 rounded-2xl p-3.5 border border-white shadow-inner">
                  {rhyme.lines.map((line, idx) => {
                    const isLineActive = isPlaying && activeLineIdx === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSingleLineClick(line)}
                        className={`w-full text-left font-bangla text-base sm:text-lg px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isLineActive
                            ? 'bg-amber-300/90 text-slate-950 font-bold scale-[1.02] shadow-xs'
                            : 'text-slate-700 font-medium hover:bg-amber-50'
                        }`}
                      >
                        <span>{line}</span>
                        <Volume2 className="w-3.5 h-3.5 opacity-45 shrink-0" />
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => playRhymeKaraoke(rhyme)}
                    className={`tile-3d w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bangla text-base font-bold text-white cursor-pointer whitespace-nowrap ${
                      isPlaying
                        ? 'bg-rose-600 hover:bg-rose-700'
                        : 'bg-emerald-500 hover:bg-emerald-600'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Square className="w-4 h-4 fill-current" />
                        <span>থামাও (Stop)</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>পুরো ছড়া শুনো (Play Rhyme)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
