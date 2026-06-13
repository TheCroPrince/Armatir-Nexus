import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Clock, Activity as ActivityIcon, ChevronRight, Play, Pause, MoreHorizontal, X, Sparkles, CheckCircle2, ShieldCheck, Timer, RotateCcw, ArrowUp, ArrowDown, Copy, Save } from 'lucide-react'
import { StatusPill } from '@/components/ui/status-pill'
import { IntegrationCluster, IntegrationChip } from '@/components/ui/integration-chip'
import { Sparkline } from '@/components/ui/sparkline'
import { nexusWorkflowTemplates } from '@/data/nexus'
import type { NexusIntegration, NexusWorkflow, NexusWorkflowTemplate, WorkflowApprovalRequirement, WorkflowTemplateCategory } from '@/types/nexus'
import { cn } from '@/lib/cn'
import { isDraftWorkflow } from '@/lib/nexus-demo-labels'
import { applyWorkflowStepAction } from '@/lib/nexus-workflow-drafts'
import { useNexusDemoState } from '@/lib/nexus-demo-state-context'

const workflowTemplateCategoryOrder: Array<WorkflowTemplateCategory | 'all'> = [
  'all',
  'customer-communication',
  'leads-crm',
  'scheduling',
  'invoices-payments',
  'documents-knowledge',
  'team-notifications',
]

const workflowTemplateCategoryLabels: Record<WorkflowTemplateCategory | 'all', string> = {
  all: 'All',
  'customer-communication': 'Customer communication',
  'leads-crm': 'Leads and CRM',
  scheduling: 'Scheduling',
  'invoices-payments': 'Invoices and payments',
  'documents-knowledge': 'Documents and knowledge',
  'team-notifications': 'Team notifications',
}

function resolveWorkflowId(id: string | null, workflows: NexusWorkflow[]) {
  return workflows.some((workflow) => workflow.id === id)
    ? id!
    : workflows[0]!.id
}

