import { useState } from 'react';
import { StickyNote as StickyNoteIcon, Plus, Trash2, Cloud } from 'lucide-react';

export function NotesApp() {
  const INIT = [
    { id: 1, title: 'Ideas', content: '# Ideas dev\n\n- Refactor módulo de auth\n- Agregar dark mode al dashboard\n- Revisar PR #42 de componentes\n- Implementar caché con Redis\n- Migrar a TypeScript gradualmente' },
    { id: 2, title: 'TODO', content: '# TODO\n\n- [ ] Fix loading spinner en móvil\n- [x] Actualizar dependencias\n- [ ] Escribir tests para la API\n- [ ] Deploy a producción viernes\n- [ ] Documentar endpoints REST' },
    { id: 3, title: 'Stack Notes', content: '# Stack Notes\n\nReact 19 + Vite — frontend\nDjango REST — backend\nPostgreSQL — DB principal\nOracle Cloud — infra\nNginx — reverse proxy\n\n## Comando útiles\n\n```\ngit log --oneline --graph\npython manage.py runserver\nnpm run dev\n```' },
  ];
  const [notes, setNotes] = useState(INIT);
  const [selected, setSelected] = useState(1);

  const cur = notes.find(n => n.id === selected);
  const setContent = (val) => setNotes(ns => ns.map(n => n.id === selected ? { ...n, content: val } : n));
  const setTitle   = (val) => setNotes(ns => ns.map(n => n.id === selected ? { ...n, title: val }   : n));

  const addNote = () => {
    const id = Date.now();
    setNotes(ns => [...ns, { id, title: 'Nueva nota', content: '' }]);
    setSelected(id);
  };
  const delNote = () => {
    const remaining = notes.filter(n => n.id !== selected);
    setNotes(remaining);
    setSelected(remaining[0]?.id ?? null);
  };

  return (
    <div className="h-full flex bg-[#1e1e1e]">
      <div className="w-44 bg-[#252526] border-r border-[#333] flex flex-col flex-shrink-0">
        <div className="px-3 py-2.5 border-b border-[#333] flex items-center justify-between">
          <span className="text-[10px] font-bold text-white/25 uppercase tracking-widest">Notas</span>
          <button onClick={addNote} className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 text-white/40 hover:text-white transition-colors">
            <Plus size={13} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {notes.map(n => (
            <button key={n.id} onClick={() => setSelected(n.id)}
              className={`w-full text-left px-3 py-2.5 transition-colors border-b border-white/[0.04] ${selected === n.id ? 'bg-[#37373d] text-white' : 'text-white/50 hover:bg-[#2a2d2e] hover:text-white/80'}`}
            >
              <div className="font-medium text-[12px] truncate">{n.title || 'Sin título'}</div>
              <div className="text-[10px] text-white/25 truncate mt-0.5">{n.content.replace(/^#.*\n?/,'').trim().slice(0,28)}…</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {cur ? (
          <>
            <div className="px-4 py-2.5 border-b border-[#333] flex items-center gap-3 flex-shrink-0">
              <input value={cur.title} onChange={e => setTitle(e.target.value)}
                className="flex-1 bg-transparent text-white font-semibold text-sm outline-none placeholder:text-white/20"
                placeholder="Título…"
              />
              <button onClick={delNote} className="flex items-center gap-1 text-[11px] text-white/20 hover:text-red-400 transition-colors">
                <Trash2 size={11}/> Eliminar
              </button>
            </div>
            <textarea value={cur.content} onChange={e => setContent(e.target.value)}
              className="flex-1 bg-[#1e1e1e] text-white/80 font-mono text-[12.5px] resize-none outline-none p-4 leading-6 placeholder:text-white/15"
              placeholder="Empieza a escribir…"
            />
            <div className="h-6 bg-[#252526] border-t border-[#333] px-4 flex items-center gap-4 text-[10px] text-white/20 flex-shrink-0">
              <span>{cur.content.length} chars</span>
              <span>{cur.content.split('\n').length} líneas</span>
              <span className="ml-auto">UTF-8</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/20">
            <StickyNoteIcon size={32} strokeWidth={1} />
            <span className="text-sm">Crea una nota</span>
            <button onClick={addNote} className="text-[var(--accent)] text-xs hover:underline">+ Nueva nota</button>
          </div>
        )}
      </div>
    </div>
  );
}
