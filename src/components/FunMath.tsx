import React, { useState } from 'react';
import { Calculator, Palette, Sparkles, Volume2 } from 'lucide-react';
import { COLORS, MATH_NUMBERS, SHAPES } from '../data/learningData';
import { ColorItem, ShapeItem } from '../types';
import { playChimeSound, playOopsSound, playPopSound, playTapSound, speakText } from '../utils/audio';

interface FunMathProps {
  onEarnStar: (amount: number, mascotMsg: string, celebrate?: boolean) => void;
  onSpeakingChange: (speaking: boolean) => void;
}

interface MathQuestion {
  a: number;
  b: number;
  op: '+' | '-';
  answer: number;
  options: number[];
}

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '১০'];

function toBanglaNum(n: number): string {
  if (n >= 0 && n <= 10) return BN_DIGITS[n];
  return String(n)
    .split('')
    .map((d) => BN_DIGITS[Number(d)] ?? d)
    .join('');
}

function generateQuestion(): MathQuestion {
  const isAdd = Math.random() > 0.35;
  let a = 1 + Math.floor(Math.random() * 5);
  let b = 1 + Math.floor(Math.random() * 4);

  if (!isAdd) {
    a = 2 + Math.floor(Math.random() * 6);
    b = 1 + Math.floor(Math.random() * (a - 1));
  }

  const answer = isAdd ? a + b : a - b;
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const candidate = Math.max(1, Math.min(10, answer + Math.floor(Math.random() * 5) - 2));
    opts.add(candidate);
  }
  const options = Array.from(opts).sort((x, y) => x - y);

  return { a, b, op: isAdd ? '+' : '-', answer, options };
}

