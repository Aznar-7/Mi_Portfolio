import { motion } from 'motion/react';

export function DockIcon({ icon: Icon, label, isOpen, isFocused, isMinimized, onClick, onRightClick }) {
  return (
    <div className="relative group/dock cursor-pointer" onClick={onClick} onContextMenu={e => { e.preventDefault(); e.stopPropagation(); onRightClick?.(e); }}>
      {isOpen && <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 rounded-full ${isFocused ? 'h-4 bg-white' : 'h-2 bg-white/40'}`} />}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${isOpen ? 'bg-white/12' : ''} ${isFocused ? 'scale-110' : 'hover:scale-110 hover:bg-white/10'} ${isMinimized ? 'opacity-50' : ''}`}>
        <Icon size={22} color="white" strokeWidth={1.5} />
      </div>
      <div className="absolute left-[56px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black/90 text-white text-[11px] rounded-md opacity-0 group-hover/dock:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
        {label}
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-[5px] border-transparent border-r-black/90" />
      </div>
    </div>
  );
}

export function DockContextMenu({ appLabel, isOpen, isMin, x, y, onOpen, onMinimize, onCloseApp, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.1 }}
      className="fixed z-[600] py-1 bg-[#303030] border border-white/10 rounded-xl shadow-2xl w-44"
      style={{ left: x + 10, top: Math.min(y, window.innerHeight - 160) }}
      onClick={e => e.stopPropagation()}
    >
      <div className="px-3 py-1.5 text-[11px] text-white/35 font-semibold border-b border-white/10 mb-1 truncate">{appLabel}</div>
      {!isOpen && <button onClick={() => { onOpen(); onDismiss(); }} className="w-full text-left px-3 py-2 text-sm text-white/75 hover:bg-white/10 transition-colors">Abrir nueva ventana</button>}
      {isOpen && !isMin && <button onClick={() => { onMinimize(); onDismiss(); }} className="w-full text-left px-3 py-2 text-sm text-white/75 hover:bg-white/10 transition-colors">Minimizar</button>}
      {isOpen && <button onClick={() => { onCloseApp(); onDismiss(); }} className="w-full text-left px-3 py-2 text-sm text-red-400/70 hover:bg-white/10 hover:text-red-400 transition-colors">Cerrar</button>}
    </motion.div>
  );
}
