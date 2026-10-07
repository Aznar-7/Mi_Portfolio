import { useState } from 'react';
import { Info, Palette, HardDrive } from 'lucide-react';
import { site } from '@/data/site';
import { skillGroups } from '@/data/skills';
import { WALLPAPERS } from '../wallpapers';

const allSkills = skillGroups.flatMap((g) => g.items);

export function SettingsApp({ wallpaper, onWallpaper }) {
  const [section, setSection] = useState('appearance');
  const SECTIONS = [
    { id: 'appearance', label: 'Apariencia',   icon: Palette },
    { id: 'display',    label: 'Pantallas',     icon: HardDrive },
    { id: 'about',      label: 'Acerca de',     icon: Info },
  ];

  return (
    <div className="h-full flex bg-[#1e1e1e]">
      <div className="w-48 bg-[#252526] border-r border-[#333] py-3 flex-shrink-0">
        <div className="px-4 py-1 text-[10px] font-bold text-white/25 uppercase tracking-widest mb-1">Sistema</div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`w-full text-left px-4 py-2 text-[13px] flex items-center gap-3 transition-colors ${section === s.id ? 'bg-[#37373d] text-white' : 'text-white/50 hover:bg-[#2a2d2e] hover:text-white/80'}`}
          >
            <s.icon size={14} className={section === s.id ? 'text-[#E95420]' : ''}/>{s.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-7">
        {section === 'appearance' && (
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Apariencia</h2>
            <p className="text-white/35 text-sm mb-6">Fondo de escritorio</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WALLPAPERS.map((w, i) => (
                <button key={w.name} onClick={() => onWallpaper(i)}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all ${wallpaper === i ? 'border-[#E95420] scale-[1.03]' : 'border-transparent hover:border-white/20'}`}
                  style={{ background: w.bg }}
                >
                  {wallpaper === i && <div className="absolute inset-0 flex items-center justify-center"><div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-[#E95420] font-black text-[10px]">✓</div></div>}
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-bold text-white/70 tracking-wider">{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {section === 'display' && (
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Pantallas</h2>
            <p className="text-white/35 text-sm mb-6">Pantalla activa</p>
            <div className="bg-[#2d2d2d] rounded-xl border border-white/5 overflow-hidden">
              {[['Resolución',`${window.screen.width} × ${window.screen.height}`],['Frecuencia','60 Hz'],['Orientación','Horizontal'],['Color','sRGB, 24-bit']].map(([k,v]) => (
                <div key={k} className="flex justify-between px-5 py-3 border-b border-white/5 last:border-0">
                  <span className="text-white/40 text-sm">{k}</span>
                  <span className="text-white/80 text-sm font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {section === 'about' && (
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Acerca de este equipo</h2>
            <p className="text-white/35 text-sm mb-5">Especificaciones del sistema</p>
            <div className="flex items-center gap-4 mb-5 p-4 bg-[#2d2d2d] rounded-xl border border-white/5">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="#E95420"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.24 9.76a6.96 6.96 0 01-.54-7.9l1.37 1.37A5.02 5.02 0 007.5 12c0 .97.27 1.87.74 2.63l-1.37 1.37-.01-.24zm4.24 3.24c-.97 0-1.87-.27-2.63-.74L8 18.63a7 7 0 007.9.54l-1.37-1.37c-.76.47-1.66.74-2.63.74zm4.24-1.24l-1.37-1.37A5.02 5.02 0 0016.5 12c0-.97-.27-1.87-.74-2.63l1.37-1.37a6.96 6.96 0 01-.54 7.9l-.11-.14z"/></svg>
              <div><div className="text-white font-semibold">Ubuntu 24.04.1 LTS</div><div className="text-white/35 text-sm">aznar-dev edition</div></div>
            </div>
            <div className="bg-[#2d2d2d] rounded-xl border border-white/5 overflow-hidden">
              {[
                ['Nombre del equipo','aznar-dev.local'],
                ['Sistema operativo','Ubuntu 24.04 LTS'],
                ['Perfil',`${site.role}`],
                ['Formación','Sistemas de Información — UTN'],
                ['Stack', allSkills.slice(0,5).join(', ')],
                ['Tecnologías listadas',`${allSkills.length}`],
                ['Disponibilidad','Abierto a oportunidades'],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between px-5 py-3 border-b border-white/5 last:border-0">
                  <span className="text-white/40 text-sm">{k}</span>
                  <span className="text-white/75 text-sm font-medium text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
