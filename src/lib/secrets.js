import { useSyncExternalStore } from 'react'

// Eight secrets, remembered in this browser. Finding one fires a 'secret' event the toast listens to.
export const SECRETS = ['placa', 'mellon', 'hire', 'order66', 'hyperspace', 'mph', 'devtools', 'mate']
const KEY = 'va-secretos'

let found = new Set()
try { found = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch { /* private mode: start empty */ }
const listeners = new Set()

export function findSecret(id) {
  const fresh = !found.has(id)
  if (fresh) {
    found = new Set(found).add(id)
    try { localStorage.setItem(KEY, JSON.stringify([...found])) } catch { /* keep it in memory */ }
    listeners.forEach((l) => l())
  }
  document.dispatchEvent(new CustomEvent('secret', { detail: { id, fresh, count: found.size } }))
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l) }
export const useSecretCount = () => useSyncExternalStore(subscribe, () => found.size)
