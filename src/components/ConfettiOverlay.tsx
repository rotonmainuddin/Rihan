import React, { useEffect, useRef } from 'react';

interface ConfettiOverlayProps {
  burstKey: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  alpha: number;
}

const CONFETTI_COLORS = [
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#0EA5E9',
  '#EC4899',
  '#8B5CF6',
  '#FACC15',
];

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ burstKey }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (burstKey === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const originX = canvas.width * 0.5;
    const originY = canvas.height * 0.38;

    const newParticles: Particle[] = Array.from({ length: 65 }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 10;
      return {
        x: originX + (Math.random() - 0.5) * 120,
        y: originY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: 7 + Math.random() * 7,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 14,
        alpha: 1,
      };
    });

    particlesRef.current = [...particlesRef.current, ...newParticles];

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0.03 && p.y < canvas.height + 40);

      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.34;
        p.vx *= 0.985;
        p.rotation += p.vRot;
        p.alpha -= 0.012;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }

      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rafRef.current = null;
      }
    };

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(render);
    }
  }, [burstKey]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
};
