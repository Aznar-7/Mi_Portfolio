import { useEffect } from 'react';
import { motion } from 'motion/react';

export function NotifCenter({ history, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.15 }}
      className="absolute top-7 right-2 z-[3000] w-72 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-semibold text-white">Notificaciones</span>
        {history.length > 0 && <button onClick={onClear} className="text-[11px] text-white/35 hover:text-white/70 transition-colors">Limpiar todo</button>}
      </div>
      {history.length === 0
        ? <div className="px-4 py-8 text-center text-white/25 text-sm">Sin notificaciones</div>
        : <div className="max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {[...history].reverse().map(n => (
              <div key={n.id} className="px-4 py-3 border-b border-white/5 last:border-0">
                <div className="text-[13px] font-medium text-white/80">{n.title}</div>
                {n.body && <div className="text-xs text-white/35 mt-0.5 leading-relaxed">{n.body}</div>}
              </div>
            ))}
          </div>
      }
    </motion.div>
  );
}

export function NotifToast({ title, body, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <motion.div
      initial={{ opacity: 0, x: 64, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex items-start gap-3 bg-[#2d2d2d]/95 backdrop-blur-md border border-white/[0.09] rounded-xl p-3.5 shadow-2xl w-72"
    >
      <div className="w-8 h-8 rounded-lg bg-[#E95420]/20 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#E95420"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.24 9.76a6.96 6.96 0 01-.54-7.9l1.37 1.37A5.02 5.02 0 007.5 12c0 .97.27 1.87.74 2.63l-1.37 1.37-.01-.24zm4.24 3.24c-.97 0-1.87-.27-2.63-.74L8 18.63a7 7 0 007.9.54l-1.37-1.37c-.76.47-1.66.74-2.63.74zm4.24-1.24l-1.37-1.37A5.02 5.02 0 0016.5 12c0-.97-.27-1.87-.74-2.63l1.37-1.37a6.96 6.96 0 01-.54 7.9l-.11-.14z"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-[12px] font-semibold leading-snug">{title}</div>
        <div className="text-white/40 text-[11px] mt-0.5 leading-snug">{body}</div>
      </div>
      <button onClick={onDismiss} className="text-white/20 hover:text-white/60 transition-colors text-base leading-none mt-0.5">×</button>
    </motion.div>
  );
}
