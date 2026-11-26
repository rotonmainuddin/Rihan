import React, { useEffect, useRef, useState } from 'react';
import { Eraser, Sparkles, Trash2, Undo2 } from 'lucide-react';
import { TRACING_GUIDES } from '../data/learningData';
import { playChimeSound, playTapSound, speakText } from '../utils/audio';

interface MagicBoardProps {
  onEarnStar: (amount: number, mascotMsg: string, celebrate?: boolean) => void;
}

const BRUSH_COLORS = [
  { id: 'rose', label: 'লাল', hex: '#E11D48' },
  { id: 'sky', label: 'নীল', hex: '#0284C7' },
  { id: 'emerald', label: 'সবুজ', hex: '#16A34A' },
  { id: 'amber', label: 'কমলা', hex: '#F59E0B' },
  { id: 'purple', label: 'বেগুনি', hex: '#9333EA' },
  { id: 'ink', label: 'কালো', hex: '#1E293B' },
];

const BRUSH_SIZES = [
  { id: 'sm', label: 'চিকন', size: 6 },
  { id: 'md', label: 'মাঝারি', size: 12 },
  { id: 'lg', label: 'মোটা', size: 20 },
];

export const MagicBoard: React.FC<MagicBoardProps> = ({ onEarnStar }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const historyRef = useRef<ImageData[]>([]);

  const [guideChar, setGuideChar] = useState<string>('অ');
  const [brushColor, setBrushColor] = useState<string>('#E11D48');
  const [brushSize, setBrushSize] = useState<number>(12);
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // Initialize and resize canvas cleanly while preserving drawing if possible
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(280, Math.floor(rect.width));
      const height = 380;

      if (canvas.width === width && canvas.height === height) return;

      const ctx = canvas.getContext('2d');
      let previous: ImageData | null = null;
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        try {
          previous = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch {
          previous = null;
        }
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx && previous) {
        ctx.putImageData(previous, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    try {
      const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [...historyRef.current.slice(-14), snap];
    } catch {
      // Ignore snapshot errors
    }
  };

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.setPointerCapture(e.pointerId);
    saveSnapshot();
    isDrawingRef.current = true;

    const { x, y } = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = isEraser ? brushSize * 2 : brushSize;

    if (isEraser) {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }

    // Draw initial dot for single taps
    ctx.lineTo(x + 0.01, y + 0.01);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getPoint(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const clearBoard = () => {
    playTapSound();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    saveSnapshot();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleUndo = () => {
    playTapSound();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || historyRef.current.length === 0) return;
    const prev = historyRef.current.pop()!;
    ctx.globalCompositeOperation = 'source-over';
    ctx.putImageData(prev, 0, 0);
  };

  const handleCelebrateDrawing = () => {
    playChimeSound();
    speakText('বাহ রিহান! তুমি খুব সুন্দর এঁকেছো!', { lang: 'bn-BD' });
    onEarnStar(2, 'বাহ রিহান! তুমি দারুণ সুন্দর এঁকেছো ও লিখেছো! +২ তারা!', true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-rose-200 rounded-3xl p-4 shadow-sm">
        <div>
          <h2 className="font-bangla text-2xl sm:text-3xl font-bold text-slate-900">
            ম্যাজিক বোর্ড (Tracing & Drawing)
          </h2>
          <p className="font-bangla text-sm text-slate-600 mt-0.5">
            বর্ণের ওপর হাত ঘুরিয়ে লেখা শেখো অথবা রঙিন ছবি আঁকো
          </p>
        </div>

        {/* Guide Letter Dropdown */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="guide-select" className="font-bangla text-sm font-bold text-slate-700 whitespace-nowrap">
            বর্ণ বাছাই:
          </label>
          <select
            id="guide-select"
            value={guideChar}
            onChange={(e) => {
              playTapSound();
              setGuideChar(e.target.value);
            }}
            className="bg-rose-50 border-2 border-rose-300 rounded-2xl px-4 py-2.5 font-bangla text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
          >
            {TRACING_GUIDES.map((g) => (
              <option key={g.label} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Canvas & Controls */}
      <div className="bg-white border-2 border-rose-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Top Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Colors */}
          <div className="flex flex-wrap items-center gap-2">
            {BRUSH_COLORS.map((c) => {
              const active = !isEraser && brushColor === c.hex;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setIsEraser(false);
                    setBrushColor(c.hex);
                  }}
                  title={c.label}
                  aria-label={c.label}
                  className={`w-10 h-10 rounded-full border-3 transition-transform cursor-pointer ${
                    active ? 'border-slate-900 scale-115 shadow-md' : 'border-white shadow-xs hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              );
            })}

            <button
              type="button"
              onClick={() => {
                playTapSound();
                setIsEraser((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 font-bangla text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                isEraser
                  ? 'bg-slate-800 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <Eraser className="w-4 h-4" />
              <span>মুছো</span>
            </button>
          </div>

          {/* Brush Size & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {BRUSH_SIZES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    playTapSound();
                    setBrushSize(b.size);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bangla text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    brushSize === b.size ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleUndo}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bangla text-sm font-bold cursor-pointer whitespace-nowrap"
            >
              <Undo2 className="w-4 h-4" />
              <span>ফিরে যাও</span>
            </button>

            <button
              type="button"
              onClick={clearBoard}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bangla text-sm font-bold cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="w-4 h-4" />
              <span>বোর্ড মুছো</span>
            </button>
          </div>
        </div>

        {/* Drawing Canvas Stage with Watermark Guide */}
        <div
          ref={containerRef}
          className="relative w-full h-[380px] rounded-2xl border-3 border-dashed border-rose-300 bg-[#FFFDF9] overflow-hidden select-none"
        >
          {/* Dotted notebook ruling lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Faint Guide Letter Overlay */}
          {guideChar && (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            >
              <span
                className="text-[220px] sm:text-[260px] font-bold text-slate-300/65 leading-none"
                style={{
                  WebkitTextStroke: '3px rgba(148, 163, 184, 0.55)',
                }}
              >
                {guideChar}
              </span>
            </div>
          )}

          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative z-10 w-full h-full touch-none cursor-crosshair"
          />
        </div>

        {/* Celebrate Finish Button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <p className="font-bangla text-sm text-slate-600">
            আঙুল বা মাউস দিয়ে বোর্ডের ওপর আঁকো, তারপর "হয়েছে!" বাটনে ক্লিক করো।
          </p>
          <button
            type="button"
            onClick={handleCelebrateDrawing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bangla text-base font-bold border-b-4 border-emerald-700 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-5 h-5" />
            <span>লেখা হয়েছে! (+২ ⭐)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
