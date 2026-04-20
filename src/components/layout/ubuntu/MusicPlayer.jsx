import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Search, Library, Home, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLAYLIST = [
  {
    id: 1,
    title: "Lofi Study",
    artist: "Chillhop Music",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b",
    url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
  },
  {
    id: 2,
    title: "War Pigs",
    artist: "Black Sabbath",
    cover: "/images/projects/covers/Paranoid.webp",
    url: "/audio/warPigs.mp3"
  },
  {
    id: 3,
    title: "Something",
    artist: "The Beatles",
    cover: "/images/projects/covers/AbbeyRoad.jpg",
    url: "/audio/Something.mp3"
  },
  {
    id: 4,
    title: "No Voy En Tren",
    artist: "Charly García",
    cover: "/images/projects/covers/NoVoy.jpg",
    url: "/audio/NoVoyEnTren.mp3"
  },
];

export function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleTrackChange = (index) => {
    setCurrentTrack(index);
    setIsPlaying(true);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex h-full w-full bg-[#121212] text-white overflow-hidden rounded-lg font-sans">
      <audio 
        ref={audioRef}
        src={PLAYLIST[currentTrack].url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => handleTrackChange((currentTrack + 1) % PLAYLIST.length)}
      />
      
      {/* Sidebar */}
      <div className="w-64 bg-black p-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
            <Music size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">Spotify</span>
        </div>
        
        <nav className="flex flex-col gap-4 text-gray-400 font-semibold">
          <button className="flex items-center gap-4 hover:text-white transition-colors text-left">
            <Home size={24} />
            <span>Inicio</span>
          </button>
          <button className="flex items-center gap-4 hover:text-white transition-colors text-left">
            <Search size={24} />
            <span>Buscar</span>
          </button>
          <button className="flex items-center gap-4 hover:text-white transition-colors text-left">
            <Library size={24} />
            <span>Tu biblioteca</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#2b2b2b] to-[#121212]">
        <div className="p-8 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6">Tu MÃºsica</h2>
          <div className="flex flex-col gap-2">
            {PLAYLIST.map((track, i) => (
              <div 
                key={track.id}
                onClick={() => handleTrackChange(i)}
                className={`flex items-center p-3 rounded-md cursor-pointer transition-colors group ${
                  currentTrack === i ? 'bg-white/10' : 'hover:bg-white/5'
                }`}
              >
                <div className="w-10 flex items-center justify-center text-gray-400 group-hover:text-white">
                  {currentTrack === i && isPlaying ? (
                    <div className="w-4 h-4 flex gap-1 items-end justify-center">
                      <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-[#1db954]" />
                      <motion.div animate={{ height: ["12px", "4px", "12px"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-[#1db954]" />
                      <motion.div animate={{ height: ["8px", "16px", "8px"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-[#1db954]" />
                    </div>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <img src={track.cover} alt={track.title} className="w-10 h-10 rounded mr-4 object-cover" />
                <div className="flex flex-col flex-1 min-w-0">
                  <span className={`font-medium truncate ${currentTrack === i ? 'text-[#1db954]' : 'text-white'}`}>
                    {track.title}
                  </span>
                  <span className="text-sm text-gray-400 truncate">{track.artist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Player Bar */}
        <div className="h-24 bg-[#181818] border-t border-[#282828] px-4 flex items-center justify-between">
          <div className="flex items-center w-1/3 min-w-0">
            <img src={PLAYLIST[currentTrack].cover} alt="Cover" className="w-14 h-14 rounded object-cover" />
            <div className="ml-4 flex flex-col min-w-0">
              <span className="text-sm text-white font-medium truncate">{PLAYLIST[currentTrack].title}</span>
              <span className="text-xs text-gray-400 truncate">{PLAYLIST[currentTrack].artist}</span>
            </div>
          </div>

          <div className="flex flex-col flex-1 items-center max-w-2xl px-4">
            <div className="flex items-center gap-6 mb-2">
              <button 
                onClick={() => handleTrackChange(currentTrack === 0 ? PLAYLIST.length - 1 : currentTrack - 1)}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipBack size={20} className="fill-current" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-8 h-8 bg-white hover:scale-105 transition-transform rounded-full flex items-center justify-center text-black"
              >
                {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-1" />}
              </button>
              
              <button 
                onClick={() => handleTrackChange((currentTrack + 1) % PLAYLIST.length)}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipForward size={20} className="fill-current" />
              </button>
            </div>
            
            <div className="flex items-center w-full gap-2 text-xs text-gray-400">
              <span className="min-w-[40px] text-right">{formatTime(progress)}</span>
              <div className="flex-1 h-1 bg-gray-600 rounded-full group cursor-pointer relative flex items-center">
                <div 
                  className="absolute h-full bg-white group-hover:bg-[#1db954] rounded-full top-0 left-0"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                />
                <div 
                  className="w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 absolute shadow"
                  style={{ left: `calc(${(progress / duration) * 100 || 0}% - 6px)` }}
                />
              </div>
              <span className="min-w-[40px]">{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="w-1/3 flex justify-end items-center pr-2">
            <Volume2 size={20} className="text-gray-400" />
            <div className="w-24 h-1 bg-gray-600 rounded-full ml-2 cursor-pointer relative group flex items-center">
              <div className="absolute h-full bg-white group-hover:bg-[#1db954] rounded-full top-0 left-0 w-2/3" />
              <div className="w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 absolute shadow left-2/3 -ml-[6px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
