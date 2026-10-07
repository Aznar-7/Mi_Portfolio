import { motion } from 'motion/react';
import { Wifi, Volume2, VolumeX, Moon, Bluetooth, Lock } from 'lucide-react';

function QTile({ icon: Icon, label, sub, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left transition-all w-full ${active ? 'bg-blue-500/20 border-blue-500/30 text-blue-200' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white/70'}`}
    >
      <Icon size={15} />
      <span className="text-[11px] font-semibold leading-none">{label}</span>
      <span className="text-[10px] opacity-60 leading-none">{sub}</span>
    </button>
  );
}

export function QuickPanel({ wifiOn, onWifi, btOn, onBt, isMuted, toggleMute, onLock, onClose, volume, onVolume, dnd, onDnd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.12 }}
      className="absolute top-7 right-2 z-[3000] w-60 bg-[#1e1e1e]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest mb-2 px-1">Acceso rápido</div>
      <div className="grid grid-cols-2 gap-2">
        <QTile icon={Wifi}                         label="Wi-Fi"      sub={wifiOn ? 'Conectado' : 'Apagado'}      active={wifiOn}   onClick={onWifi} />
        <QTile icon={Bluetooth}                    label="Bluetooth"  sub={btOn   ? 'Activo'    : 'Apagado'}      active={btOn}     onClick={onBt} />
        <QTile icon={isMuted ? VolumeX : Volume2}  label="Sonido"     sub={isMuted ? 'Silenciado' : 'Activo'}     active={!isMuted} onClick={toggleMute} />
        <QTile icon={Lock}                         label="Bloquear"   sub="Super+L"                               active={false}    onClick={() => { onLock(); onClose(); }} />
        <QTile icon={Moon}                         label="No molestar" sub={dnd ? 'Sin alertas' : 'Desactivado'}  active={dnd}      onClick={onDnd} />
      </div>
      <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center gap-2 px-0.5">
        <VolumeX size={11} className="text-white/30 flex-shrink-0" />
        <input
          type="range" min={0} max={100} value={volume}
          onChange={e => onVolume(Number(e.target.value))}
          className="flex-1 h-1 cursor-pointer rounded-full appearance-none bg-white/15"
          style={{ accentColor: '#60a5fa' }}
        />
        <Volume2 size={11} className="text-white/30 flex-shrink-0" />
        <span className="text-[10px] text-white/40 font-mono w-6 text-right tabular-nums">{volume}</span>
      </div>
    </motion.div>
  );
}
