import { useState } from 'react';

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expr, setExpr]   = useState('');
  const [fresh, setFresh] = useState(true);

  const press = (v) => {
    if (display === 'Error') { setDisplay('0'); setExpr(''); setFresh(true); }
    if (v === 'C')  { setDisplay('0'); setExpr(''); setFresh(true); return; }
    if (v === '⌫')  { setDisplay(d => d.length > 1 ? d.slice(0,-1) : '0'); return; }
    if (v === '=')  {
      if (!expr) return;
      try {
        const raw = expr + display;
        const r = Function('"use strict";return(' + raw + ')')();
        if (!isFinite(r)) throw new Error('Math Error');
        const res = String(parseFloat(r.toFixed(10)));
        setDisplay(res);
        setExpr(''); setFresh(true);
      } catch { setDisplay('Error'); setFresh(true); }
      return;
    }
    if (['+','−','×','÷'].includes(v)) {
      const m = {'−':'-','×':'*','÷':'/'};
      const op = m[v] || v;
      if (fresh && expr !== '') {
        setExpr(expr.slice(0, -1) + op);
      } else {
        setExpr(expr + display + op);
        setFresh(true);
      }
      return;
    }
    if (v === '±')  { setDisplay(d => d === '0' ? d : String(-parseFloat(d))); return; }
    if (v === '%')  { setDisplay(d => String(parseFloat(d)/100)); return; }
    if (v === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); }
      else if (!display.includes('.')) { setDisplay(d => d + '.'); }
      return;
    }
    
    if (fresh) { setDisplay(v); setFresh(false); }
    else { setDisplay(d => d === '0' ? v : d.length < 12 ? d + v : d); }
  };

  const handleKey = (e) => {
    const keyMap = {
      'Enter': '=', '=': '=',
      'Escape': 'C', 'Backspace': '⌫', 'Delete': '⌫',
      '+': '+', '-': '−', '*': '×', '/': '÷',
      '%': '%', '.': '.', ',': '.'
    };
    if (/[0-9]/.test(e.key)) { press(e.key); return; }
    if (keyMap[e.key]) { press(keyMap[e.key]); }
  };

  const ROWS = [['C','⌫','%','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],[' ±','0','.','=']];

  return (
    <div className="h-full bg-[#1a1a2e] flex items-center justify-center p-4 outline-none" tabIndex={0} onKeyDown={handleKey} autoFocus>
      <div className="w-72">
        <div className="bg-black/50 rounded-2xl p-5 mb-3 border border-white/5">
          <div className="text-white/30 text-xs font-mono h-5 text-right truncate mb-1">
            {expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')}
          </div>
          <div className="text-white text-4xl font-light text-right font-mono truncate">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {ROWS.flat().map((btn, i) => {
            const b = btn.trim();
            const isEq = b === '=', isOp = ['+','−','×','÷'].includes(b), isTop = ['C','⌫','%'].includes(b);
            return (
              <button key={i} onClick={() => press(b)}
                className={`h-14 rounded-2xl text-lg font-medium transition-all duration-100 active:scale-95 ${isEq ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-[0_4px_20px_rgba(124,106,247,0.3)]' : isOp ? 'bg-[#E95420]/25 text-[#ff9066] hover:bg-[#E95420]/35' : isTop ? 'bg-white/[0.08] text-white/70 hover:bg-white/[0.14]' : 'bg-white/[0.06] text-white hover:bg-white/[0.11]'}`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
