import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalWindow } from '@/components/layout/Terminal';
import { TerminalSquare, FolderOpen, Globe, Settings as SettingsIcon, Power, Code2, Palette, Gamepad2, Activity, Calculator as CalcIcon, StickyNote as StickyNoteIcon, Bomb, Bug, Blocks, Shell, Music, Cloud, Sparkles, LayoutGrid, Hand } from 'lucide-react';
import { AppDrawer } from './ubuntu/AppDrawer';
import { MusicPlayer } from './ubuntu/MusicPlayer';
import { WeatherApp } from './ubuntu/WeatherApp';
import { Screensaver } from './ubuntu/Screensaver';
import { useLang } from '@/contexts/LanguageContext';
import { useSoundEffects } from '@/contexts/SoundContext';
import { site } from '@/data/site';
import { BrowserApp } from './ubuntu/apps/BrowserApp';
import { Calculator } from './ubuntu/apps/Calculator';
import { DoomApp } from './ubuntu/apps/DoomApp';
import { PlaygroundApp } from './ubuntu/apps/PlaygroundApp';
import { ProjectsApp } from './ubuntu/apps/ProjectsApp';
import { WelcomeApp } from './ubuntu/apps/WelcomeApp';
import { EditorApp } from './ubuntu/apps/EditorApp';
import { FilesApp } from './ubuntu/apps/FilesApp';
import { MinesweeperGame } from './ubuntu/apps/MinesweeperGame';
import { NotesApp } from './ubuntu/apps/NotesApp';
import { PaintApp } from './ubuntu/apps/PaintApp';
import { PdfViewerApp } from './ubuntu/apps/PdfViewerApp';
import { SettingsApp } from './ubuntu/apps/SettingsApp';
import { SnakeGame } from './ubuntu/apps/SnakeGame';
import { SystemMonitor } from './ubuntu/apps/SystemMonitor';
import { TetrisGame } from './ubuntu/apps/TetrisGame';
import { BootScreen } from './ubuntu/screens/BootScreen';
import { LoginScreen } from './ubuntu/screens/LoginScreen';
import { PanicScreen } from './ubuntu/screens/PanicScreen';
import { SuspendScreen } from './ubuntu/screens/SuspendScreen';
import { DesktopIcon, ContextMenu, DesktopClock, StickyNote } from './ubuntu/shell/Desktop';
import { NOTE_COLORS } from './ubuntu/constants';
import { DockIcon, DockContextMenu } from './ubuntu/shell/Dock';
import { NotifCenter, NotifToast } from './ubuntu/shell/Notifications';
import { AltTabSwitcher, ScreenshotPreviewToast, RunDialog, ShortcutsHelp } from './ubuntu/shell/Overlays';
import { QuickPanel } from './ubuntu/shell/QuickPanel';
import { CalendarPopup, PowerMenu, TopBar } from './ubuntu/shell/TopBar';
import { useWeather } from './ubuntu/useWeather';
import { Window } from './ubuntu/shell/Window';
import { WALLPAPERS } from './ubuntu/wallpapers';

// Full boot sequence only the first time per session; afterwards straight to login
const BOOTED_KEY = 'ubuntu_booted';
const hasBooted = () => { try { return sessionStorage.getItem(BOOTED_KEY) === '1'; } catch { return false; } };

