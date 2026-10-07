import { NOTE_COLORS } from '../constants';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export function DesktopIcon({ icon: Icon, label, onClick, top, left, constraintsRef }) {
  return (
    <motion.div 
      drag dragMomentum={false} dragElastic={0} dragConstraints={constraintsRef}
      onDoubleClick={e => { e.stopPropagation(); onClick(); }}
      onPointerDown={e => e.stopPropagation()}
      className="absolute flex flex-col items-center gap-1 cursor-pointer group w-[76px] select-none"
      style={{ top, left }}
    >
      <div className="w-14 h-14 bg-black/25 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-black/40 transition-all hover:scale-105 shadow-lg relative">
        <Icon size={30} className="text-[#E95420]" strokeWidth={1.5} />
      </div>
      <span className="text-white text-[11px] font-medium bg-black/40 px-1.5 py-0.5 rounded text-center max-w-[76px] truncate group-hover:bg-[#E95420]/70 transition-colors shadow-md">
        {label}
      </span>
    </motion.div>
  );
}

export function ContextMenu({ x, y, onClose, onNewTerminal, onSettings, showClock, onToggleClock }) {
  const items = [
    { label: 'Nueva Terminal',                         action: onNewTerminal },
    { label: 'Cambiar fondo',                          action: onSettings },
    { label: showClock ? 'Ocultar reloj' : 'Mostrar reloj', action: onToggleClock },
    { label: 'Actualizar',                             action: onClose },
  ];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.1 }}
      className="absolute z-[200] py-1 bg-[#303030] border border-white/10 rounded-lg shadow-2xl w-48"
      style={{ left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 120) }}
      onClick={e => e.stopPropagation()}
    >
      {items.map(item => (
        <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
          className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

export function DesktopClock({ constraintsRef }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(n.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.div
      drag dragMomentum={false} dragElastic={0} dragConstraints={constraintsRef}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="absolute bottom-8 right-6 z-[100] text-right select-none cursor-grab active:cursor-grabbing"
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="font-extralight tabular-nums text-white/75" style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', textShadow: '0 2px 20px rgba(0,0,0,0.7)' }}>{time}</div>
      <div className="text-white/35 text-sm font-medium capitalize mt-0.5" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>{date}</div>
    </motion.div>
  );
}


export function StickyNote({ note, onChange, onDelete, constraintsRef }) {
  const { id, x, y, text, color } = note;
  return (
    <motion.div
      drag dragMomentum={false} dragElastic={0} dragConstraints={constraintsRef}
      initial={{ scale: 0.3, opacity: 0, rotate: -6 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.3, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 380, damping: 22 }}
      className="absolute z-[150] flex flex-col shadow-xl rounded-lg overflow-hidden"
      style={{ top: y, left: x, width: 170, minHeight: 140, background: color }}
      onPointerDown={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-2 py-1.5 bg-black/[0.08] cursor-grab active:cursor-grabbing flex-shrink-0">
        <div className="flex gap-1.5">
          {NOTE_COLORS.map(c => (
            <button key={c} onClick={() => onChange(id, text, c)}
              className={`w-3 h-3 rounded-full border transition-transform hover:scale-125 ${c === color ? 'border-black/50 scale-110' : 'border-transparent'}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <button onClick={() => onDelete(id)} className="text-black/35 hover:text-black/70 text-sm font-bold leading-none transition-colors">×</button>
      </div>
      <textarea
        value={text} onChange={e => onChange(id, e.target.value, color)}
        className="flex-1 resize-none outline-none p-2.5 text-[12px] leading-relaxed text-black/75 bg-transparent placeholder:text-black/30 font-medium"
        placeholder="Nota rápida..."
        onClick={e => e.stopPropagation()}
        onPointerDown={e => e.stopPropagation()}
        style={{ minHeight: 100 }}
      />
    </motion.div>
  );
}
