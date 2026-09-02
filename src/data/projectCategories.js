// Single source of truth for project categories: used to filter the
// Projects grid (Projects.jsx) and to pick each card's category icon
// (ProjectCard.jsx). Keep `id` in sync with the `category` field on
// each project in `projects.js`.
export const projectCategories = [
  { id: 'full-stack', label: { es: 'Full-Stack', en: 'Full-Stack' }, icon: 'Globe' },
  { id: 'frontend', label: { es: 'Frontend', en: 'Frontend' }, icon: 'Code2' },
  { id: 'backend', label: { es: 'Backend', en: 'Backend' }, icon: 'Server' },
  { id: 'iot', label: { es: 'IoT & Hardware', en: 'IoT & Hardware' }, icon: 'Cpu' },
  { id: 'ai', label: { es: 'AI & Automation', en: 'AI & Automation' }, icon: 'Sparkles' },
]
