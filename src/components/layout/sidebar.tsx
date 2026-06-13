import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Workflow,
  Inbox as InboxIcon,
  Boxes,
  Radio,
  Settings,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatRunningWorkflowSummary, formatWorkflowCount } from '@/lib/nexus-demo-labels'
import { useNexusDemoState } from '@/lib/nexus-demo-state-context'

interface NavEntry {
  to: string
  label: string
  icon: typeof LayoutDashboard
  badge?: string
}

const primary: NavEntry[] = [
  { to: '/',             label: 'Overview',     icon: LayoutDashboard            },
  { to: '/workflows',    label: 'Workflows',    icon: Workflow                   },
  { to: '/inbox',        label: 'Inbox',        icon: InboxIcon,   badge: '4'    },
  { to: '/integrations', label: 'Integrations', icon: Boxes                      },
  { to: '/activity',     label: 'Activity',     icon: Radio,       badge: 'live' },
]

const secondary: NavEntry[] = [
  { to: '#help',     label: 'Help',     icon: HelpCircle  },
]

export function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { workflows } = useNexusDemoState()
  const workflowCount = workflows.length
  const runningCount = workflows.filter((workflow) => workflow.status === 'running').length

  return (
    <aside className="hidden md:flex h-full w-60 flex-col gap-1 px-3 pb-4 pt-3">
      {/* Workspace pill */}
      <button
        className="group mb-3 flex items-center gap-2.5 rounded-xl border border-[var(--color-hairline)] bg-white/70 px-3 py-2.5 text-left transition-colors hover:bg-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[oklch(72%_0.18_285)] to-[oklch(62%_0.20_260)] text-[11px] font-semibold text-white shadow-[0_1px_2px_oklch(40%_0.10_280_/_0.3)]">
          AR
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-[13px] font-medium text-[var(--color-ink)]">Armatir Studio</span>
          <span className="text-[11px] text-[var(--color-ink-faint)]">Production · {formatWorkflowCount(workflowCount)}</span>
        </span>
      </button>

      {/* Primary nav */}
      <div className="mono-label px-2 pb-1.5">Workspace</div>
      <nav className="flex flex-col gap-0.5">
        {primary.map((item) => {
          const badge = item.to === '/workflows' ? String(workflowCount) : item.badge

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors',
                  isActive
                    ? 'bg-white text-[var(--color-ink)] shadow-[var(--shadow-card),inset_0_0_0_1px_oklch(100%_0_0_/_0.7)]'
                    : 'text-[var(--color-ink-soft)] hover:bg-white/60 hover:text-[var(--color-ink)]',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-[var(--color-violet)]' : 'text-[var(--color-ink-faint)] group-hover:text-[var(--color-ink-soft)]',
                    )}
                    strokeWidth={1.8}
                  />
                  <span className="flex-1 font-medium">{item.label}</span>
                  {badge && (
                    <span
                      className={cn(
                        'ml-auto flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[10px] font-medium tabular-nums',
                        badge === 'live'
                          ? 'bg-[oklch(94%_0.05_165)] text-[oklch(38%_0.10_165)]'
                          : 'bg-[var(--color-canvas-deep)] text-[var(--color-ink-faint)]',
                      )}
                    >
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Active workflows hint */}
      <div className="mt-5 rounded-xl border border-[var(--color-hairline-soft)] bg-white/40 p-3">
        <div className="mono-label mb-2">Live</div>
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-[12px] text-[var(--color-ink-soft)]">{formatRunningWorkflowSummary(runningCount)}</span>
        </div>
        <div className="mt-2 text-[11px] text-[var(--color-ink-faint)] leading-snug">
          412 runs this hour · avg <span className="font-mono text-[10.5px]">7.4s</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* Secondary nav */}
      <nav className="flex flex-col gap-0.5">
        <button
          onClick={onOpenSettings}
          className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-[var(--color-ink-faint)] transition-colors hover:bg-white/60 hover:text-[var(--color-ink)]"
        >
          <Settings className="h-4 w-4" strokeWidth={1.8} />
          <span className="font-medium">Settings</span>
        </button>
        {secondary.map((item) => (
          <a
            key={item.to}
            href={item.to}
            className="group flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-[var(--color-ink-faint)] transition-colors hover:bg-white/60 hover:text-[var(--color-ink)]"
          >
            <item.icon className="h-4 w-4" strokeWidth={1.8} />
            <span className="font-medium">{item.label}</span>
          </a>
        ))}
      </nav>
    </aside>
  )
}
