import {
  SiReact,
  SiVite,
  SiDjango,
  SiPostgresql,
  SiNginx,
  SiPython,
  SiTailwindcss,
  SiSqlite,
  SiMqtt,
  SiCplusplus,
} from '@icons-pack/react-simple-icons'

const ICON_MAP = {
  'React':        SiReact,
  'Vite':         SiVite,
  'Django':       SiDjango,
  'PostgreSQL':   SiPostgresql,
  'Nginx':        SiNginx,
  'Python':       SiPython,
  'Tailwind CSS': SiTailwindcss,
  'SQLite':       SiSqlite,
  'MQTT':         SiMqtt,
  'C/C++':        SiCplusplus,
}

export function TechTag({ name }) {
  const Icon = ICON_MAP[name]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-[11px] text-[var(--text-muted)] ring-1 ring-white/[0.06]">
      {Icon && <Icon size={11} color="currentColor" />}
      {name}
    </span>
  )
}
