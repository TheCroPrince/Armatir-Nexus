import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Mail,
  MessageSquare,
  Settings,
  Sparkles,
  Workflow as WorkflowIcon,
  AtSign,
  AlertCircle,
} from 'lucide-react'
import { integrationsById } from '@/data/nexus'
import { getNexusIcon } from '@/types/nexus-icons'
import type { NexusNotification, NotificationKind } from '@/types/nexus'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'

interface NotificationsPanelProps {
  open: boolean
  onClose: () => void
  notifications: NexusNotification[]
  onUpdate: (next: NexusNotification[]) => void
}

type Filter = 'all' | 'unread'

// ─── Kind metadata (icon + tint) ─────────────────────────────────────────────

const kindMeta: Record<NotificationKind, { icon: typeof Bell; tint: string; ring: string; label: string }> = {
  reply:    { icon: Mail,           tint: 'text-[oklch(38%_0.12_250)]',  ring: 'bg-[oklch(94%_0.04_250)]', label: 'Reply' },
  workflow: { icon: WorkflowIcon,   tint: 'text-[oklch(40%_0.13_155)]',  ring: 'bg-[oklch(94%_0.05_165)]', label: 'Workflow' },
  ai:       { icon: Sparkles,       tint: 'text-[oklch(42%_0.16_295)]',  ring: 'bg-[oklch(94%_0.06_295)]', label: 'AI' },
  mention:  { icon: AtSign,         tint: 'text-[oklch(42%_0.16_280)]',  ring: 'bg-[oklch(94%_0.06_280)]', label: 'Mention' },
  system:   { icon: AlertCircle,    tint: 'text-[oklch(42%_0.15_70)]',   ring: 'bg-[oklch(94%_0.05_75)]',  label: 'System' },
}

