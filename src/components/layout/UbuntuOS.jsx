import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls, Reorder } from 'motion/react';
import { Terminal as TerminalWindow } from '@/components/layout/Terminal';
import {
  TerminalSquare, FolderOpen, Globe, Settings as SettingsIcon,
  Power, Wifi, BatteryFull, Volume2, File, Code2,
  ChevronLeft, Info, Palette, HardDrive, ExternalLink,
  Gamepad2, Activity, Calculator as CalcIcon, RefreshCw,
  Grid3x3, StickyNote, Plus, Trash2, Bomb, Bug, Blocks, Grip,
  Rocket, Code, Briefcase, Mail, X, ChevronRight, RotateCw, Star, Menu, Shell,
  Moon, Search, Music, Camera, Cloud
} from 'lucide-react';
import React from 'react';
import html2canvas from 'html2canvas';
import { AppDrawer } from '@/components/layout/ubuntu/AppDrawer';
import { MusicPlayer } from '@/components/layout/ubuntu/MusicPlayer';
import { WeatherApp } from '@/components/layout/ubuntu/WeatherApp';
import { Screensaver } from '@/components/layout/ubuntu/Screensaver';
import { useLang } from '@/contexts/LanguageContext';
import { useSoundEffects } from '@/contexts/SoundContext';
import { site } from '@/data/site';
import { projects } from '@/data/projects';
import { skillsData } from '@/data/skills';
import { experience, academic } from '@/data/experience';

// ── Wallpapers ────────────────────────────────────────────────────
const WALLPAPERS = [
  { name: 'Jammy',   bg: 'linear-gradient(135deg,#E95420 0%,#77216F 100%)' },
  { name: 'Night',   bg: 'linear-gradient(160deg,#0a0a0f 0%,#1a1040 50%,#0a0a18 100%)' },
  { name: 'Ocean',   bg: 'linear-gradient(135deg,#0a1628 0%,#1a3a6a 50%,#0a2040 100%)' },
  { name: 'Forest',  bg: 'linear-gradient(135deg,#0d2010 0%,#1a4020 50%,#0d2a10 100%)' },
  { name: 'Crimson', bg: 'linear-gradient(135deg,#1a0505 0%,#5a1010 50%,#1a0505 100%)' },
];

// ── Virtual Filesystem ────────────────────────────────────────────
function buildFS(lang) {
  const l = (v) => (v && typeof v === 'object' ? (v[lang] ?? v.es ?? '') : v ?? '');

  const readmes = {
    'utn-hub': `# UTN Hub\n\n> Sistema web complejo para la comunidad universitaria UTN\n\n## Stack\n\n| Layer | Technology |\n|---|---|\n| Frontend | React 19, Vite, Tailwind CSS |\n| Backend | Django REST Framework, JWT |\n| Database | PostgreSQL |\n| Infra | Oracle Cloud, Nginx, SSL/TLS |\n\n## Arquitectura\n\n\`\`\`\nBrowser → Nginx → Django REST API → PostgreSQL\n               ↓\n          React SPA (Vite build)\n\`\`\`\n\n## Métricas\n\n- -40% tiempo de gestión interna\n- +1.200 usuarios activos\n- 4+ sistemas corporativos end-to-end\n\n## Setup\n\n\`\`\`bash\n# Frontend\nnpm install && npm run dev\n\n# Backend\npip install -r requirements.txt\npython manage.py migrate && python manage.py runserver\n\`\`\`\n\n## Live\n\nhttps://utnhub.com.ar`,
    'agv-studio': `# AGV Studio\n\n> Startup de desarrollo y consultoría tecnológica\n\n## Stack\n\nReact · Django · Tailwind CSS · PostgreSQL\n\n## Descripción\n\nStartup orientada a la construcción de productos digitales y consultoría para PYMEs.\nArquitectura full-stack con foco en sistemas a medida y escalabilidad.\n\n## Live\n\nhttps://portfolio-agv.vercel.app/`,
    'esp32-monitor': `# ESP32 Climate Monitor\n\n> Monitoreo IoT de temperatura y humedad en tiempo real\n\n## Hardware\n\n- ESP32 DevKit v1\n- DHT22 (temp/humidity sensor)\n- OLED SSD1306 display\n\n## Stack\n\n\`\`\`\nESP32 (C/C++) → MQTT Broker → Django Consumer\n                                    ↓\n                              PostgreSQL → REST API → React Dashboard\n\`\`\`\n\n## Firmware\n\nEscrito en C++ con PlatformIO. Publica datos cada 30s al broker MQTT local.\n\n## Features\n\n- Lectura de sensor cada 2s\n- Publicación MQTT con QoS 1\n- Display OLED con última lectura\n- Alertas por umbral configurable`,
    'pytask-cli': `# PyTask CLI\n\n> Gestor de tareas y proyectos desde la terminal\n\n## Stack\n\nPython · Rich · SQLite · Click\n\n## Uso\n\n\`\`\`bash\npytask add "Mi tarea" --priority high --project dev\npytask list --filter priority=high\npytask done 3\npytask export --format csv\n\`\`\`\n\n## Features\n\n- Multi-proyecto\n- Prioridades (low/medium/high/critical)\n- Etiquetas y búsqueda\n- Exportación CSV/JSON\n- Interfaz Rich con colores y tablas`,
  };

  const projectFiles = projects.reduce((acc, p) => {
    const extra = [];
    if (p.tech.includes('React')) {
      extra.push({
        name: 'package.json', type: 'file',
        content: JSON.stringify({ name: p.id, version: '1.0.0', scripts: { dev: 'vite', build: 'vite build', preview: 'vite preview' }, dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0', vite: '^5.0.0' } }, null, 2),
      });
    }
    if (p.tech.includes('Django')) {
      extra.push({
        name: 'requirements.txt', type: 'file',
        content: 'django>=5.0\ndjangorestframework>=3.15\ndjangorestframework-simplejwt>=5.3\npsycopg2-binary>=2.9\ncorsheaders>=4.3\npython-decouple>=3.8\ngunicorn>=21.0',
      });
    }
    if (p.id === 'utn-hub') {
      extra.push({ name: 'docker-compose.yml', type: 'file', content: 'version: "3.9"\nservices:\n  db:\n    image: postgres:16\n    env_file: .env\n    volumes:\n      - pgdata:/var/lib/postgresql/data\n  backend:\n    build: ./backend\n    depends_on: [db]\n    env_file: .env\n    ports: ["8000:8000"]\n  frontend:\n    build: ./frontend\n    ports: ["5173:5173"]\nvolumes:\n  pgdata:' });
      extra.push({ name: '.env.example', type: 'file', content: 'SECRET_KEY=your-secret-key\nDEBUG=False\nDB_NAME=utnhub\nDB_USER=postgres\nDB_PASSWORD=\nDB_HOST=db\nDB_PORT=5432\nALLOWED_HOSTS=utnhub.com.ar,localhost\nCORS_ORIGINS=https://utnhub.com.ar' });
    }
    if (p.id === 'esp32-monitor') {
      extra.push({ name: 'main.cpp', type: 'file', content: '#include <Arduino.h>\n#include <WiFi.h>\n#include <PubSubClient.h>\n#include <DHT.h>\n\n#define DHT_PIN 4\n#define DHT_TYPE DHT22\n#define MQTT_TOPIC "sensors/climate"\n\nDHT dht(DHT_PIN, DHT_TYPE);\nWiFiClient espClient;\nPubSubClient mqtt(espClient);\n\nvoid setup() {\n  Serial.begin(115200);\n  dht.begin();\n  WiFi.begin(WIFI_SSID, WIFI_PASS);\n  mqtt.setServer(MQTT_HOST, 1883);\n}\n\nvoid loop() {\n  float temp = dht.readTemperature();\n  float hum  = dht.readHumidity();\n  String payload = "{\\"temp\\":" + String(temp) + ",\\"hum\\":" + String(hum) + "}";\n  mqtt.publish(MQTT_TOPIC, payload.c_str());\n  delay(30000);\n}' });
      extra.push({ name: 'platformio.ini', type: 'file', content: '[env:esp32dev]\nplatform = espressif32\nboard = esp32dev\nframework = arduino\nlib_deps =\n  knolleary/PubSubClient@^2.8\n  adafruit/DHT sensor library@^1.4.6\nmonitor_speed = 115200' });
    }
    if (p.id === 'pytask-cli') {
      extra.push({ name: 'main.py', type: 'file', content: 'import click\nfrom rich.console import Console\nfrom rich.table import Table\nfrom db import get_tasks, add_task, mark_done\n\nconsole = Console()\n\n@click.group()\ndef cli():\n    """PyTask — gestor de tareas CLI"""\n    pass\n\n@cli.command()\n@click.argument("title")\n@click.option("--priority", default="medium")\n@click.option("--project", default="default")\ndef add(title, priority, project):\n    """Agregar una tarea"""\n    task = add_task(title, priority, project)\n    console.print(f"[green]✓[/] Tarea agregada: {task.id}")\n\n@cli.command("list")\ndef list_tasks():\n    """Listar tareas activas"""\n    tasks = get_tasks()\n    table = Table(title="Tareas pendientes")\n    table.add_column("ID"), table.add_column("Título"), table.add_column("Prioridad")\n    for t in tasks:\n        table.add_row(str(t.id), t.title, t.priority)\n    console.print(table)\n\nif __name__ == "__main__":\n    cli()' });
      extra.push({ name: 'pyproject.toml', type: 'file', content: '[build-system]\nrequires = ["setuptools"]\nbuild-backend = "setuptools.build_meta"\n\n[project]\nname = "pytask-cli"\nversion = "1.0.0"\nrequires-python = ">=3.11"\ndependencies = ["click>=8.1", "rich>=13.0", "sqlalchemy>=2.0"]\n\n[project.scripts]\npytask = "main:cli"' });
    }
    acc[`Home/Projects/${p.id}`] = [
      { name: 'README.md', type: 'file', content: readmes[p.id] || `# ${p.title}\n\n${l(p.description)}\n\n## Tech\n${p.tech.join(', ')}` },
      ...extra,
    ];
    return acc;
  }, {});

  return {
    'Home': [
      { name: 'Projects',  type: 'folder' },
      { name: 'Documents', type: 'folder' },
      { name: 'Desktop',   type: 'folder' },
      { name: 'Downloads', type: 'folder' },
      { name: '.bashrc',   type: 'file', content: '# ~/.bashrc — aznar-dev\nexport PS1="\\[\\033[35m\\]aznar\\[\\033[0m\\]@\\[\\033[36m\\]ubuntu-dev\\[\\033[0m\\]:~$ "\nexport PATH="$HOME/.local/bin:$PATH"\nexport EDITOR=code\n\n# Aliases\nalias gs="git status"\nalias glog="git log --oneline --graph"\nalias py="python3"\nalias dj="python manage.py"\nalias serve="npm run dev"\nalias k="kubectl"\n\n# NVM\nexport NVM_DIR="$HOME/.nvm"\n[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"\n\necho "🐧 Welcome to aznar-dev environment"' },
    ],
    'Home/Projects': projects.map(p => ({ name: p.id, type: 'folder', label: p.title })),
    'Home/Documents': [
      { name: 'resume.pdf', type: 'file', label: 'Resume (PDF)', isPdf: true },
      { name: 'about.txt', type: 'file', content: `${site.name}\n${site.role}\n\n${site.description}\n\nEmail: ${site.email}\nGitHub: ${site.github}\nLinkedIn: ${site.linkedin}` },
      { name: 'cover_letter.md', type: 'file', content: `# Cover Letter\n\nEstimado equipo,\n\nSoy ${site.name}, desarrollador Full Stack con experiencia real\nen construcción de sistemas end-to-end usando React, Django y PostgreSQL.\n\nActualmente trabajo en Porta Hnos donde arquitecté 4+ sistemas\ncorporativos, reduciendo el tiempo de gestión interna en un 40%.\n\nBusco roles donde pueda construir productos completos, desde el\ndiseño de la API hasta el deploy en producción.\n\nSaludos,\n${site.name}` },
    ],
    'Home/Desktop': [
      { name: 'portfolio-v2', type: 'folder' },
      { name: 'install.sh', type: 'file', content: '#!/bin/bash\n# aznar-dev environment setup\nset -e\n\necho "🐧 Setting up aznar-dev environment..."\n\n# Node.js\ncurl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -\nsudo apt-get install -y nodejs\n\n# Python\nsudo apt install python3.11 python3-pip python3-venv -y\n\n# PostgreSQL\nsudo apt install postgresql postgresql-contrib -y\n\n# Docker\ncurl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh\n\n# VS Code\nwget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg\nsudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/\nsudo apt install code -y\n\necho "✓ Setup complete! Run: code ."' },
    ],
    'Home/Downloads': [
      { name: 'vscode_amd64.deb', type: 'file', content: '# Binary installer — Visual Studio Code\n# Run: sudo dpkg -i vscode_amd64.deb' },
    ],
    'Home/Desktop/portfolio-v2': [
      { name: 'package.json', type: 'file', content: JSON.stringify({ name: 'portfolio-v2', version: '2.0.0', scripts: { dev: 'vite', build: 'vite build' }, dependencies: { react: '^19.0.0', 'motion': '^11.0.0', 'lucide-react': '^0.400.0' } }, null, 2) },
      { name: 'README.md', type: 'file', content: '# Portfolio V2\n\nPortfolio personal construido con React, Vite y Tailwind CSS.\n\n## Features\n\n- Ubuntu OS Easter Egg (estás aquí 🐧)\n- Modo oscuro completo\n- i18n ES/EN\n- Animaciones con Motion\n- Terminal interactivo\n\n## Setup\n\n```bash\nnpm install && npm run dev\n```' },
    ],
    ...projectFiles,
  };
}

// ── Kernel Panic ──────────────────────────────────────────────────
const PANIC_LINES = [
  'BUG: unable to handle kernel NULL pointer dereference',
  'IP: [<ffffffffc0dead00>] rm_recursive+0x00/0xff [rm]',
  'PGD 0 P4D 0',
  'Oops: 0002 [#1] SMP NOPTI',
  'CPU: 0 PID: 1337 Comm: rm Tainted: G  X',
  'RIP: 0010:[<ffffffffc0dead00>] rm_recursive+0x00/0xff',
  'RSP: 0018:ffff88003d8abcd8 EFLAGS: 00010246',
  'Call Trace:',
  ' [<ffffffff8120ef45>] do_unlinkat+0x1b5/0x280',
  ' [<ffffffff812107a0>] sys_unlinkat+0x20/0x40',
  '---[ end trace deadc0dedeadbeef ]---',
  'Kernel panic - not syncing: Fatal exception',
  'Rebooting in 3 seconds...',
];

function PanicScreen({ onDone }) {
  const [lines,   setLines]   = useState([]);
  const [counter, setCounter] = useState(null);

  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      if (i < PANIC_LINES.length) {
        setLines(prev => [...prev, PANIC_LINES[i]]);
        i++;
        if (i === PANIC_LINES.length) setCounter(3);
      } else {
        clearInterval(iv);
      }
    }, 90);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (counter === null) return;
    if (counter === 0) { onDone(); return; }
    const t = setTimeout(() => setCounter(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [counter, onDone]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      className="fixed inset-0 z-[10001] bg-black font-mono text-[12px] p-4 overflow-hidden flex flex-col"
    >
      <div className="flex flex-col gap-0.5">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={
              l && (l.includes('Kernel panic') || l.includes('BUG:'))
                ? 'text-red-400 font-bold'
                : l && l.includes('Rebooting')
                  ? 'text-yellow-400'
                  : 'text-white/70'
            }
          >
            {l}
          </motion.div>
        ))}
        {counter !== null && counter > 0 && (
          <div className="text-yellow-400 font-bold mt-2">Rebooting in {counter} seconds...</div>
        )}
      </div>
    </motion.div>
  );
}

