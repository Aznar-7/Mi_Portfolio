import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Search, Library, Home, Music, Shuffle, Repeat, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_PLAYLISTS = [
  {
    id: "p1",
    title: "Rock & Mix",
    description: "Tus temas favoritos de los proyectos.",
    cover: "/images/projects/covers/AbbeyRoad.jpg",
    tracks: [
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
      {
        id: 7,
        title: "Dirty Deeds Done Dirt Cheap",
        artist: "AC/DC",
        cover: "/images/projects/covers/dirtyDeeds.jpg",
        url: "/audio/dirtyDeeds.mp3"
      }
    ]
  },
  {
    id: "p2",
    title: "Lofi Study",
    description: "Beats libres de derechos para programar.",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b",
    tracks: [
      {
        id: 1,
        title: "Lofi Study",
        artist: "Chillhop Music",
        cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b",
        url: "https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
      },
      {
        id: 5,
        title: "Synthwave Night",
        artist: "Retro vibes",
        cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17",
        url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_1c2c317fdb.mp3"
      },
      {
        id: 6,
        title: "Acoustic Breeze",
        artist: "Benjamin Tissot",
        cover: "https://images.unsplash.com/photo-1453738773917-9c3eff1db985",
        url: "https://cdn.pixabay.com/download/audio/2022/11/22/audio_fc8626f594.mp3"
      }
    ]
  }
];

