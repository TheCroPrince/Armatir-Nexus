import { Bell, Search, Sparkles } from 'lucide-react'
import { ArmatirMark } from '@/components/brand/armatir-mark'
import { cn } from '@/lib/cn'

interface TopbarProps {
  onOpenPalette: () => void
  onToggleNotifications: () => void
  onAskNexus: () => void
  notificationsOpen: boolean
  unreadCount: number
}

export function Topbar({ onOpenPalette, onToggleNotifications, onAskNexus, notificationsOpen, unreadCount }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--color-hairline-soft)] bg-[oklch(98%_0.015_290_/_0.6)] px-3 backdrop-blur-xl md:px-5">

      {/* Brand */}
      <div className="flex items-center gap-2.5 pr-2">
        <ArmatirMark className="h-7 w-7" />
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="text-[13px] font-semibold tracking-tight text-[var(--color-ink)]">
            Nexus
          </span>
          <span className="text-[10.5px] text-[var(--color-ink-faint)] -mt-0.5">
            by Armatir
          </span>
        </div>
      </div>

      <div className="h-5 w-px bg-[var(--color-hairline)]" />

      {/* Breadcrumb / location */}
      <div className="hidden md:flex items-center gap-2 text-[12.5px] text-[var(--color-ink-faint)]">
        <span>Studio</span>
        <span className="text-[var(--color-ink-ghost)]">/</span>
        <span className="text-[var(--color-ink-soft)]">Production</span>
      </div>

      {/* Command palette trigger */}
      <button
        onClick={onOpenPalette}
        className="ml-auto group flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-white/70 px-3 py-1.5 text-[12px] text-[var(--color-ink-faint)] shadow-[var(--shadow-card)] transition-all hover:border-[var(--color-violet-soft)] hover:bg-white hover:text-[var(--color-ink-soft)]"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="hidden sm:inline">Search workflows, integrations…</span>
        <span className="sm:hidden">Search</span>
        <span className="ml-1 hidden items-center gap-0.5 sm:flex">
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </span>
      </button>

      {/* Quick action — AI ask */}
      <button
        onClick={onAskNexus}
        className="hidden lg:flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[oklch(60%_0.22_295)] to-[oklch(55%_0.20_260)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[0_8px_24px_oklch(55%_0.20_280_/_0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        Ask Nexus
      </button>

      {/* Notifications */}
      <button
        onClick={onToggleNotifications}
        data-notifications-anchor
        className={cn(
          'relative flex h-8 w-8 items-center justify-center rounded-full transition-colors',
          notificationsOpen
            ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-card)]'
            : 'text-[var(--color-ink-faint)] hover:bg-white/70 hover:text-[var(--color-ink-soft)]',
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={notificationsOpen}
      >
        <Bell className="h-4 w-4" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-rose)] px-1 text-[9px] font-medium text-white tabular-nums shadow-[0_1px_2px_oklch(40%_0.10_25_/_0.4)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Operator avatar */}
      <button
        className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(74%_0.16_50)] to-[oklch(66%_0.20_30)] text-[11px] font-semibold text-white shadow-[0_1px_2px_oklch(40%_0.15_30_/_0.3)]"
        aria-label="Account"
      >
        MC
      </button>
    </header>
  )
}