// ── Boot Screen ───────────────────────────────────────────────────
const SYSTEMD_LINES = [
  { tag: 'OK',       text: 'Started Load Kernel Modules.' },
  { tag: 'OK',       text: 'Reached target Local File Systems (Pre).' },
  { tag: 'STARTING', text: 'Starting udev Kernel Device Manager...' },
  { tag: 'OK',       text: 'Started udev Kernel Device Manager.' },
  { tag: 'OK',       text: 'Reached target Local File Systems.' },
  { tag: 'STARTING', text: 'Starting Network Service...' },
  { tag: 'OK',       text: 'Started Network Service.' },
  { tag: 'STARTING', text: 'Starting Accounts Service...' },
  { tag: 'OK',       text: 'Started Accounts Service.' },
  { tag: 'STARTING', text: 'Starting GNOME Display Manager...' },
  { tag: 'OK',       text: 'Started GNOME Display Manager.' },
  { tag: 'OK',       text: 'Reached target Graphical Interface.' },
];

function BootScreen({ onDone }) {
  const [lines, setLines]   = useState([]);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let i = 0;
    let timeoutId;
    const iv = setInterval(() => {
      if (i < SYSTEMD_LINES.length) {
        setLines(prev => [...prev, SYSTEMD_LINES[i]]);
        i++;
      } else {
        clearInterval(iv);
        setFading(true);
        timeoutId = setTimeout(onDone, 600);
      }
    }, 120);
    return () => {
      clearInterval(iv);
      clearTimeout(timeoutId);
    };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: fading ? 0 : 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[10000] bg-black flex flex-col justify-end p-6 pb-12 gap-0.5 font-mono text-[12px]"
    >
      {/* Ubuntu logo centered top */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-5 pointer-events-none">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="#E95420" opacity="0.85">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.24 9.76a6.96 6.96 0 01-.54-7.9l1.37 1.37A5.02 5.02 0 007.5 12c0 .97.27 1.87.74 2.63l-1.37 1.37-.01-.24zm4.24 3.24c-.97 0-1.87-.27-2.63-.74L8 18.63a7 7 0 007.9.54l-1.37-1.37c-.76.47-1.66.74-2.63.74zm4.24-1.24l-1.37-1.37A5.02 5.02 0 0016.5 12c0-.97-.27-1.87-.74-2.63l1.37-1.37a6.96 6.96 0 01-.54 7.9l-.11-.14z"/>
        </svg>
        <span className="text-white/20 text-[11px] tracking-[0.25em] uppercase">Ubuntu 24.04 LTS</span>
      </div>

      {/* systemd lines */}
      <div className="flex flex-col gap-0.5">
        {lines.map((l, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
            className="flex items-start gap-2"
          >
            {l && l.tag && (
              <span
                className="flex-shrink-0 font-bold text-[11px] px-1 rounded"
                style={{
                  color:      l.tag === 'OK' ? '#4ade80' : '#facc15',
                  background: l.tag === 'OK' ? 'rgba(74,222,128,0.08)' : 'rgba(250,204,21,0.08)',
                }}
              >
                [{l.tag.padEnd(8)}]
              </span>
            )}
            <span className="text-white/55">{l ? l.text : ''}</span>
          </motion.div>
        ))}
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[10000] flex flex-col items-center" style={{ background: wallpaperBg }}
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
            <input ref={inputRef} type="password" placeholder="Contraseña" value={pwd}
              onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === 'Enter' && onLogin()}
              className="bg-transparent text-white text-sm px-5 py-2.5 outline-none placeholder:text-white/30 w-44" autoComplete="off"
            />
            <button onClick={onLogin} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors">
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
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseDown={e => e.stopPropagation()}
      onClick={e => { e.stopPropagation(); onClick(); }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black transition-all"
      style={{ background: hovered ? hover : bg, color: hovered ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }}
    >
      {children}
    </button>
  );
}

function Window({ title, children, zIndex, isFocused, isMaximized, isMobile, defaultTop, defaultLeft, defaultW = 780, defaultH = 500, onFocus, onClose, onMinimize, onMaximize }) {
  const dragControls = useDragControls();
  const canDrag = !isMaximized && !isMobile;
  return (
    <motion.div
      drag={canDrag} dragControls={dragControls} dragListener={false}
      dragMomentum={false} dragElastic={0}
      onPointerDown={onFocus}
      initial={{ scale: 0.88, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        ...(isMaximized || isMobile ? { x: 0, y: 0 } : {})
      }}
      exit={{ scale: 0.88, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
      className={`absolute flex flex-col overflow-hidden pointer-events-auto ${isMaximized || isMobile ? 'inset-0 rounded-none' : 'rounded-lg'}`}
      style={{
        zIndex,
        width:  isMaximized || isMobile ? '100%' : `min(${defaultW}px, 92vw)`,
        height: isMaximized || isMobile ? '100%' : `min(${defaultH}px, 82vh)`,
        top:    isMaximized || isMobile ? 0 : defaultTop,
        left:   isMaximized || isMobile ? 0 : defaultLeft,
        boxShadow: isFocused ? '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.08)' : '0 16px 40px rgba(0,0,0,0.5)',
      }}
    >
      {/* Title bar — only this can initiate a drag */}
      <div
        onPointerDown={(e) => canDrag && dragControls.start(e)}
        onDoubleClick={onMaximize}
        className={`h-9 flex items-center px-3 gap-2 flex-shrink-0 ${canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'} select-none border-b ${isFocused ? 'bg-[#3c3c3c] border-black/40' : 'bg-[#282828] border-black/25'}`}
      >
        <div className="flex items-center gap-1.5 opacity-90">
          <WinBtn bg="#ff5f57" hover="#e0443f" onClick={onClose}>×</WinBtn>
          <WinBtn bg="#ffbd2e" hover="#dea123" onClick={onMinimize}>−</WinBtn>
          <WinBtn bg="#28c840" hover="#1ea831" onClick={onMaximize}>+</WinBtn>
        </div>
        <span className="flex-1 text-center text-[12px] text-white/70 truncate font-medium">{title}</span>
      </div>
      <div className="flex-1 overflow-hidden bg-[#1e1e1e] cursor-default flex flex-col min-h-0">{children}</div>
    </motion.div>
  );
}

// ── Dock & Desktop ────────────────────────────────────────────────
function DockIcon({ icon: Icon, label, isOpen, isFocused, isMinimized, onClick }) {
  return (
    <div className="relative group/dock cursor-pointer" onClick={onClick}>
      {isOpen && <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-1 rounded-full ${isFocused ? 'h-4 bg-white' : 'h-2 bg-white/40'}`} />}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-150 ${isOpen ? 'bg-white/12' : ''} ${isFocused ? 'scale-110' : 'hover:scale-110 hover:bg-white/10'} ${isMinimized ? 'opacity-50' : ''}`}>
        <Icon size={22} color="white" strokeWidth={1.5} />
      </div>
      <div className="absolute left-[56px] top-1/2 -translate-y-1/2 px-2.5 py-1 bg-black/90 text-white text-[11px] rounded-md opacity-0 group-hover/dock:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
        {label}
        <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 border-[5px] border-transparent border-r-black/90" />
      </div>
    </div>
  );
}

function DesktopIcon({ icon: Icon, label, onClick, top, left, constraintsRef }) {
  return (
    <motion.div 
      drag dragMomentum={false} dragElastic={0} dragConstraints={constraintsRef}
      onDoubleClick={e => { e.stopPropagation(); onClick(); }}
      onPointerDown={e => e.stopPropagation()}
      className="absolute flex flex-col items-center gap-1 cursor-pointer group w-[76px] select-none"
      style={{ top, left }}
    >
      <div className="w-14 h-14 bg-black/25 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-black/40 transition-all hover:scale-105 shadow-lg relative">
        <Icon size={30} className="text-[#E95420]" strokeWidth={1.5} />
      </div>
      <span className="text-white text-[11px] font-medium bg-black/40 px-1.5 py-0.5 rounded text-center max-w-[76px] truncate group-hover:bg-[#E95420]/70 transition-colors shadow-md">
        {label}
      </span>
    </motion.div>
  );
}

function ContextMenu({ x, y, onClose, onNewTerminal, onSettings }) {
  const items = [
    { label: 'Nueva Terminal',   action: onNewTerminal },
    { label: 'Cambiar fondo',    action: onSettings },
    { label: 'Actualizar',       action: onClose },
  ];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.1 }}
      className="absolute z-[200] py-1 bg-[#303030] border border-white/10 rounded-lg shadow-2xl w-48"
      style={{ left: Math.min(x, window.innerWidth - 200), top: Math.min(y, window.innerHeight - 120) }}
      onClick={e => e.stopPropagation()}
    >
      {items.map(item => (
        <button key={item.label} onClick={() => { item.action?.(); onClose(); }}
          className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

// ── Snake Game ────────────────────────────────────────────────────
function SnakeGame() {
  const GRID = 18, CELL = 22;
  const [snake, setSnake] = useState([[9, 9], [9, 8], [9, 7]]);
  const [food, setFood] = useState([4, 13]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState('idle');
  const dirRef = useRef([0, 1]);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const randFood = useCallback((body) => {
    let pos;
    do { pos = [Math.floor(Math.random() * GRID), Math.floor(Math.random() * GRID)]; }
    while (body.some(([r, c]) => r === pos[0] && c === pos[1]));
    return pos;
  }, []);

  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => {
      setSnake(prev => {
        const [dr, dc] = dirRef.current;
        const head = [prev[0][0] + dr, prev[0][1] + dc];
        if (head[0] < 0 || head[0] >= GRID || head[1] < 0 || head[1] >= GRID || prev.some(([r, c]) => r === head[0] && c === head[1])) {
          setStatus('dead'); return prev;
        }
        const ate = head[0] === food[0] && head[1] === food[1];
        const next = ate ? [head, ...prev] : [head, ...prev.slice(0, -1)];
        if (ate) { setScore(s => s + 10); setFood(randFood(next)); }
        return next;
      });
    }, 115);
    return () => clearInterval(id);
  }, [status, food, randFood]);

  const handleKey = (e) => {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    if (e.key === ' ') {
      if (status === 'idle' || status === 'dead') reset();
      else if (status === 'running') setStatus('paused');
      else setStatus('running');
      return;
    }
    const dirs = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1], w:[-1,0], s:[1,0], a:[0,-1], d:[0,1] };
    const d = dirs[e.key];
    if (!d) return;
    const [cr, cc] = dirRef.current;
    if (cr + d[0] === 0 && cc + d[1] === 0) return;
    dirRef.current = d;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, GRID * CELL); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(GRID * CELL, i * CELL); ctx.stroke();
    }

    // Food glow
    const [fr, fc] = food;
    const fx = fc * CELL + CELL / 2, fy = fr * CELL + CELL / 2;
    const grd = ctx.createRadialGradient(fx, fy, 1, fx, fy, 10);
    grd.addColorStop(0, '#E95420'); grd.addColorStop(1, 'rgba(233,84,32,0)');
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ff7a50';
    ctx.beginPath(); ctx.arc(fx, fy, 4, 0, Math.PI * 2); ctx.fill();

    // Snake
    snake.forEach(([r, c], i) => {
      const alpha = i === 0 ? 1 : Math.max(0.3, 1 - (i / snake.length) * 0.65);
      ctx.fillStyle = i === 0 ? '#9b8cff' : `rgba(124,106,247,${alpha})`;
      ctx.beginPath();
      ctx.roundRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, 5);
      ctx.fill();
    });
  }, [snake, food]);

  const reset = () => {
    const init = [[9, 9], [9, 8], [9, 7]];
    setSnake(init); setFood(randFood(init)); setScore(0);
    dirRef.current = [0, 1]; setStatus('running');
    setTimeout(() => containerRef.current?.focus(), 10);
  };

  useEffect(() => { setTimeout(() => containerRef.current?.focus(), 100); }, []);

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={handleKey}
      className="h-full bg-[#0d0d18] flex flex-col items-center justify-center gap-4 p-5 outline-none"
      onClick={() => containerRef.current?.focus()}
    >
      <div className="flex items-center justify-between w-full" style={{ maxWidth: GRID * CELL }}>
        <span className="font-mono text-[var(--accent)] text-sm font-bold tracking-widest uppercase">Snake</span>
        <span className="font-mono text-white/50 text-sm">Score: <span className="text-[var(--accent)] font-bold">{score}</span></span>
      </div>
      <canvas ref={canvasRef} width={GRID * CELL} height={GRID * CELL} className="rounded-xl border border-white/10 shadow-2xl" />
      {status === 'idle' && (
        <div className="text-center">
          <button onClick={reset} className="px-7 py-2.5 bg-[var(--accent)] text-white rounded-xl font-mono text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
            Start Game
          </button>
          <p className="text-white/25 font-mono text-[10px] mt-2 tracking-wider">Arrows / WASD · Space to pause</p>
        </div>
      )}
      {status === 'dead' && (
        <div className="text-center">
          <p className="text-red-400 font-mono text-sm mb-2 font-bold">Game Over! Score: {score}</p>
          <button onClick={reset} className="px-7 py-2.5 bg-[var(--accent)] text-white rounded-xl font-mono text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors">
            Play Again
          </button>
        </div>
      )}
      {status === 'paused' && <p className="text-[var(--accent)]/60 font-mono text-sm animate-pulse">⏸ Paused — Space to resume</p>}
      {status === 'running' && <p className="text-white/20 font-mono text-[10px] tracking-widest uppercase">Arrow keys · Space to pause</p>}
    </div>
  );
}

