type Duration = {
  seconds: number | null | undefined
}

export default function formatTime(seconds: Duration): string {
  if (typeof seconds !== 'number') return '0:00'

  const date = new Date(seconds * 1000)
  const hh = date.getUTCHours()
  const mm = date.getUTCMinutes()
  const ss = date.getUTCSeconds().toString().padStart(2, '0')
  if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
  return `${mm}:${ss}`
}
