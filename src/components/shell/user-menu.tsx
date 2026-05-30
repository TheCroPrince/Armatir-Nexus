import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Bot,
  LogOut,
  PlugZap,
  RotateCcw,
  Settings,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'

interface UserMenuProps {
  open: boolean
  onClose: () => void
  onOpenPalette: () => void
  onOpenSettings: () => void
}

const menuItemClass =
  'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12.5px] font-medium text-[var(--color-ink-soft)] transition-colors hover:bg-white/65 hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet-soft)]'

function MenuIcon({ icon: Icon, tone = 'violet' }: { icon: LucideIcon; tone?: 'violet' | 'mint' | 'amber' | 'neutral' }) {
  return (
    <span
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
        tone === 'mint' && 'bg-[oklch(94%_0.05_165)] text-[oklch(40%_0.13_155)]',
        tone === 'amber' && 'bg-[oklch(95%_0.05_75)] text-[oklch(48%_0.14_70)]',
        tone === 'neutral' && 'bg-white/70 text-[var(--color-ink-faint)]',
        tone === 'violet' && 'bg-[oklch(94%_0.06_285)] text-[var(--color-violet)]',
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
    </span>
  )
}

export function UserMenu({ open, onClose, onOpenPalette, onOpenSettings }: UserMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const noticeTimerRef = useRef<number | null>(null)
  const [notice, setNotice] = useState('Demo session only.')

  useEffect(() => {
    if (!open) return

    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null

    const focusId = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('[data-menu-item]')?.focus()
    }, 0)

    function focusMenuItem(direction: 1 | -1 | 'first' | 'last') {
      if (!panelRef.current) return
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>('[data-menu-item]'))
      if (items.length === 0) return

      if (direction === 'first') {
        items[0]?.focus()
        return
      }
      if (direction === 'last') {
        items[items.length - 1]?.focus()
        return
      }

      const activeIndex = Math.max(0, items.indexOf(document.activeElement as HTMLElement))
      const nextIndex = (activeIndex + direction + items.length) % items.length
      items[nextIndex]?.focus()
    }

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        focusMenuItem(1)
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        focusMenuItem(-1)
      }
      if (e.key === 'Home') {
        e.preventDefault()
        focusMenuItem('first')
      }
      if (e.key === 'End') {
        e.preventDefault()
        focusMenuItem('last')
      }
    }

    function onClick(e: MouseEvent) {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      const anchor = (e.target as HTMLElement).closest?.('[data-user-menu-anchor]')
      if (anchor) return
      onClose()
    }

    window.addEventListener('keydown', onKey)
    const clickId = window.setTimeout(() => window.addEventListener('mousedown', onClick), 0)

    return () => {
      window.clearTimeout(focusId)
      window.clearTimeout(clickId)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('mousedown', onClick)
      restoreFocusRef.current?.focus()
      restoreFocusRef.current = null
    }
  }, [open, onClose])

  useEffect(() => {
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    }
  }, [])

  function announce(message: string) {
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    setNotice(message)
    noticeTimerRef.current = window.setTimeout(() => setNotice('Demo session only.'), 2400)
  }

  function openSettings() {
    onClose()
    onOpenSettings()
  }

  function openAgents() {
    onClose()
    onOpenPalette()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="glass-strong fixed right-3 top-[58px] z-40 w-[min(calc(100vw-1.5rem),320px)] overflow-hidden rounded-2xl md:right-5"
          role="dialog"
          aria-label="Account menu"
        >
          <div className="border-b border-[var(--color-hairline-soft)] px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(74%_0.16_50)] to-[oklch(66%_0.20_30)] text-[12px] font-semibold text-white shadow-[0_1px_2px_oklch(40%_0.15_30_/_0.3)]">
                MC
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold tracking-tight text-[var(--color-ink)]">Matthew Curcic</div>
                <div className="truncate text-[11px] text-[var(--color-ink-soft)]">Armatir Studio · Owner</div>
                <div className="mt-0.5 truncate text-[10.5px] text-[var(--color-ink-faint)]">Production workspace</div>
              </div>
            </div>
          </div>

          <div className="p-2" role="menu" aria-label="Account actions">
            <button type="button" data-menu-item role="menuitem" onClick={openSettings} className={menuItemClass}>
              <MenuIcon icon={Settings} />
              <span>Workspace settings</span>
            </button>

            <Link to="/integrations" data-menu-item role="menuitem" onClick={onClose} className={menuItemClass}>
              <MenuIcon icon={PlugZap} tone="mint" />
              <span>Connected apps</span>
            </Link>

            <button type="button" data-menu-item role="menuitem" onClick={openAgents} className={menuItemClass}>
              <MenuIcon icon={Bot} />
              <span>AI agents</span>
            </button>

            <button type="button" data-menu-item role="menuitem" onClick={openSettings} className={menuItemClass}>
              <MenuIcon icon={Bell} tone="amber" />
              <span>Notification preferences</span>
            </button>

            <div className="my-1 h-px bg-[var(--color-hairline-soft)]" />

            <button
              type="button"
              data-menu-item
              role="menuitem"
              onClick={() => announce('Demo session reset locally.')}
              className={menuItemClass}
            >
              <MenuIcon icon={RotateCcw} tone="neutral" />
              <span>Reset demo session</span>
            </button>

            <button
              type="button"
              data-menu-item
              role="menuitem"
              onClick={() => announce('Log out is disabled in this demo.')}
              className={menuItemClass}
            >
              <MenuIcon icon={LogOut} tone="neutral" />
              <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                <span>Log out</span>
                <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-[var(--color-ink-faint)]">
                  Demo
                </span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 border-t border-[var(--color-hairline-soft)] bg-[oklch(99%_0.005_280_/_0.6)] px-4 py-2.5 text-[11px] text-[var(--color-ink-faint)]">
            <Sparkles className="h-3 w-3 text-[var(--color-violet)]" strokeWidth={1.8} />
            <span aria-live="polite">{notice}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
