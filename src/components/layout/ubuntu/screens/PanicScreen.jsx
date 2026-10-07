import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

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

export function PanicScreen({ onDone }) {
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
