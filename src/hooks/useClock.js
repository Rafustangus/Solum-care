import { useEffect, useState } from 'react'

export function useClock(intervalMs = 30000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    let timer = null

    function start() {
      if (timer) return
      timer = setInterval(() => setNow(new Date()), intervalMs)
    }

    function stop() {
      if (!timer) return
      clearInterval(timer)
      timer = null
    }

    function handleVisibility() {
      if (document.visibilityState === 'hidden') {
        stop()
        return
      }
      setNow(new Date())
      start()
    }

    start()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [intervalMs])

  return now
}
