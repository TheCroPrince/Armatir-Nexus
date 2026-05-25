import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Clock, Activity as ActivityIcon, ChevronRight, Play, Pause, MoreHorizontal } from 'lucide-react'
import { nexusWorkflows, workflowsById } from '@/data/nexus'
import { StatusPill } from '@/components/ui/status-pill'
import { IntegrationCluster, IntegrationChip } from '@/components/ui/integration-chip'
import { Sparkline } from '@/components/ui/sparkline'
import type { NexusWorkflow } from '@/types/nexus'
import { cn } from '@/lib/cn'

export function WorkflowsPage() {
  const [params, setParams] = useSearchParams()
  const initial = params.get('w') ?? nexusWorkflows[0]!.id
  const [selectedId, setSelectedId] = useState<string>(initial)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | NexusWorkflow['status']>('all')

  // Keep URL in sync with selection so the command palette can deep-link.
  useEffect(() => {
    if (params.get('w') !== selectedId) {
      const next = new URLSearchParams(params)
      next.set('w', selectedId)
      setParams(next, { replace: true })
    }
  }, [selectedId, params, setParams])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return nexusWorkflows.filter((w) => {
      if (filter !== 'all' && w.status !== filter) return false
      if (!q) return true
      return [w.name, w.description, w.impact].some((s) => s.toLowerCase().includes(q))
    })
  }, [query, filter])

  const selected = workflowsById[selectedId] ?? nexusWorkflows[0]!

  return (
    <div className="grid h-[calc(100dvh-56px)] grid-cols-1 gap-0 lg:grid-cols-[minmax(360px,440px)_1fr]">
      {/* ── List column ────────────────────────────────────────── */}
      <div className="flex h-full flex-col border-r border-[var(--color-hairline-soft)]">
        <div className="flex items-center justify-between gap-2 px-5 pb-2 pt-6">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight text-[var(--color-ink)]">
              Workflows
            </h1>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
              8 enabled · 3 running · 1 needs review
            </p>
          </div>
          <button className="flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-[var(--shadow-card)]">
            <Plus className="h-3 w-3" strokeWidth={2.2} /> New
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <label className="flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-white/70 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter workflows…"
              className="flex-1 bg-transparent text-[12.5px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-ghost)]"
            />
            <kbd>/</kbd>
          </label>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
          {(['all', 'running', 'ready', 'review', 'synced'] as const).map((f) => (
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
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <ul className="flex flex-col gap-1">
            {filtered.map((w) => {
              const isActive = w.id === selectedId
              return (
                <li key={w.id}>
                  <button
                    onClick={() => setSelectedId(w.id)}
                    className={cn(
                      'group relative flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-all',
                      isActive
                        ? 'border-[oklch(85%_0.05_285)] bg-white shadow-[var(--shadow-card-hover)]'
                        : 'border-transparent hover:border-[var(--color-hairline-soft)] hover:bg-white/60',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="line-clamp-1 text-[13px] font-medium text-[var(--color-ink)]">
                        {w.name}
                      </span>
                      <StatusPill status={w.status} pulse className="shrink-0" />
                    </div>
                    <p className="line-clamp-1 text-[11.5px] text-[var(--color-ink-faint)]">
                      {w.impact}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <IntegrationCluster ids={w.integrations.map((i) => i.id)} size="sm" />
                      <span className="font-mono text-[10.5px] tabular-nums text-[var(--color-ink-faint)]">
                        {w.lastRun}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="rounded-xl border border-dashed border-[var(--color-hairline)] px-3 py-6 text-center text-[12px] text-[var(--color-ink-faint)]">
                No workflows match your filter.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ── Detail panel ───────────────────────────────────────── */}
      <div className="relative h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 px-6 py-7 lg:px-8"
          >
            <DetailHeader workflow={selected} />
            <DetailFlow workflow={selected} />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <DetailMeta workflow={selected} />
              <DetailRunHistory workflow={selected} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ─── Detail panel sub-components ─────────────────────────────────────────────

function DetailHeader({ workflow }: { workflow: NexusWorkflow }) {
  const isRunning = workflow.status === 'running'
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <StatusPill status={workflow.status} pulse />
            <span className="chip rounded-full px-2 py-0.5 text-[10.5px] capitalize text-[var(--color-ink-soft)]">
              {workflow.category}
            </span>
            <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">
              id://{workflow.id}
            </span>
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            {workflow.name}
          </h2>
          <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--color-ink-soft)]">
            {workflow.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button className="pill !py-1.5">
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]',
              isRunning
                ? 'bg-white text-[var(--color-ink)]'
                : 'bg-[var(--color-ink)] text-white',
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-3 w-3" strokeWidth={2.2} fill="currentColor" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" strokeWidth={2.2} fill="currentColor" /> Run now
              </>
            )}
          </button>
        </div>
      </div>

      {/* Impact row */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--color-hairline-soft)] bg-white/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="mono-label">Impact</span>
          <span className="text-[13px] font-medium text-[var(--color-ink)]">{workflow.impact}</span>
        </div>
        <div className="hidden h-4 w-px bg-[var(--color-hairline)] sm:block" />
        <div className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-soft)]">
          <Clock className="h-3 w-3 text-[var(--color-ink-faint)]" />
          <span>last run {workflow.lastRun}</span>
        </div>
        <div className="hidden h-4 w-px bg-[var(--color-hairline)] sm:block" />
        <div className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-soft)]">
          <ActivityIcon className="h-3 w-3 text-[var(--color-ink-faint)]" />
          <span>{workflow.runsThisMonth} runs this month · avg <span className="font-mono">{workflow.avgDuration}</span></span>
        </div>
      </div>
    </div>
  )
}