// ── Minesweeper ───────────────────────────────────────────────────
function MinesweeperGame() {
  const ROWS = 9, COLS = 9, MINES = 10;

  const make = (safeR = -1, safeC = -1) => {
    const b = Array(ROWS).fill(null).map(() => Array(COLS).fill(null).map(() => ({ mine: false, revealed: false, flagged: false, n: 0 })));
    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS), c = Math.floor(Math.random() * COLS);
      // Evitar colocar mina en la coordenada segura o en sus alrededores inmediatos (para no perder al primer click)
      const isSafe = (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1);
      if (!b[r][c].mine && !isSafe) { b[r][c].mine = true; placed++; }
    }
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (b[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].mine) n++;
      }
      b[r][c].n = n;
    }
    return b;
  };

  const [board, setBoard] = useState(() => make());
  const [state, setState] = useState('idle'); // idle | playing | dead | won
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (state !== 'playing') return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const flood = (b, r, c) => {
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS || b[r][c].revealed || b[r][c].flagged) return;
    b[r][c].revealed = true;
    if (b[r][c].n === 0 && !b[r][c].mine) for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) flood(b, r + dr, c + dc);
  };

  const click = (r, c) => {
    if (state === 'dead' || state === 'won') return;
    if (board[r][c].revealed || board[r][c].flagged) return;
    let currentBoard = board;

    if (state === 'idle') {
      currentBoard = make(r, c);
      setState('playing');
    }

    const next = currentBoard.map(row => row.map(cell => ({ ...cell })));
    if (next[r][c].mine) {
      next.forEach(row => row.forEach(cell => { if (cell.mine) cell.revealed = true; }));
      setBoard(next); setState('dead'); return;
    }
    flood(next, r, c);
    if (next.flat().every(cell => cell.revealed || cell.mine)) setState('won');
    setBoard(next);
  };

  const flag = (e, r, c) => {
    e.preventDefault();
    if (board[r][c].revealed || state === 'dead' || state === 'won') return;
    const next = board.map(row => row.map(cell => ({ ...cell })));
    next[r][c].flagged = !next[r][c].flagged;
    setFlags(f => next[r][c].flagged ? f + 1 : f - 1);
    setBoard(next);
  };

  const reset = () => { setBoard(make()); setState('idle'); setFlags(0); setTime(0); };
  const COLORS = ['','#60a5fa','#4ade80','#f87171','#818cf8','#fb923c','#22d3ee','#e8e8f0','#888'];

  return (
    <div className="h-full bg-[#0d0d18] flex flex-col items-center justify-center gap-5 p-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-[252px]">
        <span className="font-mono text-[var(--accent)] font-bold text-sm tracking-widest uppercase">Mines</span>
        <div className="flex gap-4">
          <span className="font-mono text-white/50 text-sm">💣 {MINES - flags}</span>
          <span className="font-mono text-white/50 text-sm tabular-nums">⏱ {String(time).padStart(3,'0')}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="rounded-xl border border-white/10 overflow-hidden shadow-2xl">
        {board.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <button key={c} onClick={() => click(r, c)} onContextMenu={e => flag(e, r, c)}
                className={`w-7 h-7 text-[11px] font-bold border-[0.5px] border-white/[0.06] flex items-center justify-center transition-colors ${cell.revealed ? (cell.mine ? 'bg-red-900/70' : 'bg-[#252525]') : 'bg-[#1a1a2e] hover:bg-[#252545] active:bg-[#1e1e38]'}`}
                style={{ color: cell.revealed && !cell.mine && cell.n ? COLORS[cell.n] : undefined }}
              >
                {cell.flagged && !cell.revealed ? '🚩' : cell.revealed && cell.mine ? '💣' : cell.revealed && cell.n ? cell.n : ''}
              </button>
            ))}
          </div>
        ))}
      </div>

      {(state === 'dead' || state === 'won') && (
        <div className="text-center">
          <p className={`font-mono text-sm mb-3 font-bold ${state === 'won' ? 'text-green-400' : 'text-red-400'}`}>
            {state === 'won' ? `🎉 ¡Ganaste! ${time}s` : '💥 ¡Boom! Game Over'}
          </p>
          <button onClick={reset} className="px-5 py-2 bg-[var(--accent)] text-white rounded-lg font-mono text-sm hover:bg-[var(--accent-hover)] transition-colors">
            Jugar de nuevo
          </button>
        </div>
      )}
      {state === 'idle' && (
        <p className="text-white/25 font-mono text-[10px] tracking-wider">Click para revelar · Click derecho para bandera</p>
      )}
    </div>
  );
}

// ── DOOM map data (module-level for perf) ─────────────────────────
const DM_W = 16, DM_H = 12;
const DM_MAP = [
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,2,2,0,0,0,0,0,0,2,2,0,0,1,
  1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,3,3,3,3,3,0,0,0,0,0,1,
  1,0,0,0,0,3,0,0,0,3,0,0,0,0,0,1,
  1,0,0,0,0,3,0,0,0,0,0,0,0,0,0,1,
  1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
  1,0,0,2,0,0,0,0,0,0,0,0,2,0,0,1,
  1,0,0,2,2,0,0,0,0,0,0,2,2,0,0,1,
  1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
];
const DM_COLORS = {
  1: { lit:[100,50,180], sh:[60,28,110] },
  2: { lit:[220,90,30],  sh:[140,55,18] },
  3: { lit:[30,160,130], sh:[18,95,75]  },
};

// ── Tetris ────────────────────────────────────────────────────────
const TETROMINOS = {
  I: { m: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#22d3ee' },
  O: { m: [[1,1],[1,1]],                              color: '#fbbf24' },
  T: { m: [[0,1,0],[1,1,1],[0,0,0]],                 color: '#a78bfa' },
  S: { m: [[0,1,1],[1,1,0],[0,0,0]],                 color: '#4ade80' },
  Z: { m: [[1,1,0],[0,1,1],[0,0,0]],                 color: '#f87171' },
  J: { m: [[1,0,0],[1,1,1],[0,0,0]],                 color: '#60a5fa' },
  L: { m: [[0,0,1],[1,1,1],[0,0,0]],                 color: '#fb923c' },
};
const T_KEYS = Object.keys(TETROMINOS);
const rotateMat = (m) => m[0].map((_, i) => m.map(r => r[i]).reverse());
const cloneMatrix = (m) => m.map(r => [...r]);

function NextPreview({ piece }) {
  const ref = useRef(null);
  const C = 20;
  useEffect(() => {
    const cv = ref.current; if (!cv || !piece) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, cv.width, cv.height);
    const rows = piece.m.length, cols = piece.m[0].length;
    const ox = Math.floor((4 - cols) / 2), oy = Math.floor((4 - rows) / 2);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      if (!piece.m[r][c]) continue;
      ctx.fillStyle = piece.color;
      ctx.beginPath();
      ctx.roundRect((ox + c) * C + 1, (oy + r) * C + 1, C - 2, C - 2, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.roundRect((ox + c) * C + 2, (oy + r) * C + 2, C - 4, 4, 2);
      ctx.fill();
    }
  }, [piece]);
  return <canvas ref={ref} width={4 * C} height={4 * C} className="rounded-lg" />;
}

