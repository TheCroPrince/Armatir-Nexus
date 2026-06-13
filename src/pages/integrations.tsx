import { useEffect, useMemo, useRef, useState } from 'react'
import { createElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import { getNexusIcon, isNexusBrandIcon } from '@/types/nexus-icons'
import type { IntegrationCategory, NexusIntegration } from '@/types/nexus'
import { cn } from '@/lib/cn'
import { useNexusDemoState } from '@/lib/nexus-demo-state-context'
import { relativeTime } from '@/lib/time'

const categoryLabel: Record<IntegrationCategory, string> = {
  productivity: 'Productivity',
  communication: 'Communication',
  crm: 'CRM',
  finance: 'Finance',
  engineering: 'Engineering',
  ai: 'AI',
}

const clusterOrder: IntegrationCategory[] = ['ai', 'communication', 'crm', 'productivity', 'engineering', 'finance']

const statusMeta: Record<NexusIntegration['status'], { label: string; dot: string; pill: string; icon: typeof Check }> = {
  connected: {
    label: 'Connected',
    dot: 'bg-[var(--color-mint)]',
    pill: 'text-[oklch(38%_0.10_165)] bg-[oklch(94%_0.05_165)]',
    icon: Check,
  },
  syncing: {
    label: 'Syncing',
    dot: 'bg-[var(--color-amber)]',
    pill: 'text-[oklch(40%_0.12_70)] bg-[oklch(95%_0.06_75)]',
    icon: Loader2,
  },
  attention: {
    label: 'Connect',
    dot: 'bg-[var(--color-rose)]',
    pill: 'text-[oklch(42%_0.16_25)] bg-[oklch(95%_0.04_25)]',
    icon: AlertCircle,
  },
}

type DirectoryFilter = 'all' | string
type ConnectionStage = 'idle' | 'checking' | 'connecting' | 'success'

function connectionActionLabel(integration: NexusIntegration) {
  if (integration.status === 'connected') return 'Manage details'
  if (integration.status === 'syncing') return 'Reconnect'
  return 'Connect locally'
}

function integrationValue(integration: NexusIntegration) {
  return integration.automationValue ?? 'Use this app in local workflows, approvals, and activity summaries.'
}

function integrationScopes(integration: NexusIntegration) {
  return integration.scopes?.length ? integration.scopes : ['Read selected events', 'Trigger local workflows', 'Queue human review']
}

function formatConnectionSummary(integration: NexusIntegration, workflowCount: number) {
  if (integration.status === 'attention') {
    return 'Not connected yet. Add it from the directory to use it in local automations.'
  }
  if (integration.lastConnectedAt) {
    return `${workflowCount} active workflows use this connection. Last local check ${relativeTime(integration.lastConnectedAt)}.`
  }
  if (integration.status === 'syncing') {
    return `${workflowCount} active workflows use this connection. Syncing deltas from the last local check.`
  }
  return `${workflowCount} active workflows use this connection. Last sync completed 3m ago.`
}

function IntegrationIcon({
  integration,
  size = 'md',
}: {
  integration: NexusIntegration
  size?: 'sm' | 'md' | 'lg'
}) {
  const Icon = getNexusIcon(integration.icon)
  const hasBrandIcon = isNexusBrandIcon(integration.icon)
  const dimensions = {
    sm: 'h-7 w-7 rounded-md',
    md: 'h-9 w-9 rounded-xl',
    lg: 'h-11 w-11 rounded-xl',
  }[size]
  const iconSize = {
    sm: hasBrandIcon ? 'h-5 w-5' : 'h-3.5 w-3.5 text-white',
    md: hasBrandIcon ? 'h-6 w-6' : 'h-4 w-4 text-white',
    lg: hasBrandIcon ? 'h-7 w-7' : 'h-5 w-5 text-white',
  }[size]

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center', dimensions)}
      style={{
        background: hasBrandIcon
          ? 'oklch(100% 0 0 / 0.96)'
          : `linear-gradient(135deg, ${integration.accent}, oklch(98% 0.01 280))`,
        boxShadow: hasBrandIcon
          ? `inset 0 0 0 1px oklch(88% 0.015 285), 0 4px 12px ${integration.accent.replace(')', ' / 0.22)')}`
          : `inset 0 0 0 1px oklch(100% 0 0 / 0.55), 0 4px 12px ${integration.accent.replace(')', ' / 0.28)')}`,
      }}
    >
      {createElement(Icon, {
        className: cn(iconSize, !hasBrandIcon && 'drop-shadow-[0_1px_1px_oklch(0%_0_0_/_0.25)]'),
        strokeWidth: 2.2,
      })}
    </span>
  )
}