export function MusicPlayer() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'playlist'
  const [activeViewPlaylist, setActiveViewPlaylist] = useState(ALL_PLAYLISTS[0]);

  // Player State
  const [activePlaylistData, setActivePlaylistData] = useState(ALL_PLAYLISTS[0]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const audioRef = useRef(null);

  const currentTrackInfo = activePlaylistData.tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex, activePlaylistData]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const goNext = () => {
    if (isShuffle) {
      // Pick a random track that isn't the current one (if possible)
      const maxIdx = activePlaylistData.tracks.length;
      if (maxIdx > 1) {
        let nextIdx = currentTrackIndex;
        while (nextIdx === currentTrackIndex) {
          nextIdx = Math.floor(Math.random() * maxIdx);
        }
        setCurrentTrackIndex(nextIdx);
      } else {
        setCurrentTrackIndex(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        }
      }
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % activePlaylistData.tracks.length);
    }
    setIsPlaying(true);
  };

  const goPrev = () => {
    if (progress > 3) {
      // Restart current track if we are more than 3 seconds in
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    setCurrentTrackIndex((prev) => (prev === 0 ? activePlaylistData.tracks.length - 1 : prev - 1));
    setIsPlaying(true);
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      goNext();
    }
  };

  const playSongFromPlaylist = (playlist, trackIndex) => {
    setActivePlaylistData(playlist);
    setCurrentTrackIndex(trackIndex);
    setIsPlaying(true);
  };

  // Play entire playlist from beginning or random (if shuffle)
  const playEntirePlaylist = (playlist) => {
    setActivePlaylistData(playlist);
    if (isShuffle) {
      setCurrentTrackIndex(Math.floor(Math.random() * playlist.tracks.length));
    } else {
      setCurrentTrackIndex(0);
    }
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
        src={currentTrackInfo?.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      {/* Sidebar - Solo visible de sm para arriba */}
      <div className="w-64 bg-black p-6 flex flex-col gap-6 hidden sm:flex">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-black">
            <Music size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">Spotify</span>
        </div>
        
        <nav className="flex flex-col gap-4 text-gray-400 font-semibold">
          <button 
            onClick={() => setCurrentView('home')}
            className={`flex items-center gap-4 transition-colors text-left ${currentView === 'home' ? 'text-white' : 'hover:text-white'}`}
          >
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
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-[#2b2b2b] to-[#121212] relative">
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          
          <AnimatePresence mode='wait'>
            {currentView === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center gap-4 sm:hidden mb-6 text-gray-400">
                  <MenuButtonMobile onClick={() => setCurrentView('home')} />
                  <span className="font-bold text-xl text-white">Music</span>
                </div>

                <h2 className="text-2xl font-bold mb-6">Buenos días</h2>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ALL_PLAYLISTS.map(pl => (
                    <div 
                      key={"top_" + pl.id}
                      onClick={() => {
                        setActiveViewPlaylist(pl);
                        setCurrentView('playlist');
                      }}
                      className="bg-white/5 hover:bg-white/10 transition flex items-center gap-3 sm:gap-4 rounded overflow-hidden cursor-pointer group"
                    >
                      <img src={pl.cover} className="w-12 h-12 sm:w-16 sm:h-16 object-cover shadow-[4px_0_12px_rgba(0,0,0,0.5)] flex-shrink-0" alt={pl.title} />
                      <div className="font-semibold text-xs sm:text-sm truncate pr-2 sm:pr-4 flex-1">{pl.title}</div>
                      <div 
                        className="hidden sm:flex absolute right-4 opacity-0 group-hover:opacity-100 transition shadow-lg bg-[#1db954] text-black w-10 h-10 rounded-full items-center justify-center hover:scale-105"
                        onClick={(e) => {
                          e.stopPropagation();
                          playEntirePlaylist(pl);
                        }}
                      >
                        <Play size={20} className="ml-1" />
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="text-xl font-bold mt-10 mb-6">Tus playlists</h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {ALL_PLAYLISTS.map(pl => (
                    <div 
                      key={"made_" + pl.id}
                      onClick={() => {
                        setActiveViewPlaylist(pl);
                        setCurrentView('playlist');
                      }}
                      className="bg-[#181818] hover:bg-[#282828] transition p-4 rounded-md cursor-pointer group min-w-[140px] w-40 sm:w-48 flex-shrink-0"
                    >
                      <div className="relative mb-4 w-full aspect-square">
                        <img src={pl.cover} className="w-full h-full object-cover rounded-md shadow-lg" alt={pl.title} />
                        <div 
                          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all shadow-lg bg-[#1db954] text-black w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            playEntirePlaylist(pl);
                          }}
                        >
                          <Play size={20} className="ml-1 sm:hidden" />
                          <Play size={24} className="ml-1 hidden sm:block" />
                        </div>
                      </div>
                      <div className="font-semibold text-sm sm:text-base truncate mb-1">{pl.title}</div>
                      <div className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 leading-relaxed">{pl.description}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentView === 'playlist' && (
              <motion.div 
                key="playlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="sticky top-0 z-10 bg-gradient-to-b from-[#2b2b2b] to-transparent py-2 px-1 mb-2">
                  <button 
                    onClick={() => setCurrentView('home')}
                    className="flex items-center text-gray-400 hover:text-white text-sm font-medium transition bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md w-max"
                  >
                    <ChevronLeft size={20} /> Volver
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 mt-2">
                  <img src={activeViewPlaylist.cover} alt="Playlist cover" className="w-48 h-48 sm:w-52 sm:h-52 shadow-2xl object-cover rounded-md" />
                  <div className="flex flex-col gap-2 text-center sm:text-left mt-4 sm:mt-0">
                    <span className="text-xs font-bold uppercase hidden sm:block">Playlist</span>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-2 leading-tight">{activeViewPlaylist.title}</h1>
                    <span className="text-sm text-gray-300 px-4 sm:px-0">{activeViewPlaylist.description}</span>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-gray-300 font-medium">
                      <span>Spotify</span>
                      <span>•</span>
                      <span>{activeViewPlaylist.tracks.length} canciones</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-8 px-2">
                  <button 
                    onClick={() => playEntirePlaylist(activeViewPlaylist)}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1db954] hover:scale-105 transition-transform rounded-full flex items-center justify-center text-black"
                  >
                    <Play size={24} className="fill-current ml-1 sm:hidden" />
                    <Play size={28} className="fill-current ml-1 hidden sm:block" />
                  </button>

                  <button 
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`transition bg-transparent ${isShuffle ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Shuffle size={28} />
                  </button>

                </div>

                {/* Header list */}
                <div className="hidden sm:flex flex-col gap-1 w-full text-gray-400 text-sm mb-4 border-b border-white/10 pb-2 px-3 sticky top-14 bg-[#121212]/90 backdrop-blur-md z-10 py-2">
                  <div className="flex">
                    <div className="w-10 text-center">#</div>
                    <div className="flex-1 pl-2">Título</div>
                  </div>
                </div>

                {/* Tracks */}
                <div className="flex flex-col gap-1 sm:gap-2 pb-6">
                  {activeViewPlaylist.tracks.map((track, i) => {
                    const isThisTrackPlaying = activePlaylistData.id === activeViewPlaylist.id && currentTrackIndex === i;
                    
                    return (
                      <div 
                        key={"track_" + track.id}
                        onClick={() => playSongFromPlaylist(activeViewPlaylist, i)}
                        className={`flex items-center p-2 sm:p-3 rounded-md cursor-pointer transition-colors group ${
                          isThisTrackPlaying ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                      >
                        <div className="w-8 sm:w-10 flex items-center justify-center text-gray-400 group-hover:text-white">
                          {isThisTrackPlaying && isPlaying ? (
                            <div className="w-4 h-4 flex gap-[2px] sm:gap-1 items-end justify-center">
                              <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-[3px] sm:w-1 bg-[#1db954]" />
                              <motion.div animate={{ height: ["12px", "4px", "12px"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-[3px] sm:w-1 bg-[#1db954]" />
                              <motion.div animate={{ height: ["8px", "16px", "8px"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-[3px] sm:w-1 bg-[#1db954]" />
                            </div>
                          ) : (
                            <span className={`text-sm ${isThisTrackPlaying ? 'text-[#1db954]' : ''}`}>{i + 1}</span>
                          )}
                        </div>
                        <img src={track.cover} alt={track.title} className="w-10 h-10 rounded mr-3 sm:mr-4 object-cover" />
                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                          <span className={`font-medium text-sm sm:text-base truncate ${isThisTrackPlaying ? 'text-[#1db954]' : 'text-white'}`}>
                            {track.title}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-400 truncate">{track.artist}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Player Bar */}
        <div className="h-20 sm:h-24 bg-[#181818] border-t border-[#282828] px-2 sm:px-4 flex items-center justify-between relative z-20 w-full">
          
          {/* Info Canción (Responsive) */}
          <div className="flex items-center w-2/5 sm:w-1/3 min-w-0">
            {currentTrackInfo && (
              <>
                <img src={currentTrackInfo.cover} alt="Cover" className="hidden sm:block w-14 h-14 rounded object-cover" />
                <div className="sm:ml-4 flex flex-col min-w-0 pl-1">
                  <span className="text-xs sm:text-sm text-white font-medium truncate">{currentTrackInfo.title}</span>
                  <span className="text-[10px] sm:text-xs text-gray-400 truncate">{currentTrackInfo.artist}</span>
                </div>
              </>
            )}
          </div>

          {/* Controles del Reproductor Principales */}
          <div className="flex flex-col flex-1 items-center justify-center sm:max-w-2xl px-2 sm:px-4 w-full">
            <div className="flex items-center justify-center gap-3 sm:gap-6 mb-1 sm:mb-2 w-full max-w-[250px] sm:max-w-full">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`transition hidden sm:block ${isShuffle ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'}`}
              >
                <Shuffle size={16} />
              </button>

              <button 
                onClick={goPrev}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipBack size={18} className="fill-current sm:size-[20px]" />
              </button>
              
              <button 
                onClick={togglePlay}
                className="w-8 h-8 sm:w-8 sm:h-8 bg-white hover:scale-105 transition-transform rounded-full flex items-center justify-center text-black shadow-md flex-shrink-0"
              >
                {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-1" />}
              </button>
              
              <button 
                onClick={goNext}
                className="text-gray-400 hover:text-white transition"
              >
                <SkipForward size={18} className="fill-current sm:size-[20px]" />
              </button>

              <button 
                onClick={() => setIsRepeat(!isRepeat)}
                className={`transition hidden sm:block ${isRepeat ? 'text-[#1db954]' : 'text-gray-400 hover:text-white'}`}
              >
                <Repeat size={16} />
              </button>
            </div>
            
            {/* Barra de progreso */}
            <div className="flex items-center w-full gap-2 text-[10px] sm:text-xs text-gray-400">
              <span className="min-w-[32px] sm:min-w-[40px] text-right">{formatTime(progress)}</span>
              <div 
                className="flex-1 h-1 sm:h-1 bg-gray-600 rounded-full group cursor-pointer relative flex items-center py-2"
                onClick={(e) => {
                  const bounds = e.currentTarget.getBoundingClientRect();
                  // Ajuste de cálculo de bounds para un hitbox más grande py-2
                  const yHitboxHeight = e.currentTarget.clientHeight;
                  const percent = (e.clientX - bounds.left) / bounds.width;
                  if (audioRef.current && percent >= 0 && percent <= 1) {
                    audioRef.current.currentTime = percent * duration;
                  }
                }}
              >
                <div className="w-full bg-gray-600 h-1 absolute left-0 rounded-full" />
                <div 
                  className="absolute h-1 bg-white group-hover:bg-[#1db954] rounded-full top-1/2 -translate-y-1/2 left-0 transition-colors"
                  style={{ width: `${(progress / duration) * 100 || 0}%` }}
                />
                <div 
                  className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 absolute shadow top-1/2 -translate-y-1/2 left-0 transition-opacity"
                  style={{ left: `calc(${(progress / duration) * 100 || 0}% - 4px)` }}
                />
              </div>
              <span className="min-w-[32px] sm:min-w-[40px]">{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Volumen y Extras */}
          <div className="w-1/5 sm:w-1/3 flex justify-end items-center sm:pr-2 hidden sm:flex">
            <Volume2 size={16} className="text-gray-400 sm:size-5" />
            <div className="w-16 sm:w-24 h-1 bg-gray-600 rounded-full ml-2 cursor-pointer relative group flex items-center">
              <div className="absolute h-full bg-white group-hover:bg-[#1db954] rounded-full top-0 left-0 w-2/3" />
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 absolute shadow left-2/3 -ml-[4px] top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="w-1/5 flex sm:hidden justify-end pr-2">
            {/* Controles mobile extra */}
            <button 
              onClick={() => setIsShuffle(!isShuffle)}
              className={`transition ${isShuffle ? 'text-[#1db954]' : 'text-gray-400'}`}
            >
              <Shuffle size={14} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Simple mobile menu icon component
function MenuButtonMobile({onClick}) {
  return (
    <button onClick={onClick} className="text-white">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    </button>
  );
}
