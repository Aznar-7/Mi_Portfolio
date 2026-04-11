import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalWindow } from '@/components/layout/Terminal';
import {
  TerminalSquare, FolderOpen, Globe, Settings as SettingsIcon,
  Power, Wifi, BatteryFull, Volume2, File, Code2,
  ChevronLeft, Info, Palette, HardDrive, ExternalLink, X,
} from 'lucide-react';
import React from 'react';
import { useLang } from '@/contexts/LanguageContext';
import { site } from '@/data/site';
import { projects } from '@/data/projects';
import { skillsData } from '@/data/skills';
import { experience } from '@/data/experience';

// ── Wallpapers ────────────────────────────────────────────────────
const WALLPAPERS = [
  { name: 'Jammy',      bg: 'linear-gradient(135deg,#E95420 0%,#77216F 100%)' },
  { name: 'Night',      bg: 'linear-gradient(160deg,#0a0a0f 0%,#1a1040 50%,#0a0a18 100%)' },
  { name: 'Ocean',      bg: 'linear-gradient(135deg,#0a1628 0%,#1a3a6a 50%,#0a2040 100%)' },
  { name: 'Forest',     bg: 'linear-gradient(135deg,#0d2010 0%,#1a4020 50%,#0d2a10 100%)' },
  { name: 'Crimson',    bg: 'linear-gradient(135deg,#1a0505 0%,#5a1010 50%,#1a0505 100%)' },
];

// ── Virtual Filesystem ────────────────────────────────────────────
function buildFS(lang) {
  const l = (v) => (v && typeof v === 'object' ? (v[lang] ?? v.es ?? '') : v ?? '');
  const projectFolders = projects.reduce((acc, p) => {
    acc[`Home/Projects/${p.id}`] = [
      {
        name: 'README.md', type: 'file',
        content: `# ${p.title}\n\n${l(p.description)}\n\n## Stack\n${p.tech.join(', ')}\n\n## Status\n${p.status}${p.liveUrl ? `\n\n## Live\n${p.liveUrl}` : ''}`,
      },
      {
        name: 'package.json', type: 'file',
        content: JSON.stringify({ name: p.id.replace(/-/g, '_'), version: '1.0.0', dependencies: p.tech.reduce((a, t) => ({ ...a, [t.toLowerCase().replace(/\s/g, '-')]: 'latest' }), {}) }, null, 2),
      },
    ];
    return acc;
  }, {});

  return {
    'Home': [
      { name: 'Projects',  type: 'folder' },
      { name: 'Documents', type: 'folder' },
      { name: 'Downloads', type: 'folder' },
      { name: 'Desktop',   type: 'folder' },
    ],
    'Home/Projects': projects.map(p => ({ name: p.id, type: 'folder', label: p.title })),
    'Home/Documents': [
      { name: 'resume.pdf', type: 'file', label: 'Resume (PDF)', isPdf: true },
      {
        name: 'about.txt', type: 'file',
        content: `Full Stack Developer con experiencia real en sistemas corporativos.\n\nStack: React · Django · PostgreSQL · Oracle Cloud\nFormación: Ingeniería en Sistemas — UTN\nUbicación: Argentina`,
      },
    ],
    'Home/Downloads': [],
    'Home/Desktop':   [],
    ...projectFolders,
  };
}

// ── Boot Screen ───────────────────────────────────────────────────
function BootScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const ts = [
      setTimeout(() => setProgress(25), 200),
      setTimeout(() => setProgress(55), 700),
      setTimeout(() => setProgress(80), 1300),
      setTimeout(() => setProgress(100), 1800),
      setTimeout(onDone, 2100),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center gap-12"
    >
      <svg width="72" height="72" viewBox="0 0 24 24" fill="#E95420">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.24 9.76a6.96 6.96 0 01-.54-7.9l1.37 1.37A5.02 5.02 0 007.5 12c0 .97.27 1.87.74 2.63l-1.37 1.37-.01-.24zm4.24 3.24c-.97 0-1.87-.27-2.63-.74L8 18.63a7 7 0 007.9.54l-1.37-1.37c-.76.47-1.66.74-2.63.74zm4.24-1.24l-1.37-1.37A5.02 5.02 0 0016.5 12c0-.97-.27-1.87-.74-2.63l1.37-1.37a6.96 6.96 0 01-.54 7.9l-.11-.14z"/>
      </svg>
      <div className="flex flex-col items-center gap-2 w-40">
        <div className="w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#E95420] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="text-white/25 text-[11px] font-mono tracking-widest">UBUNTU 24.04 LTS</span>
      </div>
    </motion.div>
  );
}

