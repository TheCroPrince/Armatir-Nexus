import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, Filter, Plus } from 'lucide-react'
import { useNexusSettings } from '@/lib/nexus-settings'
import { useNexusDemoState } from '@/lib/nexus-demo-state-context'

export function WorkspaceHeader() {
  const [range, setRange] = useState<'7d' | '30d'>('7d')
  const { settings } = useNexusSettings()
  const { workflows, inboxItems, integrations, activityEvents } = useNexusDemoState()
  const currentStamp = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
  const runningCount = workflows.filter((workflow) => workflow.status === 'running').length
  const reviewWorkflows = workflows.filter((workflow) => workflow.status === 'review').length
  const pendingApprovals = inboxItems.filter((item) => item.status === 'awaiting-approval' || item.status === 'drafted').length
  const connectedIntegrations = integrations.filter((integration) => integration.status === 'connected').length
  const handledCount = activityEvents.length +
    workflows.reduce((total, workflow) => total + (workflow.status === 'running' ? 2 : 1), 0) +
    inboxItems.filter((item) => item.status === 'sent').length +
    connectedIntegrations
  const needsReview = pendingApprovals + reviewWorkflows

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-end"
    >
      <div className="flex w-full min-w-0 flex-col gap-1.5 lg:w-auto">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mono-label">{currentStamp}</span>
          <span className="h-1 w-1 rounded-full bg-[var(--color-ink-ghost)]" />
          <span className="flex min-w-0 items-center gap-1.5 text-[11.5px] text-[var(--color-ink-soft)]">
            {settings.sampleData && <span className="live-dot" />}
            <span className="truncate">
              {settings.sampleData ? `${runningCount} workflows running - ${pendingApprovals} approvals queued` : 'Sample data hidden - workspace quiet'}
            </span>
          </span>
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--color-ink)]">
          {settings.sampleData ? 'Welcome back, Matthew.' : 'Workspace data hidden.'}
        </h1>
        <p className="max-w-full text-wrap text-[13px] leading-relaxed text-[var(--color-ink-soft)]">
          {settings.sampleData ? (
            <>
              Nexus handled <span className="font-medium text-[var(--color-ink)]">{handledCount} things</span> while you were away
              {' '}-- <span className="font-medium text-[var(--color-violet)]">{needsReview} need your eyes</span>.
            </>
          ) : (
            <>Seeded accounts, workflow events, and recommendations are hidden until sample data is restored.</>
          )}
        </p>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <button
          onClick={() => setRange((current) => current === '7d' ? '30d' : '7d')}
          className="pill !py-1.5 group"
          aria-label={`Metric range: ${range === '7d' ? 'Last 7 days' : 'Last 30 days'}`}
        >
          <Filter className="h-3 w-3" strokeWidth={1.8} />
          <span>{range === '7d' ? 'Last 7 days' : 'Last 30 days'}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
        <Link
          to="/workflows"
          className="flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="h-3 w-3" strokeWidth={2.2} />
          New workflow
        </Link>
      </div>
    </motion.div>
  )
}
