import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';

const PLAYLIST = [
  { id: 1, title: 'Lofi Study',          artist: 'FASSounds',       duration: 146, cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=300&q=80', url: 'https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3' },
  { id: 2, title: 'Good Night',          artist: 'FASSounds',       duration: 147, cover: 'https://images.unsplash.com/photo-1493225457124-a1a2a4af4048?auto=format&fit=crop&w=300&q=80', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_248559ebbf.mp3' },
  { id: 3, title: 'Chill Abstract (Intention)', artist: 'Coma-Media', duration: 111, cover: 'https://images.unsplash.com/photo-1478737270239-2feae9e9d722?auto=format&fit=crop&w=300&q=80', url: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3' },
  { id: 4, title: 'Lofi Chill (The Boy)',artist: 'Guz-beats',       duration: 151, cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80', url: 'https://cdn.pixabay.com/audio/2024/09/24/audio_33a011d8fb.mp3' },
  { id: 5, title: 'Nightfall Beats',     artist: 'Lofi-Chill',      duration: 122, cover: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&w=300&q=80', url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_11cfcfb6ab.mp3' }
];

function fmt(s) {
  if (isNaN(s) || !s) return '0:00';
  const m = Math.floor(s / 60), ss = Math.floor(s % 60);
  return `${m}:${String(ss).padStart(2, '0')}`;
}

export function MusicPlayer({ onNowPlaying }) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const audioRef = useRef(null);

  const song = PLAYLIST[idx];

  const next = useCallback(() => {
    const nextIdx = shuffle
      ? Math.floor(Math.random() * PLAYLIST.length)
      : (idx + 1) % PLAYLIST.length;
    setIdx(nextIdx);
    setPlaying(true);
  }, [idx, shuffle]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleTimeUpdate = () => setElapsed(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [repeat, shuffle, idx, next]);

  // Handle src change
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    if (audio.src !== song.url) {
        audio.src = song.url;
        audio.load();
    }
    
    if (playing) {
      audio.play().catch(e => console.error("Audio playback failed", e));
    }
  }, [idx, song.url, playing]);

  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    
    if (playing) {
      audio.play().catch(e => {
        console.error("Audio playback failed", e);
        setPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [playing]);

  // Handle volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const prev = () => {
    if (!audioRef.current) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    setIdx((idx - 1 + PLAYLIST.length) % PLAYLIST.length);
    setPlaying(true);
  };

  // Notify parent of now-playing
  useEffect(() => {
    onNowPlaying?.(playing ? song : null);
  }, [playing, song, onNowPlaying]);

  const progress = duration > 0 ? (elapsed / duration) * 100 : 0;

  return (
    <div className="h-full bg-[#121212] flex flex-col font-sans select-none text-white">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar/Playlist */}
        <div className="w-1/3 min-w-[200px] border-r border-[#282828] flex flex-col bg-[#000000]">
          <div className="p-4 text-xl font-bold tracking-tight">Tu Biblioteca</div>
          <div className="flex-1 overflow-y-auto px-2 pb-2" style={{ scrollbarWidth: 'none' }}>
            {PLAYLIST.map((s, i) => (
              <button key={s.id} onClick={() => { setIdx(i); setPlaying(true); }}
                className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${i === idx ? 'bg-[#2a2a2a]' : 'hover:bg-[#1a1a1a]'}`}
              >
                <img src={s.cover} alt={s.title} className="w-10 h-10 rounded shadow object-cover" />
                <div className="flex-1 min-w-0 text-left">
                  <div className={`text-[13px] truncate font-semibold ${i === idx ? 'text-[#1db954]' : 'text-white'}`}>{s.title}</div>
                  <div className="text-[11px] text-white/60 truncate">{s.artist}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Currently Playing View */}
        <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-[#333] to-[#121212]">
          {/* Background overlay */}
          <div className="absolute inset-0 bg-cover bg-center blur-[80px] opacity-30 pointer-events-none" style={{ backgroundImage: `url(${song.cover})` }} />
          
          <div className="z-10 flex flex-col items-center justify-center p-8 w-full max-w-md mt-6">
              <img src={song.cover} alt={song.title} 
                className="w-48 h-48 sm:w-[260px] sm:h-[260px] object-cover shadow-[0_15px_30px_rgba(0,0,0,0.6)] mb-8" 
                style={{ borderRadius: '8px' }}
              />

              <div className="w-full">
                <h2 className="text-2xl sm:text-3xl font-bold mb-1 truncate text-center">{song.title}</h2>
                <p className="text-sm sm:text-base text-white/70 mb-6 truncate text-center">{song.artist}</p>
              </div>
          </div>
        </div>
      </div>

      {/* Spotify-style Bottom Player Bar */}
      <div className="h-[90px] bg-[#181818] border-t border-[#282828] flex items-center px-4 justify-between flex-shrink-0 gap-4">
        
        {/* Left: Track Info */}
        <div className="flex items-center gap-3 w-[30%] min-w-[100px]">
          <img src={song.cover} alt={song.title} className="w-14 h-14 rounded object-cover shadow-sm" />
          <div className="min-w-0 flex-1 hidden sm:block">
            <div className="text-[14px] text-white font-medium hover:underline cursor-pointer truncate">{song.title}</div>
            <div className="text-[11px] text-white/70 hover:underline cursor-pointer truncate">{song.artist}</div>
          </div>
        </div>

        {/* Center: Controls & Progress */}
        <div className="flex flex-col items-center flex-1 max-w-[600px] mt-1">
          <div className="flex items-center gap-5 sm:gap-6 mb-2">
            <button onClick={() => setShuffle(!shuffle)} className={`transition-colors ${shuffle ? 'text-[#1db954]' : 'text-white/50 hover:text-white'}`}>
              <Shuffle size={18} />
            </button>
            <button onClick={prev} className="text-white/70 hover:text-white transition-colors">
              <SkipBack size={24} fill="currentColor" />
            </button>
            <button onClick={() => setPlaying(!playing)}
              className="w-9 h-9 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition-transform"
            >
              {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={next} className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={24} fill="currentColor" />
            </button>
            <button onClick={() => setRepeat(!repeat)} className={`transition-colors ${repeat ? 'text-[#1db954]' : 'text-white/50 hover:text-white'}`}>
              <Repeat size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full max-w-[500px]">
            <span className="text-[11px] text-white/50 font-mono w-10 text-right">{fmt(elapsed)}</span>
            <div className="flex-1 h-1.5 bg-[#4d4d4d] rounded-full flex items-center group cursor-pointer relative"
              onClick={e => {
                if (!audioRef.current || !duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                audioRef.current.currentTime = ratio * duration;
                setElapsed(ratio * duration);
              }}
            >
              <div className="h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors relative" style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[11px] h-[11px] bg-white rounded-full opacity-0 group-hover:opacity-100 shadow -mr-[5.5px]" />
              </div>
            </div>
            <span className="text-[11px] text-white/50 font-mono w-10">{fmt(duration || song.duration)}</span>
          </div>
        </div>

        {/* Right: Volume */}
        <div className="flex items-center gap-2 w-[30%] justify-end min-w-[70px] hidden sm:flex">
          <button onClick={() => setVolume(v => v > 0 ? 0 : 75)} className="text-white/50 hover:text-white transition-colors">
             <Volume2 size={18} />
          </button>
          <div className="w-24 h-1.5 bg-[#4d4d4d] rounded-full flex items-center group cursor-pointer"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              setVolume(ratio * 100);
            }}
          >
            <div className="h-full bg-white group-hover:bg-[#1db954] rounded-full relative" style={{ width: `${volume}%` }}>
               <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[11px] h-[11px] bg-white rounded-full opacity-0 group-hover:opacity-100 shadow -mr-[5.5px]" />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
