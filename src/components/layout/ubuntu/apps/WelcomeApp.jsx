import { LayoutGrid, TerminalSquare, Gamepad2, Keyboard, LogOut } from 'lucide-react';

const TRY = [
  { id: 'projects', Icon: LayoutGrid,     title: 'Proyectos',  text: 'Todos mis proyectos con capturas, stack y links.' },
  { id: 'terminal', Icon: TerminalSquare, title: 'Terminal',   text: "Probá 'help', 'neofetch', 'ls projects' u 'open playground'." },
  { id: 'games',    Icon: Gamepad2,       title: 'Juegos',     text: 'Snake, Buscaminas, Tetris y DOOM shareware.' },
];

const SHORTCUTS = [
  ['Super', 'Actividades'],
  ['Alt + Tab', 'Cambiar de ventana'],
  ['Ctrl + Alt + ← →', 'Escritorios virtuales'],
  ['Alt + F2', 'Ejecutar una app'],
  ['Impr Pant', 'Captura de pantalla'],
  ['Ctrl + Alt + T', 'Volver al portfolio'],
];

// First window shown after login: what to try and how to leave
export function WelcomeApp({ onOpen, onExit }) {
  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] p-6 text-white">
      <h2 className="text-2xl font-semibold">Bienvenido a aznar-dev</h2>
      <p className="mt-2 max-w-md text-sm text-white/60">
        Un escritorio Ubuntu simulado en el navegador, hecho con React. Todo lo que ves es interactivo.
      </p>

      <div className="mt-6 grid gap-2 sm:grid-cols-3">
        {TRY.map(({ id, Icon, title, text }) => (
          <button key={id} onClick={() => onOpen(id)}
            className="rounded-xl border border-white/10 bg-[#2a2a2a] p-4 text-left transition-colors hover:border-[#E95420]/60">
            <Icon size={20} className="text-[#E95420]" aria-hidden="true" />
            <div className="mt-3 text-sm font-medium">{title}</div>
            <div className="mt-1 text-xs leading-relaxed text-white/50">{text}</div>
          </button>
        ))}
      </div>

      <h3 className="mt-7 flex items-center gap-2 text-sm font-medium text-white/80"><Keyboard size={15} aria-hidden="true" /> Atajos</h3>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        {SHORTCUTS.map(([keys, action]) => (
          <div key={keys} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
            <dt className="text-white/60">{action}</dt>
            <dd><kbd className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-white/80">{keys}</kbd></dd>
          </div>
        ))}
      </dl>

      <button onClick={onExit} className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
        <LogOut size={14} aria-hidden="true" /> Volver al portfolio
      </button>
    </div>
  );
}
