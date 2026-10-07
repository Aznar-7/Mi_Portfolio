import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { site } from '@/data/site';
import { useSoundEffects } from '@/contexts/SoundContext';

export function LoginScreen({ onLogin, wallpaperBg }) {
  const [pwd, setPwd] = useState('');
  const { playUnlock } = useSoundEffects();
  const login = () => { playUnlock(); onLogin(); };
  const [clock, setClock] = useState({ time: '', date: '' });
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    const update = () => {
      const n = new Date();
      setClock({
        time: n.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        date: n.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex flex-col items-center" style={{ background: wallpaperBg }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 gap-10 w-full">
        <div className="text-center select-none">
          <div className="text-[clamp(4rem,12vw,7rem)] font-extralight text-white leading-none tracking-tight tabular-nums">{clock.time}</div>
          <div className="text-base text-white/50 capitalize mt-2">{clock.date}</div>
        </div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex flex-col items-center gap-5"
        >
          <img src="/port.jpg" alt={site.name} width="80" height="80" className="h-20 w-20 rounded-full object-cover shadow-2xl ring-2 ring-white/20 select-none" draggable="false" />
          <div className="text-white font-medium text-lg tracking-wide select-none">{site.name}</div>
          <div className="flex items-center bg-white/10 border border-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <input ref={inputRef} type="password" placeholder="Contraseña" value={pwd}
              onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && login()}
              className="bg-transparent text-white text-sm px-5 py-2.5 outline-none placeholder:text-white/30 w-44" autoComplete="off"
            />
            <button onClick={login} aria-label="Iniciar sesión" className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <p className="text-white/25 text-xs">Presiona Enter — cualquier contraseña funciona</p>
        </motion.div>
      </div>
    </motion.div>
  );
}
