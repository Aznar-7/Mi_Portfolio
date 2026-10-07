import { useState } from 'react';
import Cubes from './playground/Cubes';
import { ParticleField } from './playground/ParticleField';
import { WaveField } from './playground/WaveField';
import { PhysicsField } from './playground/PhysicsField';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useSoundEffects } from '@/contexts/SoundContext';

const CUBE_PRESETS = {
  calm:  { label: 'Suave', gridSize: 7,  maxAngle: 28, radius: 2.5, borderStyle: '1px solid rgba(177,158,239,0.22)', faceColor: '#0c0a1e', rippleColor: '#8b5cf6', rippleSpeed: 0.9 },
  chaos: { label: 'Caos',  gridSize: 11, maxAngle: 65, radius: 4.5, borderStyle: '1px solid rgba(239,68,68,0.28)',  faceColor: '#150505', rippleColor: '#ef4444', rippleSpeed: 3.5 },
  neon:  { label: 'Neón',  gridSize: 8,  maxAngle: 45, radius: 3,   borderStyle: '1px solid rgba(0,255,200,0.22)',  faceColor: '#020e0b', rippleColor: '#00ffd0', rippleSpeed: 2.2 },
};

const VIEWS = [
  { id: 'cubes',     label: 'Cubos',      hint: 'Mové el cursor. Click para una onda.' },
  { id: 'particles', label: 'Partículas', hint: 'El cursor atrae. Click para explotar.' },
  { id: 'waves',     label: 'Ondas',      hint: 'Mové el cursor. Click para salpicar.' },
  { id: 'physics',   label: 'Física',     hint: 'El cursor repele. Click para sumar pelotas.' },
];

function Segmented({ options, value, onChange }) {
  return (
    <div className="flex gap-1 rounded-lg bg-black/30 p-1">
      {options.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${value === id ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Interactive canvas experiments (formerly the "Interactúa" home section)
export function PlaygroundApp() {
  const reduced = useReducedMotion();
  const { playSelect } = useSoundEffects();
  const [view, setView] = useState('cubes');
  const [preset, setPreset] = useState('calm');
  const select = (setter) => (id) => { playSelect(); setter(id); };
  const current = VIEWS.find((v) => v.id === view);

  return (
    <div className="flex h-full flex-col bg-[#141418] text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <Segmented options={VIEWS} value={view} onChange={select(setView)} />
        {view === 'cubes' && (
          <Segmented
            options={Object.entries(CUBE_PRESETS).map(([id, p]) => ({ id, label: p.label }))}
            value={preset}
            onChange={select(setPreset)}
          />
        )}
      </div>

      <div className="relative flex-1 overflow-hidden">
        {view === 'cubes' && (
          <div key={preset} className="absolute inset-0 flex items-center justify-center">
            <Cubes {...CUBE_PRESETS[preset]} autoAnimate={!reduced} rippleOnClick />
          </div>
        )}
        {view === 'particles' && <div className="absolute inset-0"><ParticleField /></div>}
        {view === 'waves' && <div className="absolute inset-0"><WaveField /></div>}
        {view === 'physics' && <div className="absolute inset-0"><PhysicsField /></div>}
      </div>

      <p className="border-t border-white/10 px-3 py-2 text-xs text-white/45">{current.hint}</p>
    </div>
  );
}
