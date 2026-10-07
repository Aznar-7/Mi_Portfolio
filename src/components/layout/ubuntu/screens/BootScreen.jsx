import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { File } from 'lucide-react';

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

export function BootScreen({ onDone }) {
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
