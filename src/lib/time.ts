/** Compact relative time formatter — "12s", "4m", "3h", "2d". */
export function relativeTime(iso: string, now: number = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime())
  const s = Math.floor(diff / 1000)
  if (s < 60)        return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60)        return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24)        return `${h}h`
  const d = Math.floor(h / 24)
  return `${d}d`
}
