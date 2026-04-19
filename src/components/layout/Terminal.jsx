import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'
import { useSoundEffects } from '@/contexts/SoundContext'

const PROMPT = 'aznar@portfolio:~$'

const COMMANDS = {
  help: () => [
    '',
    '  Comandos disponibles',
    '  ─────────────────────────────────────────────────────',
    '  whoami            Identity & role',
    '  skills            Technical stack overview',
    '  ls / ls projects  List all projects',
    '  cat about.txt     Bio & background',
    '  cat cv.txt        Resume summary',
    '  contact           Contact information',
    '  neofetch          System info (dev edition)',
    '  fetch repos       Fetch latest public repos from GitHub',
    '  uname -a          OS information',
    '  ps aux            Running processes',
    '  uptime            Session uptime',
    '  date              Current date & time',
    '  open <app>        Open an OS application',
    '  apps              List available apps',
    '  sudo hire         Send a hire request',
    '  clear / Ctrl+L    Clear terminal',
    '  exit / Esc        Close terminal',
    '',
  ],
  apps: () => [
    '',
    '  Aplicaciones disponibles — uso: open <nombre>',
    '  ──────────────────────────────────────────────',
    '  terminal   files     browser   notes     paint',
    '  monitor    calc      settings  editor',
    '  snake      mines     tetris    doom',
    '',
  ],
  whoami: () => [
    '',
    '  Vicente Aznar',
    '  Full Stack Developer — React · Django · Oracle Cloud',
    '  Argentina — open to remote & relocation',
    '',
  ],
  skills: () => [
    '',
    '  ╔══════════════════════════════════════════╗',
    '  ║           TECHNICAL STACK                ║',
    '  ╚══════════════════════════════════════════╝',
    '',
    '  FRONTEND   React 19 · Vite · Tailwind CSS · Motion',
    '  BACKEND    Django REST Framework · Python',
    '  DATABASE   PostgreSQL · SQLite',
    '  CLOUD      Oracle Cloud · Nginx · SSL/TLS',
    '  IOT        ESP32 · Arduino · MQTT · C/C++',
    '  ACADEMIC   Haskell · Prolog',
    '',
  ],
  'ls projects': () => [
    '',
    '  drwxr-xr-x  utn-hub         [React·Django·PostgreSQL·OCI]  ★ featured',
    '  drwxr-xr-x  agv-studio       [React·Django·Tailwind]        in-development',
    '  drwxr-xr-x  esp32-monitor    [C/C++·MQTT·Django·WebSocket]  completed',
    '  drwxr-xr-x  pytask-cli       [Python·Rich·SQLite·Click]     completed',
    '',
    `  4 projects total — use 'contact' to discuss any`,
    '',
  ],
  ls: () => COMMANDS['ls projects'](),
  contact: () => [
    '',
    `  Email     →  ${site.email}`,
    `  LinkedIn  →  linkedin.com/in/vicente-aznar-dev`,
    `  GitHub    →  github.com/Aznar-7`,
    '',
    `  Tip: run 'sudo hire' to send a hire request directly`,
    '',
  ],
  'cat about.txt': () => [
    '',
    '  Full Stack Developer con experiencia real en sistemas corporativos.',
    '  Construyo aplicaciones end-to-end: desde interfaces React hasta APIs',
    '  Django, esquemas PostgreSQL e infraestructura en Oracle Cloud.',
    '',
    '  Actualmente cursando Ingeniería en Sistemas en UTN.',
    '  Interesado en IoT/hardware y arquitecturas escalables.',
    '',
  ],
  'cat cv.txt': () => [
    '',
    '  ══════════════════════════════════════════',
    '  VICENTE AZNAR — Full Stack Developer',
    '  ══════════════════════════════════════════',
    '',
    '  EXPERIENCIA',
    '  Frontend Developer @ Porta Hnos (2025 — Presente)',
    '  · 4+ sistemas corporativos end-to-end (React+Django+PostgreSQL)',
    '  · Reducción del tiempo de gestión interna en 40%',
    '  · Sistema de componentes reutilizables (+30% delivery speed)',
    '',
    '  FORMACIÓN',
    '  Ingeniería en Sistemas — UTN (2021 — Presente)',
    '  · Haskell, Prolog, SDLC, Arquitectura de sistemas',
    '',
    `  Descarga completa: ${site.resumeUrl}`,
    '',
  ],
  neofetch: () => [
    '',
    "         .'::::::::::'.         aznar@ubuntu-dev",
    "       .'  .:++++++++:.  '.     ─────────────────────────",
    "      .  .:++++++++++++:.  .    OS:      Ubuntu 24.04 LTS",
    "     : .:++++++++++++++++:. :   Shell:   bash 5.2",
    "     '.::++++++++++++++::.'     Uptime:  2025 — Presente",
    "      '.::++++++++++::.'        CPU:     Full Stack Dev",
    "        '.::++++++::.'          RAM:     Infinity Coffee",
    "           '.'  '.'             Stack:   React · Django · OCI",
    '',
    '  Colors:  ████ ████ ████ ████ ████ ████',
    '',
  ],
  'uname -a': () => [
    `  Linux aznar-dev 6.8.0-oracle #1 SMP PREEMPT_DYNAMIC Ubuntu — ${new Date().getFullYear()}`,
    '  x86_64 x86_64 x86_64 GNU/Linux (aznar-dev edition)',
    '',
  ],
  'ps aux': () => [
    '',
    '  USER       PID  %CPU  %MEM  COMMAND',
    '  aznar        1   0.0   0.1  /sbin/init',
    '  aznar      420  12.4   8.2  react-vite --dev',
    '  aznar      421   8.1   6.4  django manage.py runserver',
    '  aznar      422   3.2   4.1  postgres -D /var/lib/postgresql',
    '  aznar      423   0.8   1.2  nginx -g "daemon off"',
    '  aznar      999   0.3   0.5  coffee --daemon --infinite',
    '',
  ],
  uptime: () => {
    const now = new Date();
    const start = new Date(2025, 0, 1);
    const days = Math.floor((now - start) / 86400000);
    return [
      `  up ${days} days, load average: 0.42, 0.38, 0.35`,
      '  Sessions: 1   Users: 1   Load OK',
      '',
    ];
  },
  date: () => [
    `  ${new Date().toLocaleString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
    '',
  ],
  'sudo hire': () => {
    window.open(`mailto:${site.email}?subject=We want to hire you!`, '_blank');
    return [
      '',
      '  [sudo] contraseña para aznar: ****',
      '  Autenticación correcta.',
      '  Redirigiendo a protocolo de contratación seguro...',
      '  Iniciando cliente de email...',
      '  ✓ Acceso concedido: Acabas de tomar una gran decisión.',
      '',
    ];
  },
  clear: () => [],
}

const APP_MAP = {
  terminal: 'terminal', files: 'files', archivos: 'files',
  browser: 'browser', firefox: 'browser',
  settings: 'settings', configuracion: 'settings',
  monitor: 'monitor', calculator: 'calc', calculadora: 'calc', calc: 'calc',
  notes: 'notes', notas: 'notes', editor: 'editor',
  snake: 'snake', mines: 'mines', minesweeper: 'mines', tetris: 'tetris',
  doom: 'doom', paint: 'paint', pinta: 'paint',
};

async function processCommand(raw, setLines, onClose) {
  const cmd = raw.trim().toLowerCase()
  if (!cmd) return []
  if (cmd === 'clear') {
    setLines([])
    return null
  }
  if (cmd === 'exit') {
    onClose()
    return null
  }
  if (COMMANDS[cmd]) return COMMANDS[cmd]()

  // Prefix commands
  const parts = cmd.split(/\s+/)
  const base = parts[0]
  const arg  = parts.slice(1).join(' ')

  if (base === 'open') {
    const appId = APP_MAP[arg]
    if (appId) {
      window.dispatchEvent(new CustomEvent('ubuntu-open-app', { detail: { app: appId } }))
      return [`  ✓ Abriendo ${arg}...`, '']
    }
    return [`  open: aplicación no encontrada: '${arg}'`, `  Escribe 'apps' para ver las disponibles`, '']
  }

  if (cmd === 'sudo') {
    return [
      '  usage: sudo <command>',
      '  example: sudo hire'
    ]
  }

  if (cmd === 'sudo rm -rf /') {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('ubuntu-kernel-panic'));
    }, 1200);
    return [
      '  [sudo] contraseña para aznar: ****',
      '  rm: it is dangerous to operate recursively on "/"',
      '  rm: use --no-preserve-root to override this failsafe',
      '  ...',
      '  Eliminando sistema de archivos...',
      '  ██████████████████░░░░ 87%',
      '  !! KERNEL PANIC !!',
      '',
    ];
  }

  if (cmd === 'fetch repos') {
    try {
      setLines(prev => [...prev, `  Fetching public repositories for aznar-dev...`])
      const res = await fetch('https://api.github.com/users/Aznar-7/repos?sort=updated&per_page=5')
      if (!res.ok) throw new Error('API Rate limit or network error')
      const data = await res.json()
      
      const repoLines = data.map(r => {
        const starStr = r.stargazers_count > 0 ? `  ★ ${r.stargazers_count}` : ''
        const langStr = r.language ? `  [${r.language}]` : ''
        return `  ❯ ${r.name.padEnd(20)} ${langStr.padEnd(15)} ${starStr}`
      })
      
      return [
        '',
        '  Recent GitHub Repositories:',
        '  --------------------------',
        ...repoLines,
        '',
        `  View more at ${site.github}`,
        ''
      ]
    } catch (err) {
      return ['  [ERROR] No se pudieron obtener los repositorios. Revisa tu conexión =(', '']
    }
  }

  return [`  command not found: ${cmd}  (type 'help' para comandos disponibles)`, '']
}

export function Terminal({ onClose, isEmbedded = false }) {
  const { playTyping, playClick, playOpenApp } = useSoundEffects()
  const [lines,   setLines]   = useState([
    '  Welcome to aznar-dev terminal  v1.0.0',
    `  Type ${'help'} for available commands.`,
    '',
  ])
  const [input,   setInput]   = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const savedInput = useRef('')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = useCallback(async () => {
    if (!input.trim()) return
    const cmd   = input.trim()
    setHistory(h => [cmd, ...h].slice(0, 100))
    setHistIdx(-1)
    savedInput.current = ''
    setInput('')
    
    // Muestra comanda de inmediato
    setLines(prev => [...prev, `${PROMPT} ${cmd}`])
    
    // check if it's an open command
    if (cmd.startsWith('open ')) {
      playOpenApp()
    } else {
      playClick()
    }

    const out = await processCommand(cmd, setLines, onClose)
    if (out !== null) {
      setLines(prev => [...prev, ...out])
    }
  }, [input, onClose, playClick, playOpenApp])

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') {
      submit();
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      const next = histIdx === -1 ? 0 : Math.min(histIdx + 1, history.length - 1)
      if (histIdx === -1) savedInput.current = input
      setHistIdx(next)
      setInput(history[next])
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (histIdx === -1) return
      const next = histIdx - 1
      if (next < 0) {
        setHistIdx(-1)
        setInput(savedInput.current)
      } else {
        setHistIdx(next)
        setInput(history[next])
      }
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const val = input.toLowerCase().trim()
      if (!val) return
      const ALL_CMDS = [
        ...Object.keys(COMMANDS),
        'open terminal', 'open files', 'open browser', 'open notes',
        'open paint', 'open monitor', 'open calc', 'open settings',
        'open snake', 'open mines', 'open tetris', 'open doom',
        'fetch repos', 'sudo hire', 'sudo rm -rf /',
      ]
      const match = ALL_CMDS.find(c => c.startsWith(val))
      if (match) setInput(match)
      return
    }
    if (e.key === 'Escape') {
      if (onClose) onClose();
      return
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }, [history, histIdx, input, onClose, submit])

  const handleClear = () => setLines([])

  return (
    <motion.div
      initial={isEmbedded ? false : { opacity: 0, scale: 0.96, y: 24 }}
      animate={isEmbedded ? false : { opacity: 1, scale: 1, y: 0 }}
      exit={isEmbedded ? false : { opacity: 0, scale: 0.96, y: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      style={isEmbedded ? { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' } : {
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
      }}
    >
      {/* Backdrop */}
      {!isEmbedded && (
        <div
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        />
      )}

      {/* Terminal window */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: isEmbedded ? '100%' : '680px',
          height: isEmbedded ? '100%' : 'auto',
          margin: isEmbedded ? '0' : '0 16px',
          borderRadius: isEmbedded ? '0 0 12px 12px' : '12px',
          border: isEmbedded ? 'none' : '1px solid rgba(255,255,255,0.1)',
          backgroundColor: '#0a0a0f',
          boxShadow: isEmbedded ? 'none' : '0 32px 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          display: isEmbedded ? 'flex' : 'block',
          flexDirection: 'column',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* Title bar (Only show if not embedded inside the OS Window which has its own) */}
        {!isEmbedded && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            backgroundColor: 'rgba(255,255,255,0.02)',
          }}>
            <button onClick={onClose}    style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff5f57', border: 'none', cursor: 'none' }} />
            <button onClick={handleClear} style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ffbd2e', border: 'none', cursor: 'none' }} />
            <div                          style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#28c840' }} />
            <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
              aznar-dev — bash
            </span>
          </div>
        )}

        {/* Output */}
        <div
          style={{ flex: 1, height: isEmbedded ? '100%' : '340px', overflowY: 'auto', padding: '16px' }}
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: line.startsWith(PROMPT)
                  ? '#9b8cff'
                  : line.startsWith('  command not found')
                  ? '#f87171'
                  : '#8888aa',
                whiteSpace: 'pre',
              }}
            >
              {line}
            </div>
          ))}

          {/* Input row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '13px', color: '#9b8cff', flexShrink: 0 }}>{PROMPT}</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => {
                playTyping()
                setInput(e.target.value)
              }}
              onKeyDown={handleKey}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '13px',
                color: '#e8e8f0',
                fontFamily: 'var(--font-mono)',
                caretColor: '#7c6af7',
                cursor: 'text',
              }}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </motion.div>
  )
}
