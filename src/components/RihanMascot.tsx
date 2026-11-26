import React, { useState } from 'react';

export type MascotMood = 'happy' | 'celebrate' | 'thinking' | 'sleeping';

interface RihanMascotProps {
  message: string;
  mood?: MascotMood;
  isSpeaking?: boolean;
  onMascotClick?: () => void;
  variant?: 'floating' | 'inline';
}

export const RihanCharacterSVG: React.FC<{
  mood?: MascotMood;
  isSpeaking?: boolean;
  className?: string;
}> = ({ mood = 'happy', isSpeaking = false, className = 'w-24 h-24' }) => {
  const isSleeping = mood === 'sleeping';
  const isCelebrate = mood === 'celebrate';

  return (
    <svg
      viewBox="0 0 140 140"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Rihan Mascot Character"
    >
      <defs>
        <radialGradient id="rihanFaceGrad" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#FFE4C9" />
          <stop offset="85%" stopColor="#FCD0A9" />
          <stop offset="100%" stopColor="#F3BC8D" />
        </radialGradient>
        <linearGradient id="rihanHoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="rihanHairGrad" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#3B2F2F" />
          <stop offset="100%" stopColor="#1E1818" />
        </linearGradient>
      </defs>

      {/* Soft Aura Shadow */}
      <ellipse cx="70" cy="131" rx="34" ry="6" fill="#0F172A" fillOpacity="0.1" />

      {/* Celebratory Stars */}
      {isCelebrate && (
        <g>
          <path d="M22 30L24.5 35L30 35.8L26 39.6L27 45L22 42.3L17 45L18 39.6L14 35.8L19.5 35L22 30Z" fill="#FACC15" />
          <path d="M118 28L120 32L124.5 32.6L121.2 35.8L122 40.2L118 38L114 40.2L114.8 35.8L111.5 32.6L116 32L118 28Z" fill="#FB7185" />
        </g>
      )}

      {/* Left Waving Arm */}
      <g className={isSleeping ? '' : 'animate-wave-hand'}>
        <path
          d={isCelebrate ? 'M38 92 C22 76, 16 62, 22 54' : 'M38 94 C24 90, 16 82, 20 72'}
          stroke="#0284C7"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle
          cx={isCelebrate ? 22 : 20}
          cy={isCelebrate ? 54 : 71}
          r="7.5"
          fill="#FCD0A9"
          stroke="#E5A979"
          strokeWidth="1.5"
        />
      </g>

      {/* Right Arm */}
      <g>
        <path
          d={isCelebrate ? 'M102 92 C118 76, 124 62, 118 54' : 'M102 95 C114 100, 118 110, 112 116'}
          stroke="#0284C7"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <circle
          cx={isCelebrate ? 118 : 112}
          cy={isCelebrate ? 54 : 116}
          r="7.5"
          fill="#FCD0A9"
          stroke="#E5A979"
          strokeWidth="1.5"
        />
      </g>

      {/* Torso / Cartoon Hoodie */}
      <path
        d="M38 94 C38 84, 50 80, 70 80 C90 80, 102 84, 102 94 L106 122 C106 127, 101 130, 95 130 L45 130 C39 130, 34 127, 34 122 Z"
        fill="url(#rihanHoodieGrad)"
      />
      {/* Hoodie Yellow Collar Trim */}
      <path
        d="M50 82 Q70 94 90 82"
        stroke="#FACC15"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Chest Star Emblem */}
      <path
        d="M70 97 L72.8 102.8 L79.2 103.7 L74.6 108.1 L75.7 114.5 L70 111.5 L64.3 114.5 L65.4 108.1 L60.8 103.7 L67.2 102.8 Z"
        fill="#FDE047"
        stroke="#CA8A04"
        strokeWidth="1.2"
      />

      {/* Neck */}
      <rect x="62" y="72" width="16" height="12" rx="6" fill="#F3BC8D" />

      {/* Ears */}
      <circle cx="34" cy="54" r="8.5" fill="#FCD0A9" stroke="#E5A979" strokeWidth="1.5" />
      <circle cx="34" cy="54" r="4" fill="#F3AA7B" />
      <circle cx="106" cy="54" r="8.5" fill="#FCD0A9" stroke="#E5A979" strokeWidth="1.5" />
      <circle cx="106" cy="54" r="4" fill="#F3AA7B" />

      {/* Head */}
      <rect
        x="36"
        y="22"
        width="68"
        height="62"
        rx="31"
        fill="url(#rihanFaceGrad)"
        stroke="#E8AC7E"
        strokeWidth="1.5"
      />

      {/* Fluffy Cartoon Hair */}
      <path
        d="M34 46 C31 25, 48 11, 72 11 C94 11, 109 25, 106 46 C103 36, 94 31, 86 33 C79 35, 76 28, 70 28 C61 28, 56 36, 48 34 C41 32, 37 38, 34 46 Z"
        fill="url(#rihanHairGrad)"
      />
      {/* Cute Top Hair Swirl / Quiff */}
      <path
        d="M58 14 C62 4, 78 4, 83 14 C75 13, 66 15, 58 14 Z"
        fill="#2D2323"
      />
      <path
        d="M52 24 Q64 17 78 23"
        stroke="#574747"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Rosy Cheeks */}
      <ellipse cx="47" cy="60" rx="6.5" ry="3.8" fill="#FB7185" fillOpacity="0.42" />
      <ellipse cx="93" cy="60" rx="6.5" ry="3.8" fill="#FB7185" fillOpacity="0.42" />

      {/* Eyebrows */}
      <path
        d={isCelebrate ? 'M47 40 Q53 35 59 39' : 'M47 42 Q53 38 59 41'}
        stroke="#2D2323"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d={isCelebrate ? 'M81 39 Q87 35 93 40' : 'M81 41 Q87 38 93 42'}
        stroke="#2D2323"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* Eyes */}
      {isSleeping ? (
        <g>
          <path d="M47 50 Q53 55 59 50" stroke="#1E1818" strokeWidth="2.8" strokeLinecap="round" />
          <path d="M81 50 Q87 55 93 50" stroke="#1E1818" strokeWidth="2.8" strokeLinecap="round" />
          <text x="106" y="25" fill="#FDE047" fontSize="13" fontWeight="bold">Z</text>
          <text x="117" y="16" fill="#FDE047" fontSize="10" fontWeight="bold">z</text>
        </g>
      ) : (
        <g className="animate-blink">
          {/* Left Eye */}
          <ellipse cx="53" cy="50" rx="6.2" ry="7.2" fill="#FFFFFF" />
          <circle cx="53.5" cy="50.5" r="4.3" fill="#1E293B" />
          <circle cx="55.2" cy="48.5" r="1.7" fill="#FFFFFF" />
          <circle cx="51.8" cy="52.4" r="0.8" fill="#FFFFFF" />

          {/* Right Eye */}
          <ellipse cx="87" cy="50" rx="6.2" ry="7.2" fill="#FFFFFF" />
          <circle cx="86.5" cy="50.5" r="4.3" fill="#1E293B" />
          <circle cx="88.2" cy="48.5" r="1.7" fill="#FFFFFF" />
          <circle cx="84.8" cy="52.4" r="0.8" fill="#FFFFFF" />
        </g>
      )}

      {/* Cute Button Nose */}
      <path
        d="M68 56 Q70 59 72 56"
        stroke="#D48E5E"
        strokeWidth="2.4"
        strokeLinecap="round"
      />

      {/* Mouth */}
      {isSleeping ? (
        <circle cx="70" cy="67" r="3" fill="#B45309" fillOpacity="0.6" />
      ) : isSpeaking ? (
        <g className="animate-talk">
          <ellipse cx="70" cy="67" rx="7.5" ry="5.5" fill="#991B1B" />
          <path d="M65 65 Q70 67 75 65" fill="#FFFFFF" />
          <ellipse cx="70" cy="70" rx="4.2" ry="2.2" fill="#FB7185" />
        </g>
      ) : (
        <g>
          <path
            d="M61 65 Q70 75 79 65 Z"
            fill="#991B1B"
          />
          <path
            d="M63 65.5 Q70 67 77 65.5"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M66 70 Q70 68 74 70"
            stroke="#FB7185"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </g>
      )}
    </svg>
  );
};

