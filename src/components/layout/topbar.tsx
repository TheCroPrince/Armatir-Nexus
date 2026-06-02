import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Bell, Search, Sparkles } from 'lucide-react'
import { ArmatirMark } from '@/components/brand/armatir-mark'
import { UserMenu } from '@/components/shell/user-menu'
import { cn } from '@/lib/cn'

interface TopbarProps {
  onOpenPalette: () => void
  onOpenSettings: () => void
  onToggleNotifications: () => void
  onAskNexus: () => void
  notificationsOpen: boolean
  unreadCount: number
}

export function Topbar({
  onOpenPalette,
  onOpenSettings,
  onToggleNotifications,
  onAskNexus,
  notificationsOpen,
  unreadCount,
}: TopbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  function openPalette() {
    setUserMenuOpen(false)
    onOpenPalette()
  }

  function askNexus() {
    setUserMenuOpen(false)
    onAskNexus()
  }

  function toggleNotifications() {
    setUserMenuOpen(false)
    onToggleNotifications()
  }

  function toggleUserMenu() {
    if (notificationsOpen) onToggleNotifications()
    setUserMenuOpen((open) => !open)
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--color-hairline-soft)] bg-[oklch(98%_0.015_290_/_0.6)] px-3 backdrop-blur-xl md:px-5">

      {/* Brand */}
      <Link
        to="/"
        onClick={() => setUserMenuOpen(false)}
        className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet-soft)]"
        aria-label="Go to Nexus overview"
        title="Nexus overview"
      >
        <ArmatirMark className="h-7 w-7" />
        <div className="hidden flex-col leading-tight sm:flex">
          <span className="text-[13px] font-semibold tracking-tight text-[var(--color-ink)]">
            Nexus
          </span>
          <span className="text-[10.5px] text-[var(--color-ink-faint)] -mt-0.5">
            by Armatir
          </span>
        </div>
      </Link>

      <div className="hidden h-5 w-px bg-[var(--color-hairline)] sm:block" />

      {/* Breadcrumb / location */}
      <div className="hidden md:flex items-center gap-2 text-[12.5px] text-[var(--color-ink-faint)]">
        <span>Studio</span>
        <span className="text-[var(--color-ink-ghost)]">/</span>
        <span className="text-[var(--color-ink-soft)]">Production</span>
      </div>

      {/* Command palette trigger */}
      <button
        onClick={openPalette}
        className="ml-auto group flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-hairline)] bg-white/70 text-[12px] text-[var(--color-ink-faint)] shadow-[var(--shadow-card)] transition-all hover:border-[var(--color-violet-soft)] hover:bg-white hover:text-[var(--color-ink-soft)] sm:w-auto sm:gap-2 sm:px-3 sm:py-1.5"
        aria-label="Open command palette search"
      >
        <Search className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="hidden sm:inline">Search workflows, integrations...</span>
      </button>

      {/* Demo exit link */}
      <a
        href="https://armatir.com"
        className="hidden h-8 shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-hairline)] bg-white/55 px-2.5 text-[12px] font-medium text-[var(--color-ink-soft)] shadow-[var(--shadow-card)] transition-all hover:border-[var(--color-violet-soft)] hover:bg-white hover:text-[var(--color-ink)] sm:flex sm:px-3"
        aria-label="Back to the main Armatir website"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
        <span className="sm:hidden">Armatir</span>
        <span className="hidden sm:inline">Back to Armatir</span>
      </a>

      {/* Quick action — AI ask */}
      <button
        onClick={askNexus}
        className="hidden lg:flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[oklch(60%_0.22_295)] to-[oklch(55%_0.20_260)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[0_8px_24px_oklch(55%_0.20_280_/_0.3)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
        Ask Nexus
      </button>

      {/* Notifications */}
      <button
        onClick={toggleNotifications}
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
        onClick={toggleUserMenu}
        data-user-menu-anchor
        className={cn(
          'ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[oklch(74%_0.16_50)] to-[oklch(66%_0.20_30)] text-[11px] font-semibold text-white shadow-[0_1px_2px_oklch(40%_0.15_30_/_0.3)] transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet-soft)] active:scale-[0.98]',
          userMenuOpen && 'ring-2 ring-[var(--color-violet-soft)]',
        )}
        aria-label="Open account menu"
        aria-expanded={userMenuOpen}
        aria-haspopup="dialog"
      >
        MC
      </button>

      <UserMenu
        open={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
        onOpenPalette={onOpenPalette}
        onOpenSettings={onOpenSettings}
      />
    </header>
  )
}