export function UbuntuOS({ onClose }) {
  const { playOpenApp, playClick, playCloseApp, playSwipe, isMuted, toggleMute } = useSoundEffects();
  const { lang } = useLang();
  const weather = useWeather();
  const [screen,   setScreen]   = useState(() => (hasBooted() ? 'login' : 'boot'));
  const [wallpaper, setWallpaper] = useState(0);
  const desktopRef = useRef(null);
  const osRootRef = useRef(null);

  const [wins, setWins] = useState({
    terminal: { open: true,  min: false, max: false },
    welcome:  { open: false, min: false, max: false },
    projects: { open: false, min: false, max: false },
    files:    { open: false, min: false, max: false },
    browser:  { open: false, min: false, max: false },
    settings: { open: false, min: false, max: false },
    editor:   { open: false, min: false, max: false, fileData: null },
    monitor:  { open: false, min: false, max: false },
    snake:    { open: false, min: false, max: false },
    mines:    { open: false, min: false, max: false },
    calc:     { open: false, min: false, max: false },
    tetris:   { open: false, min: false, max: false },
    notes:    { open: false, min: false, max: false },
    doom:     { open: false, min: false, max: false },
    paint:    { open: false, min: false, max: false },
    music:    { open: false, min: false, max: false },
    weather:  { open: false, min: false, max: false },
    pdf:      { open: false, min: false, max: false },
    playground: { open: false, min: false, max: false },
  });
  const [focused, setFocused] = useState('terminal');
  const zRef = useRef(100);
  const [zMap, setZMap] = useState({ terminal:15, files:14, browser:13, settings:12, editor:11, monitor:10, snake:9, mines:8, calc:7, tetris:6, notes:5, doom:4, paint:3, music:2, weather:1, pdf:0, playground:0, projects:0, welcome:0 });
  const [ctxMenu,    setCtxMenu]    = useState(null);
  const [gamePicker, setGamePicker] = useState(false);
  const [powerMenu,  setPowerMenu]  = useState(false);
  const [appDrawer,  setAppDrawer]  = useState(false);
  const [suspended,  setSuspended]  = useState(false);
  const [screensaver, setScreensaver] = useState(false);
  const inactivityRef = useRef(null);
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [notifs, setNotifs] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const [workspace,    setWorkspace]    = useState(0);
  const [winWorkspace, setWinWorkspace] = useState({});
  const [quickPanel, setQuickPanel] = useState(false);
  const [wifiOn,     setWifiOn]     = useState(true);
  const [btOn,       setBtOn]       = useState(false);
  const [volume,     setVolume]     = useState(80);
  const [altTabOpen, setAltTabOpen] = useState(false);
  const [altTabIdx,  setAltTabIdx]  = useState(0);
  const altTabCtxRef = useRef(null);
  const [calOpen,           setCalOpen]           = useState(false);
  const [runOpen,           setRunOpen]           = useState(false);
  const [notifCenter,       setNotifCenter]       = useState(false);
  const [unread,            setUnread]            = useState(0);
  const [notifHistory,      setNotifHistory]      = useState([]);
  const [dockCtx,           setDockCtx]           = useState(null);
  const [shortcutsOpen,     setShortcutsOpen]     = useState(false);
  const [stickyNotes,       setStickyNotes]       = useState([]);
  const [dnd,               setDnd]               = useState(false);
  const dndRef = useRef(false);
  const [showClock,         setShowClock]         = useState(false);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const addNotif = useCallback((title, body) => {
    const id = Date.now();
    if (!dndRef.current) setNotifs(ns => [...ns, { id, title, body }]);
    setNotifHistory(hs => [...hs, { id, title, body }]);
    setUnread(c => c + 1);
  }, []);
  const removeNotif = useCallback((id) => setNotifs(ns => ns.filter(n => n.id !== id)), []);

  const takeScreenshot = useCallback(async () => {
    if (!osRootRef.current) return;
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(osRootRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
      });
      const url = canvas.toDataURL('image/png');
      setScreenshotPreview(url);
    } catch {
      addNotif('Error', 'No se pudo capturar la pantalla');
    }
  }, [addNotif]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  useEffect(() => { document.body.classList.add('ubuntu-mode'); return () => document.body.classList.remove('ubuntu-mode'); }, []);
  useEffect(() => {
    const update = () => {
      const n = new Date();
      setTime(n.toLocaleTimeString(lang==='es'?'es-ES':'en-US', { hour:'2-digit', minute:'2-digit' }));
      setDate(n.toLocaleDateString(lang==='es'?'es-ES':'en-US', { month:'short', day:'numeric', weekday:'short' }));
    };
    update(); const id = setInterval(update, 1000); return () => clearInterval(id);
  }, [lang]);

  // Listen for kernel panic event
  useEffect(() => {
    const handler = () => setScreen('panic');
    window.addEventListener('ubuntu-kernel-panic', handler);
    return () => window.removeEventListener('ubuntu-kernel-panic', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'PrintScreen') { e.preventDefault(); takeScreenshot(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [takeScreenshot]);

  // Listen for terminal "open <app>" commands
  const openAppRef = useRef(null);
  useEffect(() => {
    const handler = (e) => openAppRef.current?.(e.detail?.app);
    window.addEventListener('ubuntu-open-app', handler);
    return () => window.removeEventListener('ubuntu-open-app', handler);
  }, []);

  useEffect(() => {
    if (screen !== 'desktop') return;
    const handler = (e) => {
      if (e.metaKey && e.key === 'l') {
        e.preventDefault();
        setScreen('login');
        return;
      }
      if (e.key === 'Meta' || e.key === 'Super') {
        e.preventDefault();
        setAppDrawer(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.ctrlKey || !e.altKey) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); setWorkspace(w => (w + 1) % 4); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setWorkspace(w => (w + 3) % 4); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Sync DND state to ref for use in callbacks
  useEffect(() => { dndRef.current = dnd; }, [dnd]);

  // Alt+Tab window switcher
  useEffect(() => {
    if (screen !== 'desktop') return;
    const st = { open: false, idx: 0 };
    const onKeyDown = (e) => {
      if (e.altKey && e.key === 'Tab') {
        e.preventDefault();
        const { wins, focused, ALL_APPS } = altTabCtxRef.current;
        const open = ALL_APPS.filter(a => wins[a.id]?.open);
        if (open.length < 1) return;
        if (!st.open) {
          const fi = open.findIndex(a => a.id === focused);
          const ni = open.length > 1 ? (fi + 1) % open.length : fi;
          st.open = true; st.idx = ni;
          setAltTabOpen(true); setAltTabIdx(ni);
        } else {
          const ni = (st.idx + 1) % open.length;
          st.idx = ni; setAltTabIdx(ni);
        }
      }
      if (e.key === 'Escape' && st.open) {
        st.open = false; setAltTabOpen(false);
      }
    };
    const onKeyUp = (e) => {
      if (e.key === 'Alt' && st.open) {
        const { wins, ALL_APPS, focusWin, restoreApp } = altTabCtxRef.current;
        const open = ALL_APPS.filter(a => wins[a.id]?.open);
        const sel = open[st.idx];
        if (sel) { if (wins[sel.id]?.min) restoreApp(sel.id); else focusWin(sel.id); }
        st.open = false; setAltTabOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [screen]);

  // Alt+F2 run dialog
  useEffect(() => {
    if (screen !== 'desktop') return;
    const handler = (e) => { if (e.altKey && e.key === 'F2') { e.preventDefault(); setRunOpen(v => !v); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen]);

  // Ctrl+? keyboard shortcuts help
  useEffect(() => {
    const handler = (e) => { if (e.ctrlKey && e.key === '?') { e.preventDefault(); setShortcutsOpen(v => !v); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const addStickyNote = useCallback((x, y) => {
    setStickyNotes(ns => [...ns, { id: Date.now(), x, y, text: '', color: NOTE_COLORS[ns.length % NOTE_COLORS.length] }]);
  }, []);
  const updateStickyNote = useCallback((id, text, color) => {
    setStickyNotes(ns => ns.map(n => n.id === id ? { ...n, text, color } : n));
  }, []);
  const deleteStickyNote = useCallback((id) => {
    setStickyNotes(ns => ns.filter(n => n.id !== id));
  }, []);

  const focusWin = (id) => { zRef.current += 1; setZMap(p => ({ ...p, [id]: zRef.current })); setFocused(id); };
  const openApp  = (id, fileData = null) => { playOpenApp(); setWins(p => ({ ...p, [id]: { ...p[id], open: true, min: false, ...(fileData !== null ? { fileData } : {}) } })); setWinWorkspace(p => ({ ...p, [id]: workspace })); focusWin(id); };
  const closeApp = (id) => { playCloseApp(); if (id === 'music') setNowPlaying(null); setWins(p => ({ ...p, [id]: { ...p[id], open: false, min: false } })); };
  const minApp   = (id) => { playSwipe(); setWins(p => ({ ...p, [id]: { ...p[id], min: true } })); };
  const toggleMax = (id) => { playClick(); setWins(p => ({ ...p, [id]: { ...p[id], max: !p[id].max } })); };
  const restoreApp = (id) => { playClick(); setWins(p => ({ ...p, [id]: { ...p[id], min: false } })); focusWin(id); };

  // Power actions
  const handleRestart = () => {
    setPowerMenu(false);
    setScreen('boot');
    setWins(p => Object.fromEntries(Object.keys(p).map(k => [k, { ...p[k], open: false, min: false, max: false }])));
  };
  const handleSuspend = () => { setPowerMenu(false); setSuspended(true); };
  const handleWake    = () => setSuspended(false);

  useEffect(() => {
    if (screen !== 'desktop' || suspended) return;
    const INACTIVITY_MS = 45_000;
    const reset = () => {
      if (screensaver) return;
      clearTimeout(inactivityRef.current);
      inactivityRef.current = setTimeout(() => setScreensaver(true), INACTIVITY_MS);
    };
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll', 'ubuntu-user-activity'];
    events.forEach(ev => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, reset));
      clearTimeout(inactivityRef.current);
    };
  }, [screen, suspended, screensaver]);

  const DOCK_APPS = [
    { id: 'projects', label: 'Proyectos',       icon: LayoutGrid },
    { id: 'terminal', label: 'Terminal',        icon: TerminalSquare },
    { id: 'files',    label: 'Archivos',         icon: FolderOpen },
    { id: 'browser',  label: 'Firefox',          icon: Globe },
    { id: 'notes',    label: 'Notas',            icon: StickyNoteIcon },
    { id: 'paint',    label: 'Pinta',            icon: Palette },
    { id: 'monitor',  label: 'Monitor del sist.',icon: Activity },
    { id: 'calc',     label: 'Calculadora',      icon: CalcIcon },
    { id: 'settings', label: 'Configuración',    icon: SettingsIcon },
    { id: 'music',    label: 'Rhythmbox',         icon: Music },
    { id: 'weather',  label: 'Clima',             icon: Cloud },
    { id: 'playground', label: 'Playground',      icon: Sparkles },
  ];
  const GAME_DOCK = [
    { id: 'snake',  label: 'Snake',       icon: Bug },
    { id: 'mines',  label: 'Buscaminas',  icon: Bomb },
    { id: 'tetris', label: 'Tetris',      icon: Blocks },
    { id: 'doom',   label: 'DOOM',        icon: Shell },
  ];

  // Latest-value refs read by long-lived listeners above
  useEffect(() => {
    openAppRef.current = (id) => { if (id && wins[id] !== undefined) openApp(id); };
  });
  useEffect(() => {
    altTabCtxRef.current = { wins, focused, focusWin, restoreApp, ALL_APPS: [...DOCK_APPS, ...GAME_DOCK] };
  });

  const ALL_APPS = [...DOCK_APPS, ...GAME_DOCK];

  const WIN_CFG = {
    terminal: { title: 'aznar@dev: ~',                     w: 750, h: 490, top: 40,  left: 60  },
    welcome:  { title: 'Bienvenido',                        w: 640, h: 540, top: 30,  left: 180 },
    projects: { title: 'Proyectos',                         w: 820, h: 560, top: 25,  left: 110 },
    files:    { title: 'Archivos — Inicio',                 w: 780, h: 510, top: 30,  left: 90  },
    browser:  { title: 'Firefox',                           w: 820, h: 530, top: 20,  left: 70  },
    settings: { title: 'Configuración',                     w: 680, h: 490, top: 50,  left: 110 },
    editor:   { title: `${wins.editor.fileData?.name || 'Untitled'} — Editor`, w: 720, h: 490, top: 25, left: 80 },
    monitor:  { title: 'Monitor del sistema',               w: 760, h: 500, top: 35,  left: 65  },
    snake:    { title: 'Snake',                             w: 460, h: 560, top: 45,  left: 200 },
    mines:    { title: 'Minesweeper',                       w: 360, h: 500, top: 45,  left: 240 },
    calc:     { title: 'Calculadora',                       w: 320, h: 560, top: 60,  left: 300 },
    tetris:   { title: 'Tetris',                            w: 420, h: 580, top: 30,  left: 180 },
    notes:    { title: 'Notas',                             w: 620, h: 460, top: 40,  left: 100 },
    doom:     { title: 'DOOM Shareware 1993',                w: 780, h: 560, top: 20,  left: 100 },
    paint:    { title: 'Pinta',                             w: 720, h: 520, top: 30,  left: 80  },
    music:    { title: 'Rhythmbox — Music Player',          w: 440, h: 620, top: 35,  left: 150 },
    weather:  { title: 'Clima',                             w: 360, h: 480, top: 40,  left: 170 },
    pdf:      { title: 'ResumeVicenteAznar.pdf',            w: 720, h: 560, top: 30,  left: 90  },
    playground: { title: 'Playground',                      w: 720, h: 540, top: 30,  left: 120 },
  };

  const handleDockClick = (id) => {
    if (!wins[id].open) openApp(id);
    else if (wins[id].min) restoreApp(id);
    else if (focused === id) minApp(id);
    else focusWin(id);
  };

  const wallpaperBg = WALLPAPERS[wallpaper].bg;

  if (screen === 'panic') return (
    <AnimatePresence mode="wait">
      <PanicScreen key="panic" onDone={() => {
        setScreen('boot');
        setWins(p => Object.fromEntries(Object.keys(p).map(k => [k, { ...p[k], open: false }])));
      }} />
    </AnimatePresence>
  );
  const finishBoot = () => {
    try { sessionStorage.setItem(BOOTED_KEY, '1'); } catch { /* storage blocked */ }
    setScreen('login');
  };
  const handleLogin = () => {
    setScreen('desktop');
    setTimeout(() => openApp('welcome'), 450);
    setTimeout(() => addNotif('Sesión iniciada', `Hola, soy ${site.name.split(' ')[0]}. Explorá lo que quieras.`), 900);
  };

  if (screen === 'boot')  return <AnimatePresence mode="wait"><BootScreen  key="boot"  onDone={finishBoot} /></AnimatePresence>;
  if (screen === 'login') return <AnimatePresence mode="wait"><LoginScreen key="login" onLogin={handleLogin} wallpaperBg={wallpaperBg} /></AnimatePresence>;

  return (
    <motion.div ref={osRootRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden select-none"
      style={{ background: wallpaperBg }}
      onClick={() => { setCtxMenu(null); setQuickPanel(false); setCalOpen(false); setNotifCenter(false); setDockCtx(null); }}
      onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
    >
      <TopBar time={time} date={date} onExit={onClose} onPower={() => setPowerMenu(true)} onActivities={() => setAppDrawer(v => !v)} nowPlaying={nowPlaying} workspace={workspace} onWorkspaceChange={(w) => { if (w !== workspace) playSwipe(); setWorkspace(w); }} onScreenshot={takeScreenshot} weather={weather} onWeatherClick={() => openApp('weather')} onTrayClick={() => setQuickPanel(v => !v)} onCalendarClick={() => { setCalOpen(v => !v); setNotifCenter(false); }} onBellClick={() => { setNotifCenter(v => !v); setCalOpen(false); setUnread(0); }} unread={unread} />

      {/* Quick settings panel */}
      <AnimatePresence>
        {quickPanel && (
          <QuickPanel
            key="quick-panel"
            wifiOn={wifiOn} onWifi={() => setWifiOn(v => !v)}
            btOn={btOn}     onBt={() => setBtOn(v => !v)}
            isMuted={isMuted} toggleMute={toggleMute}
            onLock={() => setScreen('login')}
            onClose={() => setQuickPanel(false)}
            volume={volume} onVolume={setVolume}
            dnd={dnd} onDnd={() => setDnd(v => !v)}
          />
        )}
      </AnimatePresence>

      {/* Alt+Tab switcher */}
      <AnimatePresence>
        {altTabOpen && (() => {
          const openApps = [...DOCK_APPS, ...GAME_DOCK].filter(a => wins[a.id]?.open);
          return openApps.length > 0 ? (
            <AltTabSwitcher key="alt-tab" apps={openApps} selectedIdx={altTabIdx} />
          ) : null;
        })()}
      </AnimatePresence>

      {/* Calendar popup */}
      <AnimatePresence>
        {calOpen && <CalendarPopup key="cal" />}
      </AnimatePresence>

      {/* Notification center */}
      <AnimatePresence>
        {notifCenter && (
          <NotifCenter key="notif-center" history={notifHistory} onClear={() => setNotifHistory([])} />
        )}
      </AnimatePresence>

      {/* Run dialog */}
      <AnimatePresence>
        {runOpen && (
          <RunDialog key="run" apps={[...DOCK_APPS, ...GAME_DOCK]} onOpen={id => openApp(id)} onClose={() => setRunOpen(false)} />
        )}
      </AnimatePresence>

      {/* Shortcuts help */}
      <AnimatePresence>
        {shortcutsOpen && <ShortcutsHelp key="shortcuts" onClose={() => setShortcutsOpen(false)} />}
      </AnimatePresence>

      {/* Dock context menu */}
      <AnimatePresence>
        {dockCtx && (
          <DockContextMenu
            key="dock-ctx"
            appLabel={dockCtx.label}
            isOpen={wins[dockCtx.id]?.open}
            isMin={wins[dockCtx.id]?.min}
            x={dockCtx.x} y={dockCtx.y}
            onOpen={() => openApp(dockCtx.id)}
            onMinimize={() => minApp(dockCtx.id)}
            onCloseApp={() => closeApp(dockCtx.id)}
            onDismiss={() => setDockCtx(null)}
          />
        )}
      </AnimatePresence>

      {/* Notification toasts */}
      <div className="absolute top-9 right-3 z-[2000] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifs.map(n => (
            <div key={n.id} className="pointer-events-auto">
              <NotifToast id={n.id} title={n.title} body={n.body} onDismiss={() => removeNotif(n.id)} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Screenshot preview toast */}
      <AnimatePresence>
        {screenshotPreview && (
          <div className="absolute top-9 right-3 z-[2100]">
            <ScreenshotPreviewToast url={screenshotPreview} onDismiss={() => setScreenshotPreview(null)} />
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex overflow-hidden">
        {/* Dock */}
        <div className={`${isMobile ? 'w-12' : 'w-14'} bg-black/55 flex flex-col items-center py-2 gap-1 z-40 backdrop-blur-sm flex-shrink-0 overflow-y-auto`}
          style={{ scrollbarWidth: 'none' }}
        >
          {DOCK_APPS.map(app => (
            <DockIcon key={app.id} icon={app.icon} label={app.label}
              isOpen={wins[app.id].open} isFocused={focused===app.id} isMinimized={wins[app.id].min}
              onClick={() => handleDockClick(app.id)}
              onRightClick={e => setDockCtx({ id: app.id, label: app.label, x: e.clientX, y: e.clientY })}
            />
          ))}

          <div className="my-1 border-b border-white/15 w-8" />

          <div className="text-[9px] text-white/25 font-mono uppercase tracking-wider px-1 text-center leading-tight">Games</div>
          {GAME_DOCK.map(app => (
            <DockIcon key={app.id} icon={app.icon} label={app.label}
              isOpen={wins[app.id].open} isFocused={focused===app.id} isMinimized={wins[app.id].min}
              onClick={() => handleDockClick(app.id)}
              onRightClick={e => setDockCtx({ id: app.id, label: app.label, x: e.clientX, y: e.clientY })}
            />
          ))}

          {wins.editor.open && (
            <>
              <div className="my-1 border-b border-white/15 w-8" />
              <DockIcon icon={Code2} label="Editor de texto"
                isOpen isFocused={focused==='editor'} isMinimized={wins.editor.min}
                onClick={() => handleDockClick('editor')}
              />
            </>
          )}

          <div className="mt-auto mb-1">
            <DockIcon icon={Power} label="Menú de apagado" isOpen={false} isFocused={false} isMinimized={false} onClick={() => setPowerMenu(true)} />
          </div>
        </div>

        {/* Desktop */}
        <div ref={desktopRef} className="flex-1 relative overflow-hidden"
          onClick={() => { setCtxMenu(null); setGamePicker(false); setQuickPanel(false); setDockCtx(null); }}
          onDoubleClick={e => {
            if (e.target !== desktopRef.current) return;
            const rect = desktopRef.current.getBoundingClientRect();
            addStickyNote(e.clientX - rect.left - 85, e.clientY - rect.top - 70);
          }}
        >
          {/* Sticky notes */}
          <AnimatePresence>
            {stickyNotes.map(note => (
              <StickyNote key={note.id} note={note} onChange={updateStickyNote} onDelete={deleteStickyNote} constraintsRef={desktopRef} />
            ))}
          </AnimatePresence>

          {/* Desktop clock widget */}
          <AnimatePresence>
            {showClock && <DesktopClock key="desk-clock" constraintsRef={desktopRef} />}
          </AnimatePresence>

          {/* Main Apps */}
          <DesktopIcon icon={LayoutGrid}     label="Proyectos" top={20}  left={20} constraintsRef={desktopRef} onClick={() => openApp('projects')} />
          <DesktopIcon icon={FolderOpen}     label="Archivos"  top={200} left={200} constraintsRef={desktopRef} onClick={() => openApp('files')} />
          <DesktopIcon icon={Hand}           label="Bienvenida" top={290} left={200} constraintsRef={desktopRef} onClick={() => openApp('welcome')} />
          <DesktopIcon icon={TerminalSquare} label="Terminal"  top={110} left={20} constraintsRef={desktopRef} onClick={() => openApp('terminal')} />
          <DesktopIcon icon={Globe}          label="Firefox" top={200} left={20} constraintsRef={desktopRef} onClick={() => openApp('browser')} />
          <DesktopIcon icon={StickyNoteIcon}  label="Notas"     top={290} left={20} constraintsRef={desktopRef} onClick={() => openApp('notes')} />
          
          {/* Extras / Tools */}
          <DesktopIcon icon={Shell}          label="DOOM"      top={20}  left={110} constraintsRef={desktopRef} onClick={() => openApp('doom')} />
          <DesktopIcon icon={Gamepad2}       label="Juegos"    top={110} left={110} constraintsRef={desktopRef} onClick={() => setGamePicker(v => !v)} />
          <DesktopIcon icon={Palette}        label="Pinta"     top={200} left={110} constraintsRef={desktopRef} onClick={() => openApp('paint')} />
          <DesktopIcon icon={SettingsIcon}   label="Config."   top={290} left={110} constraintsRef={desktopRef} onClick={() => openApp('settings')} />

          <DesktopIcon icon={Music}          label="Música"    top={20}  left={200} constraintsRef={desktopRef} onClick={() => openApp('music')} />
          <DesktopIcon icon={Cloud}          label="Clima"     top={110} left={200} constraintsRef={desktopRef} onClick={() => openApp('weather')} />

          {/* Game Picker overlay */}
          <AnimatePresence>
            {gamePicker && (
              <motion.div
                key="gamepicker"
                initial={{ opacity: 0, scale: 0.9, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -8 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                className="absolute top-16 right-20 z-[300] bg-[#2a2a2a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-3 px-1">Juegos</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id:'snake',  label:'Snake',       icon:Bug,       color:'#4ade80' },
                    { id:'mines',  label:'Buscaminas',  icon:Bomb,      color:'#f87171' },
                    { id:'tetris', label:'Tetris',      icon:Blocks,    color:'#a78bfa' },
                    { id:'doom',   label:'DOOM',        icon:Activity,  color:'#E95420' },
                  ].map(g => (
                    <button key={g.id}
                      onClick={() => { openApp(g.id); setGamePicker(false); }}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-white/10 transition-all group w-24"
                    >
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{ background: `${g.color}18`, border: `1px solid ${g.color}30` }}
                      >
                        <g.icon size={22} style={{ color: g.color }} strokeWidth={1.5} />
                      </div>
                      <span className="text-white/60 text-[11px] font-medium group-hover:text-white transition-colors">{g.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {ctxMenu && (
              <ContextMenu key="ctx" x={ctxMenu.x} y={ctxMenu.y}
                onClose={() => setCtxMenu(null)}
                onNewTerminal={() => openApp('terminal')}
                onSettings={() => openApp('settings')}
                showClock={showClock}
                onToggleClock={() => setShowClock(v => !v)}
              />
            )}
          </AnimatePresence>

          {/* Windows stay mounted across minimize and workspace switches so app
              state survives; inactive ones are hidden by the Window itself */}
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {Object.entries(wins).map(([id, win]) => {
                if (!win.open) return null;
                const cfg = WIN_CFG[id];
                const hidden = win.min || (winWorkspace[id] ?? 0) !== workspace;
                return (
                  <Window key={id} title={id === 'editor' ? `${win.fileData?.name || 'Untitled'} — Editor` : cfg.title}
                    zIndex={zMap[id]} isFocused={focused===id} isMaximized={win.max} isMobile={isMobile}
                    defaultTop={cfg.top} defaultLeft={cfg.left} defaultW={cfg.w} defaultH={cfg.h}
                    onFocus={() => focusWin(id)} onClose={() => closeApp(id)} onMinimize={() => minApp(id)} onMaximize={() => toggleMax(id)}
                    isHidden={hidden}
                  >
                    {id === 'terminal' && <TerminalWindow onClose={() => closeApp(id)} isEmbedded />}
                    {id === 'files'    && <FilesApp onOpenFile={(f) => { if (f.isPdf) openApp('pdf'); else openApp('editor', f); }} lang={lang} />}
                    {id === 'browser'  && <BrowserApp lang={lang} />}
                    {id === 'settings' && <SettingsApp wallpaper={wallpaper} onWallpaper={setWallpaper} />}
                    {id === 'editor'   && <EditorApp file={win.fileData} />}
                    {id === 'pdf'      && <PdfViewerApp lang={lang} />}
                    {id === 'monitor'  && <SystemMonitor />}
                    {id === 'snake'    && <SnakeGame />}
                    {id === 'mines'    && <MinesweeperGame />}
                    {id === 'calc'     && <Calculator />}
                    {id === 'tetris'   && <TetrisGame />}
                    {id === 'notes'    && <NotesApp />}
                    {id === 'doom'     && <DoomApp />}
                    {id === 'paint'    && <PaintApp />}
                    {id === 'music'    && <MusicPlayer onNowPlaying={setNowPlaying} />}
                    {id === 'weather'  && <WeatherApp />}
                    {id === 'playground' && <PlaygroundApp />}
                    {id === 'projects' && <ProjectsApp lang={lang} />}
                    {id === 'welcome'  && <WelcomeApp onOpen={(app) => (app === 'games' ? setGamePicker(true) : openApp(app))} onExit={onClose} />}
                  </Window>
                );
              })}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {appDrawer && (
              <AppDrawer
                key="app-drawer"
                apps={ALL_APPS}
                onOpen={(id) => openApp(id)}
                onClose={() => setAppDrawer(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Power menu overlay */}
      <AnimatePresence>
        {powerMenu && (
          <PowerMenu
            key="power-menu"
            onShutdown={onClose}
            onRestart={handleRestart}
            onSuspend={handleSuspend}
            onCancel={() => setPowerMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* Suspend screen overlay */}
      <AnimatePresence>
        {suspended && (
          <SuspendScreen key="suspend" onWake={handleWake} />
        )}
      </AnimatePresence>

      {/* Screensaver */}
      <AnimatePresence>
        {screensaver && !suspended && (
          <Screensaver key="screensaver" onWake={() => setScreensaver(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
