import React, { useEffect, useState } from 'react';
import { Clock, Lock, RotateCcw, ShieldCheck, Star, Unlock, X } from 'lucide-react';
import { RihanCharacterSVG } from './RihanMascot';
import { playChimeSound, playLullabyNote, playOopsSound, playTapSound } from '../utils/audio';

interface ParentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  stars: number;
  exploredCount: number;
  timerMinutes: number;
  secondsLeft: number | null;
  isSleeping: boolean;
  onSetTimer: (minutes: number) => void;
  onResetProgress: () => void;
  onWakeFromSleep: () => void;
}

interface GateProblem {
  a: number;
  b: number;
  answer: number;
}

function makeGateProblem(): GateProblem {
  const a = 4 + Math.floor(Math.random() * 6);
  const b = 3 + Math.floor(Math.random() * 6);
  return { a, b, answer: a * b };
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ParentalModal: React.FC<ParentalModalProps> = ({
  isOpen,
  onClose,
  stars,
  exploredCount,
  timerMinutes,
  secondsLeft,
  isSleeping,
  onSetTimer,
  onResetProgress,
  onWakeFromSleep,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [problem, setProblem] = useState<GateProblem>(() => makeGateProblem());
  const [inputVal, setInputVal] = useState('');
  const [gateError, setGateError] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Separate gate for Sleep Screen parent unlock
  const [sleepGateOpen, setSleepGateOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUnlocked(false);
      setInputVal('');
      setGateError(false);
      setConfirmReset(false);
      setProblem(makeGateProblem());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isSleeping) {
      playLullabyNote();
      setSleepGateOpen(false);
      setInputVal('');
      setGateError(false);
      setProblem(makeGateProblem());
    }
  }, [isSleeping]);

  const handleGateSubmit = (e: React.FormEvent, forSleepWake = false) => {
    e.preventDefault();
    if (Number(inputVal.trim()) === problem.answer) {
      playChimeSound();
      setGateError(false);
      if (forSleepWake) {
        setSleepGateOpen(false);
        onWakeFromSleep();
      } else {
        setUnlocked(true);
      }
    } else {
      playOopsSound();
      setGateError(true);
      setInputVal('');
      setProblem(makeGateProblem());
    }
  };

  // Fullscreen Resting Time Sleep Screen when Screen Time expires
  if (isSleeping) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 text-white flex flex-col items-center justify-center p-6 text-center">
        {/* Twinkling Stars */}
        <div className="text-4xl sm:text-5xl space-x-6 mb-4 animate-float-slow select-none">
          <span>🌙</span>
          <span>✨</span>
          <span>⭐</span>
        </div>

        <RihanCharacterSVG mood="sleeping" className="w-36 h-36 sm:w-44 sm:h-44 animate-float-slow" />

        <h2 className="font-bangla text-3xl sm:text-4xl font-bold text-amber-200 mt-4">
          রিহানের সাথে বিশ্রামের সময়
        </h2>
        <p className="font-cartoon text-lg sm:text-xl text-indigo-200 mt-1">
          Resting Time with Rihan
        </p>
        <p className="font-bangla text-base text-slate-300 max-w-md mt-3">
          স্ক্রিন টাইম শেষ হয়েছে! এখন চোখকে একটু বিশ্রাম দাও, পানি খাও এবং কিছুক্ষণ খেলাধুলা করো।
        </p>

        {!sleepGateOpen ? (
          <button
            type="button"
            onClick={() => {
              playTapSound();
              setProblem(makeGateProblem());
              setInputVal('');
              setGateError(false);
              setSleepGateOpen(true);
            }}
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bangla text-sm font-bold transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>অভিভাবক আনলক করুন (Parent Unlock)</span>
          </button>
        ) : (
          <form
            onSubmit={(e) => handleGateSubmit(e, true)}
            className="mt-6 bg-slate-800/90 border border-indigo-400/40 rounded-3xl p-5 w-full max-w-xs space-y-3"
          >
            <p className="font-bangla text-sm text-indigo-200">
              অভিভাবক যাচাই: উত্তর দিন
            </p>
            <div className="font-cartoon text-2xl font-bold text-amber-300 tabular-nums">
              {problem.a} × {problem.b} = ?
            </div>
            <input
              type="number"
              inputMode="numeric"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="উত্তর লিখুন"
              className="w-full rounded-xl bg-slate-900 border border-slate-600 px-4 py-2.5 text-center text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
            {gateError && (
              <p className="font-bangla text-xs text-rose-400">
                ভুল উত্তর! নতুন প্রশ্ন চেষ্টা করুন।
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSleepGateOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-sm font-bangla font-bold cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bangla font-bold cursor-pointer"
              >
                আনলক
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Parental Control"
    >
      <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-pop-in relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!unlocked ? (
          <form onSubmit={(e) => handleGateSubmit(e, false)} className="space-y-4 text-center pt-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bangla text-2xl font-bold text-slate-900">
                অভিভাবক নিয়ন্ত্রণ (Parental Gate)
              </h3>
              <p className="font-bangla text-sm text-slate-600 mt-1">
                প্রবেশ করতে নিচের গুণ অঙ্কটির উত্তর দিন
              </p>
            </div>

            <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl py-4 font-cartoon text-3xl font-bold text-indigo-900 tabular-nums">
              {problem.a} × {problem.b} = ?
            </div>

            <input
              type="number"
              inputMode="numeric"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="উত্তর লিখুন..."
              className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 text-center text-xl font-bold text-slate-900 focus:outline-none focus:border-indigo-500"
              autoFocus
            />

            {gateError && (
              <p className="font-bangla text-sm font-semibold text-rose-600">
                উত্তর সঠিক নয়! নতুন প্রশ্নটি চেষ্টা করুন।
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bangla text-base font-bold border-b-4 border-indigo-800 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>খুলুন (Unlock)</span>
            </button>
          </form>
        ) : (
          <div className="space-y-5 pt-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bangla text-xl font-bold text-slate-900">
                  অভিভাবক ড্যাশবোর্ড
                </h3>
                <p className="font-cartoon text-xs text-slate-500">
                  Parent Dashboard & Screen Time
                </p>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-600 font-bold text-2xl tabular-nums">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                  <span>{stars}</span>
                </div>
                <div className="font-bangla text-xs font-semibold text-slate-600 mt-1">
                  মোট অর্জিত তারা
                </div>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3.5 text-center">
                <div className="text-sky-700 font-bold text-2xl tabular-nums">
                  {exploredCount}
                </div>
                <div className="font-bangla text-xs font-semibold text-slate-600 mt-1">
                  অনুশীলন সংখ্যা
                </div>
              </div>
            </div>

            {/* Screen Time Timer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bangla text-sm font-bold text-slate-800">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>স্ক্রিন টাইম টাইমার</span>
                </div>
                {secondsLeft !== null && (
                  <span className="font-mono text-sm font-bold text-indigo-700 tabular-nums">
                    {formatTime(secondsLeft)} বাকি
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { mins: 0, label: 'বন্ধ' },
                  { mins: 1, label: '১ মি.' },
                  { mins: 15, label: '১৫ মি.' },
                  { mins: 30, label: '৩০ মি.' },
                ].map((opt) => (
                  <button
                    key={opt.mins}
                    type="button"
                    onClick={() => {
                      playTapSound();
                      onSetTimer(opt.mins);
                    }}
                    className={`py-2 rounded-xl font-bangla text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      timerMinutes === opt.mins
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset Progress */}
            <div className="pt-1">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bangla text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>সব অগ্রগতি রিসেট করুন (Reset Progress)</span>
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-300 rounded-2xl p-3 space-y-2 text-center">
                  <p className="font-bangla text-xs font-bold text-rose-800">
                    আপনি কি নিশ্চিত যে সব তারা (⭐) শূন্য করতে চান?
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="flex-1 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bangla text-xs font-bold cursor-pointer"
                    >
                      না, থাক
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playTapSound();
                        onResetProgress();
                        setConfirmReset(false);
                      }}
                      className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bangla text-xs font-bold cursor-pointer"
                    >
                      হ্যাঁ, রিসেট করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
