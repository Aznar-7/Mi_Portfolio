import { useState, useEffect, useRef } from 'react';
import { Pencil, Eraser, Download } from 'lucide-react';

const PAINT_COLORS = ['#7c6af7','#E95420','#22d3ee','#4ade80','#f87171','#fbbf24','#a78bfa','#f97316','#e2e8f0','#0f172a'];

export function PaintApp() {
  const [tool,    setTool]    = useState('pencil');
  const [color,   setColor]   = useState('#7c6af7');
  const [size,    setSize]    = useState(5);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);
  const lastRef   = useRef(null);
  const BG = '#1a1a2e';

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height);
  }, []);

  const pos = (e) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    const sx = cv.width / r.width, sy = cv.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return [(src.clientX - r.left) * sx, (src.clientY - r.top) * sy];
  };

  const paint = (e) => {
    if (!drawing) return;
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const [x, y] = pos(e);
    ctx.strokeStyle = tool === 'eraser' ? BG : color;
    ctx.lineWidth   = tool === 'eraser' ? size * 3 : size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    const [lx, ly] = lastRef.current || [x, y];
    ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
    lastRef.current = [x, y];
  };

  const startPaint = (e) => {
    setDrawing(true);
    const [x, y] = pos(e);
    lastRef.current = [x, y];
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = tool === 'eraser' ? BG : color;
    ctx.beginPath(); ctx.arc(x, y, (tool==='eraser'?size*1.5:size)/2, 0, Math.PI*2); ctx.fill();
  };

  const clear = () => {
    const cv = canvasRef.current; const ctx = cv.getContext('2d');
    ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height);
  };

  const save = () => {
    const cv = canvasRef.current;
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png'); a.download = 'aznar-paint.png'; a.click();
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-10 bg-[#2d2d2d] border-b border-[#444] flex items-center gap-3 px-3 flex-shrink-0">
        <div className="flex gap-1">
          {[{id:'pencil',Icon:Pencil,label:'Lápiz'},{id:'eraser',Icon:Eraser,label:'Goma'}].map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-colors ${tool===t.id?'bg-[var(--accent)]/30 ring-1 ring-[var(--accent)]':'hover:bg-white/10'}`}
             aria-label={t.label} title={t.label}><t.Icon size={14} /></button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-[9px] font-mono uppercase tracking-wider">Tamaño</span>
          <input type="range" min="1" max="24" value={size} onChange={e => setSize(+e.target.value)}
            className="w-20" style={{ accentColor: 'var(--accent)' }} />
          <span className="text-white/40 text-[10px] font-mono w-4">{size}</span>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex gap-1 items-center flex-wrap">
          {PAINT_COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pencil'); }}
              className={`rounded-full transition-all ${color===c&&tool!=='eraser'?'scale-125 ring-2 ring-white/50':'hover:scale-110'}`}
              style={{ width:13, height:13, background:c, border:'1px solid rgba(255,255,255,0.15)', flexShrink:0 }}
            />
          ))}
          <input type="color" value={color} onChange={e => { setColor(e.target.value); setTool('pencil'); }}
            className="w-6 h-5 rounded cursor-pointer border-0" title="Color personalizado"
            style={{ background:'transparent' }}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={clear} className="px-2.5 py-1 text-[11px] text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors font-mono">Limpiar</button>
          <button onClick={save}  className="px-2.5 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded transition-colors font-mono inline-flex items-center gap-1.5"><Download size={12} aria-hidden="true" />Guardar</button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#111118]"
        style={{ cursor: tool==='eraser' ? 'cell' : 'crosshair' }}
      >
        <canvas ref={canvasRef} width={620} height={390}
          onMouseDown={startPaint} onMouseMove={paint}
          onMouseUp={() => setDrawing(false)} onMouseLeave={() => setDrawing(false)}
          onTouchStart={startPaint} onTouchMove={paint} onTouchEnd={() => setDrawing(false)}
          className="rounded-lg shadow-2xl" style={{ maxWidth:'100%', maxHeight:'100%' }}
        />
      </div>

      <div className="h-6 bg-[#252526] border-t border-[#333] px-3 flex items-center gap-4 text-[10px] text-white/20 font-mono flex-shrink-0">
        <span className="w-3 h-3 rounded-full inline-block border border-white/10" style={{ background: tool==='eraser'?BG:color }} />
        <span>{tool === 'eraser' ? 'Goma de borrar' : 'Lápiz'}</span>
        <span>620 × 390 px</span>
        <span className="ml-auto opacity-50">Click + arrastrar para dibujar</span>
      </div>
    </div>
  );
}