export function WorkflowsPage() {
  const [params, setParams] = useSearchParams()
  const {
    workflows,
    integrationsById,
    selectedWorkflowId,
    selectWorkflow,
    toggleWorkflow,
    createWorkflowFromTemplate,
    duplicateWorkflow,
    updateWorkflowDraft,
  } = useNexusDemoState()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | NexusWorkflow['status']>('all')
  const [notice, setNotice] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [optimisticWorkflow, setOptimisticWorkflow] = useState<NexusWorkflow | null>(null)
  const requestedWorkflowId = params.get('w') ?? selectedWorkflowId
  const optimisticIsPending = optimisticWorkflow &&
    optimisticWorkflow.id === requestedWorkflowId &&
    !workflows.some((workflow) => workflow.id === optimisticWorkflow.id)
  const workflowList = useMemo(
    () => optimisticIsPending ? [optimisticWorkflow, ...workflows] : workflows,
    [optimisticIsPending, optimisticWorkflow, workflows],
  )
  const selectedId = resolveWorkflowId(requestedWorkflowId, workflowList)

  // Keep URL and selection in sync so deep links can land directly on a workflow.
  useEffect(() => {
    const requestedId = params.get('w')

    if (requestedId !== selectedId) {
      const next = new URLSearchParams(params)
      next.set('w', selectedId)
      setParams(next, { replace: true })
    }

    if (selectedWorkflowId !== selectedId) {
      selectWorkflow(selectedId)
    }
  }, [selectedId, selectedWorkflowId, params, setParams, selectWorkflow])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return workflowList.filter((w) => {
      if (filter !== 'all' && w.status !== filter) return false
      if (!q) return true
      return [w.name, w.description, w.impact].some((s) => s.toLowerCase().includes(q))
    })
  }, [query, filter, workflowList])

  const selected = workflowList.find((w) => w.id === selectedId) ?? workflowList[0]!
  const runningCount = workflowList.filter((w) => w.status === 'running').length
  const reviewCount = workflowList.filter((w) => w.status === 'review').length

  function announce(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2600)
  }

  function toggleSelectedWorkflow() {
    toggleWorkflow(selected.id)
    announce(selected.status === 'running'
      ? `${selected.name} paused`
      : `${selected.name} queued and running now`)
  }

  function handleCreateWorkflow(templateId: string) {
    const workflow = createWorkflowFromTemplate(templateId)
    if (!workflow) {
      announce('Template unavailable')
      return
    }

    const next = new URLSearchParams(params)
    next.set('w', workflow.id)
    setOptimisticWorkflow(workflow)
    selectWorkflow(workflow.id)
    setParams(next)
    setFilter('all')
    setQuery('')
    setIsCreateOpen(false)
    announce(`${workflow.name} draft created`)
  }

  function handleUseAgain() {
    const workflow = duplicateWorkflow(selected.id)
    if (!workflow) {
      announce('Workflow unavailable')
      return
    }

    const next = new URLSearchParams(params)
    next.set('w', workflow.id)
    setOptimisticWorkflow(workflow)
    selectWorkflow(workflow.id)
    setParams(next)
    setFilter('all')
    setQuery('')
    announce(`${selected.name} copied as a draft`)
  }

  function handleRenameDraft(name: string) {
    const workflow = updateWorkflowDraft(selected.id, { name })
    if (workflow) {
      announce(`${workflow.name} renamed`)
    }
  }

  function handleApprovalChange(approvalRequirement: NexusWorkflow['approvalRequirement']) {
    const workflow = updateWorkflowDraft(selected.id, { approvalRequirement })
    if (workflow) {
      announce(`${workflow.name} approval updated`)
    }
  }

  function handleStepAction(action: Parameters<typeof applyWorkflowStepAction>[1]) {
    const steps = applyWorkflowStepAction(selected.steps, action)
    const workflow = updateWorkflowDraft(selected.id, { steps })
    if (workflow) {
      announce(`${workflow.name} steps updated`)
    }
  }

  return (
    <div className="grid min-h-[calc(100dvh-56px)] grid-cols-1 gap-0 lg:h-[calc(100dvh-56px)] lg:grid-cols-[minmax(360px,440px)_1fr]">
      {/* ── List column ────────────────────────────────────────── */}
      <div className="flex max-h-[46dvh] flex-col border-b border-[var(--color-hairline-soft)] lg:max-h-none lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 px-5 pb-2 pt-6">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight text-[var(--color-ink)]">
              Workflows
            </h1>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
              {workflowList.length} enabled · {runningCount} running · {reviewCount} needs review
            </p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-2.5 py-1.5 text-[11.5px] font-medium text-white shadow-[var(--shadow-card)]"
            aria-label="Create new workflow"
          >
            <Plus className="h-3 w-3" strokeWidth={2.2} /> New workflow
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <label className="flex items-center gap-2 rounded-full border border-[var(--color-hairline)] bg-white/70 px-3 py-1.5">
            <Search className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter workflows..."
              className="flex-1 bg-transparent text-[12.5px] text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-ghost)]"
              aria-label="Filter workflows"
            />
          </label>
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
          {(['all', 'running', 'ready', 'review', 'synced', 'paused'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-label={`Filter workflows by ${f}`}
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
                    onClick={() => {
                      const next = new URLSearchParams(params)
                      next.set('w', w.id)
                      selectWorkflow(w.id)
                      setParams(next)
                    }}
                    aria-label={`Select workflow ${w.name} (${w.id})`}
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
                      <WorkflowStatePill workflow={w} className="shrink-0" />
                    </div>
                    <p className="line-clamp-1 text-[11.5px] text-[var(--color-ink-faint)]">
                      {w.impact}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <IntegrationCluster ids={w.integrations.map((i) => i.id)} size="sm" integrationIndex={integrationsById} />
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
            <DetailHeader
              workflow={selected}
              onToggle={toggleSelectedWorkflow}
              onUseAgain={handleUseAgain}
              onMenu={() => announce('Workflow actions opened')}
            />
            {isDraftWorkflow(selected) && (
              <DraftControls
                workflow={selected}
                onRename={handleRenameDraft}
                onApprovalChange={handleApprovalChange}
                onStepAction={handleStepAction}
              />
            )}
            <DetailFlow workflow={selected} integrationIndex={integrationsById} />
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <DetailMeta workflow={selected} integrationIndex={integrationsById} />
              <DetailRunHistory workflow={selected} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <WorkflowTemplatePickerModal
        open={isCreateOpen}
        templates={nexusWorkflowTemplates}
        integrationIndex={integrationsById}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateWorkflow}
      />
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-5 z-40 rounded-full bg-[var(--color-ink)] px-4 py-2 text-[12px] font-medium text-white shadow-[var(--shadow-pop)] md:bottom-5"
            role="status"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WorkflowTemplatePickerModal({
  open,
  templates,
  integrationIndex,
  onClose,
  onCreate,
}: {
  open: boolean
  templates: NexusWorkflowTemplate[]
  integrationIndex: Record<string, NexusIntegration>
  onClose: () => void
  onCreate: (templateId: string) => void
}) {
  const [category, setCategory] = useState<WorkflowTemplateCategory | 'all'>('all')
  const visibleTemplates = useMemo(
    () => templates.filter((template) => category === 'all' || template.category === category),
    [category, templates],
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 cursor-default bg-[oklch(18%_0.03_280_/_0.22)] backdrop-blur-[3px]"
            aria-label="Close workflow template picker"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-5">
            <motion.section
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.985 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[1060px] flex-col overflow-hidden rounded-[26px] border border-white/70 bg-[oklch(98.5%_0.012_290_/_0.96)] shadow-[var(--shadow-pop)] backdrop-blur-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="workflow-template-title"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-hairline-soft)] px-5 py-4 sm:px-6">
                <div>
                  <div className="mono-label">Template library</div>
                  <h2 id="workflow-template-title" className="mt-1 text-[20px] font-semibold tracking-tight text-[var(--color-ink)]">
                    New workflow
                  </h2>
                </div>
                <button onClick={onClose} className="pill !h-8 !w-8 !justify-center !p-0" aria-label="Close workflow template picker">
                  <X className="h-3.5 w-3.5" strokeWidth={1.9} />
                </button>
              </div>

              <div className="border-b border-[var(--color-hairline-soft)] px-5 py-3 sm:px-6">
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {workflowTemplateCategoryOrder.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={cn(
                        'shrink-0 rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors',
                        category === item
                          ? 'bg-[var(--color-ink)] text-white shadow-[var(--shadow-card)]'
                          : 'bg-white/60 text-[var(--color-ink-faint)] hover:bg-white/85 hover:text-[var(--color-ink)]',
                      )}
                      aria-pressed={category === item}
                    >
                      {workflowTemplateCategoryLabels[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  {visibleTemplates.map((template) => (
                    <WorkflowTemplateCard
                      key={template.id}
                      template={template}
                      integrationIndex={integrationIndex}
                      onCreate={onCreate}
                    />
                  ))}
                </div>
              </div>
            </motion.section>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

function WorkflowTemplateCard({
  template,
  integrationIndex,
  onCreate,
}: {
  template: NexusWorkflowTemplate
  integrationIndex: Record<string, NexusIntegration>
  onCreate: (templateId: string) => void
}) {
  const trigger = integrationIndex[template.triggerIntegrationId]
  const approvalLabel = template.requiresApproval ? 'Approval required' : 'Runs automatically'

  return (
    <button
      onClick={() => onCreate(template.id)}
      className="group flex min-h-[270px] w-full flex-col rounded-2xl border border-[var(--color-hairline-soft)] bg-white/58 px-4 py-4 text-left shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-[oklch(78%_0.10_285)] hover:bg-white hover:shadow-[var(--shadow-card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-violet)]"
      aria-label={`Create workflow from ${template.name} template`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <IntegrationChip id={template.triggerIntegrationId} size="lg" integrationIndex={integrationIndex} />
          <div className="min-w-0">
            <div className="mono-label line-clamp-1">{workflowTemplateCategoryLabels[template.category]}</div>
            <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--color-ink)]">
              {template.name}
            </h3>
          </div>
        </div>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-[var(--color-ink-ghost)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-ink-soft)]" strokeWidth={1.8} />
      </div>

      <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)]">
        {template.description}
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <TemplateFact icon={<Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />} label="Trigger" value={trigger?.name ?? template.triggerIntegrationId} />
        <TemplateFact icon={<ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />} label="Control" value={approvalLabel} />
        <TemplateFact icon={<Timer className="h-3.5 w-3.5" strokeWidth={1.8} />} label="Saved" value={template.estimatedTimeSaved} />
      </div>

      <div className="mt-4 rounded-xl border border-[var(--color-hairline-soft)] bg-white/55 px-3 py-3">
        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-[var(--color-ink)]">
          <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-violet)]" strokeWidth={1.8} />
          Actions performed
        </div>
        <ul className="space-y-1">
          {template.actionSummary.map((action) => (
            <li key={action} className="flex gap-2 text-[11.5px] leading-relaxed text-[var(--color-ink-soft)]">
              <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--color-violet-soft)]" />
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <IntegrationCluster ids={template.integrationIds} size="sm" integrationIndex={integrationIndex} />
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-card)] transition-transform group-hover:scale-[1.02]">
          <Plus className="h-3 w-3" strokeWidth={2.2} /> Use template
        </span>
      </div>
    </button>
  )
}

