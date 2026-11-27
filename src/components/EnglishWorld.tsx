import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Play, Square, BookOpen, Music } from 'lucide-react';
import { ENGLISH_LETTERS, ENGLISH_RHYMES } from '../data/learningData';
import { EnglishLetter, Rhyme } from '../types';
import {
  playChimeSound,
  playClapSound,
  playPopSound,
  playTapSound,
  prefetchSpeech,
  speakText,
  stopSpeech,
} from '../utils/audio';

interface EnglishWorldProps {
  onEarnStar: (amount: number, mascotMsg: string, celebrate?: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

export const EnglishWorld: React.FC<EnglishWorldProps> = ({ onEarnStar, onSpeakingChange }) => {
  const [section, setSection] = useState<'phonics' | 'rhymes'>('phonics');
  const [selectedLetter, setSelectedLetter] = useState<EnglishLetter>(ENGLISH_LETTERS[0]);

  const [activeRhymeId, setActiveRhymeId] = useState<string | null>(null);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);
  const rhymeSessionRef = useRef<number>(0);
  const rhymeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopRhyme = () => {
    rhymeSessionRef.current += 1;
    if (rhymeTimerRef.current) {
      clearTimeout(rhymeTimerRef.current);
      rhymeTimerRef.current = null;
    }
    stopSpeech();
    setActiveRhymeId(null);
    setActiveLineIdx(-1);
    onSpeakingChange(false);
  };

  useEffect(() => {
    return () => {
      rhymeSessionRef.current += 1;
      if (rhymeTimerRef.current) {
        clearTimeout(rhymeTimerRef.current);
        rhymeTimerRef.current = null;
      }
      stopSpeech();
      onSpeakingChange(false);
    };
  }, [onSpeakingChange]);

  const handleLetterClick = (item: EnglishLetter) => {
    stopRhyme();
    playPopSound();
    setSelectedLetter(item);
    speakText(item.phonics, {
      lang: 'en-US',
      onStart: () => onSpeakingChange(true),
      onEnd: () => onSpeakingChange(false),
    });
    onEarnStar(1, `Awesome Rihan! ${item.phonics}! ${item.emoji}`);
  };

  const handleSingleLineClick = (line: string) => {
    stopRhyme();
    playTapSound();
    speakText(line, {
      lang: 'en-US',
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
    const sessionId = rhymeSessionRef.current;
    setActiveRhymeId(rhyme.id);

    rhyme.lines.forEach((line) => prefetchSpeech(line, 'en-US'));

    const readLine = (idx: number) => {
      if (rhymeSessionRef.current !== sessionId) return;
      if (idx >= rhyme.lines.length) {
        setActiveRhymeId(null);
        setActiveLineIdx(-1);
        onSpeakingChange(false);
        playClapSound();
        onEarnStar(3, `Great job Rihan! Singing "${rhyme.title}"!`, true);
        return;
      }

      setActiveLineIdx(idx);
      speakText(rhyme.lines[idx], {
        lang: 'en-US',
        onStart: () => {
          if (rhymeSessionRef.current === sessionId) onSpeakingChange(true);
        },
        onEnd: () => {
          if (rhymeSessionRef.current === sessionId) {
            rhymeTimerRef.current = setTimeout(() => readLine(idx + 1), 220);
          }
        },
      });
    };

    readLine(0);
  };

  return (
    <div className="space-y-6">
      {/* 3D English World Banner */}
      <div className="card-3d bg-gradient-to-r from-sky-50 via-white to-indigo-50 border-2 border-sky-200 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-sky-100">
              <img
                src="./src/assets/images/english_3d_storybook_1795732382678.jpg"
                alt="3D English Nursery Blocks"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-cartoon text-2xl sm:text-3xl font-bold text-slate-900">
                Rihan&apos;s English World
              </h2>
              <p className="font-bangla text-sm text-slate-600 mt-0.5">
                স্বাভাবিক মিষ্টি কণ্ঠে A থেকে Z ফনিক্স ও ইংরেজি ছড়া · 26 Letters & 3 Rhymes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-sky-100/70 p-1.5 rounded-2xl border border-sky-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopRhyme();
                playTapSound();
                setSection('phonics');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-cartoon text-sm sm:text-base font-bold transition-all cursor-pointer whitespace-nowrap ${
                section === 'phonics'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-900 hover:bg-sky-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>A to Z Phonics</span>
            </button>
            <button
              type="button"
              onClick={() => {
                stopRhyme();
                playTapSound();
                setSection('rhymes');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-cartoon text-sm sm:text-base font-bold transition-all cursor-pointer whitespace-nowrap ${
                section === 'rhymes'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-indigo-900 hover:bg-indigo-100'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>English Rhymes (3)</span>
            </button>
          </div>
        </div>
      </div>

      {section === 'phonics' ? (
        <div className="space-y-6">
          {/* 3D Spotlight Card */}
          <div className="card-3d bg-gradient-to-br from-sky-50 via-white to-indigo-50 border-2 border-sky-300 rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 sm:gap-7">
                <button
                  type="button"
                  onClick={() => handleLetterClick(selectedLetter)}
                  className="tile-3d w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-white to-sky-50 border-3 border-sky-400 flex items-center justify-center cursor-pointer"
                >
                  <span className="font-cartoon text-5xl sm:text-6xl font-bold text-sky-600">
                    {selectedLetter.upper}
                    <span className="text-sky-400 ml-1">{selectedLetter.lower}</span>
                  </span>
                </button>
                <div>
                  <div className="text-sm font-cartoon font-semibold text-sky-700">
                    Rihan&apos;s Phonics Spotlight
                  </div>
                  <h3 className="font-cartoon text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                    {selectedLetter.phonics}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleLetterClick(selectedLetter)}
                    className="tile-3d mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-cartoon font-bold text-sm sm:text-base cursor-pointer whitespace-nowrap"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen Again</span>
                  </button>
                </div>
              </div>

              <div className="clay-badge-3d flex flex-col items-center justify-center bg-gradient-to-b from-white to-sky-50 border-2 border-sky-200 rounded-3xl px-8 py-4 min-w-[148px]">
                <span
                  className="text-6xl sm:text-7xl animate-float-slow select-none drop-shadow-md"
                  role="img"
                  aria-label={selectedLetter.word}
                >
                  {selectedLetter.emoji}
                </span>
                <span className="font-cartoon text-lg font-bold text-slate-700 mt-2">
                  {selectedLetter.word}
                </span>
              </div>
            </div>
          </div>

          {/* 3D A-Z Grid */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3 sm:gap-3.5">
            {ENGLISH_LETTERS.map((item) => {
              const isSelected = selectedLetter.upper === item.upper;
              return (
                <button
                  key={item.upper}
                  type="button"
                  onClick={() => handleLetterClick(item)}
                  className={`tile-3d group flex flex-col items-center justify-center p-3 rounded-2xl border-2 cursor-pointer min-h-[108px] ${
                    item.color
                  } ${isSelected ? 'ring-4 ring-sky-400 scale-[1.04]' : ''}`}
                >
                  <span className="font-cartoon text-2xl sm:text-3xl font-bold leading-none">
                    {item.upper}
                    <span className="opacity-70 text-xl ml-0.5">{item.lower}</span>
                  </span>
                  <span className="text-2xl mt-1.5 group-hover:scale-115 transition-transform">
                    {item.emoji}
                  </span>
                  <span className="font-cartoon text-xs font-semibold mt-1 truncate max-w-full">
                    {item.word}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ENGLISH_RHYMES.map((rhyme) => {
            const isPlaying = activeRhymeId === rhyme.id;
            return (
              <div
                key={rhyme.id}
                className={`card-3d rounded-3xl border-2 p-5 sm:p-6 transition-all flex flex-col justify-between ${rhyme.bgTint} ${
                  isPlaying ? 'ring-4 ring-sky-400' : ''
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-cartoon text-xs font-semibold text-slate-600">
                        {rhyme.subtitle}
                      </p>
                      <h3 className="font-cartoon text-xl font-bold text-slate-900 mt-0.5">
                        {rhyme.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 text-2xl select-none">
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

                  <div className="mt-4 space-y-1.5 bg-white/90 rounded-2xl p-3.5 border border-white shadow-inner">
                    {rhyme.lines.map((line, idx) => {
                      const isLineActive = isPlaying && activeLineIdx === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSingleLineClick(line)}
                          className={`w-full text-left font-cartoon text-base px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                            isLineActive
                              ? 'bg-amber-300/90 text-slate-950 font-bold scale-[1.02]'
                              : 'text-slate-700 font-medium hover:bg-sky-50'
                          }`}
                        >
                          <span>{line}</span>
                          <Volume2 className="w-3.5 h-3.5 opacity-45 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => playRhymeKaraoke(rhyme)}
                  className={`tile-3d mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-cartoon text-base font-bold text-white cursor-pointer whitespace-nowrap ${
                    isPlaying
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-sky-500 hover:bg-sky-600'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop Rhyme</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Play Rhyme</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
