import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';

export function Screensaver({ onWake }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const handler = () => onWake();
    window.addEventListener('keydown',     handler);
    window.addEventListener('pointermove', handler);
    window.addEventListener('pointerdown', handler);
    return () => {
      window.removeEventListener('keydown',     handler);
      window.removeEventListener('pointermove', handler);
      window.removeEventListener('pointerdown', handler);
    };
  }, [onWake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx   = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const W    = canvas.width;
    const H    = canvas.height;
    const COLS = Math.floor(W / 16);
    const drops = Array(COLS).fill(1);
    const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF';

    let raf;
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, W, H);
      ctx.font = '14px monospace';
      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        ctx.fillStyle = y * 16 < 80 ? '#afffaf' : '#00cc00';
        ctx.fillText(char, i * 16, y * 16);
        if (y * 16 > H && Math.random() > 0.975) drops[i] = 0;
        else drops[i]++;
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-[3500] cursor-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none">
        <p className="text-[#00cc00]/70 font-mono text-xs animate-pulse tracking-widest">
          Mueve el mouse para despertar
        </p>
      </div>
    </motion.div>
  );
}