// ── Login Screen ──────────────────────────────────────────────────
function LoginScreen({ onLogin, wallpaperBg }) {
  const [pwd, setPwd] = useState('');
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
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex flex-col items-center"
      style={{ background: wallpaperBg }}
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
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E95420] to-[#77216F] flex items-center justify-center text-white text-3xl font-bold shadow-2xl select-none">
            VA
          </div>
          <div className="text-white font-medium text-lg tracking-wide select-none">{site.name}</div>

          <div className="flex items-center bg-white/10 border border-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <input
              ref={inputRef}
              type="password"
              placeholder="Contraseña"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onLogin()}
              className="bg-transparent text-white text-sm px-5 py-2.5 outline-none placeholder:text-white/30 w-44"
              autoComplete="off"
            />
            <button onClick={onLogin}
              className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <p className="text-white/25 text-xs">Presiona Enter — cualquier contraseña funciona</p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Window ────────────────────────────────────────────────────────
function WinBtn({ bg, hover, onClick, children }) {
  return (
    <button
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-transparent hover:text-black/60 text-[9px] font-black transition-all group-hover/btns:text-black/40"
      style={{ background: bg }}
      onMouseEnter={e => e.currentTarget.style.background = hover}
      onMouseLeave={e => e.currentTarget.style.background = bg}
    >
      {children}
    </button>
  );
}

