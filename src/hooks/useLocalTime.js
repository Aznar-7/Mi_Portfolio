import { useEffect, useState } from 'react'

const TIME_ZONE = 'America/Argentina/Cordoba'

// Current time in Córdoba ("18:42"), refreshed each minute
export function useLocalTime() {
  const format = () =>
    new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIME_ZONE }).format(new Date())
  const [time, setTime] = useState(format)

  useEffect(() => {
    const id = setInterval(() => setTime(format()), 30_000)
    return () => clearInterval(id)
  }, [])

  return time
}