export const FunMath: React.FC<FunMathProps> = ({ onEarnStar, onSpeakingChange }) => {
  const [subTab, setSubTab] = useState<'counting' | 'monkey' | 'shapes'>('counting');

  const [numLang, setNumLang] = useState<'bn' | 'en'>('bn');
  const [selectedNum, setSelectedNum] = useState(MATH_NUMBERS[2]);
  const [tappedFruits, setTappedFruits] = useState<number[]>([]);

  const [question, setQuestion] = useState<MathQuestion>(() => generateQuestion());
  const [wrongOpt, setWrongOpt] = useState<number | null>(null);
  const [monkeyHappy, setMonkeyHappy] = useState(false);

  const [selectedShape, setSelectedShape] = useState<ShapeItem>(SHAPES[0]);
  const [selectedColor, setSelectedColor] = useState<ColorItem>(COLORS[0]);

  const handleSelectNumber = (item: (typeof MATH_NUMBERS)[number]) => {
    playPopSound();
    setSelectedNum(item);
    setTappedFruits([]);
    const spoken = numLang === 'bn' ? `${item.bnWord}! ${item.bn}টি` : `${item.value}! ${item.enWord}`;
    speakText(numLang === 'bn' ? item.bnWord : item.enWord, {
      lang: numLang === 'bn' ? 'bn-BD' : 'en-US',
      onStart: () => onSpeakingChange(true),
      onEnd: () => onSpeakingChange(false),
    });
    onEarnStar(1, `সাবাশ রিহান! এটি ${spoken} ${item.emoji}`);
  };

  const handleFruitTap = (idx: number) => {
    playPopSound();
    if (!tappedFruits.includes(idx)) {
      const next = [...tappedFruits, idx];
      setTappedFruits(next);
      const count = next.length;
      const numObj = MATH_NUMBERS[count - 1];
      if (numObj) {
        speakText(numLang === 'bn' ? numObj.bnWord : numObj.enWord, {
          lang: numLang === 'bn' ? 'bn-BD' : 'en-US',
          onStart: () => onSpeakingChange(true),
          onEnd: () => onSpeakingChange(false),
        });
      }
    }
  };

  const handleAnswerMonkey = (opt: number) => {
    if (opt === question.answer) {
      setWrongOpt(null);
      setMonkeyHappy(true);
      playChimeSound();
      speakText(`দারুণ রিহান! উত্তর ${toBanglaNum(question.answer)}`, {
        lang: 'bn-BD',
        onStart: () => onSpeakingChange(true),
        onEnd: () => onSpeakingChange(false),
      });
      onEarnStar(3, `সাবাশ রিহান! বানর খুব খুশি! উত্তর ${toBanglaNum(question.answer)}টি কলা!`, true);
      setTimeout(() => {
        setMonkeyHappy(false);
        setQuestion(generateQuestion());
      }, 1250);
    } else {
      setWrongOpt(opt);
      playOopsSound();
      onEarnStar(0, 'উহু রিহান! আবার গুনে দেখো তো সোনা!');
      setTimeout(() => setWrongOpt(null), 500);
    }
  };

  const handleSelectShape = (shape: ShapeItem) => {
    playPopSound();
    setSelectedShape(shape);
    speakText(`${shape.nameBn}`, {
      lang: 'bn-BD',
      onStart: () => onSpeakingChange(true),
      onEnd: () => onSpeakingChange(false),
    });
    onEarnStar(1, `বাহ রিহান! এটি ${shape.nameBn} (${shape.nameEn})!`);
  };

  const handleSelectColor = (color: ColorItem) => {
    playPopSound();
    setSelectedColor(color);
    speakText(`${color.nameBn} রঙ`, {
      lang: 'bn-BD',
      onStart: () => onSpeakingChange(true),
      onEnd: () => onSpeakingChange(false),
    });
    onEarnStar(1, `সুন্দর রঙ রিহান! ${color.nameBn} (${color.nameEn})!`);
  };

  const render3DShapeSVG = () => {
    const base = selectedColor.hex;
    return (
      <svg viewBox="0 0 200 200" className="w-48 h-48 sm:w-56 sm:h-56 animate-float-slow drop-shadow-xl">
        <defs>
          <radialGradient id="shape3DGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="28%" stopColor={base} stopOpacity="1" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.45" />
          </radialGradient>
          <linearGradient id="shapeFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={base} />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Ground Shadow */}
        <ellipse cx="100" cy="182" rx="58" ry="10" fill="#0F172A" fillOpacity="0.14" />

        {selectedShape.id === 'circle' && (
          <g>
            <circle cx="100" cy="96" r="68" fill={base} />
            <circle cx="100" cy="96" r="68" fill="url(#shape3DGrad)" fillOpacity="0.55" />
            <ellipse cx="75" cy="65" rx="20" ry="11" transform="rotate(-30 75 65)" fill="#FFFFFF" fillOpacity="0.55" />
          </g>
        )}

        {selectedShape.id === 'square' && (
          <g>
            {/* 3D Cube extruded sides */}
            <polygon points="44,48 64,28 168,28 148,48" fill={base} opacity="0.78" />
            <polygon points="148,48 168,28 168,132 148,152" fill={base} />
            <polygon points="148,48 168,28 168,132 148,152" fill="#0F172A" opacity="0.22" />
            <rect x="44" y="48" width="104" height="104" rx="14" fill={base} stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="3" />
            <rect x="52" y="56" width="38" height="12" rx="6" fill="#FFFFFF" fillOpacity="0.38" />
          </g>
        )}

        {selectedShape.id === 'rectangle' && (
          <g>
            <polygon points="24,62 42,44 178,44 160,62" fill={base} opacity="0.78" />
            <polygon points="160,62 178,44 178,136 160,154" fill={base} />
            <polygon points="160,62 178,44 178,136 160,154" fill="#0F172A" opacity="0.22" />
            <rect x="24" y="62" width="136" height="92" rx="14" fill={base} stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="3" />
            <rect x="34" y="70" width="46" height="10" rx="5" fill="#FFFFFF" fillOpacity="0.38" />
          </g>
        )}

        {selectedShape.id === 'triangle' && (
          <g>
            {/* 3D Pyramid */}
            <polygon points="100,24 170,152 122,162" fill={base} />
            <polygon points="100,24 170,152 122,162" fill="#0F172A" opacity="0.25" />
            <polygon points="100,24 122,162 30,152" fill={base} stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="2.5" strokeLinejoin="round" />
            <polygon points="100,34 86,86 70,82" fill="#FFFFFF" fillOpacity="0.32" />
          </g>
        )}

        {selectedShape.id === 'star' && (
          <g>
            <polygon
              transform="translate(6, 8)"
              points="100,20 124,70 178,76 138,114 148,168 100,142 52,168 62,114 22,76 76,70"
              fill="#0F172A"
              fillOpacity="0.22"
            />
            <polygon
              points="100,20 124,70 178,76 138,114 148,168 100,142 52,168 62,114 22,76 76,70"
              fill={base}
              stroke="#FFFFFF"
              strokeOpacity="0.55"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="88" cy="75" r="10" fill="#FFFFFF" fillOpacity="0.32" />
          </g>
        )}

        {selectedShape.id === 'heart' && (
          <g>
            <path
              transform="translate(5, 7)"
              d="M100 164 C100 164 26 118 26 68 C26 42 46 26 70 26 C84 26 95 34 100 44 C105 34 116 26 130 26 C154 26 174 42 174 68 C174 118 100 164 100 164 Z"
              fill="#0F172A"
              fillOpacity="0.2"
            />
            <path
              d="M100 164 C100 164 26 118 26 68 C26 42 46 26 70 26 C84 26 95 34 100 44 C105 34 116 26 130 26 C154 26 174 42 174 68 C174 118 100 164 100 164 Z"
              fill={base}
              stroke="#FFFFFF"
              strokeOpacity="0.5"
              strokeWidth="4"
            />
            <ellipse cx="62" cy="54" rx="14" ry="8" transform="rotate(-35 62 54)" fill="#FFFFFF" fillOpacity="0.45" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      {/* 3D Math World Banner */}
      <div className="card-3d bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-2 border-emerald-200 rounded-3xl p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-24 h-20 sm:w-32 sm:h-24 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-emerald-100">
              <img
                src="/src/assets/images/math_3d_storybook_1795732383559.jpg"
                alt="3D Monkey and Geometric Shapes"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900">
                রিহানের মজার গণিত (3D Math)
              </h2>
              <p className="font-bangla text-sm text-slate-600 mt-0.5">
                সংখ্যা গণনা, বানরের কলা খেলা এবং রঙিন ৩ডি আকৃতি চেনা
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-emerald-100/70 p-1.5 rounded-2xl border border-emerald-200">
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSubTab('counting');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bangla text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTab === 'counting'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-emerald-900 hover:bg-emerald-100'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>সংখ্যা গণনা</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSubTab('monkey');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bangla text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTab === 'monkey'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-amber-900 hover:bg-amber-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>বানরের কলা খেলা</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playTapSound();
                setSubTab('shapes');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bangla text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                subTab === 'shapes'
                  ? 'bg-violet-500 text-white shadow-sm'
                  : 'text-violet-900 hover:bg-violet-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>৩ডি আকৃতি ও রঙ</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: Counting 1-10 / ১-১০ */}
      {subTab === 'counting' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-emerald-200">
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setNumLang('bn');
                }}
                className={`px-4 py-2 rounded-xl font-bangla text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  numLang === 'bn' ? 'bg-emerald-500 text-white' : 'text-slate-700 hover:bg-emerald-50'
                }`}
              >
                বাংলা (১ - ১০)
              </button>
              <button
                type="button"
                onClick={() => {
                  playTapSound();
                  setNumLang('en');
                }}
                className={`px-4 py-2 rounded-xl font-cartoon text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                  numLang === 'en' ? 'bg-sky-500 text-white' : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                English (1 - 10)
              </button>
            </div>
            <span className="font-bangla text-sm text-slate-600">
              ফলের ওপর ট্যাপ করে একে একে গুনো!
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
            {MATH_NUMBERS.map((item) => {
              const active = selectedNum.value === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleSelectNumber(item)}
                  className={`tile-3d py-3.5 rounded-2xl border-2 font-bold text-2xl sm:text-3xl cursor-pointer tabular-nums ${
                    active
                      ? 'bg-emerald-500 text-white border-emerald-700 scale-105'
                      : 'bg-white text-slate-800 border-emerald-200 hover:border-emerald-400'
                  }`}
                >
                  {numLang === 'bn' ? item.bn : item.value}
                </button>
              );
            })}
          </div>

          <div className="card-3d bg-gradient-to-br from-emerald-50 via-white to-lime-50 border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 text-center">
            <div className="clay-badge-3d inline-flex items-center gap-4 bg-white border-2 border-emerald-200 rounded-3xl px-7 py-4">
              <span className="text-5xl sm:text-6xl font-bold text-emerald-600 tabular-nums">
                {numLang === 'bn' ? selectedNum.bn : selectedNum.value}
              </span>
              <span className="text-3xl text-slate-300">=</span>
              <span className="font-bangla text-3xl sm:text-4xl font-bold text-slate-800">
                {numLang === 'bn' ? selectedNum.bnWord : selectedNum.enWord}
              </span>
            </div>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4 min-h-[110px]">
              {Array.from({ length: selectedNum.value }).map((_, idx) => {
                const isTapped = tappedFruits.includes(idx);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleFruitTap(idx)}
                    className={`tile-3d w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer select-none ${
                      isTapped
                        ? 'bg-amber-100 border-amber-400 scale-110'
                        : 'bg-white border-emerald-200 animate-float-slow'
                    }`}
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <span className="text-4xl sm:text-5xl drop-shadow-xs">{selectedNum.emoji}</span>
                    {isTapped && (
                      <span className="text-xs font-bold text-amber-800 -mt-1 tabular-nums">
                        {numLang === 'bn' ? toBanglaNum(idx + 1) : idx + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: Monkey Banana Addition/Subtraction Game */}
      {subTab === 'monkey' && (
        <div className="card-3d bg-gradient-to-br from-amber-50 via-white to-yellow-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className={`text-5xl sm:text-6xl ${monkeyHappy ? 'animate-bounce' : 'animate-float-slow'}`}>
              🐵
            </span>
            <div className="text-left">
              <h3 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900">
                রিহান ও বানরের কলা খেলা!
              </h3>
              <p className="font-bangla text-sm text-slate-600">
                সঠিক সংখ্যায় ক্লিক করে ৩টি তারা (⭐) জিতে নাও
              </p>
            </div>
          </div>

          <div className="mt-6 bg-white border-2 border-amber-200 rounded-3xl p-5 sm:p-7 max-w-2xl mx-auto shadow-inner">
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <div className="flex flex-wrap justify-center gap-1 text-3xl sm:text-4xl max-w-[160px]">
                  {Array.from({ length: question.a }).map((_, i) => (
                    <span key={i}>🍌</span>
                  ))}
                </div>
                <div className="font-bangla text-lg font-bold text-amber-900 mt-1 tabular-nums">
                  {toBanglaNum(question.a)}টি
                </div>
              </div>

              <span className="text-4xl sm:text-5xl font-bold text-rose-500">
                {question.op}
              </span>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <div className="flex flex-wrap justify-center gap-1 text-3xl sm:text-4xl max-w-[160px]">
                  {Array.from({ length: question.b }).map((_, i) => (
                    <span key={i} className={question.op === '-' ? 'opacity-65' : ''}>
                      🍌
                    </span>
                  ))}
                </div>
                <div className="font-bangla text-lg font-bold text-amber-900 mt-1 tabular-nums">
                  {toBanglaNum(question.b)}টি
                </div>
              </div>

              <span className="text-4xl sm:text-5xl font-bold text-slate-700">=</span>

              <div className="clay-badge-3d w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 border-3 border-dashed border-emerald-400 flex items-center justify-center text-3xl font-bold text-emerald-700">
                {monkeyHappy ? toBanglaNum(question.answer) : '?'}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3">
              <p className="font-bangla text-xl sm:text-2xl font-bold text-slate-800">
                {toBanglaNum(question.a)}টি 🍌 {question.op} {toBanglaNum(question.b)}টি 🍌 = কয়টি?
              </p>
              <button
                type="button"
                onClick={() =>
                  speakText(
                    `${toBanglaNum(question.a)} ${question.op === '+' ? 'যোগ' : 'বিয়োগ'} ${toBanglaNum(question.b)} সমান কত?`,
                    { lang: 'bn-BD' }
                  )
                }
                aria-label="প্রশ্ন শুনো"
                className="p-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 cursor-pointer"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-xl mx-auto">
            {question.options.map((opt) => {
              const isWrong = wrongOpt === opt;
              const isCorrect = monkeyHappy && opt === question.answer;
              return (
                <button
                  key={opt}
                  type="button"
                  disabled={monkeyHappy}
                  onClick={() => handleAnswerMonkey(opt)}
                  className={`tile-3d py-4 sm:py-5 rounded-2xl border-2 font-bangla text-3xl sm:text-4xl font-bold cursor-pointer tabular-nums ${
                    isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-700 scale-105'
                      : isWrong
                      ? 'bg-rose-500 text-white border-rose-700 animate-wiggle'
                      : 'bg-white text-slate-900 border-amber-300 hover:bg-amber-100'
                  }`}
                >
                  {toBanglaNum(opt)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE 3: 3D Shapes & Colors */}
      {subTab === 'shapes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="card-3d lg:col-span-5 bg-gradient-to-b from-white to-violet-50 border-2 border-violet-200 rounded-3xl p-6 flex flex-col items-center justify-center">
            {render3DShapeSVG()}
            <h3 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900 mt-3 text-center">
              {selectedColor.nameBn} {selectedShape.nameBn}
            </h3>
            <p className="font-cartoon text-lg font-semibold text-slate-500 mt-0.5">
              {selectedColor.nameEn} {selectedShape.nameEn}
            </p>
          </div>

          <div className="card-3d lg:col-span-7 space-y-5 bg-white border-2 border-violet-200 rounded-3xl p-6">
            <div>
              <h4 className="font-bangla text-lg font-bold text-slate-800 mb-3">
                ১. ৩ডি আকৃতি পছন্দ করো (3D Shapes)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SHAPES.map((shape) => {
                  const active = selectedShape.id === shape.id;
                  return (
                    <button
                      key={shape.id}
                      type="button"
                      onClick={() => handleSelectShape(shape)}
                      className={`tile-3d p-3 rounded-2xl border-2 text-left cursor-pointer ${
                        active
                          ? 'bg-violet-500 text-white border-violet-700'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-violet-300'
                      }`}
                    >
                      <div className="font-bangla text-base font-bold">{shape.nameBn}</div>
                      <div className={`font-cartoon text-xs ${active ? 'text-violet-100' : 'text-slate-500'}`}>
                        {shape.nameEn}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="font-bangla text-lg font-bold text-slate-800 mb-3">
                ২. রঙ পছন্দ করো (Colors)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {COLORS.map((color) => {
                  const active = selectedColor.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handleSelectColor(color)}
                      className={`tile-3d flex items-center gap-2.5 p-2.5 rounded-2xl border-2 cursor-pointer ${
                        active
                          ? 'border-slate-900 bg-slate-100 scale-[1.02]'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <span
                        className="clay-badge-3d w-7 h-7 rounded-full border-2 border-white shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="text-left min-w-0">
                        <div className="font-bangla text-sm font-bold text-slate-900 truncate">
                          {color.nameBn}
                        </div>
                        <div className="font-cartoon text-xs text-slate-500 truncate">
                          {color.nameEn}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
