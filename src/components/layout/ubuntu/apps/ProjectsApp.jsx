import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ExternalLink, ImageOff } from 'lucide-react';
import { GitHubIcon } from '@/components/common/SocialIcons';
import { TechTag } from '@/components/common/TechTag';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ProjectGallery } from '@/components/common/ProjectGallery';
import { projects } from '@/data/projects';
import { useSoundEffects } from '@/contexts/SoundContext';
import { translations } from '@/i18n/translations';
import { l } from '@/lib/utils';

const links = (p) => [
  ...(p.liveUrl ? [{ url: p.liveUrl, label: 'Demo', Icon: ExternalLink }] : []),
  ...(Array.isArray(p.githubUrl) ? p.githubUrl : p.githubUrl ? [{ url: p.githubUrl }] : [])
    .map(({ url, label }) => ({ url, label: label ?? 'GitHub', Icon: GitHubIcon })),
];

function Detail({ project, lang, T, onBack }) {
  const [index, setIndex] = useState(0);
  const images = project.gallery?.length ? project.gallery : project.image ? [project.image] : [];
  return (
    <motion.div
      key={project.id}
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 overflow-y-auto"
    >
      <button onClick={onBack} className="sticky top-0 z-10 flex w-full items-center gap-1 border-b border-white/10 bg-[#242424]/95 px-3 py-2 text-sm text-white/70 backdrop-blur hover:text-white">
        <ChevronLeft size={16} /> Proyectos
      </button>
      <ProjectGallery images={images} index={index} onChange={setIndex} title={project.title} T={T} />
      <div className="p-6">
        <StatusBadge status={project.status} label={T.status[project.status]} />
        <h2 className="mt-2 text-2xl font-semibold text-white">{project.title}</h2>
        <p className="mt-1 text-white/60">{l(project.tagline, lang)}</p>
        <p className="mt-4 text-sm leading-relaxed text-white/70">{l(project.description, lang)}</p>
        <div className="mt-5 flex flex-wrap gap-1.5">{project.tech.map((t) => <TechTag key={t} name={t} />)}</div>
        <div className="mt-6 flex flex-wrap gap-2">
          {links(project).map(({ url, label, Icon }) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-3.5 py-2 text-sm text-white hover:bg-white/20">
              <Icon size={14} aria-hidden="true" /> {label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// GNOME Software-style showcase of the portfolio projects
export function ProjectsApp({ lang }) {
  const T = translations[lang].projects;
  const { playSelect, playSwipe } = useSoundEffects();
  const [selected, setSelected] = useState(null);

  return (
    <div className="relative h-full overflow-hidden bg-[#1e1e1e] text-white">
      <AnimatePresence initial={false} mode="popLayout">
        {selected ? (
          <Detail key="detail" project={selected} lang={lang} T={T} onBack={() => { playSwipe(); setSelected(null); }} />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 overflow-y-auto p-5"
          >
            <h2 className="mb-4 text-lg font-semibold">Proyectos</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {projects.map((p) => (
                <button key={p.id} onClick={() => { playSelect(); setSelected(p); }}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-[#2a2a2a] text-left transition-colors hover:border-white/25">
                  <div className="aspect-[16/9] overflow-hidden bg-black/40">
                    {p.image
                      ? <img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      : <div className="flex h-full items-center justify-center text-white/25"><ImageOff size={28} aria-hidden="true" /></div>}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{p.title}</span>
                      {p.featured && <span className="text-[11px] text-[#E95420]">Destacado</span>}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-white/50">{l(p.tagline, lang)}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
