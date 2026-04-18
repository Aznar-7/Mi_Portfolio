import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const SoundContext = createContext(null)

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(
    () => typeof window !== 'undefined' && localStorage.getItem('site_muted') === 'true'
  )
  const audioCtxRef = useRef(null)

  const initAudio = () => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioContextCtor()
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume()
    }
  }

  useEffect(() => {
    window.addEventListener('mousedown', initAudio, { once: true })
    window.addEventListener('keydown', initAudio, { once: true })
    window.addEventListener('touchstart', initAudio, { once: true })
    return () => {
      window.removeEventListener('mousedown', initAudio)
      window.removeEventListener('keydown', initAudio)
      window.removeEventListener('touchstart', initAudio)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('site_muted', isMuted)
  }, [isMuted])

  const toggleMute = () => {
    initAudio() // ensure ctx is ready if user manually un-mutes
    setIsMuted((m) => !m)
  }

  const playTone = useCallback((frequency, type, duration, vol, env = 'exp') => {
    if (isMuted || !audioCtxRef.current) return
    const ctx = audioCtxRef.current
    if (ctx.state === 'suspended') ctx.resume()
    
    const time = ctx.currentTime
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, time)
    
    gainNode.gain.setValueAtTime(vol, time)
    if (env === 'exp') {
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + duration)
    } else {
      gainNode.gain.linearRampToValueAtTime(0.01, time + duration)
    }
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(time)
    oscillator.stop(time + duration)
  }, [isMuted])

  const playTyping = useCallback(() => {
    // Mechanical clack (randomized slightly for realistic typing)
    playTone(150 + Math.random() * 50, 'triangle', 0.05, 0.05)
  }, [playTone])

  const playHover = useCallback(() => {
    // Soft UI tick
    playTone(300, 'sine', 0.05, 0.02)
  }, [playTone])

  const playClick = useCallback(() => {
    // Firm UI click (double pulse)
    playTone(400, 'sine', 0.08, 0.08)
    setTimeout(() => playTone(600, 'sine', 0.05, 0.05), 15)
  }, [playTone])
  
  const playOpenApp = useCallback(() => {
    // Subtle chime UP when opening Ubuntu App or similar action
    playTone(440, 'sine', 0.1, 0.05)
    setTimeout(() => playTone(880, 'sine', 0.15, 0.05), 50)
  }, [playTone])

  return (
    <SoundContext.Provider value={{ isMuted, toggleMute, playTyping, playHover, playClick, playOpenApp }}>
      {children}
    </SoundContext.Provider>
  )
}

export const useSoundEffects = () => {
  const context = useContext(SoundContext)
  if (!context) {
    return { isMuted: true, toggleMute: () => {}, playTyping: () => {}, playHover: () => {}, playClick: () => {}, playOpenApp: () => {} }
  }
  return context
}
