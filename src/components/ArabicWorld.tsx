import React, { useState } from 'react';
import { BookOpen, HeartHandshake, Volume2 } from 'lucide-react';
import { ARABIC_LETTERS, ISLAMIC_DUAS } from '../data/learningData';
import { ArabicLetter, DuaItem } from '../types';
import { playChimeSound, playPopSound, playTapSound, prefetchSpeech, speakText } from '../utils/audio';

interface ArabicWorldProps {
  onEarnStar: (amount: number, mascotMsg: string, celebrate?: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

export const ArabicWorld: React.FC<ArabicWorldProps> = ({ onEarnStar, onSpeakingChange }) => {
  const [section, setSection] = useState<'hijaiyah' | 'duas'>('hijaiyah');
  const [selectedLetter, setSelectedLetter] = useState<ArabicLetter>(ARABIC_LETTERS[0]);

  const handleArabicClick = (item: ArabicLetter) => {
    playPopSound();
    setSelectedLetter(item);
    speakText(item.speech, {
      lang: 'ar-SA',
      onStart: () => onSpeakingChange(true),
      onEnd: () => onSpeakingChange(false),
    });
    onEarnStar(1, `মাশাআল্লাহ রিহান! এটি ${item.nameBn} (${item.nameEn})!`);
  };

  const handleDuaClick = (dua: DuaItem) => {
    playChimeSound();
    prefetchSpeech(dua.meaningBn, 'bn-BD');
    speakText(dua.arabic, {
      lang: 'ar-SA',
      onStart: () => onSpeakingChange(true),
      onEnd: () => {
        speakText(dua.meaningBn, {
          lang: 'bn-BD',
          onEnd: () => onSpeakingChange(false),
        });
      },
    });
    onEarnStar(2, `মাশাআল্লাহ রিহান! "${dua.titleBn}" শিখেছো!`, true);
  };

  return (
    <div className="space-y-6">
      {/* 3D Arabic & Islamic Banner */}
      <div className="card-3d bg-gradient-to-r from-teal-50 via-white to-emerald-50 border-2 border-teal-200 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-teal-900">
              <img
                src="./src/assets/images/arabic_3d_storybook_1795732383561.jpg"
                alt="3D Crescent Moon and Lantern Storybook"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900">
                রিহানের আরবি ও ইসলামিক শিক্ষা
              </h2>
              <p className="font-bangla text-sm text-slate-600 mt-0.5">
                আলিফ থেকে ইয়া পর্যন্ত ২৮টি আরবি হরফ এবং প্রতিদিনের সুন্দর দোয়া ও আদব
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-teal-100/70 p-1.5 rounded-2xl border border-teal-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSection('hijaiyah');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bangla text-sm sm:text-base font-bold transition-all cursor-pointer whitespace-nowrap ${
                section === 'hijaiyah'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-teal-900 hover:bg-teal-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>আরবি হরফ (২৮টি)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSection('duas');
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bangla text-sm sm:text-base font-bold transition-all cursor-pointer whitespace-nowrap ${
                section === 'duas'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <HeartHandshake className="w-4 h-4" />
              <span>ছোট দোয়া ও আদব</span>
            </button>
          </div>
        </div>
      </div>

      {section === 'hijaiyah' ? (
        <div className="space-y-6">
          <div className="card-3d bg-gradient-to-br from-teal-50 via-white to-emerald-50 border-2 border-teal-300 rounded-3xl p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5 sm:gap-7">
                <button
                  type="button"
                  onClick={() => handleArabicClick(selectedLetter)}
                  className="tile-3d w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-b from-white to-teal-50 border-3 border-teal-400 flex items-center justify-center cursor-pointer"
                >
                  <span className="font-arabic text-6xl sm:text-7xl font-bold text-teal-700 leading-none">
                    {selectedLetter.letter}
                  </span>
                </button>
                <div>
                  <div className="font-bangla text-sm font-semibold text-teal-700">
                    আরবি হরফ (Hijaiyah)
                  </div>
                  <h3 className="font-bangla text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
                    {selectedLetter.nameBn} ({selectedLetter.nameEn})
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleArabicClick(selectedLetter)}
                    className="tile-3d mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bangla font-bold text-sm sm:text-base cursor-pointer whitespace-nowrap"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>উচ্চারণ শুনো</span>
                  </button>
                </div>
              </div>

              <div className="clay-badge-3d bg-white/90 border-2 border-teal-200 rounded-3xl px-7 py-4 text-center">
                <div className="font-bangla text-xs font-semibold text-teal-700">আরবিতে পড়ে</div>
                <div className="font-arabic text-4xl font-bold text-teal-800 mt-1" dir="rtl">
                  {selectedLetter.speech}
                </div>
              </div>
            </div>
          </div>

          <div dir="rtl" className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-3 sm:gap-4">
            {ARABIC_LETTERS.map((item) => {
              const isSelected = selectedLetter.letter === item.letter;
              return (
                <button
                  key={item.letter}
                  type="button"
                  onClick={() => handleArabicClick(item)}
                  className={`tile-3d flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl border-2 cursor-pointer min-h-[108px] ${
                    item.color
                  } ${isSelected ? 'ring-4 ring-teal-400 scale-[1.04]' : ''}`}
                >
                  <span className="font-arabic text-4xl sm:text-5xl font-bold leading-none">
                    {item.letter}
                  </span>
                  <span className="font-bangla text-sm font-bold mt-2">
                    {item.nameBn}
                  </span>
                  <span className="font-cartoon text-xs opacity-75">
                    {item.nameEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ISLAMIC_DUAS.map((dua) => (
            <div
              key={dua.id}
              className={`card-3d rounded-3xl border-2 p-5 sm:p-6 flex flex-col justify-between ${dua.color}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-cartoon text-xs font-semibold text-slate-600">
                      {dua.titleEn}
                    </p>
                    <h3 className="font-bangla text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                      {dua.titleBn}
                    </h3>
                  </div>
                  <span className="text-4xl select-none drop-shadow-xs">{dua.emoji}</span>
                </div>

                <div className="mt-4 bg-white/90 rounded-2xl p-4 border border-white space-y-2.5 shadow-inner">
                  <p
                    dir="rtl"
                    className="font-arabic text-2xl sm:text-3xl font-bold text-teal-900 text-right leading-relaxed"
                  >
                    {dua.arabic}
                  </p>
                  <p className="font-bangla text-base font-bold text-slate-800">
                    উচ্চারণ: {dua.pronunciationBn}
                  </p>
                  <p className="font-bangla text-sm text-slate-600">
                    অর্থ: {dua.meaningBn}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDuaClick(dua)}
                className="tile-3d mt-4 w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bangla text-base font-bold cursor-pointer whitespace-nowrap"
              >
                <Volume2 className="w-5 h-5" />
                <span>দোয়া ও অর্থ শুনো</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
