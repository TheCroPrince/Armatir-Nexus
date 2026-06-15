import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock, EyeOff } from 'lucide-react'
import { nexusWorkflows } from '@/data/nexus'
import { WorkflowStatusText } from '@/components/ui/status-pill'
import { IntegrationCluster } from '@/components/ui/integration-chip'
import { cn } from '@/lib/cn'
import { useNexusSettings } from '@/lib/nexus-settings'

export function ActiveWorkflows() {
  const { settings } = useNexusSettings()
  const sorted = [...nexusWorkflows].sort((a, b) => {
    const order = { review: 0, running: 1, ready: 2, synced: 3, paused: 4 }
    return order[a.status] - order[b.status]
  }).slice(0, 6)

  return (
    <div className="glass rounded-2xl" data-dashboard-panel="workflows">
      <div className="flex items-center justify-between border-b border-[var(--color-hairline-soft)] px-4 py-3">
        <div>
          <div className="text-[13px] font-medium text-[var(--color-ink)]">Active workflows</div>
          <div className="text-[10.5px] text-[var(--color-ink-faint)]">
            {settings.sampleData ? '8 enabled · 3 running now' : '0 enabled · sample data hidden'}
          </div>
        </div>
        <Link
          to="/workflows"
          className="group flex items-center gap-1 text-[11.5px] font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
          aria-label="See all workflows"
        >
          See all workflows
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      {settings.sampleData ? (
        <ul className="divide-y divide-[var(--color-hairline-soft)]">
          {sorted.map((w, i) => (
            <motion.li
              key={w.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.04 * i, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={`/workflows?w=${w.id}`}
                data-workflow-row
                aria-label={`Open workflow ${w.name}`}
                className={cn(
                  'group flex items-center gap-3 px-4 py-3 transition-colors',
                  'hover:bg-white/70',
                )}
              >
                <WorkflowStatusText status={w.status} className="w-[58px] shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium text-[var(--color-ink)]">
                      {w.name}
                    </span>
                  </div>
                  <div
                    data-workflow-row-meta
                    className="mt-0.5 flex items-center gap-2 text-[11px] text-[var(--color-ink-faint)]"
                  >
                    <Clock className="h-3 w-3" strokeWidth={1.6} />
                    <span>last run {w.lastRun}</span>
                    <span className="text-[var(--color-ink-ghost)]">·</span>
                    <span className="truncate">{w.impact}</span>
                  </div>
                </div>

                <IntegrationCluster
                  ids={w.integrations.map((i) => i.id).slice(0, 4)}
                  size="sm"
                  className="shrink-0"
                />

                <ArrowUpRight className="ml-1 hidden h-3.5 w-3.5 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 sm:block" />
              </Link>
            </motion.li>
          ))}
        </ul>
      ) : (
        <div className="flex min-h-[180px] flex-col items-center justify-center px-5 py-8 text-center">
          <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-canvas-deep)] text-[var(--color-ink-faint)]">
            <EyeOff className="h-4 w-4" strokeWidth={1.8} />
          </span>
          <div className="text-[13px] font-medium text-[var(--color-ink)]">Sample data hidden</div>
          <p className="mt-1 max-w-[260px] text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
            Workflow rows are cleared until seeded workspace data is restored.
          </p>
        </div>
      )}
    </div>
  )
}
