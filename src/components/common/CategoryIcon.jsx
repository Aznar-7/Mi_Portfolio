import { Globe, Code2, Cpu } from 'lucide-react'

// Resolves the string `icon` field from `projectCategories.js` into a
// lucide-react component. Shared by ProjectCard (per-card badge) and
// Projects (filter tabs) so both stay in sync with one source of truth.
const ICONS = { Globe, Code2, Cpu }

export function CategoryIcon({ name, ...props }) {
  const Icon = ICONS[name]
  if (!Icon) return null
  return <Icon {...props} />
}
