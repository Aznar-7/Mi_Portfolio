import { useEffect, useState } from 'react'

const TTL_MS = 10 * 60 * 1000 // unauthenticated GitHub API allows 60 requests/hour per IP

// Most recent public push of a GitHub user: { repo, at } or null
export function useLatestPush(user) {
  const key = `latest_push_${user}`
  const [push, setPush] = useState(() => {
    try {
      const cached = JSON.parse(sessionStorage.getItem(key))
      return cached && Date.now() - cached.savedAt < TTL_MS ? cached.push : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (push || !user) return
    const controller = new AbortController()
    fetch(`https://api.github.com/users/${user}/events/public?per_page=30`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((events) => {
        const latest = events
          .filter((e) => e.type === 'PushEvent')
          .sort((a, b) => b.created_at.localeCompare(a.created_at))[0]
        if (!latest) return
        const value = { repo: latest.repo.name.split('/')[1], at: latest.created_at }
        setPush(value)
        try { sessionStorage.setItem(key, JSON.stringify({ push: value, savedAt: Date.now() })) } catch { /* storage blocked */ }
      })
      .catch(() => {})
    return () => controller.abort()
  }, [user, key, push])

  return push
}

// "hace 3 horas" / "3 hours ago"
export function timeAgo(iso, lang) {
  const seconds = (new Date(iso).getTime() - Date.now()) / 1000
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(Math.round(seconds / 60) || 0, 'minute')
}
