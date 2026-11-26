/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Lock, Sparkles, Star, Volume2, VolumeX } from 'lucide-react';
import { ArabicWorld } from './components/ArabicWorld';
import { BalloonGame } from './components/BalloonGame';
import { BanglaWorld } from './components/BanglaWorld';
import { ConfettiOverlay } from './components/ConfettiOverlay';
import { EnglishWorld } from './components/EnglishWorld';
import { FunMath } from './components/FunMath';
import { MagicBoard } from './components/MagicBoard';
import { ParentalModal } from './components/ParentalModal';
import { installRihanFaceFavicon, RihanFaceAvatar } from './components/RihanFaceAvatar';
import { MascotMood, RihanMascot } from './components/RihanMascot';
import { TabId } from './types';
import { playChimeSound, playTapSound, setMuted, speakText, stopSpeech } from './utils/audio';

const STORAGE_STARS_KEY = 'rihan_book_stars_v1';
const STORAGE_EXPLORED_KEY = 'rihan_book_explored_v1';

interface TabConfig {
  id: TabId;
  badge: string;
  label: string;
  activeClass: string;
  inactiveClass: string;
  greeting: string;
}

const TABS: TabConfig[] = [
  {
    id: 'bangla',
    badge: 'অ',
    label: 'বাংলা',
    activeClass: 'bg-amber-500 text-white border-amber-700',
    inactiveClass: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
    greeting: 'রিহান, চলো মজার বাংলা বর্ণমালা ও ৮টি সুন্দর ছড়া পড়ি!',
  },
  {
    id: 'english',
    badge: 'A',
    label: 'English',
    activeClass: 'bg-sky-500 text-white border-sky-700',
    inactiveClass: 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100',
    greeting: "Let's learn A to Z Phonics and sing English Rhymes, Rihan!",
  },
  {
    id: 'math',
    badge: '১২৩',
    label: 'মজার গণিত',
    activeClass: 'bg-emerald-500 text-white border-emerald-700',
    inactiveClass: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
    greeting: 'রিহান, এসো ফল গুনে সংখ্যা শিখি আর বানরের কলা খেলা খেলি!',
  },
  {
    id: 'arabic',
    badge: 'ا',
    label: 'আরবি ও আদব',
    activeClass: 'bg-teal-600 text-white border-teal-800',
    inactiveClass: 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100',
    greeting: 'রিহান, চলো আরবি হরফ এবং প্রতিদিনের সুন্দর দোয়া শিখি!',
  },
  {
    id: 'board',
    badge: '🎨',
    label: 'ম্যাজিক বোর্ড',
    activeClass: 'bg-rose-500 text-white border-rose-700',
    inactiveClass: 'bg-rose-50 text-rose-900 border-rose-200 hover:bg-rose-100',
    greeting: 'রিহান, ম্যাজিক বোর্ডে বর্ণের ওপর হাত ঘুরিয়ে সুন্দর করে আঁকো!',
  },
  {
    id: 'balloon',
    badge: '🎈',
    label: 'বেলুন গেম',
    activeClass: 'bg-indigo-600 text-white border-indigo-800',
    inactiveClass: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
    greeting: 'রিহান, সঠিক বেলুন ফাটিয়ে +৫টি তারা জিতে নাও!',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('bangla');

  const [stars, setStars] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STARS_KEY);
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });

  const [exploredCount, setExploredCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_EXPLORED_KEY);
      return saved ? Math.max(0, parseInt(saved, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });

  const [isMutedState, setIsMutedState] = useState<boolean>(false);
  const [mascotMessage, setMascotMessage] = useState<string>(
    'হ্যালো রিহান! চলো তোমার ৩ডি ইন্টেলিজেন্স বই থেকে মজা করে শিখি!'
  );
  const [mascotMood, setMascotMood] = useState<MascotMood>('happy');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [confettiKey, setConfettiKey] = useState<number>(0);
  const [starPop, setStarPop] = useState<boolean>(false);

  const [parentModalOpen, setParentModalOpen] = useState<boolean>(false);
  const [timerMinutes, setTimerMinutes] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);

  useEffect(() => {
    installRihanFaceFavicon();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STARS_KEY, String(stars));
    } catch {
      // ignore storage errors
    }
  }, [stars]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_EXPLORED_KEY, String(exploredCount));
    } catch {
      // ignore storage errors
    }
  }, [exploredCount]);

  useEffect(() => {
    if (secondsLeft === null || isSleeping) return;
    if (secondsLeft <= 0) {
      stopSpeech();
      setIsSleeping(true);
      setSecondsLeft(null);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, isSleeping]);

  const handleEarnStar = useCallback((amount: number, msg: string, celebrate = false) => {
    setMascotMessage(msg);
    if (amount > 0) {
      setStars((prev) => prev + amount);
      setExploredCount((prev) => prev + 1);
      setStarPop(true);
      setTimeout(() => setStarPop(false), 380);
    }

    if (celebrate) {
      setMascotMood('celebrate');
      setConfettiKey((k) => k + 1);
      setTimeout(() => setMascotMood('happy'), 2000);
    }
  }, []);

  const handleToggleMute = () => {
    const next = !isMutedState;
    setIsMutedState(next);
    setMuted(next);
    if (!next) {
      playTapSound();
    }
  };

  const handleTabChange = (tab: TabConfig) => {
    stopSpeech();
    setIsSpeaking(false);
    playTapSound();
    setActiveTab(tab.id);
    setMascotMessage(tab.greeting);
    setMascotMood('happy');
  };

  const handleMascotClick = () => {
    playChimeSound();
    setMascotMood('celebrate');
    const phrases = [
      'সাবাশ রিহান! তুমি অনেক বুদ্ধিমান! আরও তারকা জিতে নাও!',
      'হ্যালো রিহান! তোমার সাথে পড়তে আমার খুব ভালো লাগছে!',
      'দারুণ রিহান! যেকোনো বর্ণ বা ছড়ায় ক্লিক করে মিষ্টি কণ্ঠে শুনো!',
    ];
    const picked = phrases[Math.floor(Math.random() * phrases.length)];
    setMascotMessage(picked);
    speakText(picked, {
      lang: 'bn-BD',
      onStart: () => setIsSpeaking(true),
      onEnd: () => {
        setIsSpeaking(false);
        setMascotMood('happy');
      },
    });
  };

  const handleWelcomeSpeak = () => {
    playChimeSound();
    const welcomeText = 'স্বাগতম রিহান! রিহান ইন্টেলিজেন্স বুকে তোমাকে স্বাগতম। চলো আজ মজা করে শিখি!';
    setMascotMessage(welcomeText);
    speakText(welcomeText, {
      lang: 'bn-BD',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  const handleSetTimer = (minutes: number) => {
    setTimerMinutes(minutes);
    if (minutes === 0) {
      setSecondsLeft(null);
      setIsSleeping(false);
    } else {
      setSecondsLeft(minutes * 60);
      setIsSleeping(false);
    }
  };

  const handleResetProgress = () => {
    setStars(0);
    setExploredCount(0);
    setMascotMessage('নতুন করে শেখা শুরু হলো রিহান! চলো সব তারা জিতে নিই!');
  };

  const handleWakeFromSleep = () => {
    setIsSleeping(false);
    setTimerMinutes(0);
    setSecondsLeft(null);
    setMascotMessage('স্বাগতম রিহান! চলো আবার মজা করে শিখি!');
  };

  return (
    <div className="min-h-screen text-slate-900 pb-28 sm:pb-32">
      <ConfettiOverlay burstKey={confettiKey} />

      {/* Top Bar featuring Rihan's Face App Icon */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* App Brand with Rihan's Full-Face App Icon */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="clay-badge-3d w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-400 p-0.5 shrink-0">
              <RihanFaceAvatar
                className="w-full h-full rounded-[14px] border-2 border-white"
                alt="Rihan App Icon"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-cartoon text-base sm:text-xl font-bold text-slate-900 truncate leading-tight">
                Rihan Intelligence Book
              </h1>
              <p className="font-bangla text-xs font-semibold text-amber-700 truncate">
                রিহান ইন্টেলিজেন্স বুক · 3D Edition
              </p>
            </div>
          </div>

          {/* Right Controls: Star Counter, Sound Toggle, Parental Lock */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div
              className={`clay-badge-3d inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-bold transition-transform ${
                starPop ? 'scale-115' : 'scale-100'
              }`}
              title="রিহানের অর্জিত তারা (Rihan's Stars)"
            >
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-500" />
              <span className="font-cartoon text-base sm:text-lg tabular-nums">{stars}</span>
            </div>

            <button
              type="button"
              onClick={handleToggleMute}
              aria-label={isMutedState ? 'Unmute Sound' : 'Mute Sound'}
              title={isMutedState ? 'শব্দ চালু করো' : 'শব্দ বন্ধ করো'}
              className={`tile-3d w-10 h-10 sm:w-11 sm:h-11 rounded-2xl border-2 flex items-center justify-center cursor-pointer ${
                isMutedState
                  ? 'bg-rose-100 border-rose-300 text-rose-700'
                  : 'bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200'
              }`}
            >
              {isMutedState ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                playTapSound();
                setParentModalOpen(true);
              }}
              aria-label="Parental Control"
              title="অভিভাবক নিয়ন্ত্রণ"
              className="tile-3d w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 border-2 border-slate-300 text-slate-700 flex items-center justify-center cursor-pointer"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero 3D Intelligence Book Personalized Showcase */}
      <section className="max-w-6xl mx-auto px-4 pt-4 sm:pt-5">
        <div className="card-3d rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-7 p-5 sm:p-6 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-4">
                <div className="clay-badge-3d w-18 h-18 sm:w-22 sm:h-22 rounded-3xl p-0.5 bg-gradient-to-br from-amber-400 to-rose-400 shrink-0">
                  <RihanFaceAvatar className="w-full h-full rounded-[22px] border-2 border-white" alt="Rihan" />
                </div>
                <div>
                  <div className="font-bangla text-xs sm:text-sm font-bold text-amber-700">
                    রিহানের নিজস্ব ৩ডি স্মার্ট বই
                  </div>
                  <h2 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    স্বাগতম, <span className="text-amber-600">রিহান (Rihan)</span>!
                  </h2>
                </div>
              </div>

              <p className="font-bangla text-sm sm:text-base text-slate-600 max-w-xl">
                মিষ্টি কণ্ঠে বাংলা বর্ণ ও ৮টি ছড়া, English A–Z ও rhymes, মজার ৩ডি গণিত, আরবি হরফ ও দোয়া, ম্যাজিক ড্রয়িং বোর্ড এবং ৩ডি বেলুন গেম!
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleWelcomeSpeak}
                  className="tile-3d inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bangla text-sm sm:text-base font-bold cursor-pointer whitespace-nowrap"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>রিহানের নাম শুনো</span>
                </button>
                <span className="font-bangla text-xs sm:text-sm font-semibold text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>মোট তারা: {stars} ⭐</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 min-h-[190px] sm:min-h-[220px] relative overflow-hidden">
              <img
                src="/src/assets/images/hero_3d_intelligence_book_1795732382110.jpg"
                alt="Rihan 3D Pop-up Intelligence Book"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover lg:h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6 Learning World 3D Navigation Tabs */}
      <nav aria-label="Learning Modules" className="max-w-6xl mx-auto px-4 pt-4 sm:pt-5">
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-2.5 overflow-x-auto no-scrollbar pb-2">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab)}
                className={`tile-3d flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border-2 font-bangla text-sm sm:text-base font-bold cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive ? `${tab.activeClass} -translate-y-0.5` : tab.inactiveClass
                }`}
              >
                <span className="text-lg sm:text-xl leading-none font-bold">{tab.badge}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 3D Open Intelligence Book Spread Container */}
      <main className="max-w-6xl mx-auto px-4 pt-3 sm:pt-4">
        <div className="book-spread-3d rounded-[28px] sm:rounded-[36px] bg-[#FFFDF8] border-2 border-amber-200/80 p-4 sm:p-6 md:p-7">
          {activeTab === 'bangla' && (
            <BanglaWorld onEarnStar={handleEarnStar} onSpeakingChange={setIsSpeaking} />
          )}
          {activeTab === 'english' && (
            <EnglishWorld onEarnStar={handleEarnStar} onSpeakingChange={setIsSpeaking} />
          )}
          {activeTab === 'math' && (
            <FunMath onEarnStar={handleEarnStar} onSpeakingChange={setIsSpeaking} />
          )}
          {activeTab === 'arabic' && (
            <ArabicWorld onEarnStar={handleEarnStar} onSpeakingChange={setIsSpeaking} />
          )}
          {activeTab === 'board' && <MagicBoard onEarnStar={handleEarnStar} />}
          {activeTab === 'balloon' && (
            <BalloonGame onEarnStar={handleEarnStar} onSpeakingChange={setIsSpeaking} />
          )}
        </div>
      </main>

      {/* Persistent Cute Cartoon Mascot "Rihan" */}
      <RihanMascot
        message={mascotMessage}
        mood={mascotMood}
        isSpeaking={isSpeaking}
        onMascotClick={handleMascotClick}
      />

      {/* Parental Gate & Sleep Screen */}
      <ParentalModal
        isOpen={parentModalOpen}
        onClose={() => setParentModalOpen(false)}
        stars={stars}
        exploredCount={exploredCount}
        timerMinutes={timerMinutes}
        secondsLeft={secondsLeft}
        isSleeping={isSleeping}
        onSetTimer={handleSetTimer}
        onResetProgress={handleResetProgress}
        onWakeFromSleep={handleWakeFromSleep}
      />
    </div>
  );
}
