import { useState, useEffect, useRef, useCallback } from 'react';

export function SnakeGame() {
  const GRID = 18, CELL = 22;
  const [snake, setSnake] = useState([[9, 9], [9, 8], [9, 7]]);
  const [food, setFood] = useState([4, 13]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('idle');
  const dirRef = useRef([0, 1]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const randFood = useCallback((body) => {
    let pos;
    do { pos = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)]; }
    while (body.some(([r, c]) => r === pos[0] && c === pos[1]));
    return pos;
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => {
      setSnake(prev => {
        const [dr, dc] = dirRef.current;
        const head = [prev[0][0] + dr, prev[0][1] + dc];
        if (head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID || prev.some(([r, c]) => r === head[0] && c === head[1])) {
          setStatus('dead'); return prev;
        }
        const ate = head[0] === food[0] && head[1] === food[1];
        const next = ate ? [head, ...prev] : [head, ...prev.slice(0, -1)];
        if (ate) { setScore(s => s + 10); setFood(randFood(next)); }
        return next;
      });
    }, 115);
    return () => clearInterval(id);
  }, [status, food, randFood]);

  const handleKey = (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (e.key === ' ') {
      if (status === 'idle' || status === 'dead') reset();
      else if (status === 'running') setStatus('paused');
      else setStatus('running');
      return;
    }
    const dirs = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1], w:[-1,0], s:[1,0], a:[0,-1], d:[0,1] };
    const d = dirs[e.key];
    if (!d) return;
    const [cr, cc] = dirRef.current;
    if (cr + d[0] === 0 && cc + d[1] === 0) return;
    dirRef.current = d;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, GRID * CELL); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(GRID * CELL, i * CELL); ctx.stroke();
    }

    // Food glow
    const [fr, fc] = food;
    const fx = fc * CELL + CELL / 2, fy = fr * CELL + CELL / 2;
    const grd = ctx.createRadialGradient(fx, fy, 1, fx, fy, 10);
    grd.addColorStop(0, '#E95420'); grd.addColorStop(1, 'rgba(233,84,32,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff7a50';
    ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2); ctx.fill();

    // Snake
    snake.forEach(([r, c], i) => {
      const alpha = i === 0 ? 1 : Math.max(0.3, 1 - (i / snake.length) * 0.65);
      ctx.fillStyle = i === 0 ? '#9b8cff' : `rgba(124,106,247,${alpha})`;
      ctx.beginPath();
      ctx.roundRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, 5);
      ctx.fill();
    });
  }, [snake, food]);

  const reset = () => {
    const init = [[9, 9], [9, 8], [9, 7]];
    setSnake(init); setFood(randFood(init)); setScore(0);
    dirRef.current = [0, 1]; setStatus('running');
    setTimeout(() => containerRef.current?.focus(), 10);
  };

  useEffect(() => { setTimeout(() => containerRef.current?.focus(), 100); }, []);

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={handleKey}
      className="h-full bg-[#0d0d18] flex flex-col items-center justify-center gap-4 p-5 outline-none"
      onClick={() => containerRef.current?.focus()}
    >
      <div className="flex items-center justify-between w-full" style={{ maxWidth: GRID * CELL }}>
        <span className="font-mono text-[var(--accent)] text-sm font-bold tracking-widest uppercase">Snake</span>
        <span className="font-mono text-white/50 text-sm">Score: <span className="text-[var(--accent)] font-bold">{score}</span></span>
      </div>
      <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} className="rounded-xl border border-white/10 shadow-2xl" />
      {status === 'idle' && (
        <div className="text-center">
          <button onClick={reset} className="px-7 py-2.5 bg-[var(--accent)] text-white rounded-xl font-mono text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
            Start Game
          </button>
          <p className="text-white/25 font-mono text-[10px] mt-2 tracking-wider">Arrows / WASD · Space to pause</p>
        </div>
      )}
      {status === 'dead' && (
        <div className="text-center">
          <p className="text-red-400 font-mono text-sm mb-2 font-bold">Game Over! Score: {score}</p>
          <button onClick={reset} className="px-7 py-2.5 bg-[var(--accent)] text-white rounded-xl font-mono text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
            Play Again
          </button>
        </div>
      )}
      {status === 'paused' && <p className="text-[var(--accent)]/60 font-mono text-sm animate-pulse">⏸ Paused — Space to resume</p>}
      {status === 'running' && <p className="text-white/20 font-mono text-[10px] tracking-widest uppercase">Arrow keys · Space to pause</p>}
    </div>
  );
}
