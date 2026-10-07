import { useState, useEffect } from 'react';

const BOOT_SEQUENCE = [
  "Starting MS-DOS...",
  "HIMEM is testing extended memory...done.",
  "C:\\> cd DOOM",
  "C:\\DOOM> DOOM.EXE",
  "DOOM Shareware Startup v1.9",
  "V_Init: allocate screens.",
  "M_LoadDefaults: Load system defaults.",
  "Z_Init: zone memory allocation.",
  "W_Init: Init WADfiles.",
  "Adding DOOM1.WAD",
  "===========================================================================",
  "                             Commercial product - do not distribute!",
  "         Please report software piracy to the SPA: 1-800-388-PIR8",
  "===========================================================================",
  "I_Init: Setting up machine state.",
  "D_CheckNetGame: Checking network game status.",
  "startskill 2  deathmatch: 0  startmap: 1  startepisode: 1",
  "player 1 of 1 (1 nodes)",
  "S_Init: Setting up sound.",
  "HU_Init: Setting up heads up display.",
  "ST_Init: Init status bar.",
  "Executing DOOM..."
];

export function DoomApp() {
  const [phase, setPhase] = useState('intro'); // intro | bios | loading | playing
  const [bootText, setBootText] = useState([]);
  

  useEffect(() => {
    if (phase === 'bios') {
      let step = 0;
      const iv = setInterval(() => {
        setBootText(prev => [...prev, BOOT_SEQUENCE[step]]);
        step++;
        if (step >= BOOT_SEQUENCE.length) {
          clearInterval(iv);
          setTimeout(() => setPhase('playing'), 800);
        }
      }, 150);
      return () => clearInterval(iv);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;

    const reportActivity = () => {
      window.dispatchEvent(new CustomEvent('ubuntu-user-activity'));
    };

    reportActivity();
    const id = setInterval(reportActivity, 10_000);
    return () => clearInterval(id);
  }, [phase]);

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden font-mono selection:bg-[#E95420]/30">
      {/* CRT Scanline Overlay applied globally to the app */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-50 opacity-20" />
      
      {phase === 'intro' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505] z-40 gap-8">
          <div className="flex flex-col items-center relative">
            <div className="absolute -inset-10 bg-red-600/20 blur-3xl rounded-full" />
            <div className="font-black tracking-[0.35em] leading-none select-none relative z-10"
              style={{ fontSize:'4.5rem', fontFamily:'serif', color:'#cc0000',
                textShadow:'2px 2px 0px #ff9900, -1px -1px 0 #550000, 0 0 20px rgba(255,0,0,0.5)' }}
            >DOOM</div>
            <div className="text-orange-500/70 font-mono text-[10px] tracking-[0.4em] uppercase mt-2">Shareware Edition</div>
          </div>
          
          <div className="flex flex-col items-center gap-2 text-white/40 font-mono text-[10px] text-center max-w-xs mt-4">
            <p>1993 id Software. Portado vía JS-DOS / Internet Archive.</p>
            <p className="text-[#00ff00]/60 mt-2">&gt; Inserta la moneda virtual para empezar_</p>
          </div>
          
          <button
            onClick={() => setPhase('bios')}
            className="mt-4 px-12 py-3 bg-red-700/80 border border-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all hover:scale-105 tracking-[0.2em] shadow-[0_0_15px_rgba(255,0,0,0.4)] relative group overflow-hidden"
          >
            <span className="relative z-10">ARRANCAR DOS</span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-white/20 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          </button>
        </div>
      )}

      {phase === 'bios' && (
        <div className="absolute inset-0 bg-black p-4 z-30 flex flex-col justify-end">
          <div className="text-[#a8a8a8] text-[13px] leading-snug whitespace-pre-wrap font-mono flex flex-col items-start gap-0.5">
            {bootText.map((txt, i) => (
              <div key={i}>{txt}</div>
            ))}
            <div className="w-2.5 h-4 bg-[#a8a8a8] animate-pulse mt-1" />
          </div>
        </div>
      )}

      {phase === 'playing' && (
        <div
          className="flex-1 w-full relative z-10 flex"
          onPointerDown={() => window.dispatchEvent(new CustomEvent('ubuntu-user-activity'))}
          onPointerMove={() => window.dispatchEvent(new CustomEvent('ubuntu-user-activity'))}
        >
          {/* Wrapper to force correct aspect ratio and center the iframe */}
          <iframe
            src="https://silentspacemarine.com/"
            className="flex-1 border-0 w-full h-full bg-black/80"
            title="DOOM Shareware"
            allow="autoplay; fullscreen; keyboard"
          />
        </div>
      )}
    </div>
  );
}
