import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Workflow,
  Inbox as InboxIcon,
  Boxes,
  Radio,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/cn'

const mobileNav = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/workflows', label: 'Workflows', icon: Workflow },
  { to: '/inbox', label: 'Inbox', icon: InboxIcon },
  { to: '/integrations', label: 'Integrations', icon: Boxes },
  { to: '/activity', label: 'Activity', icon: Radio },
]

export function MobileNav({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <nav
      className="glass-strong fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-2xl px-1.5 py-1.5 md:hidden"
      aria-label="Primary navigation"
    >
      {mobileNav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          aria-label={item.label}
          className={({ isActive }) => cn(
            'flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0 py-1.5 text-[8.5px] font-medium transition-colors',
            isActive
              ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-card)]'
              : 'text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]',
          )}
        >
          {({ isActive }) => (
            <>
              <item.icon
                className={cn('h-4 w-4', isActive ? 'text-[var(--color-violet)]' : 'text-[var(--color-ink-faint)]')}
                strokeWidth={1.8}
              />
              <span className="max-w-full truncate">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
      <button
        onClick={onOpenSettings}
        className="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-xl px-0 py-1.5 text-[8.5px] font-medium text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-ink-soft)]"
        aria-label="Open workspace settings"
      >
        <Settings className="h-4 w-4 text-[var(--color-ink-faint)]" strokeWidth={1.8} />
        <span className="truncate">Settings</span>
      </button>
    </nav>
  )
}
