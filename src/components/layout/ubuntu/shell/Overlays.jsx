import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

export function AltTabSwitcher({ apps, selectedIdx }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="absolute inset-0 z-[5000] flex flex-col items-center justify-center gap-3 pointer-events-none"
    >
      <div className="bg-black/75 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex gap-2 shadow-2xl max-w-[90vw] flex-wrap justify-center">
        {apps.map((app, i) => (
          <div
            key={app.id}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-100 ${i === selectedIdx ? 'bg-white/20 ring-2 ring-white/50' : 'bg-white/5'}`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <app.icon size={22} color="white" strokeWidth={1.5} />
            </div>
            <span className="text-white text-[11px] font-medium w-[72px] truncate text-center">{app.label}</span>
          </div>
        ))}
      </div>
      <div className="text-white/30 text-[11px] font-mono">Alt+Tab · Suelta Alt para seleccionar</div>
    </motion.div>
  );
}

export function ScreenshotPreviewToast({ url, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 7000); return () => clearTimeout(t); }, [onDismiss]);
  const download = () => {
    const a = document.createElement('a');
    a.href = url; a.download = `screenshot-${Date.now()}.png`; a.click();
    onDismiss();
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="flex gap-3 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl w-72 pointer-events-auto"
    >
      <img src={url} alt="screenshot" className="w-20 h-14 object-cover rounded-lg flex-shrink-0 border border-white/10 bg-black" />
      <div className="flex flex-col flex-1 min-w-0">
        <div className="text-white/80 text-[12px] font-semibold mb-0.5">Captura de pantalla</div>
        <div className="text-white/30 text-[10px] mb-2">Lista para guardar</div>
        <div className="flex gap-1.5">
          <button onClick={download} className="flex-1 text-[10px] py-1 bg-[#E95420]/80 hover:bg-[#E95420] rounded-lg text-white font-medium transition-colors">Descargar</button>
          <button onClick={onDismiss} className="flex-1 text-[10px] py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white/50 transition-colors">Cerrar</button>
        </div>
      </div>
    </motion.div>
  );
}

export function RunDialog({ apps, onOpen, onClose }) {
  const [val, setVal] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);
  const matched = val.trim() ? apps.filter(a => a.label.toLowerCase().includes(val.toLowerCase()) || a.id.toLowerCase().includes(val.toLowerCase())) : [];
  const submit = () => { if (matched.length > 0) { onOpen(matched[0].id); } onClose(); };
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[5500] flex items-start justify-center pt-[18vh] bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: -16, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: -16, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-80 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={14} className="text-white/40 flex-shrink-0" />
          <input ref={inputRef} value={val} onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose(); }}
            placeholder="Ejecutar una orden..." className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/25"
          />
        </div>
        {matched.length > 0 && (
          <div className="py-1 max-h-52 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {matched.slice(0, 6).map(a => (
              <button key={a.id} onClick={() => { onOpen(a.id); onClose(); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left"
              >
                <a.icon size={14} className="text-white/40 flex-shrink-0" />
                <span className="text-sm text-white/80">{a.label}</span>
              </button>
            ))}
          </div>
        )}
        <div className="px-4 py-2 border-t border-white/5">
          <span className="text-[10px] text-white/20 font-mono">Alt+F2 · Escape para cerrar</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ShortcutsHelp({ onClose }) {
  const SHORTCUTS = [
    ['Super',         'Abrir/cerrar App Drawer'],
    ['Super+L',       'Bloquear pantalla'],
    ['Alt+Tab',       'Cambiar ventana activa'],
    ['Alt+F2',        'Ejecutar una orden'],
    ['Ctrl+Alt+→/←',  'Cambiar escritorio'],
    ['PrintScreen',   'Captura de pantalla'],
    ['Ctrl+?',        'Esta ayuda'],
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="absolute inset-0 z-[5500] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92 }} animate={{ scale: 1 }} exit={{ scale: 0.92 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl w-80"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-sm font-bold text-white mb-5">Atajos de teclado</div>
        <div className="flex flex-col gap-3">
          {SHORTCUTS.map(([k, d]) => (
            <div key={k} className="flex items-center justify-between gap-4">
              <kbd className="px-2 py-1 bg-white/10 rounded-md text-[10px] font-mono text-white/65 border border-white/15 whitespace-nowrap flex-shrink-0">{k}</kbd>
              <span className="text-[12px] text-white/45 text-right">{d}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 text-center text-[10px] text-white/20 font-mono">Escape o clic para cerrar</div>
      </motion.div>
    </motion.div>
  );
}
