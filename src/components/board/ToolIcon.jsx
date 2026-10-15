import { Box, Cloud, Cpu, Database } from 'lucide-react'
import { TECH_ICONS } from '@/data/techIcons'

// Tools without a brand mark get a plain glyph instead of a made-up logo
const FALLBACK = { 'Oracle Cloud': Cloud, FreeRTOS: Cpu, '3D Modeling': Box, 'SQL Server': Database }

// Monochrome by default; CSS paints it in the brand color (--brand) on hover
export function ToolIcon({ name, size = 14 }) {
  const entry = TECH_ICONS[name]
  if (entry) return <entry.Icon size={size} color="currentColor" aria-hidden="true" className="ti" style={{ '--brand': entry.brand }} />
  const Glyph = FALLBACK[name]
  return Glyph ? <Glyph size={size} strokeWidth={1.75} aria-hidden="true" className="ti" /> : null
}
