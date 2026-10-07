import { useState } from 'react';
import { FolderOpen, File, ChevronLeft, Search } from 'lucide-react';
import React from 'react';
import { buildFS } from '../filesystem';

export function FilesApp({ onOpenFile, lang }) {
  const [path, setPath] = useState('Home/Projects');
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState('');
  const fs = buildFS(lang);
  const parts = path.split('/');
  const allFiles = fs[path] || [];
  const files = query.trim() ? allFiles.filter(f => (f.label || f.name).toLowerCase().includes(query.toLowerCase())) : allFiles;

  const open = (item) => {
    const next = `${path}/${item.name}`;
    if (item.type === 'folder') { if (!fs[next]) fs[next] = []; setPath(next); setSelected(null); }
    else if (item.isPdf || item.name.endsWith('.pdf')) onOpenFile({ ...item, isPdf: true });
    else if (item.content) onOpenFile(item);
  };
  const navTo = (idx) => { setPath(parts.slice(0, idx + 1).join('/')); setSelected(null); };
  const SIDEBAR = ['Home','Desktop','Documents','Downloads','Projects'];

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="h-11 bg-[#2d2d2d] flex items-center gap-2 px-3 border-b border-black/40 flex-shrink-0">
        <button onClick={() => { parts.length > 1 && navTo(parts.length - 2); setQuery(''); }} disabled={parts.length === 1}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/60 transition-colors flex-shrink-0"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1 text-[12px] bg-black/20 rounded px-2 py-1 flex-1 overflow-hidden min-w-0">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <button onClick={() => { navTo(i); setQuery(''); }} className="text-white/60 hover:text-white transition-colors whitespace-nowrap">{part}</button>
              {i < parts.length - 1 && <span className="text-white/20">/</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="flex items-center gap-1.5 bg-black/20 rounded px-2 py-1 flex-shrink-0">
          <Search size={11} className="text-white/30 flex-shrink-0" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Buscar..." className="bg-transparent text-white/80 text-[11px] outline-none placeholder:text-white/25 w-20"
          />
          {query && <button onClick={() => setQuery('')} className="text-white/30 hover:text-white/60 text-xs leading-none">×</button>}
        </div>
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="w-36 bg-[#252526] border-r border-[#333] py-2 flex-shrink-0 overflow-y-auto">
          {SIDEBAR.map(f => {
            const p = f === 'Home' ? 'Home' : `Home/${f}`;
            const active = path === p || path.startsWith(p + '/');
            return (
              <button key={f} onClick={() => { if (!fs[p]) fs[p] = []; setPath(p); setSelected(null); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 transition-colors ${active ? 'bg-[#37373d] text-white' : 'text-white/50 hover:bg-[#2a2d2e] hover:text-white/80'}`}
              >
                <FolderOpen size={13} className={active ? 'text-[#E95420]' : ''} />{f}
              </button>
            );
          })}
        </div>
        <div className="flex-1 p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 content-start gap-3 overflow-y-auto">
          {files.length === 0 && <div className="col-span-full text-white/25 text-sm text-center mt-12">{query ? 'Sin resultados' : 'Carpeta vacía'}</div>}
          {files.map((f) => (
            <div key={f.name} onClick={() => setSelected(f.name)} onDoubleClick={() => open(f)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors ${selected === f.name ? 'bg-[#E95420]/20 ring-1 ring-[#E95420]/40' : 'hover:bg-white/[0.07]'}`}
            >
              {f.type === 'folder'
                ? <FolderOpen size={40} className="text-[#E95420]" strokeWidth={1} />
                : f.isPdf || f.name?.endsWith('.pdf')
                  ? <File size={40} className="text-red-400" strokeWidth={1} />
                  : f.name?.endsWith('.md')
                    ? <File size={40} className="text-blue-400" strokeWidth={1} />
                    : <File size={40} className="text-[#519aba]" strokeWidth={1} />
              }
              <span className="text-white/70 text-[10px] font-medium text-center leading-tight max-w-full truncate w-full">
                {f.label || f.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-6 bg-[#252526] border-t border-black/30 px-3 flex items-center text-[10px] text-white/25 flex-shrink-0">
        {files.length} elemento{files.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