export function NotificationsPanel({ open, onClose, notifications, onUpdate }: NotificationsPanelProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const items = notifications
  const [filter, setFilter] = useState<Filter>('all')
  const [tick, setTick] = useState(0)

  // ESC to close + click outside
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node
      if (!panelRef.current) return
      if (panelRef.current.contains(target)) return
      // Ignore clicks on the bell anchor itself (it toggles via its own handler).
      const anchor = (e.target as HTMLElement).closest?.('[data-notifications-anchor]')
      if (anchor) return
      onClose()
    }
    window.addEventListener('keydown', onKey)
    // Defer 'mousedown' listener to next tick so the open click itself doesn't immediately close.
    const id = setTimeout(() => window.addEventListener('mousedown', onClick), 0)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
      clearTimeout(id)
    }
  }, [open, onClose])

  // Re-render every 12s so relative timestamps stay fresh.
  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setTick((t) => t + 1), 12_000)
    return () => clearInterval(id)
  }, [open])

  const filtered = useMemo(
    () => (filter === 'unread' ? items.filter((n) => !n.read) : items),
    [items, filter],
  )

  const unreadCount = items.filter((n) => !n.read).length

  function markAllRead() {
    onUpdate(items.map((n) => ({ ...n, read: true })))
  }

  function markOne(id: string) {
    onUpdate(items.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  function activate(n: NexusNotification) {
    markOne(n.id)
    if (n.href) {
      navigate(n.href)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          exit={{    opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          // Anchored under the bell — right-aligned to viewport with comfortable inset.
          className="glass-strong fixed right-3 top-[58px] z-40 w-[380px] overflow-hidden rounded-2xl md:right-5"
          role="dialog"
          aria-label="Notifications"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-hairline-soft)] px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(94%_0.05_295)] text-[oklch(42%_0.16_295)]">
                <Bell className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
              <div>
                <div className="text-[13px] font-medium text-[var(--color-ink)]">Notifications</div>
                <div className="text-[10.5px] text-[var(--color-ink-faint)]">
                  {unreadCount === 0 ? "You're all caught up" : `${unreadCount} unread`}
                </div>
              </div>
            </div>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-canvas-deep)] hover:text-[var(--color-ink)] disabled:opacity-40 disabled:hover:bg-transparent"
              aria-label="Mark all as read"
            >
              <CheckCheck className="h-3 w-3" strokeWidth={1.8} />
              Mark all read
            </button>
          </div>

          {/* Filter pills */}
          <div className="flex items-center justify-between gap-2 border-b border-[var(--color-hairline-soft)] px-3 py-2">
            <div className="flex items-center gap-1">
              {(['all', 'unread'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-[11px] font-medium capitalize transition-colors',
                    filter === f
                      ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-card)]'
                      : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]',
                  )}
                >
                  {f}{f === 'unread' && unreadCount > 0 && (
                    <span className="ml-1 inline-flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-[var(--color-rose)] px-1 text-[9px] font-medium text-white tabular-nums">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-faint)]">
              <span className="live-dot !h-1.5 !w-1.5" /> Live
            </span>
          </div>

          {/* List */}
          <div className="max-h-[60vh] overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
                <Check className="h-5 w-5 text-[oklch(40%_0.13_155)]" />
                <p className="text-[13px] text-[var(--color-ink)]">Nothing new here.</p>
                <p className="text-[11px] text-[var(--color-ink-faint)]">Nexus will surface anything that needs your attention.</p>
              </div>
            ) : (
              <ul>
                {filtered.map((n) => {
                  const meta = kindMeta[n.kind]
                  const integration = n.source ? integrationsById[n.source] : null
                  const SourceIcon = integration ? getNexusIcon(integration.icon) : null
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => activate(n)}
                        className={cn(
                          'group flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors',
                          n.read ? 'hover:bg-white/60' : 'bg-[oklch(99%_0.012_285)] hover:bg-white',
                        )}
                      >
                        {/* Unread dot rail */}
                        <span
                          className={cn(
                            'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                            n.read ? 'bg-transparent' : 'bg-[var(--color-violet)] shadow-[0_0_0_3px_oklch(62%_0.20_285_/_0.18)]',
                          )}
                          aria-hidden="true"
                        />

                        {/* Kind icon */}
                        <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', meta.ring)}>
                          <meta.icon className={cn('h-3.5 w-3.5', meta.tint)} strokeWidth={1.8} />
                        </span>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p className={cn(
                              'flex-1 text-[12.5px] leading-snug',
                              n.read ? 'text-[var(--color-ink-soft)]' : 'font-medium text-[var(--color-ink)]',
                            )}>
                              {n.title}
                            </p>
                            <span
                              suppressHydrationWarning
                              data-tick={tick}
                              className="shrink-0 font-mono text-[10.5px] tabular-nums text-[var(--color-ink-faint)]"
                            >
                              {relativeTime(n.timestamp)}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-[var(--color-ink-faint)]">
                            {n.body}
                          </p>

                          <div className="mt-1.5 flex items-center gap-2">
                            {integration && SourceIcon && (
                              <span className="inline-flex items-center gap-1.5 text-[10.5px] text-[var(--color-ink-faint)]">
                                <span
                                  className="inline-flex h-3 w-3 items-center justify-center rounded-[3px]"
                                  style={{ background: integration.accent }}
                                >
                                  <SourceIcon className="h-1.5 w-1.5 text-white" strokeWidth={2.6} />
                                </span>
                                <span>{integration.name}</span>
                              </span>
                            )}
                            <span className="chip rounded-full px-1.5 py-0.5 text-[10px] text-[var(--color-ink-soft)]">
                              {meta.label}
                            </span>
                            {n.action && (
                              <span className="ml-auto inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--color-violet)] opacity-0 transition-opacity group-hover:opacity-100">
                                {n.action}
                                <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-[var(--color-hairline-soft)] bg-[oklch(99%_0.005_280_/_0.6)] px-3 py-2">
            <button
              onClick={() => { navigate('/activity'); onClose() }}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-[var(--color-ink-soft)] transition-colors hover:bg-white hover:text-[var(--color-ink)]"
            >
              <MessageSquare className="h-3 w-3" strokeWidth={1.8} />
              See in activity
            </button>
            <button className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-[var(--color-ink-faint)] transition-colors hover:bg-white hover:text-[var(--color-ink-soft)]">
              <Settings className="h-3 w-3" strokeWidth={1.8} />
              Preferences
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
