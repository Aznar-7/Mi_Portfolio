import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { WeatherIcon } from '../WeatherIcon';
import { ArrowLeft, Power, Wifi, BatteryFull, Volume2, RefreshCw, Moon, Camera, Bell } from 'lucide-react';

export function CalendarPopup() {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const [, tick] = useState(0);
  useEffect(() => { const id = setInterval(() => tick(v => v + 1), 1000); return () => clearInterval(id); }, []);
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const CLOCKS = [
    { city: 'Nueva York', tz: 'America/New_York' },
    { city: 'Londres',    tz: 'Europe/London' },
    { city: 'Tokio',      tz: 'Asia/Tokyo' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.12 }}
      className="absolute top-7 left-1/2 -translate-x-1/2 z-[3000] w-64 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="text-center mb-3 text-sm font-semibold text-white capitalize">{monthName}</div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => (
          <div key={d} className="text-[10px] font-bold text-white/30 py-1">{d}</div>
        ))}
        {cells.map((d, i) => (
          <div key={i} className={`text-[11px] py-1.5 rounded-lg ${d === now.getDate() ? 'bg-[#E95420] text-white font-bold' : d ? 'text-white/55 hover:bg-white/10 cursor-pointer' : ''}`}>
            {d ?? ''}
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 mt-3 pt-3 flex flex-col gap-2">
        {CLOCKS.map(({ city, tz }) => (
          <div key={city} className="flex items-center justify-between text-[11px]">
            <span className="text-white/40">{city}</span>
            <span className="text-white/80 font-mono tabular-nums">{new Date().toLocaleTimeString('es-ES', { timeZone: tz, hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function PowerMenu({ onShutdown, onRestart, onSuspend, onCancel }) {
  // Escape closes, Enter confirms focused button
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const actions = [
    { label: 'Suspender',  icon: Moon,      onClick: onSuspend,  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.28)' },
    { label: 'Reiniciar',  icon: RefreshCw, onClick: onRestart,  color: '#a3e635', bg: 'rgba(163,230,53,0.10)',  border: 'rgba(163,230,53,0.25)' },
    { label: 'Apagar',     icon: Power,     onClick: onShutdown, color: '#E95420', bg: 'rgba(233,84,32,0.12)',   border: 'rgba(233,84,32,0.30)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-[5000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(14px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-8 rounded-3xl border border-white/[0.1] bg-[#1a1a2e]/90 px-10 py-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Ubuntu logo mark */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full border-2 border-[#E95420]/60 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full bg-[#E95420]/80" />
          </div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-white/40 uppercase">Ubuntu 24.04 LTS</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-5">
          {actions.map(({ label, icon: Icon, onClick, color, bg, border }) => (
            <button
              key={label}
              onClick={onClick}
              className="group flex flex-col items-center gap-3 rounded-2xl px-6 py-5 transition-all duration-200"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${color}22`, color }}
              >
                <Icon size={26} strokeWidth={1.6} />
              </div>
              <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase group-hover:text-white transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase hover:text-white/60 transition-colors"
        >
          Cancelar (Esc)
        </button>
      </motion.div>
    </motion.div>
  )
}

export function TopBar({ time, date, onExit, onPower, onActivities, nowPlaying, workspace, onWorkspaceChange, onScreenshot, weather, onWeatherClick, onTrayClick, onCalendarClick, onBellClick, unread }) {
  return (
    <div className="h-7 w-full bg-black/75 flex items-center justify-between px-4 text-white/85 text-[12px] font-medium z-50 backdrop-blur-sm flex-shrink-0 select-none">
      <div className="flex items-center gap-2">
        <button
          onClick={onActivities}
          className="hover:text-white transition-colors cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded"
        >
          Activities
        </button>
        <button
          onClick={onExit}
          title="Volver al portfolio (Ctrl + Alt + T)"
          className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-white/80 transition-colors hover:bg-[#E95420] hover:text-white"
        >
          <ArrowLeft size={12} aria-hidden="true" />
          Portfolio
        </button>
        {/* Workspace dots */}
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(i => (
            <button
              key={i}
              onClick={() => onWorkspaceChange(i)}
              className={`w-4 h-2 rounded-sm transition-all ${i === workspace ? 'bg-white/70' : 'bg-white/20 hover:bg-white/40'}`}
              title={`Escritorio ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Center: now playing or clock */}
      {nowPlaying ? (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] text-white/60">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E95420] animate-pulse" />
          <span className="max-w-[180px] truncate">{nowPlaying.title}</span>
          <span className="text-white/30">—</span>
          <span className="text-white/35 truncate max-w-[100px]">{nowPlaying.artist}</span>
        </div>
      ) : (
        <button onClick={e => { e.stopPropagation(); onCalendarClick?.(); }} className="absolute left-1/2 -translate-x-1/2 tabular-nums hover:text-white transition-colors hover:bg-white/10 px-2 py-0.5 rounded">
          {date && time ? `${date}  ${time}` : '...'}
        </button>
      )}

      <div className="flex items-center gap-3">
        {weather && (
          <span className="text-white/55 text-[11px] flex items-center gap-1 select-none cursor-pointer hover:text-white" onClick={onWeatherClick} title="Ver clima">
            <WeatherIcon code={weather.code} size={13} />
            <span>{weather.temp}°C</span>
          </span>
        )}
        <button onClick={e => { e.stopPropagation(); onBellClick?.(); }} className="relative opacity-60 hover:opacity-100 transition-opacity" title="Notificaciones">
          <Bell size={13} />
          {unread > 0 && <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#E95420] rounded-full text-[8px] font-bold flex items-center justify-center text-white leading-none">{unread > 9 ? '9+' : unread}</span>}
        </button>
        <div
          className="flex items-center gap-2 px-1.5 py-0.5 rounded hover:bg-white/10 cursor-pointer transition-colors"
          onClick={e => { e.stopPropagation(); onTrayClick?.(); }}
          title="Configuración rápida"
        >
          <Volume2 size={13} className="opacity-60"/>
          <Wifi size={13} className="opacity-60"/>
          <BatteryFull size={13} className="opacity-60"/>
        </div>
        {nowPlaying && <span className="tabular-nums text-white/50 text-[11px]">{time}</span>}
        <button onClick={onScreenshot} className="opacity-60 hover:opacity-100 transition-opacity" title="Captura de pantalla (PrintScreen)">
          <Camera size={13} />
        </button>
        <button onClick={onPower} className="hover:text-[#E95420] transition-colors ml-1" title="Salir de Ubuntu Mode"><Power size={13}/></button>
      </div>
    </div>
  );
}