function StatusBadge({ status, compact = false }: { status: NexusIntegration['status']; compact?: boolean }) {
  const meta = statusMeta[status]
  const StatusIcon = meta.icon
  return (
    <span className={cn('status-pill', meta.pill, compact && '!px-1.5')}>
      <span className={meta.dot} />
      {!compact && (
        <>
          {status === 'syncing' && <StatusIcon className="h-2.5 w-2.5 animate-spin" strokeWidth={2.6} />}
          {meta.label}
        </>
      )}
    </span>
  )
}

export function IntegrationsPage() {
  const { integrations, integrationsById, workflows, connectIntegration } = useNexusDemoState()
  const [hovered, setHovered] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string>(integrations[0]!.id)
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false)
  const selected = integrationsById[hovered ?? selectedId] ?? integrations[0]!
  const selectedIcon = createElement(getNexusIcon(selected.icon), {
    className: cn(isNexusBrandIcon(selected.icon) ? 'h-7 w-7' : 'h-5 w-5 text-white'),
    strokeWidth: 2.2,
  })
  const relatedWorkflows = workflows.filter((workflow) =>
    workflow.integrations.some((integration) => integration.id === selected.id),
  )

  const grouped = clusterOrder.map((cat) => ({
    category: cat,
    items: integrations.filter((i) => i.category === cat),
  }))

  const stats = {
    total: integrations.length,
    connected: integrations.filter((i) => i.status === 'connected').length,
    syncing: integrations.filter((i) => i.status === 'syncing').length,
    attention: integrations.filter((i) => i.status === 'attention').length,
  }

  function handleConnected(id: string) {
    const integration = connectIntegration(id)
    if (!integration) return null
    setSelectedId(integration.id)
    setHovered(null)
    return integration
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-6 md:px-7 md:py-7 lg:px-10 lg:py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="mono-label">Connections</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            Integration ecosystem
          </h1>
          <p className="mt-1 text-[13px] text-[var(--color-ink-soft)]">
            <span className="font-medium text-[var(--color-ink)]">{stats.connected}</span> connected,
            {' '}<span className="font-medium text-[oklch(40%_0.13_75)]">{stats.syncing}</span> syncing,
            {' '}<span className="font-medium text-[var(--color-ink-faint)]">{stats.attention}</span> ready to add
          </p>
        </div>
        <button
          onClick={() => setIsDirectoryOpen(true)}
          className="flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
          aria-label="Open app directory"
        >
          <Plus className="h-3 w-3" strokeWidth={2.2} /> Add integration
        </button>
      </div>

      <div className="glass relative overflow-hidden rounded-2xl px-6 py-8 md:px-10 md:py-12 lg:py-16">
        <ConnectionLines hovered={hovered ?? selectedId} integrationIndex={integrationsById} />

        <div className="relative z-10 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
          {grouped.map((group, idx) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * idx, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <div className="mono-label text-center">{categoryLabel[group.category]}</div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {group.items.map((integration) => {
                  const isHovered = hovered === integration.id
                  return (
                    <motion.button
                      key={integration.id}
                      data-int-id={integration.id}
                      onMouseEnter={() => setHovered(integration.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(integration.id)}
                      onBlur={() => setHovered(null)}
                      onClick={() => setSelectedId(integration.id)}
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                      className={cn(
                        'group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 transition-shadow',
                        isHovered || selectedId === integration.id
                          ? 'shadow-[0_0_0_3px_oklch(100%_0_0),0_18px_40px_oklch(45%_0.10_280_/_0.18)]'
                          : 'shadow-[var(--shadow-card),inset_0_0_0_1px_oklch(100%_0_0_/_0.7)]',
                      )}
                      title={integration.name}
                      aria-label={`Select ${integration.name} integration`}
                    >
                      <span
                        className="absolute inset-0 -z-10 rounded-2xl opacity-30 blur-md transition-opacity group-hover:opacity-70"
                        style={{ background: integration.accent }}
                      />
                      <IntegrationIcon integration={integration} />
                      <span className="absolute -right-1 -top-1">
                        <StatusDot status={integration.status} />
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="text-center text-[11px] text-[var(--color-ink-faint)]">
                {group.items.length} {group.items.length === 1 ? 'tool' : 'tools'}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 mt-8 flex items-center justify-center gap-2 text-center text-[11.5px] text-[var(--color-ink-faint)]">
          <span>Select an integration to inspect workflows, scopes, and sync health.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="glass rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span
              className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: isNexusBrandIcon(selected.icon)
                  ? 'oklch(100% 0 0 / 0.96)'
                  : `linear-gradient(135deg, ${selected.accent}, oklch(98% 0.01 280))`,
                boxShadow: isNexusBrandIcon(selected.icon)
                  ? `inset 0 0 0 1px oklch(88% 0.015 285), 0 8px 20px ${selected.accent.replace(')', ' / 0.22)')}`
                  : `inset 0 0 0 1px oklch(100% 0 0 / 0.55), 0 8px 20px ${selected.accent.replace(')', ' / 0.25)')}`,
              }}
            >
              {selectedIcon}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[16px] font-semibold tracking-tight text-[var(--color-ink)]">{selected.name}</h2>
                <StatusBadge status={selected.status} />
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
                {formatConnectionSummary(selected, relatedWorkflows.length)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[var(--color-hairline-soft)] pt-4">
            <div>
              <div className="text-[10.5px] text-[var(--color-ink-faint)]">Directory</div>
              <div className="mt-0.5 text-[12.5px] font-medium text-[var(--color-ink)]">{selected.catalogCategory ?? categoryLabel[selected.category]}</div>
            </div>
            <div>
              <div className="text-[10.5px] text-[var(--color-ink-faint)]">Scope</div>
              <div className="mt-0.5 text-[12.5px] font-medium text-[var(--color-ink)]">{integrationScopes(selected)[0]}</div>
            </div>
            <div>
              <div className="text-[10.5px] text-[var(--color-ink-faint)]">Events</div>
              <div className="mt-0.5 font-mono text-[12.5px] font-medium text-[var(--color-ink)]">{relatedWorkflows.length * 37}/hr</div>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium text-[var(--color-ink)]">Workflows using {selected.name}</div>
              <div className="text-[10.5px] text-[var(--color-ink-faint)]">Directory changes update local demo state and activity.</div>
            </div>
            <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">{relatedWorkflows.length} linked</span>
          </div>
          {relatedWorkflows.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {relatedWorkflows.map((workflow) => (
                <li key={workflow.id} className="rounded-xl border border-[var(--color-hairline-soft)] bg-white/50 px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-mint)]" />
                    <span className="line-clamp-1 text-[12.5px] font-medium text-[var(--color-ink)]">{workflow.name}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--color-ink-faint)]">{workflow.impact}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex min-h-[116px] flex-col justify-center rounded-xl border border-dashed border-[var(--color-hairline-soft)] bg-white/35 px-4 py-3">
              <div className="text-[12.5px] font-medium text-[var(--color-ink)]">Ready for a workflow</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
                Connect this app, then add it to a template from Workflows to make it part of the live demo story.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {integrations.slice(0, 10).map((integration) => (
          <motion.div
            key={integration.id}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            className="glass rounded-xl px-3 py-3"
          >
            <div className="flex items-start gap-2.5">
              <IntegrationIcon integration={integration} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12.5px] font-medium text-[var(--color-ink)]">{integration.name}</div>
                <div className="text-[10.5px] text-[var(--color-ink-faint)]">
                  {integration.activeWorkflows} {integration.activeWorkflows === 1 ? 'workflow' : 'workflows'}
                </div>
              </div>
              <StatusBadge status={integration.status} compact />
            </div>
          </motion.div>
        ))}
      </div>

      <IntegrationDirectoryModal
        open={isDirectoryOpen}
        integrations={integrations}
        selectedId={selectedId}
        onSelect={(id) => {
          setSelectedId(id)
          setHovered(null)
        }}
        onClose={() => setIsDirectoryOpen(false)}
        onConnect={handleConnected}
      />
    </div>
  )
}

function StatusDot({ status }: { status: NexusIntegration['status'] }) {
  const meta = statusMeta[status]
  const Icon = meta.icon
  return (
    <span className={cn('flex h-3.5 w-3.5 items-center justify-center rounded-full', meta.dot)}>
      {status === 'connected' && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
      {status === 'syncing' && <Loader2 className="h-2 w-2 animate-spin text-white" strokeWidth={3} />}
      {status === 'attention' && <Icon className="h-2 w-2 text-white" strokeWidth={3} />}
    </span>
  )
}

function IntegrationDirectoryModal({
  open,
  integrations,
  selectedId,
  onSelect,
  onClose,
  onConnect,
}: {
  open: boolean
  integrations: NexusIntegration[]
  selectedId: string
  onSelect: (id: string) => void
  onClose: () => void
  onConnect: (id: string) => NexusIntegration | null
}) {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<DirectoryFilter>('all')
  const [connectingId, setConnectingId] = useState<string | null>(null)
  const [connectionStage, setConnectionStage] = useState<ConnectionStage>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const timers = useRef<number[]>([])

  const selected = integrations.find((integration) => integration.id === selectedId) ?? integrations[0]!
  const catalogCategories = useMemo(
    () => ['all', ...Array.from(new Set(integrations.map((integration) => integration.catalogCategory ?? categoryLabel[integration.category])))] as const,
    [integrations],
  )
  const recommended = useMemo(() => {
    const items = integrations.filter((integration) => integration.recommended || integration.status !== 'connected')
    return items.slice(0, 7)
  }, [integrations])
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    return integrations.filter((integration) => {
      const directory = integration.catalogCategory ?? categoryLabel[integration.category]
      if (filter !== 'all' && directory !== filter) return false
      if (!term) return true
      return [
        integration.name,
        directory,
        categoryLabel[integration.category],
        integrationValue(integration),
        ...integrationScopes(integration),
      ].some((value) => value.toLowerCase().includes(term))
    })
  }, [filter, integrations, query])

  useEffect(() => {
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer))
      timers.current = []
    }
  }, [])

  function schedule(callback: () => void, delay: number) {
    const id = window.setTimeout(callback, delay)
    timers.current.push(id)
  }

  function resetDirectoryState() {
    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setQuery('')
    setFilter('all')
    setConnectionStage('idle')
    setConnectingId(null)
    setNotice(null)
  }

  function closeDirectory() {
    resetDirectoryState()
    onClose()
  }

  function beginConnection(integration: NexusIntegration) {
    if (integration.status === 'connected') {
      onSelect(integration.id)
      closeDirectory()
      return
    }

    timers.current.forEach((timer) => window.clearTimeout(timer))
    timers.current = []
    setConnectingId(integration.id)
    setConnectionStage('checking')
    setNotice(null)

    schedule(() => setConnectionStage('connecting'), 520)
    schedule(() => {
      const connected = onConnect(integration.id)
      if (!connected) return
      onSelect(connected.id)
      setConnectionStage('success')
      setConnectingId(null)
      setNotice(`${connected.name} connected locally`)
    }, 1260)
    schedule(() => setConnectionStage('idle'), 2400)
  }

  function resetFilters() {
    setQuery('')
    setFilter('all')
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDirectory}
            className="fixed inset-0 z-40 cursor-default bg-[oklch(18%_0.03_280_/_0.24)] backdrop-blur-[3px]"
            aria-label="Close app directory"
          />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 flex h-[min(820px,calc(100dvh-28px))] w-[calc(100%-28px)] max-w-[1040px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/75 bg-[oklch(98.5%_0.012_290_/_0.97)] shadow-[var(--shadow-pop)] backdrop-blur-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="integration-directory-title"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-hairline-soft)] px-4 py-4 md:px-5">
              <div className="min-w-0">
                <div className="mono-label">App directory</div>
                <h2 id="integration-directory-title" className="mt-1 text-[18px] font-semibold tracking-tight text-[var(--color-ink)]">
                  Add integration
                </h2>
                <p className="mt-1 max-w-[620px] text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
                  Connect familiar apps to local workflows, approvals, notifications, and activity history.
                </p>
              </div>
              <button onClick={closeDirectory} className="pill !h-8 !w-8 !justify-center !p-0" aria-label="Close app directory">
                <X className="h-3.5 w-3.5" strokeWidth={1.9} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="flex min-h-0 flex-col border-b border-[var(--color-hairline-soft)] lg:border-b-0 lg:border-r">
                <div className="space-y-3 border-b border-[var(--color-hairline-soft)] px-4 py-3 md:px-5">
                  <label className="flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-white/75 px-3 py-2 shadow-[var(--shadow-card)]">
                    <Search className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" strokeWidth={1.8} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search apps, permissions, or outcomes..."
                      className="min-w-0 flex-1 bg-transparent text-[12.5px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-ghost)]"
                      aria-label="Search app directory"
                    />
                  </label>

                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {catalogCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setFilter(category)}
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors',
                          filter === category
                            ? 'bg-[var(--color-ink)] text-white shadow-[var(--shadow-card)]'
                            : 'bg-white/65 text-[var(--color-ink-faint)] hover:text-[var(--color-ink)]',
                        )}
                      >
                        {category === 'all' ? 'All apps' : category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-b border-[var(--color-hairline-soft)] px-4 py-3 md:px-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink)]">
                      <Star className="h-3.5 w-3.5 text-[var(--color-amber)]" strokeWidth={2} />
                      Recommended
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-faint)]">
                      {recommended.filter((integration) => integration.status !== 'connected').length} open
                    </span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {recommended.map((integration) => (
                      <button
                        key={integration.id}
                        onClick={() => onSelect(integration.id)}
                        className={cn(
                          'flex min-w-[174px] items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all',
                          selected.id === integration.id
                            ? 'border-[oklch(82%_0.08_285)] bg-white shadow-[var(--shadow-card-hover)]'
                            : 'border-[var(--color-hairline-soft)] bg-white/55 hover:bg-white',
                        )}
                      >
                        <IntegrationIcon integration={integration} size="sm" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-medium text-[var(--color-ink)]">{integration.name}</span>
                          <span className="block truncate text-[10.5px] text-[var(--color-ink-faint)]">{integration.catalogCategory}</span>
                        </span>
                        <StatusDot status={integration.status} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
                  {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      {filtered.map((integration) => (
                        <DirectoryCard
                          key={integration.id}
                          integration={integration}
                          selected={integration.id === selected.id}
                          connecting={connectingId === integration.id}
                          connectionStage={connectionStage}
                          onSelect={() => onSelect(integration.id)}
                          onConnect={() => beginConnection(integration)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-hairline-soft)] bg-white/35 px-6 text-center">
                      <Search className="mb-3 h-5 w-5 text-[var(--color-ink-faint)]" strokeWidth={1.8} />
                      <div className="text-[13px] font-medium text-[var(--color-ink)]">No apps match this view</div>
                      <p className="mt-1 max-w-[300px] text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
                        Try another category or search by app name, permission, or automation outcome.
                      </p>
                      <button onClick={resetFilters} className="pill mt-3 !py-1.5">
                        Reset filters
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <aside className="flex min-h-0 flex-col overflow-y-auto bg-[oklch(99%_0.006_285_/_0.72)] px-4 py-4 md:px-5">
                <div className="rounded-2xl border border-[var(--color-hairline-soft)] bg-white/70 p-4 shadow-[var(--shadow-card)]">
                  <div className="flex items-start gap-3">
                    <IntegrationIcon integration={selected} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-[16px] font-semibold tracking-tight text-[var(--color-ink)]">{selected.name}</h3>
                        <StatusBadge status={selected.status} />
                      </div>
                      <div className="mt-1 text-[11px] text-[var(--color-ink-faint)]">
                        {selected.catalogCategory ?? categoryLabel[selected.category]}
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
                    {integrationValue(selected)}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <DetailStat label="Status" value={statusMeta[selected.status].label} />
                    <DetailStat label="Workflows" value={`${selected.activeWorkflows}`} />
                    <DetailStat label="Events" value={`${selected.activeWorkflows * 37}/hr`} />
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center gap-1.5 text-[12px] font-medium text-[var(--color-ink)]">
                      <ShieldCheck className="h-3.5 w-3.5 text-[oklch(40%_0.13_155)]" strokeWidth={1.9} />
                      Local scopes
                    </div>
                    <ul className="space-y-1.5">
                      {integrationScopes(selected).map((scope) => (
                        <li key={scope} className="flex items-center gap-2 rounded-lg bg-[var(--color-canvas-deep)] px-2.5 py-1.5 text-[11.5px] text-[var(--color-ink-soft)]">
                          <CheckCircle2 className="h-3 w-3 text-[var(--color-mint)]" strokeWidth={2} />
                          {scope}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => beginConnection(selected)}
                    disabled={connectingId !== null}
                    className={cn(
                      'mt-4 flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-medium shadow-[var(--shadow-card)] transition-transform active:scale-[0.98]',
                      connectingId
                        ? 'cursor-wait bg-[var(--color-canvas-deep)] text-[var(--color-ink-faint)]'
                        : selected.status === 'connected'
                          ? 'bg-white text-[var(--color-ink)] hover:scale-[1.01]'
                          : 'bg-[var(--color-ink)] text-white hover:scale-[1.01]',
                    )}
                  >
                    {connectingId === selected.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2.2} />
                        {connectionStage === 'checking' ? 'Checking scopes' : 'Connecting'}
                      </>
                    ) : selected.status === 'syncing' ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5" strokeWidth={2.1} />
                        {connectionActionLabel(selected)}
                      </>
                    ) : selected.status === 'connected' ? (
                      <>
                        {connectionActionLabel(selected)}
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.1} />
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" strokeWidth={2.1} />
                        {connectionActionLabel(selected)}
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-3 rounded-2xl border border-[var(--color-hairline-soft)] bg-white/45 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(94%_0.06_295)] text-[var(--color-violet)]">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </span>
                    <div>
                      <div className="text-[12.5px] font-medium text-[var(--color-ink)]">What updates after connect</div>
                      <div className="text-[10.5px] text-[var(--color-ink-faint)]">Status, activity, notifications, and dashboard counts</div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2 text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
                    <p>Connection is simulated locally, then the app becomes available for workflow templates and audit history.</p>
                    {notice && (
                      <div className="rounded-xl bg-[oklch(94%_0.05_165)] px-3 py-2 font-medium text-[oklch(38%_0.13_155)]" role="status">
                        {notice}
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function DirectoryCard({
  integration,
  selected,
  connecting,
  connectionStage,
  onSelect,
  onConnect,
}: {
  integration: NexusIntegration
  selected: boolean
  connecting: boolean
  connectionStage: ConnectionStage
  onSelect: () => void
  onConnect: () => void
}) {
  return (
    <article
      className={cn(
        'group rounded-2xl border bg-white/58 p-3 transition-all',
        selected
          ? 'border-[oklch(82%_0.08_285)] shadow-[var(--shadow-card-hover)]'
          : 'border-[var(--color-hairline-soft)] hover:bg-white hover:shadow-[var(--shadow-card)]',
      )}
    >
      <button onClick={onSelect} className="flex w-full items-start gap-3 text-left">
        <IntegrationIcon integration={integration} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-medium text-[var(--color-ink)]">{integration.name}</span>
            {integration.recommended && <Star className="h-3 w-3 shrink-0 fill-[var(--color-amber)] text-[var(--color-amber)]" strokeWidth={1.8} />}
          </span>
          <span className="mt-0.5 block text-[10.5px] text-[var(--color-ink-faint)]">
            {integration.catalogCategory ?? categoryLabel[integration.category]}
          </span>
        </span>
        <StatusDot status={integration.status} />
      </button>

      <p className="mt-3 line-clamp-2 min-h-[34px] text-[11.5px] leading-snug text-[var(--color-ink-soft)]">
        {integrationValue(integration)}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">
          {integration.activeWorkflows} workflows
        </span>
        <button
          type="button"
          onClick={onConnect}
          disabled={connecting}
          className={cn(
            'flex h-7 items-center gap-1 rounded-full px-2.5 text-[11px] font-medium transition-colors',
            integration.status === 'connected'
              ? 'bg-[var(--color-canvas-deep)] text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
              : 'bg-[var(--color-ink)] text-white',
          )}
        >
          {connecting ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" strokeWidth={2.2} />
              {connectionStage === 'checking' ? 'Checking' : 'Connecting'}
            </>
          ) : (
            connectionActionLabel(integration)
          )}
        </button>
      </div>
    </article>
  )
}

function DetailStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-hairline-soft)] bg-[oklch(99%_0.005_280_/_0.72)] px-2.5 py-2">
      <div className="text-[10px] text-[var(--color-ink-faint)]">{label}</div>
      <div className="mt-0.5 truncate font-mono text-[12px] font-medium text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

function ConnectionLines({
  hovered,
  integrationIndex,
}: {
  hovered: string | null
  integrationIndex: Record<string, NexusIntegration>
}) {
  if (!hovered) return null
  const integration = integrationIndex[hovered]
  if (!integration) return null

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute inset-0 bg-[oklch(100%_0_0_/_0.35)]" />
    </div>
  )
}
