import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search } from 'lucide-react';

export function AppDrawer({ apps, onOpen, onClose }) {
  const [query, setQuery]   = useState('');
  const inputRef            = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const filtered = query.trim()
    ? apps.filter(a => a.label.toLowerCase().includes(query.toLowerCase()))
    : apps;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-[4000] flex flex-col items-center pt-10 pb-6"
      style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}
    >
      {/* Search bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.05, type: 'spring', stiffness: 380, damping: 32 }}
        className="flex items-center gap-3 bg-white/[0.08] border border-white/[0.14] rounded-2xl px-4 py-2.5 w-80 mb-10"
        onClick={e => e.stopPropagation()}
      >
        <Search size={16} className="text-white/40 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar aplicaciones…"
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/70 transition-colors text-base leading-none">×</button>
        )}
      </motion.div>

      {/* Apps grid */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 320, damping: 28 }}
        className="grid gap-4 px-8 overflow-y-auto"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', maxWidth: 680, maxHeight: 'calc(100vh - 200px)' }}
        onClick={e => e.stopPropagation()}
      >
        <AnimatePresence mode="popLayout">
          {filtered.map((app, i) => (
            <motion.button
              key={app.id}
              layout
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ delay: i * 0.025, type: 'spring', stiffness: 400, damping: 32 }}
              onClick={() => { onOpen(app.id); onClose(); }}
              className="flex flex-col items-center gap-2.5 p-3 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-colors group"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.07] border border-white/[0.09] flex items-center justify-center group-hover:bg-white/[0.12] group-hover:scale-110 transition-all shadow-lg">
                <app.icon size={26} className="text-white/85" strokeWidth={1.5} />
              </div>
              <span className="text-white/75 text-[11px] font-medium text-center leading-tight group-hover:text-white transition-colors">
                {app.label}
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-white/25 gap-3">
            <Search size={32} strokeWidth={1} />
            <p className="text-sm">Sin resultados para «{query}»</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
