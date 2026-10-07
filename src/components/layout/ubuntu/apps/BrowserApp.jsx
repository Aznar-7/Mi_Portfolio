import { useState } from 'react';
import { Reorder } from 'motion/react';
import { Globe, ChevronLeft, ExternalLink, Plus, Code, Briefcase, Mail, X, ChevronRight, RotateCw, Star, Menu, Search, Cloud, MapPin, Link } from 'lucide-react';
import React from 'react';
import { site } from '@/data/site';
import { projects } from '@/data/projects';
import { skillGroups } from '@/data/skills';
import { TECH_ICONS } from '@/data/techIcons';
import { experience, academic } from '@/data/experience';

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
                <span className="cursor-pointer hover:underline">{projects.length} proyectos visibles</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-2">Acerca de</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Desarrollador full-stack con base en Sistemas de Información: procesos, datos, interfaces, APIs y despliegues. Trabajo con React, Django, PostgreSQL y Linux/cloud.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Experiencia</h2>
            {experience.map((exp, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">{exp.company[0]}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">{exp.role.es}</div>
                  <div className="text-gray-500 text-xs">{exp.company} · Desarrollo web</div>
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
                  <div className="text-gray-500 text-xs">Diseño, implementación y control de sistemas de información</div>
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
            {[{name:'GitHub',sub:'Repositorios'},{name:'Vercel',sub:'Deploys'},{name:'UTN',sub:'Sistemas de Información'}].map(p => (
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

export function BrowserApp({ lang }) {
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
            {skillGroups.map(group => (
                <div key={group.id} className="mb-5">
                  <h2 className="text-sm font-semibold text-gray-500 mb-3">{group.label.es}</h2>
                  <div className="flex flex-wrap gap-2">
                    {group.items.map(name => {
                      const Icon = TECH_ICONS[name]?.Icon;
                      return (
                        <div key={name} className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700">
                          {Icon && <Icon size={14} color="default" aria-hidden="true" />}
                          <span className="text-sm font-medium">{name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
            ))}
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
                <a href={site.resumes[lang].url} download={site.resumes[lang].filename} className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors flex-shrink-0">
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
                <p className="text-sm text-[#e6edf3]">Full Stack Developer · Sistemas de Información · Cloud</p>
                <a href={site.github} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] text-xs font-semibold py-1.5 rounded-md transition-colors">
                  <ExternalLink size={12}/> Ver perfil real
                </a>
                <div className="space-y-2 text-sm text-[#8b949e]">
                  <div className="flex items-center gap-2"><MapPin size={14} aria-hidden="true" />Argentina</div>
                  <div className="flex items-center gap-2"><Link size={14} aria-hidden="true" /><a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="text-[#58a6ff] hover:underline text-xs truncate">linkedin.com/in/vicente-aznar-dev</a></div>
                  <div className="flex items-center gap-2"><Mail size={14} aria-hidden="true" /><span className="text-xs">{site.email}</span></div>
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
                    {projects.slice(0, 4).map((p) => (
                      <div key={p.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col gap-2 hover:border-[#58a6ff] transition-colors cursor-pointer">
                        <div className="flex items-center gap-2">
                          <svg viewBox="0 0 16 16" width="14" height="14" fill="#8b949e"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/></svg>
                          <span className="text-[#58a6ff] text-xs font-semibold">{p.id}</span>
                          <span className="text-[#8b949e] text-[10px] border border-[#30363d] px-1.5 py-0.5 rounded-full ml-auto">Public</span>
                        </div>
                        <p className="text-[#8b949e] text-xs leading-relaxed line-clamp-2">{l(p.tagline)}</p>
                        <div className="flex items-center gap-3 text-[10px] text-[#8b949e] mt-auto">
                          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3572A5] inline-block"/>{p.tech[0]}</span>
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
