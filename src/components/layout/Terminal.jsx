import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { site } from '@/data/site'
import { useLang } from '@/contexts/LanguageContext'

const PROMPT = 'aznar@portfolio:~$'

const COMMANDS = {
  help: () => [
    '  Available commands:',
    '  ─────────────────────────────────────────',
    '  whoami          Identity & role',
    '  skills          Technical stack',
    '  ls projects     List all projects',
    '  contact         Contact information',
    '  cat about.txt   Bio',
    '  clear           Clear terminal',
    '  exit            Close terminal',
    '',
  ],
  whoami: () => [
    '  Vicente Aznar',
    '  Full Stack Developer — React · Django · Oracle Cloud',
    '  Argentina, open to remote & relocation.',
    '',
  ],
  skills: () => [
    '  CORE STACK',
    '  Frontend  →  React, Vite, Tailwind CSS, Motion',
    '  Backend   →  Django REST Framework, Python',
    '  Database  →  PostgreSQL, SQL',
    '  Cloud     →  Oracle Cloud, Nginx, SSL/TLS',
    '',
    '  LAB',
    '  Hardware  →  Arduino, Raspberry Pi, MQTT, C/C++',
    '  Academic  →  Haskell, Prolog (functional / logic)',
    '',
  ],
  'ls projects': () => [
    '  drwxr-xr-x  utn-hub        [React · Django · PostgreSQL · OCI]  ★ featured',
    '  drwxr-xr-x  agv-studio      [React · Django]  in-development',
    '  drwxr-xr-x  esp32-monitor   [C/C++ · MQTT · Django]  lab',
    '  drwxr-xr-x  pytask-cli      [Python · Rich · SQLite]  completed',
    '',
  ],
  ls: () => COMMANDS['ls projects'](),
  contact: () => [
    `  Email    →  ${site.email}`,
    `  LinkedIn →  linkedin.com/in/vicente-aznar-dev`,
    `  GitHub   →  github.com/YOUR_GITHUB`,
    '',
  ],
  'cat about.txt': () => [
    '  Full Stack Developer with real corporate experience building systems',
    '  end-to-end — from React interfaces to Django APIs, PostgreSQL schemas,',
    '  and Oracle Cloud infrastructure. Currently studying Systems Engineering',
    '  at UTN (Haskell, Prolog, SDLC). Interested in IoT/hardware integration.',
    '',
  ],
}

function processCommand(raw) {
  const cmd = raw.trim().toLowerCase()
  if (!cmd) return []
  if (COMMANDS[cmd]) return COMMANDS[cmd]()
  return [`  command not found: ${cmd}  (type 'help' for available commands)`, '']
}

export function Terminal({ onClose }) {
  const [lines,   setLines]   = useState([
    '  Welcome to aznar-dev terminal  v1.0.0',
    `  Type ${'help'} for available commands.`,
    '',
  ])
  const [input,   setInput]   = useState('')
  const [history, setHistory] = useState([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = useCallback(() => {
    if (!input.trim()) return
    const cmd   = input.trim()
    const out   = processCommand(cmd)
    setLines(prev => [...prev, `${PROMPT} ${cmd}`, ...out])
    setHistory(h => [cmd, ...h])
    setHistIdx(-1)
    setInput('')
  }, [input])

  const handleKey = (e) => {
    if (e.key === 'Enter') { submit(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.min(i + 1, history.length - 1)
        setInput(history[next] ?? '')
        return next
      })
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.max(i - 1, -1)
        setInput(next === -1 ? '' : history[next] ?? '')
        return next
      })
      return
    }
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setLines([])
    }
  }

  const handleClear = () => setLines([])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 24 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9000,
      }}
    >
      {/* Backdrop */}
      <div
        style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      />

      {/* Terminal window */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '680px',
          margin: '0 16px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: '#0a0a0f',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          overflow: 'hidden',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* Title bar */}
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

        {/* Output */}
        <div
          style={{ height: '340px', overflowY: 'auto', padding: '16px' }}
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
              onChange={(e) => setInput(e.target.value)}
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