function TemplateFact({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--color-hairline-soft)] bg-white/55 px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-faint)]">
        <span className="text-[var(--color-violet)]">{icon}</span>
        {label}
      </div>
      <div className="mt-1 line-clamp-2 text-[11.5px] font-medium leading-snug text-[var(--color-ink)]">{value}</div>
    </div>
  )
}

// ─── Detail panel sub-components ─────────────────────────────────────────────

function WorkflowStatePill({ workflow, className, pulse = false }: { workflow: NexusWorkflow; className?: string; pulse?: boolean }) {
  if (!isDraftWorkflow(workflow)) {
    return <StatusPill status={workflow.status} className={className} pulse={pulse} />
  }

  return (
    <span className={cn('status-pill bg-[oklch(95%_0.04_285)] text-[var(--color-violet)]', className)}>
      <span className="bg-[var(--color-violet-soft)]" />
      Draft
    </span>
  )
}

function DraftSetupStrip() {
  return (
    <div className="mt-2 flex max-w-xl flex-wrap items-center gap-2 rounded-xl border border-[oklch(84%_0.06_285)] bg-white/65 px-3 py-2 shadow-[var(--shadow-card)]">
      <span className="mono-label text-[var(--color-violet)]">Draft setup</span>
      <span className="hidden h-4 w-px bg-[var(--color-hairline)] sm:block" />
      {['Review steps', 'Test run', 'Activate'].map((item, index) => (
        <span key={item} className="flex items-center gap-1.5 text-[11.5px] font-medium text-[var(--color-ink-soft)]">
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full border border-[oklch(82%_0.06_285)] bg-white text-[9px] font-semibold text-[var(--color-violet)]">
            {index + 1}
          </span>
          <span>{item}</span>
        </span>
      ))}
    </div>
  )
}