export const RihanMascot: React.FC<RihanMascotProps> = ({
  message,
  mood = 'happy',
  isSpeaking = false,
  onMascotClick,
  variant = 'floating',
}) => {
  const [minimized, setMinimized] = useState(false);

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-4">
        <RihanCharacterSVG mood={mood} isSpeaking={isSpeaking} className="w-28 h-28 shrink-0 animate-float-slow" />
        <div className="bg-white border-2 border-amber-200 rounded-2xl px-4 py-3 shadow-sm text-slate-800 font-bangla text-base sm:text-lg font-medium">
          {message}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex items-end gap-2 max-w-[calc(100vw-24px)] pointer-events-none">
      {/* Speech Bubble */}
      {!minimized && (
        <div
          key={message}
          className="pointer-events-auto animate-pop-in relative bg-white border-2 border-amber-300 rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-lg max-w-[215px] sm:max-w-[270px]"
        >
          <button
            type="button"
            onClick={() => setMinimized(true)}
            aria-label="Hide Rihan message"
            className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-100 border border-amber-300 text-amber-800 text-xs font-bold flex items-center justify-center hover:bg-amber-200 transition-colors cursor-pointer"
          >
            ×
          </button>
          <p className="font-bangla text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
            {message}
          </p>
          {/* Speech Bubble Tail */}
          <div className="absolute -right-2 bottom-4 w-3.5 h-3.5 bg-white border-r-2 border-b-2 border-amber-300 -rotate-45" />
        </div>
      )}

      {/* Cartoon Rihan Avatar Button */}
      <button
        type="button"
        onClick={() => {
          if (minimized) setMinimized(false);
          onMascotClick?.();
        }}
        title="রিহানের সাথে কথা বলো!"
        className="pointer-events-auto group relative flex flex-col items-center focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 rounded-full cursor-pointer"
      >
        <div className="w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-gradient-to-b from-amber-100 to-sky-100 border-3 border-white shadow-lg flex items-center justify-center overflow-visible group-hover:scale-105 active:scale-95 transition-transform">
          <RihanCharacterSVG
            mood={mood}
            isSpeaking={isSpeaking}
            className="w-16 h-16 sm:w-22 sm:h-22 animate-float-slow"
          />
        </div>
      </button>
    </div>
  );
};