function Window({ id, title, children, zIndex, isFocused, isMaximized, isMobile, defaultTop, defaultLeft, onFocus, onClose, onMinimize, onMaximize }) {
  return (
    <motion.div
      drag={!isMaximized && !isMobile}
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={onFocus}
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.88, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className={`absolute flex flex-col overflow-hidden ${isMaximized || isMobile ? 'inset-0 rounded-none' : 'rounded-lg'}`}
      style={{
        zIndex,
        width:  isMaximized || isMobile ? '100%' : 'min(800px, 88vw)',
        height: isMaximized || isMobile ? '100%' : 'min(510px, 80vh)',
        top:    isMaximized || isMobile ? 0 : defaultTop,
        left:   isMaximized || isMobile ? 0 : defaultLeft,
        boxShadow: isFocused
          ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)'
          : '0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {/* Title bar */}
      <div
        onDoubleClick={onMaximize}
        className={`h-8 flex items-center px-3 gap-2 flex-shrink-0 cursor-grab active:cursor-grabbing select-none border-b group/btns ${isFocused ? 'bg-[#3c3c3c] border-black/40' : 'bg-[#282828] border-black/25'}`}
      >
        <div className="flex items-center gap-1.5">
          <WinBtn bg="#ff5f57" hover="#e0443f" onClick={onClose}>×</WinBtn>
          <WinBtn bg="#ffbd2e" hover="#dea123" onClick={onMinimize}>−</WinBtn>
          <WinBtn bg="#28c840" hover="#1ea831" onClick={onMaximize}>+</WinBtn>
        </div>
        <span className="flex-1 text-center text-[12px] text-white/60 truncate font-medium">{title}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-[#1e1e1e] cursor-default">
        {children}
      </div>
    </motion.div>
  );
}

// ── Dock Icon ────────────────────────────────────────────────────
function DockIcon({ icon: Icon, label, isOpen, isFocused, isMinimized, onClick }) {
  return (
    <div className="relative group/dock cursor-pointer" onClick={onClick}>
      {isOpen && (
        <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 rounded-full transition-all ${isFocused ? 'h-4 bg-white' : 'h-2 bg-white/50'}`} />
      )}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${isOpen ? 'bg-white/12' : 'bg-transparent'} ${isFocused ? 'scale-110' : 'hover:scale-110 hover:bg-white/10'} ${isMinimized ? 'opacity-50' : ''}`}>
        <Icon size={22} color="white" strokeWidth={1.5} />
      </div>
      <div className="absolute left-[56px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black/90 text-white text-[11px] rounded-md opacity-0 group-hover/dock:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
        {label}
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-[5px] border-transparent border-r-black/90" />
      </div>
    </div>
  );
}

// ── Desktop Icon ─────────────────────────────────────────────────
function DesktopIcon({ icon: Icon, label, onClick }) {
  return (
    <div onDoubleClick={onClick} className="flex flex-col items-center gap-1 cursor-pointer group w-18 select-none">
      <div className="w-14 h-14 bg-black/25 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-black/40 group-focus:ring-2 ring-[#E95420] transition-all">
        <Icon size={30} className="text-[#E95420]" strokeWidth={1.5} />
      </div>
      <span className="text-white text-[11px] font-medium bg-black/40 px-1.5 py-0.5 rounded text-center max-w-[70px] truncate group-hover:bg-[#E95420]/70 transition-colors">
        {label}
      </span>
    </div>
  );
}

// ── Context Menu ─────────────────────────────────────────────────
function ContextMenu({ x, y, onClose, onNewTerminal, onSettings }) {
  const items = [
    { label: 'Nueva Terminal', icon: TerminalSquare, action: onNewTerminal },
    { label: 'Cambiar fondo',  icon: Palette,        action: onSettings },
    { label: 'Actualizar',     icon: null,            action: onClose },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.12 }}
      className="absolute z-[200] py-1 bg-[#303030] border border-white/10 rounded-lg shadow-2xl w-48 overflow-hidden"
      style={{ left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 160) }}
      onClick={e => e.stopPropagation()}
    >
      {items.map((item) => (
        <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors text-left"
        >
          {item.icon && <item.icon size={14} className="text-white/50" />}
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

// ── Files App ────────────────────────────────────────────────────
function FilesApp({ onOpenFile, lang }) {
  const [path, setPath] = useState('Home/Projects');
  const [selected, setSelected] = useState(null);
  const fs = buildFS(lang);
  const parts = path.split('/');
  const files = fs[path] || [];

  const open = (item) => {
    const next = `${path}/${item.name}`;
    if (item.type === 'folder') {
      if (!fs[next]) fs[next] = [];
      setPath(next); setSelected(null);
    } else if (item.isPdf || item.name.endsWith('.pdf')) {
      window.open('/ResumeVicenteAznar.pdf', '_blank');
    } else if (item.content) {
      onOpenFile(item);
    }
  };

  const navTo = (idx) => {
    setPath(parts.slice(0, idx + 1).join('/'));
    setSelected(null);
  };

  const SIDEBAR = ['Home', 'Desktop', 'Documents', 'Downloads', 'Projects'];

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-11 bg-[#2d2d2d] flex items-center gap-3 px-3 border-b border-black/40 flex-shrink-0">
        <button onClick={() => parts.length > 1 && navTo(parts.length - 2)}
          disabled={parts.length === 1}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/60 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[12px] bg-black/20 rounded px-2 py-1 flex-1 overflow-hidden">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <button onClick={() => navTo(i)} className="text-white/60 hover:text-white transition-colors whitespace-nowrap">{part}</button>
              {i < parts.length - 1 && <span className="text-white/25">/</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-40 bg-[#252526] border-r border-[#333] py-2 flex-shrink-0 overflow-y-auto">
          {SIDEBAR.map(f => {
            const p = f === 'Home' ? 'Home' : `Home/${f}`;
            const active = path === p || path.startsWith(p + '/');
            return (
              <button key={f} onClick={() => { if (!fs[p]) fs[p] = []; setPath(p); setSelected(null); }}
                className={`w-full text-left px-3 py-1.5 text-[12px] flex items-center gap-2 transition-colors ${active ? 'bg-[#37373d] text-white' : 'text-white/50 hover:bg-[#2a2d2e] hover:text-white/80'}`}
              >
                <FolderOpen size={14} className={active ? 'text-[#E95420]' : ''} />
                {f}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="flex-1 p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 content-start gap-3 overflow-y-auto">
          {files.length === 0 && (
            <div className="col-span-full text-white/25 text-sm text-center mt-12">Carpeta vacía</div>
          )}
          {files.map((f) => (
            <div
              key={f.name}
              onClick={() => setSelected(f.name)}
              onDoubleClick={() => open(f)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-lg cursor-pointer transition-colors ${selected === f.name ? 'bg-[#E95420]/20 ring-1 ring-[#E95420]/40' : 'hover:bg-white/8'}`}
            >
              {f.type === 'folder'
                ? <FolderOpen size={42} className="text-[#E95420]" strokeWidth={1} />
                : f.isPdf || f.name?.endsWith('.pdf')
                  ? <File size={42} className="text-[#e25050]" strokeWidth={1} />
                  : <File size={42} className="text-[#519aba]" strokeWidth={1} />
              }
              <span className="text-white/70 text-[11px] font-medium text-center leading-tight max-w-full truncate w-full text-center">
                {f.label || f.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-6 bg-[#252526] border-t border-black/30 px-3 flex items-center text-[10px] text-white/30 flex-shrink-0">
        {files.length} elemento{files.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

// ── Browser App ──────────────────────────────────────────────────
function BrowserApp({ lang }) {
  const l = (v) => (v && typeof v === 'object' ? (v[lang] ?? v.es ?? '') : v ?? '');
  const [url] = useState(`https://${site.domain || 'aznar-dev.com'}/portfolio`);
  const [tab, setTab] = useState('projects');
  const TABS = [
    { id: 'projects',  label: 'Proyectos' },
    { id: 'skills',    label: 'Skills' },
    { id: 'cv',        label: 'CV / Resume' },
    { id: 'contact',   label: 'Contacto' },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Browser chrome */}
      <div className="bg-[#dee1e6] border-b border-[#bbb] flex-shrink-0">
        <div className="flex items-center gap-2 px-3 h-10">
          <button className="p-1.5 text-[#6b6b6b] hover:bg-black/10 rounded transition-colors"><ChevronLeft size={15}/></button>
          <div className="flex-1 flex items-center bg-white border border-[#d0d0d0] rounded-full h-7 px-3 gap-2 text-[11px] text-gray-500 shadow-inner">
            <Globe size={11} className="text-[#4CAF50]" />
            {url}
          </div>
          <a href={site.github} target="_blank" rel="noopener noreferrer"
            className="p-1.5 text-[#6b6b6b] hover:bg-black/10 rounded transition-colors"
          >
            <ExternalLink size={14}/>
          </a>
        </div>
        {/* Tabs */}
        <div className="flex gap-0 border-t border-[#ccc]">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-5 py-1.5 text-[12px] font-medium transition-colors border-r border-[#ccc] ${tab === t.id ? 'bg-white text-gray-800' : 'bg-[#dee1e6] text-gray-500 hover:bg-[#d0d3d8]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto bg-[#f9fafb]">
        {tab === 'projects' && (
          <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{site.name}</h1>
            <p className="text-gray-500 mb-6 text-sm">{site.role}</p>
            <div className="grid gap-4">
              {projects.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="font-bold text-gray-800">{p.title}</h2>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${p.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{l(p.tagline)}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map(t => (
                      <span key={t} className="px-2 py-0.5 bg-violet-50 text-violet-700 text-[11px] rounded-full font-medium">{t}</span>
                    ))}
                  </div>
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-[12px] text-violet-600 hover:text-violet-800 font-medium"
                    >
                      <ExternalLink size={11}/> {p.liveUrl}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'skills' && (
          <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Skills & Stack</h1>
            {['Frontend','Backend','Infraestructura','Bases de datos','IoT & Hardware','Otros'].map(cat => {
              const catSkills = skillsData.filter(s => s.category === cat);
              if (!catSkills.length) return null;
              return (
                <div key={cat} className="mb-6">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{cat}</h2>
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map(s => (
                      <div key={s.name} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                        <img src={s.icon} alt={s.name} className="w-4 h-4 object-contain" loading="lazy" onError={e => e.currentTarget.style.display='none'} />
                        <span className="text-sm text-gray-700 font-medium">{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'cv' && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200 flex-shrink-0">
              <span className="text-xs text-gray-500 font-mono">ResumeVicenteAznar.pdf</span>
              <a href="/ResumeVicenteAznar.pdf" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-800 font-medium"
              >
                <ExternalLink size={11} /> Abrir en nueva pestaña
              </a>
            </div>
            <iframe
              src="/ResumeVicenteAznar.pdf"
              className="flex-1 w-full border-0"
              title="Resume Vicente Aznar"
            />
          </div>
        )}

        {tab === 'contact' && (
          <div className="p-6 max-w-lg mx-auto flex flex-col items-center text-center gap-5 mt-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-2xl font-bold">VA</div>
            <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            <p className="text-gray-500">{site.role}</p>
            <div className="flex flex-col gap-3 w-full">
              <a href={`mailto:${site.email}`} className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors">{site.email}</a>
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">GitHub</a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors">LinkedIn</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Code Editor App ──────────────────────────────────────────────
function EditorApp({ file }) {
  const lines = (file?.content || '// No file open').split('\n');
  const ext = file?.name?.split('.').pop() || 'txt';
  const langLabel = { json: 'JSON', jsx: 'JavaScript React', md: 'Markdown', txt: 'Plain Text', pdf: 'Text' }[ext] || 'Plain Text';

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Tab bar */}
      <div className="bg-[#252526] border-b border-black/50 flex flex-shrink-0">
        <div className="px-4 py-2 bg-[#1e1e1e] text-[#ccc] text-[12px] flex items-center gap-2 border-t-2 border-t-[#007acc]">
          <File size={13} className="text-[#519aba]" />
          {file?.name || 'Untitled'}
        </div>
      </div>
      {/* Editor body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div className="w-10 bg-[#1e1e1e] text-[#5a5a5a] text-[12px] text-right pr-2 py-3 select-none font-mono leading-5 flex-shrink-0 overflow-hidden">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        {/* Code area */}
        <div className="flex-1 overflow-auto p-3 pl-4 border-l border-[#303030]">
          <pre className="text-[#d4d4d4] font-mono text-[13px] leading-5 m-0 whitespace-pre-wrap break-words">
            {file?.content || '// No file open — abre un archivo desde Files'}
          </pre>
        </div>
      </div>
      {/* Status bar */}
      <div className="h-6 bg-[#007acc] px-3 flex items-center justify-between text-white text-[10px] flex-shrink-0">
        <div className="flex gap-3"><span>⎇ main</span><span>Ln 1, Col 1</span></div>
        <div className="flex gap-3"><span>UTF-8</span><span>{langLabel}</span></div>
      </div>
    </div>
  );
}

// ── Settings App ─────────────────────────────────────────────────
function SettingsApp({ wallpaper, onWallpaper }) {
  const [section, setSection] = useState('appearance');

  const SECTIONS = [
    { id: 'appearance', label: 'Apariencia',     icon: Palette },
    { id: 'display',    label: 'Pantallas',       icon: HardDrive },
    { id: 'about',      label: 'Acerca de',       icon: Info },
  ];

  return (
    <div className="h-full flex bg-[#1e1e1e]">
      {/* Sidebar */}
      <div className="w-52 bg-[#252526] border-r border-[#333] py-3 flex-shrink-0">
        <div className="px-4 py-1 text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Sistema</div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`w-full text-left px-4 py-2 text-[13px] flex items-center gap-3 transition-colors rounded-sm ${section === s.id ? 'bg-[#37373d] text-white' : 'text-white/50 hover:bg-[#2a2d2e] hover:text-white/80'}`}
          >
            <s.icon size={15} className={section === s.id ? 'text-[#E95420]' : ''} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {section === 'appearance' && (
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Apariencia</h2>
            <p className="text-white/40 text-sm mb-6">Personaliza el fondo de escritorio</p>
            <div className="mb-2 text-[11px] font-bold text-white/30 uppercase tracking-widest">Fondo de pantalla</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {WALLPAPERS.map((w, i) => (
                <button key={w.name} onClick={() => onWallpaper(i)}
                  className={`relative rounded-xl overflow-hidden h-20 border-2 transition-all ${wallpaper === i ? 'border-[#E95420] scale-[1.03]' : 'border-transparent hover:border-white/20'}`}
                  style={{ background: w.bg }}
                >
                  {wallpaper === i && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-[#E95420] font-black text-[10px]">✓</div>
                    </div>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] font-bold text-white/70 tracking-wider">{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {section === 'display' && (
          <div>
            <h2 className="text-xl font-medium text-white mb-1">Pantallas</h2>
            <p className="text-white/40 text-sm mb-6">Configuración de pantalla activa</p>
            <div className="bg-[#2d2d2d] rounded-xl border border-white/5 p-5">
              <div className="flex items-center justify-center w-full h-28 bg-black/30 rounded-lg border border-white/5 mb-4">
                <div className="flex flex-col items-center gap-1 text-white/20">
                  <HardDrive size={32} strokeWidth={1} />
                  <span className="text-[11px]">Display 1</span>
                </div>
              </div>
              {[['Resolución', `${window.screen.width} × ${window.screen.height}`], ['Frecuencia', '60 Hz'], ['Orientación', 'Horizontal']].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-white/5 last:border-0">
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
            <p className="text-white/40 text-sm mb-6">Sistema operativo y especificaciones</p>
            <div className="flex items-center gap-4 mb-6 p-4 bg-[#2d2d2d] rounded-xl border border-white/5">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#E95420">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.24 9.76a6.96 6.96 0 01-.54-7.9l1.37 1.37A5.02 5.02 0 007.5 12c0 .97.27 1.87.74 2.63l-1.37 1.37-.01-.24zm4.24 3.24c-.97 0-1.87-.27-2.63-.74L8 18.63a7 7 0 007.9.54l-1.37-1.37c-.76.47-1.66.74-2.63.74zm4.24-1.24l-1.37-1.37A5.02 5.02 0 0016.5 12c0-.97-.27-1.87-.74-2.63l1.37-1.37a6.96 6.96 0 01-.54 7.9l-.11-.14z"/>
              </svg>
              <div>
                <div className="text-white font-semibold">Ubuntu 24.04.1 LTS</div>
                <div className="text-white/40 text-sm">aznar-dev edition</div>
              </div>
            </div>
            <div className="bg-[#2d2d2d] rounded-xl border border-white/5 overflow-hidden">
              {[
                ['Nombre del equipo', 'aznar-dev.local'],
                ['Sistema operativo', 'Ubuntu 24.04 LTS (aznar-dev)'],
                ['Procesador', `${site.role} (8 cores)`],
                ['Memoria', '∞ Coffee · 16GB RAM'],
                ['Stack', skillsData.slice(0, 6).map(s => s.name).join(' · ')],
                ['Paquetes', `${skillsData.length} tecnologías instaladas`],
                ['Uptime', '2025 — Presente'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-5 py-3 border-b border-white/5 last:border-0">
                  <span className="text-white/40 text-sm">{k}</span>
                  <span className="text-white/80 text-sm font-medium text-right max-w-[55%]">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Top Bar ──────────────────────────────────────────────────────
function TopBar({ time, date, onPower }) {
  const [volOpen, setVolOpen] = useState(false);
  return (
    <div className="h-7 w-full bg-black/75 flex items-center justify-between px-4 text-white/85 text-[12px] font-medium z-50 backdrop-blur-sm flex-shrink-0 select-none">
      <button className="hover:text-white transition-colors">Activities</button>
      <button className="hover:text-white transition-colors tabular-nums">{date && time ? `${date}  ${time}` : '...'}</button>
      <div className="flex items-center gap-3">
        <Volume2 size={13} className="opacity-70 cursor-pointer hover:opacity-100 transition-opacity" onClick={() => setVolOpen(v => !v)} />
        <Wifi size={13} className="opacity-70" />
        <BatteryFull size={13} className="opacity-70" />
        <button onClick={onPower} className="hover:text-[#E95420] transition-colors ml-1" title="Apagar Ubuntu Mode">
          <Power size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Main UbuntuOS ────────────────────────────────────────────────
export function UbuntuOS({ onClose }) {
  const [screen,   setScreen]   = useState('boot');
  const [wallpaper, setWallpaper] = useState(0);
  const { lang } = useLang();

  const [wins, setWins] = useState({
    terminal: { open: true,  min: false, max: false },
    files:    { open: false, min: false, max: false },
    browser:  { open: false, min: false, max: false },
    settings: { open: false, min: false, max: false },
    editor:   { open: false, min: false, max: false, fileData: null },
  });
  const [focused, setFocused] = useState('terminal');
  const zRef = useRef(100);
  const [zMap, setZMap] = useState({ terminal: 10, files: 9, browser: 8, settings: 7, editor: 6 });
  const [ctxMenu, setCtxMenu] = useState(null);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => {
    document.body.classList.add('ubuntu-mode');
    return () => document.body.classList.remove('ubuntu-mode');
  }, []);

  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString(lang === 'es' ? 'es-ES' : 'en-US', { hour: '2-digit', minute: '2-digit' }));
      setDate(n.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric', weekday: 'short' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [lang]);

  const focusWin = (id) => {
    zRef.current += 1;
    setZMap(prev => ({ ...prev, [id]: zRef.current }));
    setFocused(id);
  };

  const openApp = (id, fileData = null) => {
    setWins(prev => ({
      ...prev,
      [id]: { ...prev[id], open: true, min: false, ...(fileData !== null ? { fileData } : {}) },
    }));
    focusWin(id);
  };

  const closeApp  = (id) => setWins(prev => ({ ...prev, [id]: { ...prev[id], open: false, min: false } }));
  const minApp    = (id) => setWins(prev => ({ ...prev, [id]: { ...prev[id], min: true } }));
  const toggleMax = (id) => setWins(prev => ({ ...prev, [id]: { ...prev[id], max: !prev[id].max } }));
  const restoreApp = (id) => { setWins(prev => ({ ...prev, [id]: { ...prev[id], min: false } })); focusWin(id); };

  const DOCK_APPS = [
    { id: 'terminal', label: 'Terminal',        icon: TerminalSquare },
    { id: 'files',    label: 'Archivos',         icon: FolderOpen },
    { id: 'browser',  label: 'Firefox',          icon: Globe },
    { id: 'settings', label: 'Configuración',    icon: SettingsIcon },
  ];
  const EDITOR_DOCK = { id: 'editor', label: 'Editor de texto', icon: Code2 };

  const WIN_DEFAULTS = {
    terminal: { top: 40,  left: 60  },
    files:    { top: 30,  left: 90  },
    browser:  { top: 20,  left: 70  },
    settings: { top: 50,  left: 100 },
    editor:   { top: 25,  left: 80  },
  };

  const WIN_TITLES = (id) => ({
    terminal: 'aznar@dev: ~',
    files:    'Archivos — Inicio',
    browser:  'Firefox',
    settings: 'Configuración',
    editor:   `${wins.editor.fileData?.name || 'Sin título'} — Editor`,
  }[id]);

  const wallpaperBg = WALLPAPERS[wallpaper].bg;

  if (screen === 'boot') return (
    <AnimatePresence mode="wait">
      <BootScreen key="boot" onDone={() => setScreen('login')} />
    </AnimatePresence>
  );

  if (screen === 'login') return (
    <AnimatePresence mode="wait">
      <LoginScreen key="login" onLogin={() => setScreen('desktop')} wallpaperBg={wallpaperBg} />
    </AnimatePresence>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden select-none"
      style={{ background: wallpaperBg }}
      onClick={() => setCtxMenu(null)}
      onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
    >
      <TopBar time={time} date={date} onPower={onClose} />

      <div className="flex-1 flex overflow-hidden">
        {/* Dock */}
        <div className={`${isMobile ? 'w-12' : 'w-14'} bg-black/55 flex flex-col items-center py-3 gap-2 z-40 backdrop-blur-sm flex-shrink-0`}>
          {DOCK_APPS.map(app => (
            <DockIcon
              key={app.id}
              icon={app.icon}
              label={app.label}
              isOpen={wins[app.id].open}
              isFocused={focused === app.id}
              isMinimized={wins[app.id].min}
              onClick={() => {
                if (!wins[app.id].open) openApp(app.id);
                else if (wins[app.id].min) restoreApp(app.id);
                else if (focused === app.id) minApp(app.id);
                else focusWin(app.id);
              }}
            />
          ))}

          {wins.editor.open && (
            <DockIcon
              icon={EDITOR_DOCK.icon}
              label={EDITOR_DOCK.label}
              isOpen
              isFocused={focused === 'editor'}
              isMinimized={wins.editor.min}
              onClick={() => {
                if (wins.editor.min) restoreApp('editor');
                else if (focused === 'editor') minApp('editor');
                else focusWin('editor');
              }}
            />
          )}

          <div className="my-1 border-b border-white/15 w-8" />

          {/* Power / close shortcut at bottom */}
          <div className="mt-auto mb-1">
            <DockIcon icon={Power} label="Salir de Ubuntu" isOpen={false} isFocused={false} isMinimized={false} onClick={onClose} />
          </div>
        </div>

        {/* Desktop area */}
        <div
          className="flex-1 relative overflow-hidden"
          onClick={() => setCtxMenu(null)}
        >
          {/* Desktop icons top-right */}
          <div className="absolute top-4 right-4 flex flex-col gap-5">
            <DesktopIcon icon={FolderOpen}    label="Proyectos" onClick={() => openApp('files')} />
            <DesktopIcon icon={TerminalSquare} label="Terminal"  onClick={() => openApp('terminal')} />
          </div>

          {/* Context menu */}
          <AnimatePresence>
            {ctxMenu && (
              <ContextMenu
                key="ctx"
                x={ctxMenu.x}
                y={ctxMenu.y}
                onClose={() => setCtxMenu(null)}
                onNewTerminal={() => openApp('terminal')}
                onSettings={() => openApp('settings')}
              />
            )}
          </AnimatePresence>

          {/* Windows */}
          <AnimatePresence>
            {Object.entries(wins).map(([id, win]) => {
              if (!win.open || win.min) return null;
              const def = WIN_DEFAULTS[id];
              return (
                <Window
                  key={id}
                  id={id}
                  title={WIN_TITLES(id)}
                  zIndex={zMap[id]}
                  isFocused={focused === id}
                  isMaximized={win.max}
                  isMobile={isMobile}
                  defaultTop={def.top}
                  defaultLeft={def.left}
                  onFocus={() => focusWin(id)}
                  onClose={() => closeApp(id)}
                  onMinimize={() => minApp(id)}
                  onMaximize={() => toggleMax(id)}
                >
                  {id === 'terminal' && <TerminalWindow onClose={() => closeApp(id)} isEmbedded />}
                  {id === 'files'    && <FilesApp onOpenFile={(f) => openApp('editor', f)} lang={lang} />}
                  {id === 'browser'  && <BrowserApp lang={lang} />}
                  {id === 'settings' && <SettingsApp wallpaper={wallpaper} onWallpaper={setWallpaper} />}
                  {id === 'editor'   && <EditorApp file={win.fileData} />}
                </Window>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
