import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music, Shuffle, Repeat } from 'lucide-react';

const PLAYLIST = [
  { id: 1, title: 'Lo-Fi Study Beats',   artist: 'Chillhop',        duration: 214, cover: '#7c6af7' },
  { id: 2, title: 'Tokyo Dreaming',       artist: 'Nujabes',         duration: 187, cover: '#E95420' },
  { id: 3, title: 'Coffee & Code',        artist: 'Lofi Hip Hop',    duration: 203, cover: '#4ade80' },
  { id: 4, title: 'Midnight Compile',     artist: 'Synthwave Dev',   duration: 241, cover: '#22d3ee' },
  { id: 5, title: 'Late Night Deploy',    artist: 'Chill Beats',     duration: 198, cover: '#a78bfa' },
  { id: 6, title: 'git commit -m "flow"', artist: 'Developer Mix',   duration: 176, cover: '#fb923c' },
];

function fmt(s) {
  const m = Math.floor(s / 60), ss = s % 60;
  return `${m}:${String(ss).padStart(2, '0')}`;
}

export function MusicPlayer({ onNowPlaying }) {
  const [idx,     setIdx]     = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [volume,  setVolume]  = useState(75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat,  setRepeat]  = useState(false);
  const intervalRef           = useRef(null);

  const song = PLAYLIST[idx];

  const next = useCallback(() => {
    const nextIdx = shuffle
      ? Math.floor(Math.random() * PLAYLIST.length)
      : (idx + 1) % PLAYLIST.length;
    setIdx(nextIdx);
    setElapsed(0);
  }, [idx, shuffle]);

  // Auto-advance on song end
  useEffect(() => {
    if (!playing) return;
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        if (e >= song.duration) {
          if (repeat) return 0;
          next();
          return 0;
        }
        return e + 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [playing, song.duration, next, repeat]);

  // Notify parent of now-playing
  useEffect(() => {
    onNowPlaying?.(playing ? song : null);
  }, [playing, song, onNowPlaying]);

  const progress = (elapsed / song.duration) * 100;

  const prev = () => {
    if (elapsed > 3) { setElapsed(0); return; }
    setIdx(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
    setElapsed(0);
  };

  return (
    <div className="h-full bg-[#1a1a2e] flex flex-col overflow-hidden select-none">
      {/* Now playing panel */}
      <div className="flex flex-col items-center justify-center gap-6 p-8 flex-shrink-0"
        style={{ background: `linear-gradient(160deg, ${song.cover}18 0%, transparent 70%)` }}
      >
        {/* Album art */}
        <div className="w-40 h-40 rounded-2xl shadow-2xl flex items-center justify-center relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${song.cover}aa, ${song.cover}44)` }}
        >
          {playing && (
            <div className="absolute inset-0 rounded-2xl animate-pulse"
              style={{ boxShadow: `0 0 40px ${song.cover}55` }}
            />
          )}
          <Music size={56} className="text-white/60" strokeWidth={1} />
        </div>

        {/* Title */}
        <div className="text-center">
          <div className="text-white font-semibold text-lg leading-snug">{song.title}</div>
          <div className="text-white/45 text-sm mt-0.5">{song.artist}</div>
        </div>

        {/* Progress bar */}
        <div className="w-full px-2 flex flex-col gap-1.5">
          <div
            className="w-full h-1 bg-white/10 rounded-full cursor-pointer group relative"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setElapsed(Math.floor(ratio * song.duration));
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: song.cover }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
              style={{ left: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/30 font-mono">
            <span>{fmt(elapsed)}</span>
            <span>{fmt(song.duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-5">
          <button onClick={() => setShuffle(v => !v)}
            className={`transition-colors ${shuffle ? 'text-[#7c6af7]' : 'text-white/30 hover:text-white/60'}`}
          >
            <Shuffle size={15} />
          </button>
          <button onClick={prev} className="text-white/60 hover:text-white transition-colors">
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={() => setPlaying(v => !v)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95"
            style={{ background: song.cover }}
          >
            {playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-0.5" />}
          </button>
          <button onClick={next} className="text-white/60 hover:text-white transition-colors">
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button onClick={() => setRepeat(v => !v)}
            className={`transition-colors ${repeat ? 'text-[#7c6af7]' : 'text-white/30 hover:text-white/60'}`}
          >
            <Repeat size={15} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 w-full px-2">
          <Volume2 size={13} className="text-white/30 flex-shrink-0" />
          <input type="range" min="0" max="100" value={volume} onChange={e => setVolume(+e.target.value)}
            className="flex-1 accent-[#E95420] h-1 cursor-pointer"
          />
          <span className="text-[10px] text-white/25 font-mono w-6 text-right">{volume}</span>
        </div>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-y-auto border-t border-white/[0.06]">
        <div className="px-3 py-2 text-[10px] font-bold text-white/25 uppercase tracking-widest">Playlist</div>
        {PLAYLIST.map((s, i) => (
          <button key={s.id} onClick={() => { setIdx(i); setElapsed(0); setPlaying(true); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5 ${i === idx ? 'bg-white/[0.07]' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.cover}30` }}
            >
              {i === idx && playing
                ? <Pause size={12} style={{ color: s.cover }} fill="currentColor" />
                : <Play  size={12} style={{ color: s.cover }} fill="currentColor" className="ml-0.5" />
              }
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className={`text-[12px] truncate font-medium ${i === idx ? 'text-white' : 'text-white/60'}`}>{s.title}</div>
              <div className="text-[10px] text-white/30 truncate">{s.artist}</div>
            </div>
            <span className="text-[10px] text-white/25 font-mono flex-shrink-0">{fmt(s.duration)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
