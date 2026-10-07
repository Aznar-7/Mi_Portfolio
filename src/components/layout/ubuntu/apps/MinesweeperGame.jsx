import { useState, useEffect } from 'react';
import { Bomb, Flag } from 'lucide-react';

export function MinesweeperGame() {
  const ROWS = 9, COLS = 9, MINES = 10;

  const make = (safeR = -1, safeC = -1) => {
    const b = Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, n: 0 })));
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
      // Evitar colocar mina en la coordenada segura o en sus alrededores inmediatos (para no perder al primer click)
      const isSafe = (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1);
      if (!b[r][c].mine && !isSafe) { b[r][c].mine = true; placed++; }
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (b[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].mine) n++;
      }
      b[r][c].n = n;
    }
    return b;
  };

  const [board, setBoard] = useState(() => make());
  const [state, setState] = useState('idle'); // idle | playing | dead | won
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (state !== 'playing') return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const flood = (b, r, c) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || b[r][c].revealed || b[r][c].flagged) return;
    b[r][c].revealed = true;
    if (b[r][c].n === 0 && !b[r][c].mine) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(b, r + dr, c + dc);
  };

  const click = (r, c) => {
    if (state === 'dead' || state === 'won') return;
    if (board[r][c].revealed || board[r][c].flagged) return;
    let currentBoard = board;

    if (state === 'idle') {
      currentBoard = make(r, c);
      setState('playing');
    }

    const next = currentBoard.map(row => row.map(cell => ({ ...cell })));
    if (next[r][c].mine) {
      next.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
      setBoard(next); setState('dead'); return;
    }
    flood(next, r, c);
    if (next.flat().every(cell => cell.revealed || cell.mine)) setState('won');
    setBoard(next);
  };

  const flag = (e, r, c) => {
    e.preventDefault();
    if (board[r][c].revealed || state === 'dead' || state === 'won') return;
    const next = board.map(row => row.map(cell => ({ ...cell })));
    next[r][c].flagged = !next[r][c].flagged;
    setFlags(f => next[r][c].flagged ? f + 1 : f - 1);
    setBoard(next);
  };

  const reset = () => { setBoard(make()); setState('idle'); setFlags(0); setTime(0); };
  const COLORS = ['','#60a5fa','#4ade80','#f87171','#818cf8','#fb923c','#22d3ee','#e8e8f0','#888'];

  return (
    <div className="h-full bg-[#0d0d18] flex flex-col items-center justify-center gap-5 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-[252px]">
        <span className="font-mono text-[var(--accent)] font-bold text-sm tracking-widest uppercase">Mines</span>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 font-mono text-white/50 text-sm"><Bomb size={13} aria-hidden="true" />{MINES - flags}</span>
          <span className="font-mono text-white/50 text-sm tabular-nums">⏱ {String(time).padStart(3,'0')}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <button key={c} onClick={() => click(r, c)} onContextMenu={e => flag(e, r, c)}
                className={`w-7 h-7 text-[11px] font-bold border-[0.5px] border-white/[0.06] flex items-center justify-center transition-colors ${cell.revealed ? (cell.mine ? 'bg-red-900/70' : 'bg-[#252525]') : 'bg-[#1a1a2e] hover:bg-[#252545] active:bg-[#1e1e38]'}`}
                style={{ color: cell.revealed && !cell.mine && cell.n ? COLORS[cell.n] : undefined }}
              >
                {cell.flagged && !cell.revealed ? <Flag size={12} className="text-red-400" /> : cell.revealed && cell.mine ? <Bomb size={12} /> : cell.revealed && cell.n ? cell.n : ''}
              </button>
            ))}
          </div>
        ))}
      </div>

      {(state === 'dead' || state === 'won') && (
        <div className="text-center">
          <p className={`font-mono text-sm mb-3 font-bold ${state === 'won' ? 'text-green-400' : 'text-red-400'}`}>
            {state === 'won' ? `¡Ganaste! ${time}s` : 'Pisaste una mina. Fin del juego'}
          </p>
          <button onClick={reset} className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg font-mono text-sm hover:bg-[var(--accent-hover)] transition-colors">
            Jugar de nuevo
          </button>
        </div>
      )}
      {state === 'idle' && (
        <p className="text-white/25 font-mono text-[10px] tracking-wider">Click para revelar · Click derecho para bandera</p>
      )}
    </div>
  );
}