const approvalOptions: Array<{ value: WorkflowApprovalRequirement; label: string }> = [
  { value: 'approval-required', label: 'Approval required' },
  { value: 'optional-review', label: 'Optional review' },
  { value: 'auto-run', label: 'Runs automatically' },
]

function DraftControls({
  workflow,
  onRename,
  onApprovalChange,
  onStepAction,
}: {
  workflow: NexusWorkflow
  onRename: (name: string) => void
  onApprovalChange: (approvalRequirement: WorkflowApprovalRequirement) => void
  onStepAction: (action: Parameters<typeof applyWorkflowStepAction>[1]) => void
}) {
  const [name, setName] = useState(workflow.name)
  const approvalRequirement = workflow.approvalRequirement ?? 'optional-review'

  return (
    <section className="glass rounded-2xl p-5" aria-label="Draft setup controls">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,0.85fr)_1fr]">
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="mono-label">Name</span>
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => {
                  if (name.trim() !== workflow.name) onRename(name)
                }}
                className="min-h-9 flex-1 rounded-xl border border-[var(--color-hairline-soft)] bg-white/65 px-3 text-[13px] font-medium text-[var(--color-ink)] outline-none transition-colors focus:border-[oklch(76%_0.10_285)]"
                aria-label="Workflow draft name"
              />
              <button
                type="button"
                onClick={() => onRename(name)}
                className="pill !h-9 !px-3"
                aria-label={`Rename workflow draft ${workflow.name}`}
              >
                <Save className="h-3.5 w-3.5" strokeWidth={1.8} />
                <span>Save</span>
              </button>
            </div>
          </label>

          <div className="flex flex-col gap-1.5">
            <div className="mono-label">Approval</div>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Approval requirement">
              {approvalOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onApprovalChange(option.value)}
                  aria-pressed={approvalRequirement === option.value}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-colors',
                    approvalRequirement === option.value
                      ? 'bg-[var(--color-ink)] text-white shadow-[var(--shadow-card)]'
                      : 'bg-white/65 text-[var(--color-ink-faint)] hover:bg-white hover:text-[var(--color-ink)]',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="mono-label">Steps</div>
            <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">{workflow.steps.length}/8</span>
          </div>
          <ol className="flex flex-col gap-1.5">
            {workflow.steps.map((step, index) => (
              <li key={`${step}-${index}`} className="flex items-center gap-2 rounded-xl border border-[var(--color-hairline-soft)] bg-white/55 px-2.5 py-2">
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white font-mono text-[10.5px] font-medium text-[var(--color-ink-soft)] shadow-[inset_0_0_0_1px_var(--color-hairline-soft)]">
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-[var(--color-ink)]">{step}</span>
                <div className="flex shrink-0 items-center gap-1">
                  <IconDraftButton
                    label={`Move step ${index + 1} up`}
                    disabled={index === 0}
                    onClick={() => onStepAction({ type: 'move-up', index })}
                  >
                    <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </IconDraftButton>
                  <IconDraftButton
                    label={`Move step ${index + 1} down`}
                    disabled={index === workflow.steps.length - 1}
                    onClick={() => onStepAction({ type: 'move-down', index })}
                  >
                    <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </IconDraftButton>
                  <IconDraftButton
                    label={`Copy step ${index + 1}`}
                    disabled={workflow.steps.length >= 8}
                    onClick={() => onStepAction({ type: 'copy', index })}
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </IconDraftButton>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function IconDraftButton({
  label,
  disabled = false,
  onClick,
  children,
}: {
  label: string
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--color-ink-faint)] transition-colors hover:bg-white hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  )
}

function DetailHeader({
  workflow,
  onToggle,
  onUseAgain,
  onMenu,
}: {
  workflow: NexusWorkflow
  onToggle: () => void
  onUseAgain: () => void
  onMenu: () => void
}) {
  const isRunning = workflow.status === 'running'
  const isDraft = isDraftWorkflow(workflow)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <WorkflowStatePill workflow={workflow} pulse />
            <span className="chip rounded-full px-2 py-0.5 text-[10.5px] capitalize text-[var(--color-ink-soft)]">
              {workflow.category}
            </span>
            <span
              className="chip max-w-full rounded-full px-2 py-0.5 font-mono text-[10.5px] text-[var(--color-ink-faint)]"
              aria-label={`Workflow ID ${workflow.id}`}
            >
              Workflow ID: {workflow.id}
            </span>
          </div>
          <h2 className="text-[22px] font-semibold tracking-tight text-[var(--color-ink)]">
            {workflow.name}
          </h2>
          <p className="max-w-xl text-[13.5px] leading-relaxed text-[var(--color-ink-soft)]">
            {workflow.description}
          </p>
          {isDraft && <DraftSetupStrip />}
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:shrink-0">
          <button
            className="pill !py-1.5"
            onClick={onUseAgain}
            aria-label={`Use workflow ${workflow.name} again`}
          >
            <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.8} />
            <span>Use again</span>
          </button>
          <button
            className="pill !py-1.5"
            onClick={onMenu}
            aria-label={`Open actions for workflow ${workflow.name}`}
          >
            <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
          <button
            onClick={onToggle}
            aria-label={`${isRunning ? 'Pause' : 'Run'} workflow ${workflow.name}`}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]',
              isRunning
                ? 'bg-white text-[var(--color-ink)]'
                : 'bg-[var(--color-ink)] text-white',
            )}
          >
            {isRunning ? (
              <>
                <Pause className="h-3 w-3" strokeWidth={2.2} fill="currentColor" /> Pause workflow
              </>
            ) : (
              <>
                <Play className="h-3 w-3" strokeWidth={2.2} fill="currentColor" /> Run workflow
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

function DetailFlow({
  workflow,
  integrationIndex,
}: {
  workflow: NexusWorkflow
  integrationIndex: Record<string, NexusIntegration>
}) {
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
            <IntegrationChip key={i.id} id={i.id} size="md" integrationIndex={integrationIndex} />
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
                    <IntegrationChip id={integration.id} size="sm" integrationIndex={integrationIndex} />
                    <span>via {integrationIndex[integration.id]?.name ?? integration.id}</span>
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

function DetailMeta({
  workflow,
  integrationIndex,
}: {
  workflow: NexusWorkflow
  integrationIndex: Record<string, NexusIntegration>
}) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 text-[13px] font-medium text-[var(--color-ink)]">Connected integrations</div>
      <ul className="flex flex-col gap-2.5">
        {workflow.integrations.map((i) => (
          <li key={i.id} className="flex items-center gap-3">
            <IntegrationChip id={i.id} size="lg" integrationIndex={integrationIndex} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-[var(--color-ink)]">
                {integrationIndex[i.id]?.name ?? i.id}
              </div>
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
    <div className="glass min-w-0 overflow-hidden rounded-2xl p-5">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[13px] font-medium text-[var(--color-ink)]">Run history</div>
        <span className="font-mono text-[10.5px] text-[var(--color-ink-faint)]">14 days</span>
      </div>
      <div className="text-[10.5px] text-[var(--color-ink-faint)]">
        Total <span className="font-mono text-[var(--color-ink-soft)]">{workflow.sparkline.reduce((a, b) => a + b, 0)}</span> runs · success rate <span className="font-mono text-[var(--color-ink-soft)]">99.2%</span>
      </div>

      <div className="mt-4 min-w-0 overflow-hidden">
        <Sparkline
          values={workflow.sparkline}
          width={320}
          height={56}
          color="oklch(55% 0.20 280)"
          strokeWidth={1.8}
          className="w-full max-w-full"
        />
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
