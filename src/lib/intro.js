const SESSION_KEY = 'intro_seen'

// Intro plays once per browser session and never with reduced motion
export function shouldPlayIntro() {
  try {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
    return sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    return false
  }
}

export function markIntroSeen() {
  try { sessionStorage.setItem(SESSION_KEY, '1') } catch { /* storage blocked */ }
}