function DetailFlow({ workflow }: { workflow: NexusWorkflow }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[13px] font-medium text-[var(--color-ink)]">Flow</div>
          <div className="text-[10.5px] text-[var(--color-ink-faint)]">
            {workflow.steps.length} steps · {workflow.integrations.length} integrations
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {workflow.integrations.map((i) => (
            <IntegrationChip key={i.id} id={i.id} size="md" />
          ))}
        </div>
      </div>

      <ol className="relative space-y-1">
        {/* Connector line */}
        <span className="pointer-events-none absolute left-[14px] top-3 bottom-3 w-px bg-gradient-to-b from-[oklch(82%_0.10_285)] via-[var(--color-hairline)] to-transparent" />

        {workflow.steps.map((step, i) => {
          const integration = workflow.integrations[i]
          return (
            <li key={i} className="relative flex items-start gap-3 rounded-lg px-1 py-1.5">
              <div className="relative z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-[var(--shadow-card),inset_0_0_0_1px_oklch(88%_0.04_285)] font-mono text-[10.5px] font-medium text-[var(--color-ink-soft)] tabular-nums">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-[13px] leading-snug text-[var(--color-ink)]">{step}</p>
                {integration && (
                  <div className="mt-1 flex items-center gap-1.5 text-[10.5px] text-[var(--color-ink-faint)]">
                    <IntegrationChip id={integration.id} size="sm" />
                    <span>via {workflow.integrations[i]?.id ? (workflow.integrations[i]!.id) : ''}</span>
                  </div>
                )}
              </div>
              {i < workflow.steps.length - 1 && (
                <ChevronRight className="mt-1 h-3.5 w-3.5 text-[var(--color-ink-ghost)]" />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function DetailMeta({ workflow }: { workflow: NexusWorkflow }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 text-[13px] font-medium text-[var(--color-ink)]">Connected integrations</div>
      <ul className="flex flex-col gap-2.5">
        {workflow.integrations.map((i) => (
          <li key={i.id} className="flex items-center gap-3">
            <IntegrationChip id={i.id} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[var(--color-ink)] capitalize">{i.id}</div>
              <div className="text-[10.5px] text-[var(--color-ink-faint)]">Active connection · OAuth · scoped</div>
            </div>
            <span className="status-pill text-[oklch(38%_0.10_165)] bg-[oklch(94%_0.05_165)]">
              <span className="bg-[var(--color-mint)]" /> OK
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DetailRunHistory({ workflow }: { workflow: NexusWorkflow }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[13px] font-medium text-[var(--color-ink)]">Run history</div>
        <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">14 days</span>
      </div>
      <div className="text-[10.5px] text-[var(--color-ink-faint)]">
        Total <span className="font-mono text-[var(--color-ink-soft)]">{workflow.sparkline.reduce((a, b) => a + b, 0)}</span> runs · success rate <span className="font-mono text-[var(--color-ink-soft)]">99.2%</span>
      </div>

      <div className="mt-4">
        <Sparkline values={workflow.sparkline} width={360} height={56} color="oklch(55% 0.20 280)" strokeWidth={1.8} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 border-t border-[var(--color-hairline-soft)] pt-3">
        <div>
          <div className="text-[10.5px] text-[var(--color-ink-faint)]">P50 duration</div>
          <div className="mt-0.5 font-mono text-[14px] font-medium text-[var(--color-ink)] tabular-nums">{workflow.avgDuration}</div>
        </div>
        <div>
          <div className="text-[10.5px] text-[var(--color-ink-faint)]">P99 duration</div>
          <div className="mt-0.5 font-mono text-[14px] font-medium text-[var(--color-ink)] tabular-nums">14.6s</div>
        </div>
        <div>
          <div className="text-[10.5px] text-[var(--color-ink-faint)]">Failures (14d)</div>
          <div className="mt-0.5 font-mono text-[14px] font-medium text-[var(--color-ink)] tabular-nums">2</div>
        </div>
      </div>
    </div>
  )
}
