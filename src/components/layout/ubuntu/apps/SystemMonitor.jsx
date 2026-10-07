import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

function Card({ label, value, color, children }) {
  return (
    <div className="bg-[#252526] rounded-xl p-4 border border-white/[0.05]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white/50 text-sm font-medium">{label}</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>{value}</span>
      </div>
      {children}
    </div>
  );
}

export function SystemMonitor() {
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
  const [killed, setKilled] = useState(new Set());
  const killProc = (pid) => setKilled(s => new Set([...s, pid]));
  const visibleProcs = PROCS.filter(p => !killed.has(p.pid));

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
          <AnimatePresence initial={false}>
            {visibleProcs.map(p => (
              <motion.div key={p.pid}
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                transition={{ duration: 0.2 }}
                className="flex items-center px-3 py-1.5 border-b border-white/[0.04] hover:bg-white/5 group"
              >
                <span className="flex-1 text-[12px] text-white/60 font-mono truncate">{p.name}</span>
                <span className="text-[11px] font-mono text-[var(--accent)] w-12 text-right">{p.cpu}%</span>
                <span className="text-[11px] font-mono text-green-400/70 w-10 text-right">{p.mem}%</span>
                <button onClick={() => killProc(p.pid)}
                  className="ml-2 w-5 h-5 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition-all text-xs font-bold flex-shrink-0"
                  title={`kill -9 ${p.pid}`}
                >×</button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="px-3 py-2 border-t border-[#333] text-[10px] text-white/20 font-mono">{visibleProcs.length} procesos</div>
      </div>
    </div>
  );
}
