import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radio } from 'lucide-react'
import { nexusActivityPool, nexusActivitySeed, integrationsById } from '@/data/nexus'
import { getNexusIcon } from '@/types/nexus-icons'
import type { ActivityStatus, NexusActivityEvent } from '@/types/nexus'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'

const statusStyle: Record<ActivityStatus, { dot: string; ring: string }> = {
  success: { dot: 'bg-[var(--color-mint)]',  ring: 'shadow-[0_0_0_4px_oklch(72%_0.13_165_/_0.18)]' },
  info:    { dot: 'bg-[var(--color-blue)]',  ring: 'shadow-[0_0_0_4px_oklch(64%_0.18_245_/_0.16)]' },
  warning: { dot: 'bg-[var(--color-amber)]', ring: 'shadow-[0_0_0_4px_oklch(78%_0.14_70_/_0.20)]' },
  ai:      { dot: 'bg-[var(--color-ai)]',    ring: 'shadow-[0_0_0_4px_oklch(60%_0.22_295_/_0.18)]' },
}

interface ActivityFeedProps {
  /** Render at most N events. */
  limit?: number
  className?: string
  showHeader?: boolean
  statusFilter?: ActivityStatus | 'all'
  query?: string
  sinceMs?: number
}

export function ActivityFeed({
  limit = 9,
  className,
  showHeader = true,
  statusFilter = 'all',
  query = '',
  sinceMs,
}: ActivityFeedProps) {
  const [events, setEvents] = useState<NexusActivityEvent[]>(nexusActivitySeed)
  const [tick, setTick] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const counter = useRef(events.length)

  // Prepend new events on a 3.4–5.8s irregular cadence so it never feels mechanical.
  useEffect(() => {
    let cancelled = false
    function next() {
      if (cancelled) return
      const delay = 3400 + Math.random() * 2400
      setTimeout(() => {
        if (cancelled) return
        const pick = nexusActivityPool[Math.floor(Math.random() * nexusActivityPool.length)]!
        const id = `evt-live-${++counter.current}`
        setEvents((prev) => [
          { id, timestamp: new Date().toISOString(), ...pick },
          ...prev,
        ].slice(0, 24))
        next()
      }, delay)
    }
    next()
    return () => { cancelled = true }
  }, [])

  // Re-render every 12s so relative timestamps stay fresh without driving heavy work.
  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1)
      setNow(Date.now())
    }, 12_000)
    return () => clearInterval(id)
  }, [])

  const visibleEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    const cutoff = sinceMs ? now - sinceMs : null
    return events.filter((event) => {
      if (statusFilter !== 'all' && event.status !== statusFilter) return false
      if (cutoff && new Date(event.timestamp).getTime() < cutoff) return false
      if (!q) return true
      const integration = integrationsById[event.source]
      return [
        event.message,
        event.source,
        event.workflowId,
        integration?.name,
      ].filter(Boolean).some((value) => value!.toLowerCase().includes(q))
    })
  }, [events, now, query, sinceMs, statusFilter])

  return (
    <div className={cn('glass relative flex flex-col overflow-hidden rounded-2xl', className)}>
      {showHeader && (
        <div className="flex items-center justify-between border-b border-[var(--color-hairline-soft)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[oklch(94%_0.05_165)] text-[oklch(40%_0.13_155)]">
              <Radio className="h-3.5 w-3.5" strokeWidth={1.8} />
            </span>
            <div>
              <div className="text-[13px] font-medium text-[var(--color-ink)]">Live activity</div>
              <div className="text-[10.5px] text-[var(--color-ink-faint)]">Streaming · last 24h</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="live-dot" />
            <span className="mono-label">Live</span>
          </div>
        </div>
      )}

      <div className="relative flex-1">
        <AnimatePresence initial={false}>
          {visibleEvents.slice(0, limit).map((e) => {
            const integration = integrationsById[e.source]
            const Icon = integration ? getNexusIcon(integration.icon) : null
            const s = statusStyle[e.status]
            return (
              <motion.div
                key={e.id}
                layout
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0,   height: 'auto' }}
                exit={{    opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="group relative"
              >
                <div className="flex items-start gap-3 border-b border-[var(--color-hairline-soft)] px-4 py-2.5 last:border-b-0">
                  {/* Timeline rail */}
                  <span className={cn('relative mt-1.5 flex h-2 w-2 shrink-0 rounded-full', s.dot, s.ring)} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className="flex-1 text-[12.5px] leading-snug text-[var(--color-ink)]">
                        {e.message}
                      </p>
                      <span
                        suppressHydrationWarning
                        className="shrink-0 font-mono text-[10.5px] tabular-nums text-[var(--color-ink-faint)]"
                        data-tick={tick}
                      >
                        {relativeTime(e.timestamp)}
                      </span>
                    </div>

                    {integration && Icon && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm"
                          style={{ background: integration.accent }}
                        >
                          <Icon className="h-2 w-2 text-white" strokeWidth={2.4} />
                        </span>
                        <span className="text-[10.5px] text-[var(--color-ink-faint)]">{integration.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        {visibleEvents.length === 0 && (
          <div className="flex min-h-[220px] items-center justify-center px-6 text-center text-[13px] text-[var(--color-ink-faint)]">
            No activity matches the current filters.
          </div>
        )}
      </div>
    </div>
  )
}
