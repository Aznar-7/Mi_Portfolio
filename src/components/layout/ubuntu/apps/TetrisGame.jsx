import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const TETROMINOS = {
  I: { m: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#22d3ee' },
  O: { m: [[1,1],[1,1]],                              color: '#fbbf24' },
  T: { m: [[0,1,0],[1,1,1],[0,0,0]],                 color: '#a78bfa' },
  S: { m: [[0,1,1],[1,1,0],[0,0,0]],                 color: '#4ade80' },
  Z: { m: [[1,1,0],[0,1,1],[0,0,0]],                 color: '#f87171' },
  J: { m: [[1,0,0],[1,1,1],[0,0,0]],                 color: '#60a5fa' },
  L: { m: [[0,0,1],[1,1,1],[0,0,0]],                 color: '#fb923c' },
};

const T_KEYS = Object.keys(TETROMINOS);

const rotateMat = (m) => m[0].map((_, i) => m.map(r => r[i]).reverse());

const cloneMatrix = (m) => m.map(r => [...r]);

function NextPreview({ piece }) {
  const ref = useRef(null);
  const C = 20;
  useEffect(() => {
    const cv = ref.current; if (!cv || !piece) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const rows = piece.m.length, cols = piece.m[0].length;
    const ox = Math.floor((4 - cols) / 2), oy = Math.floor((4 - rows) / 2);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (!piece.m[r][c]) continue;
      ctx.fillStyle = piece.color;
      ctx.beginPath();
      ctx.roundRect((ox + c) * C + 1, (oy + r) * C + 1, C - 2, C - 2, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.roundRect((ox + c) * C + 2, (oy + r) * C + 2, C - 4, 4, 2);
      ctx.fill();
    }
  }, [piece]);
  return <canvas ref={ref} width={4 * C} height={4 * C} className="rounded-lg" />;
}

export function TetrisGame() {
  const COLS = 10, ROWS = 20, CELL = 24;
  const BW = COLS * CELL, BH = ROWS * CELL;

  const mkPiece = useCallback(() => {
    const key = T_KEYS[Math.floor(Math.random() * T_KEYS.length)];
    const { m, color } = TETROMINOS[key];
    return { m: cloneMatrix(m), color, x: Math.floor((COLS - m[0].length) / 2), y: 0 };
  }, []);

  const boardRef   = useRef(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const pieceRef   = useRef(null);
  const nextRef    = useRef(null);
  const statusRef  = useRef('idle');
  const scoreRef   = useRef(0);
  const levelRef   = useRef(1);
  const linesRef   = useRef(0);
  const intervalRef = useRef(null);
  const stepRef     = useRef(null);
  const canvasRef   = useRef(null);
  const containerRef = useRef(null);
  const audioRef    = useRef(null);

  const [score,  setScore]  = useState(0);
  const [level,  setLevel]  = useState(1);
  const [lines,  setLines]  = useState(0);
  const [status, setStatus] = useState('idle');
  const [nextP,  setNextP]  = useState(null);
  const [music,  setMusic]  = useState(true);

  useEffect(() => {
    // Try to load an iconic sound from local files or an external creative commons source
    audioRef.current = new Audio('https://ia800504.us.archive.org/33/items/TetrisThemeMusic/Tetris.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (status === 'running' && music) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [status, music]);

  const collides = useCallback((piece, dx = 0, dy = 0, mat = null) => {
    const m = mat || piece.m;
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const nr = piece.y + r + dy, nc = piece.x + c + dx;
      if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
      if (nr >= 0 && boardRef.current[nr][nc]) return true;
    }
    return false;
  }, []);

  const drawCanvas = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, BW, BH);
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(BW, i * CELL); ctx.stroke(); }
    for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, BH); ctx.stroke(); }

    const drawCell = (cx, cy, color) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(cx * CELL + 1, cy * CELL + 1, CELL - 2, CELL - 2, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.roundRect(cx * CELL + 2, cy * CELL + 2, CELL - 4, 4, 2); ctx.fill();
    };

    // Board
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
      if (boardRef.current[r][c]) drawCell(c, r, boardRef.current[r][c]);

    // Ghost
    const p = pieceRef.current;
    if (p) {
      let dy = 0;
      while (!collides(p, 0, dy + 1)) dy++;
      for (let r = 0; r < p.m.length; r++) for (let c = 0; c < p.m[r].length; c++) {
        if (!p.m[r][c]) continue;
        ctx.fillStyle = `${p.color}28`;
        ctx.beginPath(); ctx.roundRect((p.x + c) * CELL + 1, (p.y + dy + r) * CELL + 1, CELL - 2, CELL - 2, 3); ctx.fill();
      }
      // Current piece
      for (let r = 0; r < p.m.length; r++) for (let c = 0; c < p.m[r].length; c++)
        if (p.m[r][c]) drawCell(p.x + c, p.y + r, p.color);
    }
  }, [BH, BW, collides]);

  const lockAndSpawn = useCallback(() => {
    const p = pieceRef.current; if (!p) return;
    const board = boardRef.current.map(r => [...r]);
    for (let r = 0; r < p.m.length; r++) for (let c = 0; c < p.m[r].length; c++) {
      if (!p.m[r][c]) continue;
      const nr = p.y + r; if (nr >= 0) board[nr][p.x + c] = p.color;
    }
    const full = board.filter(row => row.every(Boolean));
    const rest = board.filter(row => !row.every(Boolean));
    const n = full.length;
    boardRef.current = [...Array(n).fill(null).map(() => Array(COLS).fill(null)), ...rest];

    if (n > 0) {
      const pts = [0, 100, 300, 500, 800][n] * levelRef.current;
      scoreRef.current += pts; linesRef.current += n;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      setScore(scoreRef.current); setLines(linesRef.current); setLevel(levelRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => stepRef.current?.(), Math.max(80, 800 - (levelRef.current - 1) * 70));
    }

    const np = nextRef.current;
    if (collides(np, 0, 0)) {
      statusRef.current = 'dead'; setStatus('dead');
      clearInterval(intervalRef.current); pieceRef.current = null; drawCanvas(); return;
    }
    pieceRef.current = np;
    const nn = mkPiece();
    nextRef.current = nn; setNextP(nn);
    drawCanvas();
  }, [collides, drawCanvas, mkPiece]);

  const step = useCallback(() => {
    const p = pieceRef.current; if (!p || statusRef.current !== 'running') return;
    if (collides(p, 0, 1)) lockAndSpawn();
    else { pieceRef.current = { ...p, y: p.y + 1 }; drawCanvas(); }
  }, [collides, drawCanvas, lockAndSpawn]);
  useEffect(() => { stepRef.current = step; }, [step]);

  const startGame = useCallback(() => {
    boardRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    scoreRef.current = 0; linesRef.current = 0; levelRef.current = 1;
    setScore(0); setLines(0); setLevel(1);
    const p = mkPiece(), n = mkPiece();
    pieceRef.current = p; nextRef.current = n; setNextP(n);
    statusRef.current = 'running'; setStatus('running');
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => stepRef.current?.(), 800);
    containerRef.current?.focus(); drawCanvas();
  }, [drawCanvas, mkPiece]);

  const handleKey = useCallback((e) => {
    const p = pieceRef.current;
    const st = statusRef.current;
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
    if (e.key === 'Enter') {
      if (st === 'idle' || st === 'dead') startGame(); return;
    }
    if (e.key === 'p' || e.key === 'P') {
      if (st === 'running') { statusRef.current = 'paused'; setStatus('paused'); clearInterval(intervalRef.current); }
      else if (st === 'paused') {
        statusRef.current = 'running'; setStatus('running');
        intervalRef.current = setInterval(() => stepRef.current?.(), Math.max(80, 800 - (levelRef.current - 1) * 70));
      }
      return;
    }
    if (!p || st !== 'running') return;
    if (e.key === 'ArrowLeft'  && !collides(p, -1, 0)) { pieceRef.current = { ...p, x: p.x - 1 }; drawCanvas(); }
    if (e.key === 'ArrowRight' && !collides(p,  1, 0)) { pieceRef.current = { ...p, x: p.x + 1 }; drawCanvas(); }
    if (e.key === 'ArrowDown') {
      if (!collides(p, 0, 1)) { pieceRef.current = { ...p, y: p.y + 1 }; drawCanvas(); } else lockAndSpawn();
    }
    if (e.key === 'ArrowUp') {
      const rot = rotateMat(p.m);
      for (const kick of [0, -1, 1, -2, 2]) {
        if (!collides({ ...p, x: p.x + kick }, 0, 0, rot)) {
          pieceRef.current = { ...p, m: rot, x: p.x + kick }; drawCanvas(); break;
        }
      }
    }
    if (e.key === ' ') {
      e.preventDefault();
      let dy = 0;
      while (!collides(p, 0, dy + 1)) dy++;
      scoreRef.current += dy * 2; setScore(scoreRef.current);
      pieceRef.current = { ...p, y: p.y + dy };
      drawCanvas(); lockAndSpawn();
    }
  }, [collides, drawCanvas, lockAndSpawn, startGame]);


  useEffect(() => { drawCanvas(); }, [drawCanvas]);
  useEffect(() => { 
    setTimeout(() => containerRef.current?.focus(), 100); 
    return () => clearInterval(intervalRef.current); 
  }, []);

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={handleKey}
      className="h-full bg-[#0d0d18] flex items-center justify-center gap-3 p-4 outline-none relative"
      onClick={() => containerRef.current?.focus()}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-mono text-[var(--accent)] text-sm font-bold tracking-widest uppercase">Tetris</span>
          <span className="font-mono text-white/20 text-[10px]">P = pause</span>
        </div>
        <canvas ref={canvasRef} width={BW} height={BH} className="rounded-xl border border-white/10 shadow-2xl" />
      </div>

      <div className="flex flex-col gap-3 min-w-[90px]">
        <div className="bg-[#1a1a2e] rounded-xl p-3 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Next</div>
            <button onClick={() => setMusic(!music)} className="text-[10px] text-white/30 hover:text-white/80 transition-colors" title="Activar/Desactivar Música">
              {music ? <Volume2 size={12} /> : <VolumeX size={12} />}
            </button>
          </div>
          <NextPreview piece={nextP} />
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-3 border border-white/10 flex flex-col gap-3">
          {[['Score', score], ['Level', level], ['Lines', lines]].map(([k, v]) => (
            <div key={k}>
              <div className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{k}</div>
              <div className="font-mono text-[var(--accent)] font-bold text-lg leading-none mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-white/20 font-mono leading-relaxed">
          ← → ↓ Mover<br/>↑ Rotar<br/>Space Drop<br/>P Pausa<br/>Enter Iniciar
        </div>
      </div>

      {(status === 'idle' || status === 'dead' || status === 'paused') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-b-lg">
          <div className="text-center">
            {status === 'dead' && <p className="text-red-400 font-mono text-sm mb-2 font-bold">Game Over — Score: {score}</p>}
            {status === 'paused' && <p className="text-[var(--accent)] font-mono text-base mb-3 font-bold">⏸ Pausado</p>}
            <button onClick={status === 'paused'
              ? () => { statusRef.current='running'; setStatus('running'); intervalRef.current=setInterval(()=>stepRef.current?.(),Math.max(80,800-(levelRef.current-1)*70)); containerRef.current?.focus(); }
              : startGame}
              className="px-7 py-2.5 bg-[var(--accent)] text-white rounded-xl font-mono text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors"
            >
              {status === 'paused' ? 'Continuar' : status === 'dead' ? 'Jugar de nuevo' : 'Start Game'}
            </button>
            {status === 'idle' && <p className="text-white/20 font-mono text-[9px] mt-2 tracking-wider">Enter para comenzar</p>}
          </div>
        </div>
      )}
    </div>
  );
}