function TetrisGame() {
  const COLS = 10, ROWS = 20, CELL = 24;
  const BW = COLS * CELL, BH = ROWS * CELL;

  const mkPiece = useCallback(() => {
    const key = T_KEYS[Math.floor(Math.random() * T_KEYS.length)];
    const { m, color } = TETROMINOS[key];
    return { m: cloneMatrix(m), color, x: Math.floor((COLS - m[0].length) / 2), y: 0 };
  }, []);

  const boardRef   = useRef(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const pieceRef   = useRef(null);
  const nextRef    = useRef(null);
  const statusRef  = useRef('idle');
  const scoreRef   = useRef(0);
  const levelRef   = useRef(1);
  const linesRef   = useRef(0);
  const intervalRef = useRef(null);
  const canvasRef   = useRef(null);
  const containerRef = useRef(null);
  const audioRef    = useRef(null);

  const [score,  setScore]  = useState(0);
  const [level,  setLevel]  = useState(1);
  const [lines,  setLines]  = useState(0);
  const [status, setStatus] = useState('idle');
  const [nextP,  setNextP]  = useState(null);
  const [music,  setMusic]  = useState(true);

  useEffect(() => {
    // Try to load an iconic sound from local files or an external creative commons source
    audioRef.current = new Audio('https://ia800504.us.archive.org/33/items/TetrisThemeMusic/Tetris.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    if (status === 'running' && music) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [status, music]);

  const collides = useCallback((piece, dx = 0, dy = 0, mat = null) => {
    const m = mat || piece.m;
    for (let r = 0; r < m.length; r++) for (let c = 0; c < m[r].length; c++) {
      if (!m[r][c]) continue;
      const nr = piece.y + r + dy, nc = piece.x + c + dx;
      if (nc < 0 || nc >= COLS || nr >= ROWS) return true;
      if (nr >= 0 && boardRef.current[nr][nc]) return true;
    }
    return false;
  }, []);

  const drawCanvas = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#0d0d18';
    ctx.fillRect(0, 0, BW, BH);
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= ROWS; i++) { ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(BW, i * CELL); ctx.stroke(); }
    for (let i = 0; i <= COLS; i++) { ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, BH); ctx.stroke(); }

    const drawCell = (cx, cy, color) => {
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.roundRect(cx * CELL + 1, cy * CELL + 1, CELL - 2, CELL - 2, 3); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.roundRect(cx * CELL + 2, cy * CELL + 2, CELL - 4, 4, 2); ctx.fill();
    };

    // Board
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++)
      if (boardRef.current[r][c]) drawCell(c, r, boardRef.current[r][c]);

    // Ghost
    const p = pieceRef.current;
    if (p) {
      let dy = 0;
      while (!collides(p, 0, dy + 1)) dy++;
      for (let r = 0; r < p.m.length; r++) for (let c = 0; c < p.m[r].length; c++) {
        if (!p.m[r][c]) continue;
        ctx.fillStyle = `${p.color}28`;
        ctx.beginPath(); ctx.roundRect((p.x + c) * CELL + 1, (p.y + dy + r) * CELL + 1, CELL - 2, CELL - 2, 3); ctx.fill();
      }
      // Current piece
      for (let r = 0; r < p.m.length; r++) for (let c = 0; c < p.m[r].length; c++)
        if (p.m[r][c]) drawCell(p.x + c, p.y + r, p.color);
    }
  }, [BH, BW, collides]);

  const lockAndSpawn = useCallback(() => {
    const p = pieceRef.current; if (!p) return;
    const board = boardRef.current.map(r => [...r]);
    for (let r = 0; r < p.m.length; r++) for (let c = 0; c < p.m[r].length; c++) {
      if (!p.m[r][c]) continue;
      const nr = p.y + r; if (nr >= 0) board[nr][p.x + c] = p.color;
    }
    const full = board.filter(row => row.every(Boolean));
    const rest = board.filter(row => !row.every(Boolean));
    const n = full.length;
    boardRef.current = [...Array(n).fill(null).map(() => Array(COLS).fill(null)), ...rest];

    if (n > 0) {
      const pts = [0, 100, 300, 500, 800][n] * levelRef.current;
      scoreRef.current += pts; linesRef.current += n;
      levelRef.current = Math.floor(linesRef.current / 10) + 1;
      setScore(scoreRef.current); setLines(linesRef.current); setLevel(levelRef.current);
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => stepRef.current?.(), Math.max(80, 800 - (levelRef.current - 1) * 70));
    }

    const np = nextRef.current;
    if (collides(np, 0, 0)) {
      statusRef.current = 'dead'; setStatus('dead');
      clearInterval(intervalRef.current); pieceRef.current = null; drawCanvas(); return;
    }
    pieceRef.current = np;
    const nn = mkPiece();
    nextRef.current = nn; setNextP(nn);
    drawCanvas();
  }, [collides, drawCanvas, mkPiece]);

  const stepRef = useRef(null);
  const step = useCallback(() => {
    const p = pieceRef.current; if (!p || statusRef.current !== 'running') return;
    if (collides(p, 0, 1)) lockAndSpawn();
    else { pieceRef.current = { ...p, y: p.y + 1 }; drawCanvas(); }
  }, [collides, drawCanvas, lockAndSpawn]);
  stepRef.current = step;

  const handleKey = useCallback((e) => {
    const p = pieceRef.current;
    const st = statusRef.current;
    if (['ArrowLeft','ArrowRight','ArrowDown','ArrowUp',' '].includes(e.key)) e.preventDefault();
    if (e.key === 'Enter') {
      if (st === 'idle' || st === 'dead') startGame(); return;
    }
    if (e.key === 'p' || e.key === 'P') {
      if (st === 'running') { statusRef.current = 'paused'; setStatus('paused'); clearInterval(intervalRef.current); }
      else if (st === 'paused') {
        statusRef.current = 'running'; setStatus('running');
        intervalRef.current = setInterval(() => stepRef.current?.(), Math.max(80, 800 - (levelRef.current - 1) * 70));
      }
      return;
    }
    if (!p || st !== 'running') return;
    if (e.key === 'ArrowLeft'  && !collides(p, -1, 0)) { pieceRef.current = { ...p, x: p.x - 1 }; drawCanvas(); }
    if (e.key === 'ArrowRight' && !collides(p,  1, 0)) { pieceRef.current = { ...p, x: p.x + 1 }; drawCanvas(); }
    if (e.key === 'ArrowDown') {
      if (!collides(p, 0, 1)) { pieceRef.current = { ...p, y: p.y + 1 }; drawCanvas(); } else lockAndSpawn();
    }
    if (e.key === 'ArrowUp') {
      const rot = rotateMat(p.m);
      for (const kick of [0, -1, 1, -2, 2]) {
        if (!collides({ ...p, x: p.x + kick }, 0, 0, rot)) {
          pieceRef.current = { ...p, m: rot, x: p.x + kick }; drawCanvas(); break;
        }
      }
    }
    if (e.key === ' ') {
      e.preventDefault();
      let dy = 0;
      while (!collides(p, 0, dy + 1)) dy++;
      scoreRef.current += dy * 2; setScore(scoreRef.current);
      pieceRef.current = { ...p, y: p.y + dy };
      drawCanvas(); lockAndSpawn();
    }
  }, [collides, drawCanvas, lockAndSpawn]);

  const startGame = useCallback(() => {
    boardRef.current = Array(ROWS).fill(null).map(() => Array(COLS).fill(null));
    scoreRef.current = 0; linesRef.current = 0; levelRef.current = 1;
    setScore(0); setLines(0); setLevel(1);
    const p = mkPiece(), n = mkPiece();
    pieceRef.current = p; nextRef.current = n; setNextP(n);
    statusRef.current = 'running'; setStatus('running');
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => stepRef.current?.(), 800);
    containerRef.current?.focus(); drawCanvas();
  }, [drawCanvas, mkPiece]);

  useEffect(() => { drawCanvas(); }, [drawCanvas]);
  useEffect(() => { 
    setTimeout(() => containerRef.current?.focus(), 100); 
    return () => clearInterval(intervalRef.current); 
  }, []);

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={handleKey}
      className="h-full bg-[#0d0d18] flex items-center justify-center gap-3 p-4 outline-none relative"
      onClick={() => containerRef.current?.focus()}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-mono text-[var(--accent)] text-sm font-bold tracking-widest uppercase">Tetris</span>
          <span className="font-mono text-white/20 text-[10px]">P = pause</span>
        </div>
        <canvas ref={canvasRef} width={BW} height={BH} className="rounded-xl border border-white/10 shadow-2xl" />
      </div>

      <div className="flex flex-col gap-3 min-w-[90px]">
        <div className="bg-[#1a1a2e] rounded-xl p-3 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[9px] font-bold text-white/25 uppercase tracking-widest">Next</div>
            <button onClick={() => setMusic(!music)} className="text-[10px] text-white/30 hover:text-white/80 transition-colors" title="Activar/Desactivar Música">
              {music ? '🔊' : '🔇'}
            </button>
          </div>
          <NextPreview piece={nextP} />
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-3 border border-white/10 flex flex-col gap-3">
          {[['Score', score], ['Level', level], ['Lines', lines]].map(([k, v]) => (
            <div key={k}>
              <div className="text-[9px] font-bold text-white/25 uppercase tracking-widest">{k}</div>
              <div className="font-mono text-[var(--accent)] font-bold text-lg leading-none mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <div className="text-[9px] text-white/20 font-mono leading-relaxed">
          ← → ↓ Mover<br/>↑ Rotar<br/>Space Drop<br/>P Pausa<br/>Enter Iniciar
        </div>
      </div>

      {(status === 'idle' || status === 'dead' || status === 'paused') && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-b-lg">
          <div className="text-center">
            {status === 'dead' && <p className="text-red-400 font-mono text-sm mb-2 font-bold">Game Over — Score: {score}</p>}
            {status === 'paused' && <p className="text-[var(--accent)] font-mono text-base mb-3 font-bold">⏸ Pausado</p>}
            <button onClick={status === 'paused'
              ? () => { statusRef.current='running'; setStatus('running'); intervalRef.current=setInterval(()=>stepRef.current?.(),Math.max(80,800-(levelRef.current-1)*70)); containerRef.current?.focus(); }
              : startGame}
              className="px-7 py-2.5 bg-[var(--accent)] text-white rounded-xl font-mono text-sm font-bold hover:bg-[var(--accent-hover)] transition-colors"
            >
              {status === 'paused' ? 'Continuar' : status === 'dead' ? 'Jugar de nuevo' : 'Start Game'}
            </button>
            {status === 'idle' && <p className="text-white/20 font-mono text-[9px] mt-2 tracking-wider">Enter para comenzar</p>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Notes App ─────────────────────────────────────────────────────
function NotesApp() {
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
            <StickyNote size={32} strokeWidth={1} />
            <span className="text-sm">Crea una nota</span>
            <button onClick={addNote} className="text-[var(--accent)] text-xs hover:underline">+ Nueva nota</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Notification Toast ─────────────────────────────────────────────
function NotifToast({ id, title, body, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4200);
    return () => clearTimeout(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <motion.div
      initial={{ opacity: 0, x: 64, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 64, scale: 0.92 }} transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex items-start gap-3 bg-[#2d2d2d]/95 backdrop-blur-md border border-white/[0.09] rounded-xl p-3.5 shadow-2xl w-72"
    >
      <div className="w-8 h-8 rounded-lg bg-[#E95420]/20 flex items-center justify-center flex-shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#E95420"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.24 9.76a6.96 6.96 0 01-.54-7.9l1.37 1.37A5.02 5.02 0 007.5 12c0 .97.27 1.87.74 2.63l-1.37 1.37-.01-.24zm4.24 3.24c-.97 0-1.87-.27-2.63-.74L8 18.63a7 7 0 007.9.54l-1.37-1.37c-.76.47-1.66.74-2.63.74zm4.24-1.24l-1.37-1.37A5.02 5.02 0 0016.5 12c0-.97-.27-1.87-.74-2.63l1.37-1.37a6.96 6.96 0 01-.54 7.9l-.11-.14z"/></svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white text-[12px] font-semibold leading-snug">{title}</div>
        <div className="text-white/40 text-[11px] mt-0.5 leading-snug">{body}</div>
      </div>
      <button onClick={onDismiss} className="text-white/20 hover:text-white/60 transition-colors text-base leading-none mt-0.5">×</button>
    </motion.div>
  );
}

// ── DOOM (real shareware via embed) ──────────────
function DoomApp() {
  const [phase, setPhase] = useState('intro'); // intro | bios | loading | playing
  const [bootText, setBootText] = useState([]);
  
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
        <div className="flex-1 w-full relative z-10 flex">
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

// ── Paint App ─────────────────────────────────────────────────────
const PAINT_COLORS = ['#7c6af7','#E95420','#22d3ee','#4ade80','#f87171','#fbbf24','#a78bfa','#f97316','#e2e8f0','#0f172a'];

function PaintApp() {
  const [tool,    setTool]    = useState('pencil');
  const [color,   setColor]   = useState('#7c6af7');
  const [size,    setSize]    = useState(5);
  const [drawing, setDrawing] = useState(false);
  const canvasRef = useRef(null);
  const lastRef   = useRef(null);
  const BG = '#1a1a2e';

  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height);
  }, []);

  const pos = (e) => {
    const cv = canvasRef.current;
    const r = cv.getBoundingClientRect();
    const sx = cv.width / r.width, sy = cv.height / r.height;
    const src = e.touches ? e.touches[0] : e;
    return [(src.clientX - r.left) * sx, (src.clientY - r.top) * sy];
  };

  const paint = (e) => {
    if (!drawing) return;
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    const [x, y] = pos(e);
    ctx.strokeStyle = tool === 'eraser' ? BG : color;
    ctx.lineWidth   = tool === 'eraser' ? size * 3 : size;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath();
    const [lx, ly] = lastRef.current || [x, y];
    ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
    lastRef.current = [x, y];
  };

  const startPaint = (e) => {
    setDrawing(true);
    const [x, y] = pos(e);
    lastRef.current = [x, y];
    const cv = canvasRef.current;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = tool === 'eraser' ? BG : color;
    ctx.beginPath(); ctx.arc(x, y, (tool==='eraser'?size*1.5:size)/2, 0, Math.PI*2); ctx.fill();
  };

  const clear = () => {
    const cv = canvasRef.current; const ctx = cv.getContext('2d');
    ctx.fillStyle = BG; ctx.fillRect(0, 0, cv.width, cv.height);
  };

  const save = () => {
    const cv = canvasRef.current;
    const a = document.createElement('a');
    a.href = cv.toDataURL('image/png'); a.download = 'aznar-paint.png'; a.click();
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="h-10 bg-[#2d2d2d] border-b border-[#444] flex items-center gap-3 px-3 flex-shrink-0">
        <div className="flex gap-1">
          {[{id:'pencil',ch:'✏️'},{id:'eraser',ch:'🧹'}].map(t => (
            <button key={t.id} onClick={() => setTool(t.id)}
              className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-colors ${tool===t.id?'bg-[var(--accent)]/30 ring-1 ring-[var(--accent)]':'hover:bg-white/10'}`}
            >{t.ch}</button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex items-center gap-2">
          <span className="text-white/30 text-[9px] font-mono uppercase tracking-wider">Tamaño</span>
          <input type="range" min="1" max="24" value={size} onChange={e => setSize(+e.target.value)}
            className="w-20" style={{ accentColor: 'var(--accent)' }} />
          <span className="text-white/40 text-[10px] font-mono w-4">{size}</span>
        </div>
        <div className="w-px h-5 bg-white/10" />
        <div className="flex gap-1 items-center flex-wrap">
          {PAINT_COLORS.map(c => (
            <button key={c} onClick={() => { setColor(c); setTool('pencil'); }}
              className={`rounded-full transition-all ${color===c&&tool!=='eraser'?'scale-125 ring-2 ring-white/50':'hover:scale-110'}`}
              style={{ width:13, height:13, background:c, border:'1px solid rgba(255,255,255,0.15)', flexShrink:0 }}
            />
          ))}
          <input type="color" value={color} onChange={e => { setColor(e.target.value); setTool('pencil'); }}
            className="w-6 h-5 rounded cursor-pointer border-0" title="Color personalizado"
            style={{ background:'transparent' }}
          />
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={clear} className="px-2.5 py-1 text-[11px] text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors font-mono">Limpiar</button>
          <button onClick={save}  className="px-2.5 py-1 text-[11px] text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded transition-colors font-mono">💾 Guardar</button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#111118]"
        style={{ cursor: tool==='eraser' ? 'cell' : 'crosshair' }}
      >
        <canvas ref={canvasRef} width={620} height={390}
          onMouseDown={startPaint} onMouseMove={paint}
          onMouseUp={() => setDrawing(false)} onMouseLeave={() => setDrawing(false)}
          onTouchStart={startPaint} onTouchMove={paint} onTouchEnd={() => setDrawing(false)}
          className="rounded-lg shadow-2xl" style={{ maxWidth:'100%', maxHeight:'100%' }}
        />
      </div>

      <div className="h-6 bg-[#252526] border-t border-[#333] px-3 flex items-center gap-4 text-[10px] text-white/20 font-mono flex-shrink-0">
        <span className="w-3 h-3 rounded-full inline-block border border-white/10" style={{ background: tool==='eraser'?BG:color }} />
        <span>{tool === 'eraser' ? 'Goma de borrar' : 'Lápiz'}</span>
        <span>620 × 390 px</span>
        <span className="ml-auto opacity-50">Click + arrastrar para dibujar</span>
      </div>
    </div>
  );
}

// ── System Monitor ────────────────────────────────────────────────
function SystemMonitor() {
  const LEN = 40;
  const base = () => Array(LEN).fill(0).map(() => Math.random() * 35 + 10);
  const [cpu, setCpu]    = useState(base);
  const [gpu, setGpu]    = useState(base);
  const [net, setNet]    = useState({ rx: 1.2, tx: 0.3 });

  useEffect(() => {
    const id = setInterval(() => {
      const bump = (arr) => { const last = arr[arr.length - 1]; return [...arr.slice(1), Math.min(98, Math.max(4, last + (Math.random() - 0.48) * 18))]; };
      setCpu(bump); setGpu(bump);
      setNet({ rx: +(Math.random() * 3).toFixed(1), tx: +(Math.random() * 0.8).toFixed(1) });
    }, 700);
    return () => clearInterval(id);
  }, []);

  const curCpu = cpu[cpu.length - 1].toFixed(1);
  const curGpu = gpu[gpu.length - 1].toFixed(1);
  const mem = 64;

  const sparkline = (data, color, height = 70) => {
    const max = 100, w = 300;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * height}`).join(' ');
    const fill = data.map((v, i) => `${(i / (data.length - 1)) * w},${height - (v / max) * height}`).join(' ') + ` ${w},${height} 0,${height}`;
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={fill} fill={`url(#g${color.replace('#','')})`} />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  };

  const PROCS = [
    { name: 'react-vite',  cpu: curCpu, mem: '8.2',  pid: 420 },
    { name: 'django',      cpu: (parseFloat(curCpu)*0.6).toFixed(1), mem: '6.4', pid: 421 },
    { name: 'postgres',    cpu: '3.2',  mem: '4.1',  pid: 422 },
    { name: 'nginx',       cpu: '0.8',  mem: '1.2',  pid: 423 },
    { name: 'node',        cpu: '2.1',  mem: '3.8',  pid: 424 },
    { name: 'python3',     cpu: '1.4',  mem: '2.9',  pid: 425 },
    { name: 'code',        cpu: '4.7',  mem: '12.1', pid: 426 },
  ];

  const Card = ({ label, value, color, children }) => (
    <div className="bg-[#252526] rounded-xl p-4 border border-white/[0.05]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white/50 text-sm font-medium">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      {children}
    </div>
  );

  return (
    <div className="h-full flex bg-[#1e1e1e] overflow-hidden">
      <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
        <Card label="CPU" value={`${curCpu}%`} color="#7c6af7">{sparkline(cpu, '#7c6af7')}</Card>
        <Card label="GPU / Render" value={`${curGpu}%`} color="#E95420">{sparkline(gpu, '#E95420')}</Card>
        <Card label="Memory" value={`${mem}%`} color="#4ade80">
          <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all" style={{ width: `${mem}%` }} />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] text-white/25 font-mono">
            <span>10.2 GB used</span><span>16 GB total</span>
          </div>
        </Card>
        <Card label="Network" value="" color="#22d3ee">
          <div className="grid grid-cols-2 gap-4 mt-1">
            <div><div className="text-[10px] text-white/30 mb-1">↓ Receiving</div><div className="text-cyan-400 font-mono font-bold">{net.rx} MB/s</div></div>
            <div><div className="text-[10px] text-white/30 mb-1">↑ Sending</div><div className="text-blue-400 font-mono font-bold">{net.tx} MB/s</div></div>
          </div>
        </Card>
      </div>

      <div className="w-56 border-l border-[#333] flex flex-col flex-shrink-0">
        <div className="px-3 py-2.5 border-b border-[#333] text-[10px] font-bold text-white/30 uppercase tracking-widest">Procesos</div>
        <div className="flex-1 overflow-y-auto">
          {PROCS.map(p => (
            <div key={p.pid} className="flex items-center px-3 py-1.5 border-b border-white/[0.04] hover:bg-white/5">
              <span className="flex-1 text-[12px] text-white/60 font-mono truncate">{p.name}</span>
              <span className="text-[11px] font-mono text-[var(--accent)] w-12 text-right">{p.cpu}%</span>
              <span className="text-[11px] font-mono text-green-400/70 w-12 text-right">{p.mem}%</span>
            </div>
          ))}
        </div>
        <div className="px-3 py-2 border-t border-[#333] text-[10px] text-white/20 font-mono">{PROCS.length} procesos</div>
      </div>
    </div>
  );
}

// ── Calculator ────────────────────────────────────────────────────
function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expr, setExpr]   = useState('');
  const [fresh, setFresh] = useState(true);

  const press = (v) => {
    if (display === 'Error') { setDisplay('0'); setExpr(''); setFresh(true); }
    if (v === 'C')  { setDisplay('0'); setExpr(''); setFresh(true); return; }
    if (v === '⌫')  { setDisplay(d => d.length > 1 ? d.slice(0,-1) : '0'); return; }
    if (v === '=')  {
      if (!expr) return;
      try {
        const raw = expr + display;
        // eslint-disable-next-line no-new-func
        const r = Function('"use strict";return(' + raw + ')')();
        if (!isFinite(r)) throw new Error('Math Error');
        const res = String(parseFloat(r.toFixed(10)));
        setDisplay(res);
        setExpr(''); setFresh(true);
      } catch { setDisplay('Error'); setFresh(true); }
      return;
    }
    if (['+','−','×','÷'].includes(v)) {
      const m = {'−':'-','×':'*','÷':'/'};
      const op = m[v] || v;
      if (fresh && expr !== '') {
        setExpr(expr.slice(0, -1) + op);
      } else {
        setExpr(expr + display + op);
        setFresh(true);
      }
      return;
    }
    if (v === '±')  { setDisplay(d => d === '0' ? d : String(-parseFloat(d))); return; }
    if (v === '%')  { setDisplay(d => String(parseFloat(d)/100)); return; }
    if (v === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); }
      else if (!display.includes('.')) { setDisplay(d => d + '.'); }
      return;
    }
    
    if (fresh) { setDisplay(v); setFresh(false); }
    else { setDisplay(d => d === '0' ? v : d.length < 12 ? d + v : d); }
  };

  const handleKey = (e) => {
    const keyMap = {
      'Enter': '=', '=': '=',
      'Escape': 'C', 'Backspace': '⌫', 'Delete': '⌫',
      '+': '+', '-': '−', '*': '×', '/': '÷',
      '%': '%', '.': '.', ',': '.'
    };
    if (/[0-9]/.test(e.key)) { press(e.key); return; }
    if (keyMap[e.key]) { press(keyMap[e.key]); }
  };

  const ROWS = [['C','⌫','%','÷'],['7','8','9','×'],['4','5','6','−'],['1','2','3','+'],[' ±','0','.','=']];

  return (
    <div className="h-full bg-[#1a1a2e] flex items-center justify-center p-4 outline-none" tabIndex={0} onKeyDown={handleKey} autoFocus>
      <div className="w-72">
        <div className="bg-black/50 rounded-2xl p-5 mb-3 border border-white/5">
          <div className="text-white/30 text-xs font-mono h-5 text-right truncate mb-1">
            {expr.replace(/\*/g, '×').replace(/\//g, '÷').replace(/-/g, '−')}
          </div>
          <div className="text-white text-4xl font-light text-right font-mono truncate">{display}</div>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {ROWS.flat().map((btn, i) => {
            const b = btn.trim();
            const isEq = b === '=', isOp = ['+','−','×','÷'].includes(b), isTop = ['C','⌫','%'].includes(b);
            return (
              <button key={i} onClick={() => press(b)}
                className={`h-14 rounded-2xl text-lg font-medium transition-all duration-100 active:scale-95 ${isEq ? 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-[0_4px_20px_rgba(124,106,247,0.3)]' : isOp ? 'bg-[#E95420]/25 text-[#ff9066] hover:bg-[#E95420]/35' : isTop ? 'bg-white/[0.08] text-white/70 hover:bg-white/[0.14]' : 'bg-white/[0.06] text-white hover:bg-white/[0.11]'}`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Files App ─────────────────────────────────────────────────────
function FilesApp({ onOpenFile, lang }) {
  const [path, setPath] = useState('Home/Projects');
  const [selected, setSelected] = useState(null);
  const fs = buildFS(lang);
  const parts = path.split('/');
  const files = fs[path] || [];

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
      <div className="h-11 bg-[#2d2d2d] flex items-center gap-3 px-3 border-b border-black/40 flex-shrink-0">
        <button onClick={() => parts.length > 1 && navTo(parts.length - 2)} disabled={parts.length === 1}
          className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 text-white/60 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex items-center gap-1 text-[12px] bg-black/20 rounded px-2 py-1 flex-1 overflow-hidden">
          {parts.map((part, i) => (
            <React.Fragment key={i}>
              <button onClick={() => navTo(i)} className="text-white/60 hover:text-white transition-colors whitespace-nowrap">{part}</button>
              {i < parts.length - 1 && <span className="text-white/20">/</span>}
            </React.Fragment>
          ))}
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
          {files.length === 0 && <div className="col-span-full text-white/25 text-sm text-center mt-12">Carpeta vacía</div>}
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

// ── Browser App ───────────────────────────────────────────────────
function GoogleTab() {
  const [query, setQuery] = React.useState('');
  const doSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) window.open('https://www.google.com/search?q=' + encodeURIComponent(query.trim()), '_blank');
  };
  return (
    <div className="h-full flex flex-col items-center justify-center bg-white gap-6 px-4">
      <div className="text-[52px] font-light select-none leading-none tracking-tight">
        <span className="text-[#4285f4]">G</span><span className="text-[#ea4335]">o</span><span className="text-[#fbbc05]">o</span><span className="text-[#4285f4]">g</span><span className="text-[#34a853]">l</span><span className="text-[#ea4335]">e</span>
      </div>
      <form onSubmit={doSearch} className="w-full max-w-xl">
        <div className="flex items-center gap-3 border border-gray-300 rounded-full px-4 py-2.5 hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] focus-within:shadow-[0_1px_6px_rgba(32,33,36,0.28)] transition-shadow bg-white">
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar en Google"
            className="flex-1 outline-none text-sm text-gray-800 placeholder:text-gray-400" autoFocus />
          {query && <button type="button" onClick={() => setQuery('')}><X size={16} className="text-gray-400 hover:text-gray-600" /></button>}
        </div>
      </form>
      <div className="flex gap-3">
        <button onClick={doSearch} className="px-5 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:border-[#dadce0] border border-transparent rounded text-sm text-gray-700 transition-colors">Buscar con Google</button>
        <button onClick={() => window.open('https://www.google.com', '_blank')} className="px-5 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] hover:border-[#dadce0] border border-transparent rounded text-sm text-gray-700 transition-colors">Voy a tener suerte</button>
      </div>
      <p className="text-xs text-gray-400">Los resultados abren en una pestaña real del navegador</p>
    </div>
  );
}

function LinkedInTab() {
  return (
    <div className="h-full overflow-auto bg-[#f3f2ef] text-gray-900 text-sm">
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="#0a66c2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        <div className="flex-1 bg-[#eef3f8] rounded-md px-3 py-1.5 text-xs text-gray-400 flex items-center gap-2">
          <Search size={13} className="text-gray-400" /> Buscar
        </div>
        <nav className="hidden sm:flex items-center gap-4 text-[11px] text-gray-500">
          {['Inicio','Mi red','Empleos','Mensajería'].map(n => <span key={n} className="hover:text-black cursor-pointer">{n}</span>)}
        </nav>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-4 flex gap-4">
        <div className="flex-1 min-w-0 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="h-20 bg-gradient-to-r from-[#0a66c2] to-[#004182]" />
            <div className="px-5 pb-5">
              <div className="flex items-end justify-between -mt-10 mb-3">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E95420] to-[#77216F] border-4 border-white flex items-center justify-center text-white text-2xl font-bold shadow-lg">VA</div>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-colors">
                  <ExternalLink size={11}/> Ver perfil real
                </a>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{site.name}</h1>
              <p className="text-gray-600 text-sm">{site.role}</p>
              <p className="text-gray-400 text-xs mt-1">Argentina · <a href={'mailto:' + site.email} className="text-[#0a66c2] hover:underline">{site.email}</a></p>
              <div className="flex items-center gap-3 mt-3 text-xs text-[#0a66c2] font-semibold">
                <span className="cursor-pointer hover:underline">{projects.length} conexiones</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-2">Acerca de</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{site.description}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Experiencia</h2>
            {experience.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">{exp.company[0]}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{exp.role.es}</div>
                  <div className="text-gray-500 text-xs">{exp.company} · Tiempo completo</div>
                  <div className="text-gray-400 text-xs">{exp.period.es}</div>
                  <ul className="mt-2 space-y-1">
                    {exp.impact.es.map((item, j) => (
                      <li key={j} className="text-xs text-gray-600 flex gap-1.5"><span className="text-[#0a66c2] mt-0.5 flex-shrink-0">·</span>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Educación</h2>
            {academic.map((edu, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">UTN</div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{edu.institution}</div>
                  <div className="text-gray-500 text-xs">{edu.degree.es}</div>
                  <div className="text-gray-400 text-xs">{edu.period.es}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">Aptitudes destacadas</h2>
            <div className="flex flex-wrap gap-2">
              {['React','Django','PostgreSQL','Python','TypeScript','Docker','REST APIs','Agile/Scrum'].map(s => (
                <span key={s} className="border border-[#0a66c2] text-[#0a66c2] text-xs px-3 py-1 rounded-full hover:bg-[#eef3f8] cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="w-56 flex-shrink-0 hidden sm:block space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-gray-700">Páginas que podrían interesarte</h3>
            {[{name:'GitHub',sub:'Software'},{name:'Vercel',sub:'Internet'},{name:'UTN',sub:'Educación'}].map(p => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{p.name[0]}</div>
                <div><div className="text-xs font-semibold text-gray-800">{p.name}</div><div className="text-[10px] text-gray-400">{p.sub}</div></div>
                <button className="ml-auto text-[10px] border border-gray-300 rounded-full px-2 py-0.5 text-gray-500 hover:border-gray-400 transition-colors">+ Seguir</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BrowserApp({ lang }) {
  const l = (v) => (v && typeof v === 'object' ? (v[lang] ?? v.es ?? '') : v ?? '');
  const INIT_TABS = [
    { id: 'google',   label: 'Google',      url: 'https://google.com' },
    { id: 'skills',   label: 'Habilidades', url: 'https://aznar-dev.com/skills' },
    { id: 'cv',       label: 'Experiencia', url: 'https://aznar-dev.com/experience' },
    { id: 'contact',  label: 'Contacto',    url: 'https://aznar-dev.com/contact' },
    { id: 'github',   label: 'GitHub',      url: 'https://github.com/Aznar-7' },
    { id: 'linkedin', label: 'LinkedIn',    url: 'https://linkedin.com/in/vicente-aznar-dev' },
    { id: 'youtube',  label: 'YouTube',     url: 'https://youtube.com' },
  ];
  const [tabs, setTabs] = useState(INIT_TABS);
  const [activeTab, setActiveTab] = useState('google');

  const closeTab = (id, e) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    const next = tabs.filter(t => t.id !== id);
    setTabs(next);
    if (activeTab === id) setActiveTab(next[Math.max(0, idx - 1)].id);
  };

  const getTabIcon = (id) => {
    const cls = 'flex-shrink-0';
    switch (id) {
      case 'google':   return <svg viewBox="0 0 24 24" width="13" height="13" className={cls}><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;
      case 'skills':   return <Code size={13} className={'text-blue-400 ' + cls} />;
      case 'cv':       return <Briefcase size={13} className={'text-green-400 ' + cls} />;
      case 'contact':  return <Mail size={13} className={'text-red-400 ' + cls} />;
      case 'github':   return <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" className={'text-gray-200 ' + cls}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
      case 'linkedin': return <svg viewBox="0 0 24 24" width="13" height="13" fill="#0a66c2" className={cls}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
      case 'youtube':  return <svg viewBox="0 0 24 24" width="13" height="13" fill="#ff0000" className={cls}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>;
      default: return <Globe size={13} className={'text-gray-400 ' + cls} />;
    }
  };

  const currentUrl = tabs.find(t => t.id === activeTab)?.url ?? '';

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden rounded-b-xl select-none text-sm">
      <div className="bg-[#1C1B22] flex items-end px-2 pt-2 flex-shrink-0 min-h-[42px]">
        <Reorder.Group axis="x" values={tabs} onReorder={setTabs}
          as="div" className="flex items-end gap-0.5 overflow-x-auto flex-1 min-w-0"
          style={{ listStyle: 'none', margin: 0, padding: 0 }}
        >
          {tabs.map(t => (
            <Reorder.Item key={t.id} value={t} as="div"
              onClick={() => setActiveTab(t.id)}
              className={'flex items-center gap-1.5 h-8 px-2.5 rounded-t-lg cursor-pointer transition-colors flex-shrink-0 group/tab ' + (activeTab === t.id ? 'bg-[#2B2A33] text-white z-10' : 'bg-[#1C1B22] text-gray-400 hover:bg-[#252430] hover:text-gray-200')}
              style={{ minWidth: 0, width: 'clamp(80px,140px,160px)' }}
            >
              {getTabIcon(t.id)}
              <span className="truncate text-[11px] flex-1 select-none">{t.label}</span>
              {tabs.length > 1 && (
                <span onClick={e => closeTab(t.id, e)}
                  className="opacity-0 group-hover/tab:opacity-60 hover:opacity-100 hover:bg-white/15 rounded-full p-0.5 flex items-center flex-shrink-0 transition-opacity">
                  <X size={10} />
                </span>
              )}
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <button className="h-8 w-8 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2B2A33] rounded-full mx-1 transition-colors flex-shrink-0">
          <Plus size={15} />
        </button>
      </div>
      <div className="bg-[#2B2A33] border-b border-[#1C1B22] flex items-center px-2 py-1.5 gap-2 flex-shrink-0">
        <div className="flex gap-1 items-center">
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={15}/></button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><ChevronRight size={15}/></button>
          <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"><RotateCw size={13}/></button>
        </div>
        <div className="flex-1 flex items-center bg-[#1C1B22] border border-[#1C1B22] focus-within:border-[#00DDFF] rounded-full h-7 px-3 gap-2 text-[11px] text-gray-200 shadow-inner group transition-colors">
          <Globe size={12} className="text-gray-400 group-focus-within:text-[#00DDFF] flex-shrink-0" />
          <span className="truncate flex-1">{currentUrl}</span>
          <Star size={12} className="text-gray-400 hover:text-yellow-400 cursor-pointer" />
        </div>
        <a href={site.github} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
          <Menu size={15}/>
        </a>
      </div>
      <div className="flex-1 overflow-hidden bg-[#F9F9FB] text-gray-900 border-x border-b border-[#2B2A33]">
        {activeTab === 'google'   && <GoogleTab />}
        {activeTab === 'linkedin' && <LinkedInTab />}
        {activeTab === 'skills' && (
          <div className="h-full overflow-auto p-5 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-5">Skills & Stack</h1>
            {['Frontend','Backend','Infraestructura','Bases de datos','IoT & Hardware','Otros'].map(cat => {
              const s = skillsData.filter(x => x.category === cat);
              if (!s.length) return null;
              return (
                <div key={cat} className="mb-5">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{cat}</h2>
                  <div className="flex flex-wrap gap-2">
                    {s.map(sk => (
                      <div key={sk.name} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5">
                        <img src={sk.icon} alt={sk.name} className="w-4 h-4 object-contain" loading="lazy" onError={e => e.currentTarget.style.display='none'}/>
                        <span className="text-sm text-gray-700 font-medium">{sk.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === 'cv' && (
          <div className="h-full overflow-auto bg-[#F9F9FB]">
            <div className="max-w-2xl mx-auto p-8 space-y-8">
              <div className="flex items-start justify-between border-b border-gray-200 pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{site.name}</h1>
                  <p className="text-gray-500 mt-1">{site.role}</p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <a href={'mailto:' + site.email} className="hover:text-violet-600 transition-colors">{site.email}</a>
                    <span>·</span>
                    <a href={site.github} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 transition-colors">GitHub</a>
                    <span>·</span>
                    <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 transition-colors">LinkedIn</a>
                  </div>
                </div>
                <a href={site.resumeUrl} download className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors flex-shrink-0">
                  <ExternalLink size={13}/> Descargar PDF
                </a>
              </div>
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Experiencia Laboral</h2>
                {experience.map((exp, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900">{l(exp.role)}</h3>
                        <p className="text-violet-600 font-medium text-sm">{exp.company}</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md font-mono">{l(exp.period)}</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {l(exp.impact).map((item, j) => (
                        <li key={j} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                          <span className="text-violet-400 mt-0.5 flex-shrink-0">▸</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Formación Académica</h2>
                {academic.map((edu, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900">{l(edu.degree)}</h3>
                        <p className="text-violet-600 font-medium text-sm">{edu.institution}</p>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md font-mono">{l(edu.period)}</span>
                    </div>
                    <ul className="mt-3 space-y-2">
                      {l(edu.highlights).map((item, j) => (
                        <li key={j} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                          <span className="text-violet-400 mt-0.5 flex-shrink-0">▸</span>{item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
              <section>
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Stack Principal</h2>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-wrap gap-2">
                  {['React','Django','PostgreSQL','Python','TypeScript','Tailwind CSS','Vite','Docker','Nginx','Oracle Cloud'].map(s => (
                    <span key={s} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-medium">{s}</span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        )}
        {activeTab === 'contact' && (
          <div className="h-full overflow-auto p-6 max-w-lg mx-auto flex flex-col items-center text-center gap-4 mt-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-2xl font-bold">VA</div>
            <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            <p className="text-gray-500">{site.role}</p>
            <div className="flex flex-col gap-3 w-full max-w-xs">
              <a href={'mailto:' + site.email} className="w-full bg-violet-600 text-white py-3 rounded-xl font-semibold hover:bg-violet-700 transition-colors text-sm text-center">{site.email}</a>
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm text-center">GitHub</a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="w-full border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors text-sm text-center">LinkedIn</a>
            </div>
          </div>
        )}
        {activeTab === 'github' && (
          <div className="h-full overflow-auto bg-[#0d1117] text-[#e6edf3]">
            <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="#e6edf3"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                <div className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1 text-xs text-[#8b949e] w-48">Search or jump to...</div>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#8b949e]">
                <span className="hover:text-[#e6edf3] cursor-pointer">Pull requests</span>
                <span className="hover:text-[#e6edf3] cursor-pointer">Issues</span>
              </div>
            </div>
            <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6">
              <div className="w-[260px] flex-shrink-0 space-y-4">
                <div className="w-full aspect-square rounded-full bg-gradient-to-br from-[#E95420] to-[#77216F] flex items-center justify-center text-5xl font-bold text-white shadow-2xl">VA</div>
                <div>
                  <h1 className="text-xl font-bold text-[#e6edf3]">{site.name}</h1>
                  <p className="text-[#8b949e] text-sm">Aznar-7</p>
                </div>
                <p className="text-sm text-[#e6edf3]">Full Stack Developer · React · Django · PostgreSQL</p>
                <a href={site.github} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-xs font-semibold py-1.5 rounded-md transition-colors">
                  <ExternalLink size={12}/> Ver perfil real
                </a>
                <div className="space-y-2 text-sm text-[#8b949e]">
                  <div className="flex items-center gap-2"><span>📍</span>Argentina</div>
                  <div className="flex items-center gap-2"><span>🔗</span><a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] hover:underline text-xs truncate">linkedin.com/in/vicente-aznar-dev</a></div>
                  <div className="flex items-center gap-2"><span>✉️</span><span className="text-xs">{site.email}</span></div>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-4">
                <div className="flex gap-4 border-b border-[#30363d] pb-2 text-sm">
                  {['Overview','Repositories','Projects','Stars'].map((item, i) => (
                    <span key={item} className={'pb-2 cursor-pointer ' + (i === 0 ? 'text-[#e6edf3] font-semibold border-b-2 border-[#f78166]' : 'text-[#8b949e] hover:text-[#e6edf3]')}>{item}</span>
                  ))}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#e6edf3] mb-3">Pinned</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projects.slice(0, 4).map((p, pi) => (
                      <div key={p.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col gap-2 hover:border-[#58a6ff] transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="#8b949e"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/></svg>
                          <span className="text-[#58a6ff] text-xs font-semibold">{p.id}</span>
                          <span className="text-[#8b949e] text-[10px] border border-[#30363d] px-1.5 py-0.5 rounded-full ml-auto">Public</span>
                        </div>
                        <p className="text-[#8b949e] text-xs leading-relaxed line-clamp-2">{l(p.tagline)}</p>
                        <div className="flex items-center gap-3 text-[10px] text-[#8b949e] mt-auto">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3572A5] inline-block"/>Python</span>
                          <span className="flex items-center gap-1">⭐ {[8,12,5,14][pi % 4]}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                  <div className="mb-3"><span className="text-sm text-[#e6edf3] font-semibold">248 contributions in the last year</span></div>
                  <div className="flex gap-0.5 overflow-hidden">
                    {Array.from({ length: 52 }, (_, w) => (
                      <div key={w} className="flex flex-col gap-0.5">
                        {Array.from({ length: 7 }, (_, d) => {
                          const v = Math.random();
                          const bg = v < 0.55 ? '#161b22' : v < 0.70 ? '#0e4429' : v < 0.83 ? '#006d32' : v < 0.93 ? '#26a641' : '#39d353';
                          return <div key={d} className="w-2.5 h-2.5 rounded-sm" style={{ background: bg }} />;
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-1 items-center mt-2 text-[10px] text-[#8b949e]">
                    <span>Less</span>
                    {['#161b22','#0e4429','#006d32','#26a641','#39d353'].map(c => <div key={c} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }}/>)}
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === 'youtube' && (
          <div className="h-full flex flex-col bg-black">
            <iframe src="https://www.youtube.com/embed/1Sihccfgs90?list=RD1Sihccfgs90"
              className="flex-1 w-full border-0" title="YouTube"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen />
          </div>
        )}
      </div>
    </div>
  );
}


// ── Code Editor ───────────────────────────────────────────────────
function EditorApp({ file }) {
  const lines = (file?.content || '// No file open — abre un archivo desde Files').split('\n');
  const ext = file?.name?.split('.').pop() || 'txt';
  const langLabel = { json:'JSON', jsx:'JavaScript React', cpp:'C++', py:'Python', md:'Markdown', sh:'Shell', txt:'Plain Text', pdf:'PDF', ini:'INI', toml:'TOML' }[ext] || 'Text';

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="bg-[#252526] border-b border-black/50 flex flex-shrink-0">
        <div className="px-4 py-2 bg-[#1e1e1e] text-[#ccc] text-[12px] flex items-center gap-2 border-t-2 border-t-[#007acc]">
          <File size={13} className="text-[#519aba]" />{file?.name || 'Untitled'}
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-10 bg-[#1e1e1e] text-[#5a5a5a] text-[12px] text-right pr-2 py-3 select-none font-mono leading-5 flex-shrink-0 overflow-hidden border-r border-[#303030]">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <div className="flex-1 overflow-auto p-3 pl-4">
          <pre className="text-[#d4d4d4] font-mono text-[13px] leading-5 m-0 whitespace-pre-wrap break-words">{file?.content || '// No file open'}</pre>
        </div>
      </div>
      <div className="h-6 bg-[#007acc] px-3 flex items-center justify-between text-white text-[10px] flex-shrink-0">
        <div className="flex gap-3"><span>⎇ main</span><span>Ln 1</span></div>
        <div className="flex gap-3"><span>UTF-8</span><span>{langLabel}</span></div>
      </div>
    </div>
  );
}

// ── PDF Viewer App ────────────────────────────────────────────────
function PdfViewerApp({ src = '/ResumeVicenteAznar.pdf' }) {
  const [zoom, setZoom] = useState(100);

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Toolbar */}
      <div className="h-9 bg-[#252526] border-b border-black/40 flex items-center px-3 gap-3 flex-shrink-0">
        <span className="text-white/50 text-[11px] font-medium flex-1 truncate">ResumeVicenteAznar.pdf</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 25))}
            className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white/60 text-sm flex items-center justify-center transition-colors"
          >−</button>
          <span className="text-white/40 text-[11px] font-mono w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(200, z + 25))}
            className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white/60 text-sm flex items-center justify-center transition-colors"
          >+</button>
        </div>
        <a
          href={src}
          download
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors ml-1"
        >
          <ExternalLink size={12} /> Descargar
        </a>
      </div>

      {/* Iframe viewer */}
      <div className="flex-1 overflow-auto bg-[#404040] flex justify-center py-4">
        <iframe
          src={`${src}#zoom=${zoom}`}
          className="shadow-2xl border-0 h-full"
          style={{ width: `${Math.min(zoom, 100)}%`, minHeight: 600 }}
          title="Resume PDF"
        />
      </div>
    </div>
  );
}

// ── Settings App ──────────────────────────────────────────────────
function SettingsApp({ wallpaper, onWallpaper }) {
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
                ['Procesador',`${site.role} (8 cores)`],
                ['Memoria','∞ Coffee · 16 GB RAM'],
                ['Stack', skillsData.slice(0,5).map(s=>s.name).join(' · ')],
                ['Paquetes',`${skillsData.length} tecnologías instaladas`],
                ['Uptime','2025 — Presente'],
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

// ── Top Bar ───────────────────────────────────────────────────────
// ── Power Menu (GNOME-style) ──────────────────────────────────────
function PowerMenu({ onShutdown, onRestart, onSuspend, onCancel }) {
  // Escape closes, Enter confirms focused button
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const actions = [
    { label: 'Suspender',  icon: Moon,      onClick: onSuspend,  color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.28)' },
    { label: 'Reiniciar',  icon: RefreshCw, onClick: onRestart,  color: '#a3e635', bg: 'rgba(163,230,53,0.10)',  border: 'rgba(163,230,53,0.25)' },
    { label: 'Apagar',     icon: Power,     onClick: onShutdown, color: '#E95420', bg: 'rgba(233,84,32,0.12)',   border: 'rgba(233,84,32,0.30)' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="absolute inset-0 z-[5000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(14px)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.88, y: 20 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-8 rounded-3xl border border-white/[0.1] bg-[#1a1a2e]/90 px-10 py-10 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Ubuntu logo mark */}
        <div className="flex flex-col items-center gap-2">
          <div className="h-10 w-10 rounded-full border-2 border-[#E95420]/60 flex items-center justify-center">
            <div className="h-5 w-5 rounded-full bg-[#E95420]/80" />
          </div>
          <p className="font-mono text-[11px] tracking-[0.22em] text-white/40 uppercase">Ubuntu 24.04 LTS</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-5">
          {actions.map(({ label, icon: Icon, onClick, color, bg, border }) => (
            <button
              key={label}
              onClick={onClick}
              className="group flex flex-col items-center gap-3 rounded-2xl px-6 py-5 transition-all duration-200"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110"
                style={{ background: `${color}22`, color }}
              >
                <Icon size={26} strokeWidth={1.6} />
              </div>
              <span className="font-mono text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase group-hover:text-white transition-colors">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onCancel}
          className="font-mono text-[10px] tracking-[0.18em] text-white/30 uppercase hover:text-white/60 transition-colors"
        >
          Cancelar (Esc)
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Suspend screen ────────────────────────────────────────────────
function SuspendScreen({ onWake }) {
  useEffect(() => {
    const handler = () => onWake()
    window.addEventListener('keydown',    handler)
    window.addEventListener('pointerdown', handler)
    return () => {
      window.removeEventListener('keydown',    handler)
      window.removeEventListener('pointerdown', handler)
    }
  }, [onWake])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-[5000] flex flex-col items-center justify-center bg-black"
    >
      {/* Breathing dot */}
      <motion.div
        className="mb-6 h-2 w-2 rounded-full bg-white/30"
        animate={{ opacity: [0.15, 0.5, 0.15] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <p className="font-mono text-[11px] tracking-[0.35em] text-white/20 uppercase">
        Suspendido
      </p>
      <p className="mt-3 font-mono text-[9px] tracking-[0.2em] text-white/10 uppercase">
        Presione cualquier tecla para despertar
      </p>
    </motion.div>
  )
}

// ── Weather Hook ──────────────────────────────────────────────────
function useWeather() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const fetchWeather = async (lat, lon) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`
        );
        if (!res.ok) return;
        const data = await res.json();
        const code = data.current_weather?.weathercode ?? 0;
        const temp = Math.round(data.current_weather?.temperature ?? 0);
        const icon = code === 0 ? '☀️' : code <= 3 ? '⛅' : code <= 67 ? '🌧️' : code <= 77 ? '🌨️' : '⛈️';
        setWeather({ temp, icon });
      } catch { /* silent fail */ }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        ()  => fetchWeather(-34.6037, -58.3816),
        { timeout: 5000 }
      );
    } else {
      fetchWeather(-34.6037, -58.3816);
    }
  }, []);

  return weather;
}

function TopBar({ time, date, onPower, onActivities, nowPlaying, workspace, onWorkspaceChange, onScreenshot, weather, onWeatherClick }) {
  return (
    <div className="h-7 w-full bg-black/75 flex items-center justify-between px-4 text-white/85 text-[12px] font-medium z-50 backdrop-blur-sm flex-shrink-0 select-none">
      <div className="flex items-center gap-2">
        <button
          onClick={onActivities}
          className="hover:text-white transition-colors cursor-pointer hover:bg-white/10 px-2 py-0.5 rounded"
        >
          Activities
        </button>
        {/* Workspace dots */}
        <div className="flex gap-1">
          {[0, 1, 2, 3].map(i => (
            <button
              key={i}
              onClick={() => onWorkspaceChange(i)}
              className={`w-4 h-2 rounded-sm transition-all ${i === workspace ? 'bg-white/70' : 'bg-white/20 hover:bg-white/40'}`}
              title={`Escritorio ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Center: now playing or clock */}
      {nowPlaying ? (
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] text-white/60">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E95420] animate-pulse" />
          <span className="max-w-[180px] truncate">{nowPlaying.title}</span>
          <span className="text-white/30">—</span>
          <span className="text-white/35 truncate max-w-[100px]">{nowPlaying.artist}</span>
        </div>
      ) : (
        <span className="absolute left-1/2 -translate-x-1/2 tabular-nums hover:text-white transition-colors cursor-default">
          {date && time ? `${date}  ${time}` : '...'}
        </span>
      )}

      <div className="flex items-center gap-3">
        {weather && (
          <span className="text-white/55 text-[11px] flex items-center gap-1 select-none cursor-pointer hover:text-white" onClick={onWeatherClick} title="Ver clima">
            <span>{weather.icon}</span>
            <span>{weather.temp}°C</span>
          </span>
        )}
        <Volume2 size={13} className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"/>
        <Wifi size={13} className="opacity-60"/>
        <BatteryFull size={13} className="opacity-60"/>
        {nowPlaying && <span className="tabular-nums text-white/50 text-[11px]">{time}</span>}
        <button onClick={onScreenshot} className="opacity-60 hover:opacity-100 transition-opacity" title="Captura de pantalla (PrintScreen)">
          <Camera size={13} />
        </button>
        <button onClick={onPower} className="hover:text-[#E95420] transition-colors ml-1" title="Salir de Ubuntu Mode"><Power size={13}/></button>
      </div>
    </div>
  );
}

// ── Main UbuntuOS ─────────────────────────────────────────────────
export function UbuntuOS({ onClose }) {
  const { playOpenApp, playClick, playCloseApp, setBgmAllowed } = useSoundEffects();
  const { lang } = useLang();
  const weather = useWeather();
  const [screen,   setScreen]   = useState('boot');
  const [wallpaper, setWallpaper] = useState(0);
  const desktopRef = useRef(null);
  const osRootRef = useRef(null);

  useEffect(() => {
    // Apagamos la música de fondo de 'modo normal' en Ubuntu
    setBgmAllowed(false);
    return () => setBgmAllowed(true);
  }, [setBgmAllowed]);

  const [wins, setWins] = useState({
    terminal: { open: true,  min: false, max: false },
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
  });
  const [focused, setFocused] = useState('terminal');
  const zRef = useRef(100);
  const [zMap, setZMap] = useState({ terminal:15, files:14, browser:13, settings:12, editor:11, monitor:10, snake:9, mines:8, calc:7, tetris:6, notes:5, doom:4, paint:3, music:2, weather:1, pdf:0 });
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
  const addNotif = useCallback((title, body) => {
    const id = Date.now();
    setNotifs(ns => [...ns, { id, title, body }]);
  }, []);
  const removeNotif = useCallback((id) => setNotifs(ns => ns.filter(n => n.id !== id)), []);

  const takeScreenshot = useCallback(async () => {
    if (!osRootRef.current) return;
    try {
      addNotif('Captura de pantalla', 'Capturando escritorio…');
      const canvas = await html2canvas(osRootRef.current, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        scale: window.devicePixelRatio || 1,
      });
      const url  = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href     = url;
      link.download = `screenshot-${Date.now()}.png`;
      link.click();
      addNotif('Captura guardada', 'Imagen descargada como PNG');
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
    openAppRef.current = (id) => { if (id && wins[id] !== undefined) openApp(id); };
  });
  useEffect(() => {
    const handler = (e) => openAppRef.current?.(e.detail?.app);
    window.addEventListener('ubuntu-open-app', handler);
    return () => window.removeEventListener('ubuntu-open-app', handler);
  }, []);

  useEffect(() => {
    if (screen !== 'desktop') return;
    const handler = (e) => {
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

  const focusWin = (id) => { zRef.current += 1; setZMap(p => ({ ...p, [id]: zRef.current })); setFocused(id); };
  const openApp  = (id, fileData = null) => { playOpenApp(); setWins(p => ({ ...p, [id]: { ...p[id], open: true, min: false, ...(fileData !== null ? { fileData } : {}) } })); setWinWorkspace(p => ({ ...p, [id]: workspace })); focusWin(id); };
  const closeApp = (id) => { playCloseApp(); if (id === 'music') setNowPlaying(null); setWins(p => ({ ...p, [id]: { ...p[id], open: false, min: false } })); };
  const minApp   = (id) => setWins(p => ({ ...p, [id]: { ...p[id], min: true } }));
  const toggleMax = (id) => setWins(p => ({ ...p, [id]: { ...p[id], max: !p[id].max } }));
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
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(ev => window.removeEventListener(ev, reset));
      clearTimeout(inactivityRef.current);
    };
  }, [screen, suspended, screensaver]);

  const DOCK_APPS = [
    { id: 'terminal', label: 'Terminal',        icon: TerminalSquare },
    { id: 'files',    label: 'Archivos',         icon: FolderOpen },
    { id: 'browser',  label: 'Firefox',          icon: Globe },
    { id: 'notes',    label: 'Notas',            icon: StickyNote },
    { id: 'paint',    label: 'Pinta',            icon: Palette },
    { id: 'monitor',  label: 'Monitor del sist.',icon: Activity },
    { id: 'calc',     label: 'Calculadora',      icon: CalcIcon },
    { id: 'settings', label: 'Configuración',    icon: SettingsIcon },
    { id: 'music',    label: 'Rhythmbox',         icon: Music },
    { id: 'weather',  label: 'Clima',             icon: Cloud },
  ];
  const GAME_DOCK = [
    { id: 'snake',  label: 'Snake',       icon: Bug },
    { id: 'mines',  label: 'Buscaminas',  icon: Bomb },
    { id: 'tetris', label: 'Tetris',      icon: Blocks },
    { id: 'doom',   label: 'DOOM',        icon: Shell },
  ];

  const ALL_APPS = [...DOCK_APPS, ...GAME_DOCK];

  const WIN_CFG = {
    terminal: { title: 'aznar@dev: ~',                     w: 750, h: 490, top: 40,  left: 60  },
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
  if (screen === 'boot')  return <AnimatePresence mode="wait"><BootScreen  key="boot"  onDone={() => setScreen('login')} /></AnimatePresence>;
  if (screen === 'login') return <AnimatePresence mode="wait"><LoginScreen key="login" onLogin={() => { setScreen('desktop'); setTimeout(() => { addNotif('Bienvenido', `Sesión iniciada como ${site.name}`); }, 600); setTimeout(() => addNotif('Terminal listo', "Escribe 'help' para ver comandos disponibles"), 2200); }} wallpaperBg={wallpaperBg} /></AnimatePresence>;

  return (
    <motion.div ref={osRootRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9999] flex flex-col overflow-hidden select-none"
      style={{ background: wallpaperBg }}
      onClick={() => setCtxMenu(null)}
      onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY }); }}
    >
      <TopBar time={time} date={date} onPower={() => setPowerMenu(true)} onActivities={() => setAppDrawer(v => !v)} nowPlaying={nowPlaying} workspace={workspace} onWorkspaceChange={setWorkspace} onScreenshot={takeScreenshot} weather={weather} onWeatherClick={() => openApp('weather')} />

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

      <div className="flex-1 flex overflow-hidden">
        {/* Dock */}
        <div className={`${isMobile ? 'w-12' : 'w-14'} bg-black/55 flex flex-col items-center py-2 gap-1 z-40 backdrop-blur-sm flex-shrink-0 overflow-y-auto`}
          style={{ scrollbarWidth: 'none' }}
        >
          {DOCK_APPS.map(app => (
            <DockIcon key={app.id} icon={app.icon} label={app.label}
              isOpen={wins[app.id].open} isFocused={focused===app.id} isMinimized={wins[app.id].min}
              onClick={() => handleDockClick(app.id)}
            />
          ))}

          <div className="my-1 border-b border-white/15 w-8" />

          <div className="text-[9px] text-white/25 font-mono uppercase tracking-wider px-1 text-center leading-tight">Games</div>
          {GAME_DOCK.map(app => (
            <DockIcon key={app.id} icon={app.icon} label={app.label}
              isOpen={wins[app.id].open} isFocused={focused===app.id} isMinimized={wins[app.id].min}
              onClick={() => handleDockClick(app.id)}
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
        <div ref={desktopRef} className="flex-1 relative overflow-hidden" onClick={() => { setCtxMenu(null); setGamePicker(false); }}>
          {/* Main Apps */}
          <DesktopIcon icon={FolderOpen}     label="Proyectos" top={20}  left={20} constraintsRef={desktopRef} onClick={() => openApp('files')} />
          <DesktopIcon icon={TerminalSquare} label="Terminal"  top={110} left={20} constraintsRef={desktopRef} onClick={() => openApp('terminal')} />
          <DesktopIcon icon={Globe}          label="Firefox" top={200} left={20} constraintsRef={desktopRef} onClick={() => openApp('browser')} />
          <DesktopIcon icon={StickyNote}     label="Notas"     top={290} left={20} constraintsRef={desktopRef} onClick={() => openApp('notes')} />
          
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
              />
            )}
          </AnimatePresence>

          <motion.div
            key={workspace}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 pointer-events-none"
          >
            <AnimatePresence>
              {Object.entries(wins).map(([id, win]) => {
                if (!win.open || win.min) return null;
                if ((winWorkspace[id] ?? 0) !== workspace) return null;
                const cfg = WIN_CFG[id];
                return (
                  <Window key={id} title={id === 'editor' ? `${win.fileData?.name || 'Untitled'} — Editor` : cfg.title}
                    zIndex={zMap[id]} isFocused={focused===id} isMaximized={win.max} isMobile={isMobile}
                    defaultTop={cfg.top} defaultLeft={cfg.left} defaultW={cfg.w} defaultH={cfg.h}
                    onFocus={() => focusWin(id)} onClose={() => closeApp(id)} onMinimize={() => minApp(id)} onMaximize={() => toggleMax(id)}
                  >
                    {id === 'terminal' && <TerminalWindow onClose={() => closeApp(id)} isEmbedded />}
                    {id === 'files'    && <FilesApp onOpenFile={(f) => { if (f.isPdf) openApp('pdf'); else openApp('editor', f); }} lang={lang} />}
                    {id === 'browser'  && <BrowserApp lang={lang} />}
                    {id === 'settings' && <SettingsApp wallpaper={wallpaper} onWallpaper={setWallpaper} />}
                    {id === 'editor'   && <EditorApp file={win.fileData} />}
                    {id === 'pdf'      && <PdfViewerApp />}
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
                  </Window>
                );
              })}
            </AnimatePresence>
          </motion.div>

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
