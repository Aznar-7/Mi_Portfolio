import { useEffect, useState } from 'react'

const TTL_MS = 60 * 60 * 1000

// Share of public repos per primary language: [{ name, share }] sorted, top 5. Cached per session.
export function useGitHubLanguages(user) {
  const key = `gh_langs_${user}`
  const [langs, setLangs] = useState(() => {
    try {
      const c = JSON.parse(sessionStorage.getItem(key))
      return c && Date.now() - c.savedAt < TTL_MS ? c.langs : null
    } catch { return null }
  })

  useEffect(() => {
    if (langs || !user) return
    const ctrl = new AbortController()
    fetch(`https://api.github.com/users/${user}/repos?per_page=100&type=owner`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((repos) => {
        const counts = {}
        for (const r of repos) if (r.language && !r.fork) counts[r.language] = (counts[r.language] || 0) + 1
        const total = Object.values(counts).reduce((a, b) => a + b, 0)
        if (!total) return
        const value = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, n]) => ({ name, share: n / total, n }))
        setLangs(value)
        try { sessionStorage.setItem(key, JSON.stringify({ langs: value, savedAt: Date.now() })) } catch { /* storage blocked */ }
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [user, key, langs])

  return langs
}
