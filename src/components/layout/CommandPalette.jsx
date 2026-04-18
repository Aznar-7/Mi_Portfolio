import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Home, Briefcase, Code, User, Mail, Copy, Check } from 'lucide-react';
import { site } from '@/data/site';
import { useLang } from '@/contexts/LanguageContext';
import { useSoundEffects } from '@/contexts/SoundContext';

export function CommandPalette({ onOpenTerminal }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const { playTyping, playClick, playHover, playModalOpen, playModalClose, playSuccess, playNavigation } = useSoundEffects();
  const inputRef = useRef(null);
  const { lang } = useLang();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) playModalOpen(); else playModalClose();
          return !prev;
        });
      }
      if (e.key === 'Escape') {
        playModalClose();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
    }
  }, [isOpen]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(site.email);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setIsOpen(false);
    }, 1000);
  };

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const actions = [
    { id: 'hero', label: lang === 'es' ? 'Ir al Inicio' : 'Go to Home', icon: Home, action: () => scrollTo('hero') },
    { id: 'experience', label: lang === 'es' ? 'Ver Experiencia' : 'View Experience', icon: Briefcase, action: () => scrollTo('experience') },
    { id: 'projects', label: lang === 'es' ? 'Ver Proyectos' : 'View Projects', icon: Code, action: () => scrollTo('projects') },
    { id: 'about', label: lang === 'es' ? 'Sobre Mí' : 'About Me', icon: User, action: () => scrollTo('about') },
    { id: 'contact', label: lang === 'es' ? 'Contacto' : 'Contact', icon: Mail, action: () => scrollTo('contact') },
    { id: 'copy-email', label: lang === 'es' ? 'Copiar Email' : 'Copy Email', icon: copied ? Check : Copy, action: handleCopyEmail },
  ];

  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
          onClick={() => { playModalClose(); setIsOpen(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center px-4 border-b border-white/10">
              <Terminal className="w-5 h-5 text-white/50 mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  playTyping();
                  setQuery(e.target.value);
                }}
                placeholder={lang === 'es' ? "Escribe un comando o busca..." : "Type a command or search..."}
                className="flex-1 bg-transparent border-none outline-none py-4 text-white placeholder-white/40 text-sm"
              />
              <div className="flex items-center gap-1">
                <kbd className="bg-white/10 text-white/50 px-2 py-1 rounded text-xs">ESC</kbd>
              </div>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredActions.length === 0 ? (
                <div className="p-4 text-center text-white/50 text-sm">
                  {lang === 'es' ? "No se encontraron resultados" : "No results found"}
                </div>
              ) : (
                filteredActions.map((action, idx) => (
                  <button
                    key={action.id || idx}
                    onClick={(e) => {
                      // copy-email gets success sound, nav actions get navigation sound
                      if (action.id === 'copy-email') playSuccess()
                      else playNavigation()
                      action.action(e);
                    }}
                    onMouseEnter={playHover}
                    className="w-full flex items-center px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white rounded-lg transition-colors group"
                  >
                    <action.icon className="w-4 h-4 mr-3 text-white/40 group-hover:text-white/80 transition-colors" />
                    {action.label}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
