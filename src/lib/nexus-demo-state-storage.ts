const nexusDemoStateStorageKey = 'armatir:nexus-demo-state:v1'

const workflowIds = new Set([
  'triage-inbound',
  'lead-routing',
  'meeting-recap',
  'overdue-escalation',
  'invoice-followup',
  'sync-project-status',
  'schedule-recurring',
  'deploy-digest',
])

const inboxIds = new Set(['in-001', 'in-002', 'in-003', 'in-004', 'in-005', 'in-006'])
const recommendationIds = new Set(['rec-lead-intent', 'rec-followup', 'rec-calendar', 'rec-risk'])
const workflowStatuses = new Set(['running', 'ready', 'synced', 'review', 'paused'])
const inboxStatuses = new Set(['queued', 'drafted', 'awaiting-approval', 'sent'])

export interface NexusDemoWorkflowState {
  status?: 'running' | 'ready' | 'synced' | 'review' | 'paused'
  lastRun?: string
  runsThisMonth?: number
}

export interface NexusDemoInboxItemState {
  status: 'queued' | 'drafted' | 'awaiting-approval' | 'sent'
}

export interface NexusDemoState {
  workflows: Record<string, NexusDemoWorkflowState>
  inboxItems: Record<string, NexusDemoInboxItemState>
  drafts: Record<string, string>
  dismissedRecommendationIds: string[]
  selectedWorkflowId: string | null
  selectedInboxId: string | null
}

export function createDefaultNexusDemoState(): NexusDemoState {
  return {
    workflows: {},
    inboxItems: {},
    drafts: {},
    dismissedRecommendationIds: [],
    selectedWorkflowId: null,
    selectedInboxId: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readWorkflowState(value: unknown): NexusDemoWorkflowState | null {
  if (!isRecord(value)) return null

  const next: NexusDemoWorkflowState = {}

  if (typeof value.status === 'string' && workflowStatuses.has(value.status)) {
    next.status = value.status as NexusDemoWorkflowState['status']
  }
  if (typeof value.lastRun === 'string') {
    next.lastRun = value.lastRun
  }
  if (typeof value.runsThisMonth === 'number' && Number.isFinite(value.runsThisMonth) && value.runsThisMonth >= 0) {
    next.runsThisMonth = Math.round(value.runsThisMonth)
  }

  return Object.keys(next).length > 0 ? next : null
}

function readWorkflowStates(value: unknown) {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter(([id]) => workflowIds.has(id))
      .map(([id, workflowState]) => [id, readWorkflowState(workflowState)])
      .filter((entry): entry is [string, NexusDemoWorkflowState] => entry[1] !== null),
  )
}

function readInboxItemStates(value: unknown) {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter(([id]) => inboxIds.has(id))
      .map(([id, itemState]) => {
        if (!isRecord(itemState) || typeof itemState.status !== 'string' || !inboxStatuses.has(itemState.status)) {
          return null
        }

        return [id, { status: itemState.status as NexusDemoInboxItemState['status'] }]
      })
      .filter((entry): entry is [string, NexusDemoInboxItemState] => entry !== null),
  )
}

function readDrafts(value: unknown) {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => inboxIds.has(entry[0]) && typeof entry[1] === 'string'),
  )
}

function readDismissedRecommendationIds(value: unknown) {
  if (!Array.isArray(value)) return []

  return [...new Set(value.filter((id): id is string => typeof id === 'string' && recommendationIds.has(id)))]
}

function readKnownId(value: unknown, knownIds: Set<string>) {
  return typeof value === 'string' && knownIds.has(value) ? value : null
}

export function normalizeNexusDemoState(value: unknown): NexusDemoState {
  if (!isRecord(value)) return createDefaultNexusDemoState()

  return {
    workflows: readWorkflowStates(value.workflows),
    inboxItems: readInboxItemStates(value.inboxItems),
    drafts: readDrafts(value.drafts),
    dismissedRecommendationIds: readDismissedRecommendationIds(value.dismissedRecommendationIds),
    selectedWorkflowId: readKnownId(value.selectedWorkflowId, workflowIds),
    selectedInboxId: readKnownId(value.selectedInboxId, inboxIds),
  }
}

export function loadStoredNexusDemoState(): NexusDemoState {
  if (typeof window === 'undefined') return createDefaultNexusDemoState()

  try {
    const raw = window.localStorage.getItem(nexusDemoStateStorageKey)
    return raw ? normalizeNexusDemoState(JSON.parse(raw)) : createDefaultNexusDemoState()
  } catch {
    return createDefaultNexusDemoState()
  }
}

export function saveNexusDemoState(state: NexusDemoState) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(nexusDemoStateStorageKey, JSON.stringify(state))
  } catch {
    // Storage can fail in private modes; demo state should still work for the session.
  }
}
