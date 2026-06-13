import type {
  ActivityStatus,
  IntegrationCategory,
  NexusActivityEvent,
  NexusIntegration,
  NexusNotification,
  NexusWorkflow,
  NotificationKind,
  WorkflowApprovalRequirement,
  WorkflowStatus,
} from '@/types/nexus'
import type { NexusIconName } from '@/types/nexus-icons'

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
const seedIntegrationIds = new Set([
  'gmail',
  'outlook',
  'gcal',
  'm365-calendar',
  'slack',
  'teams',
  'zoom',
  'hubspot',
  'salesforce',
  'pipedrive',
  'notion',
  'google-drive',
  'dropbox',
  'airtable',
  'stripe',
  'square',
  'quickbooks',
  'shopify',
  'typeform',
  'linear',
  'github',
  'openai',
  'claude',
])
const seedNotificationIds = new Set(['n-1', 'n-2', 'n-3', 'n-4', 'n-5', 'n-6', 'n-7'])
const workflowStatuses = new Set(['running', 'ready', 'synced', 'review', 'paused'])
const inboxStatuses = new Set(['queued', 'drafted', 'awaiting-approval', 'sent'])
const workflowCategories = new Set(['ops', 'sales', 'support', 'comms', 'finance'])
const integrationCategories = new Set(['productivity', 'communication', 'crm', 'finance', 'engineering', 'ai'])
const integrationStatuses = new Set(['connected', 'syncing', 'attention'])
const activityStatuses = new Set(['success', 'info', 'warning', 'ai'])
const notificationKinds = new Set(['reply', 'workflow', 'ai', 'system', 'mention'])
const workflowApprovalRequirements = new Set(['approval-required', 'optional-review', 'auto-run'])
const integrationIcons = new Set([
  'Calendar',
  'Mail',
  'MessageSquare',
  'Users',
  'FileText',
  'CreditCard',
  'GitBranch',
  'Github',
  'Brain',
  'Sparkles',
  'Slack',
  'MailPlus',
  'CalendarDays',
  'Cloud',
  'Handshake',
  'Building2',
  'BadgeDollarSign',
  'ReceiptText',
  'Video',
  'FolderOpen',
  'Box',
  'Table2',
  'ShoppingBag',
  'ClipboardList',
  'MessagesSquare',
  'PanelTop',
  'WalletCards',
  'Database',
  'Bot',
  'Workflow',
  'Inbox',
  'Webhook',
])

export interface NexusDemoWorkflowState {
  status?: 'running' | 'ready' | 'synced' | 'review' | 'paused'
  lastRun?: string
  runsThisMonth?: number
}

export interface NexusDemoInboxItemState {
  status: 'queued' | 'drafted' | 'awaiting-approval' | 'sent'
}

export interface NexusDemoIntegrationState {
  status?: NexusIntegration['status']
  activeWorkflows?: number
  lastConnectedAt?: string
}

export interface NexusDemoNotificationState {
  read: boolean
}

export interface NexusDemoState {
  workflows: Record<string, NexusDemoWorkflowState>
  integrations: Record<string, NexusDemoIntegrationState>
  customWorkflows: NexusWorkflow[]
  customIntegrations: NexusIntegration[]
  inboxItems: Record<string, NexusDemoInboxItemState>
  drafts: Record<string, string>
  activityEvents: NexusActivityEvent[]
  notifications: NexusNotification[]
  notificationStates: Record<string, NexusDemoNotificationState>
  dismissedRecommendationIds: string[]
  selectedWorkflowId: string | null
  selectedInboxId: string | null
}

export function createDefaultNexusDemoState(): NexusDemoState {
  return {
    workflows: {},
    integrations: {},
    customWorkflows: [],
    customIntegrations: [],
    inboxItems: {},
    drafts: {},
    activityEvents: [],
    notifications: [],
    notificationStates: {},
    dismissedRecommendationIds: [],
    selectedWorkflowId: null,
    selectedInboxId: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function readText(value: unknown, fallback = '', maxLength = 240) {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed.length > maxLength ? trimmed.slice(0, maxLength) : trimmed
}

function readIsoTimestamp(value: unknown) {
  if (typeof value !== 'string') return null
  const timestamp = value.trim()
  return Number.isNaN(Date.parse(timestamp)) ? null : timestamp
}

function readNonNegativeInteger(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : null
}

function readStringArray(value: unknown, maxItems: number, maxLength = 180) {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => readText(item, '', maxLength))
    .filter(Boolean)
    .slice(0, maxItems)
}

function readLocalHref(value: unknown) {
  const href = readText(value, '', 120)
  return href.startsWith('/') ? href : undefined
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
      .filter(([id]) => workflowIds.has(id) || id.startsWith('local-workflow-'))
      .map(([id, workflowState]) => [id, readWorkflowState(workflowState)])
      .filter((entry): entry is [string, NexusDemoWorkflowState] => entry[1] !== null),
  )
}

function readIntegrationState(value: unknown): NexusDemoIntegrationState | null {
  if (!isRecord(value)) return null

  const next: NexusDemoIntegrationState = {}

  if (typeof value.status === 'string' && integrationStatuses.has(value.status)) {
    next.status = value.status as NexusIntegration['status']
  }

  const activeWorkflows = readNonNegativeInteger(value.activeWorkflows)
  if (activeWorkflows !== null) {
    next.activeWorkflows = activeWorkflows
  }

  const lastConnectedAt = readIsoTimestamp(value.lastConnectedAt)
  if (lastConnectedAt) {
    next.lastConnectedAt = lastConnectedAt
  }

  return Object.keys(next).length > 0 ? next : null
}

function readIntegrationStates(value: unknown, integrationIds: Set<string>) {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter(([id]) => integrationIds.has(id))
      .map(([id, integrationState]) => [id, readIntegrationState(integrationState)])
      .filter((entry): entry is [string, NexusDemoIntegrationState] => entry[1] !== null),
  )
}

function readCustomIntegration(value: unknown): NexusIntegration | null {
  if (!isRecord(value)) return null

  const id = readText(value.id, '', 64)
  const name = readText(value.name, '', 80)
  const category = typeof value.category === 'string' && integrationCategories.has(value.category)
    ? value.category as IntegrationCategory
    : null
  const status = typeof value.status === 'string' && integrationStatuses.has(value.status)
    ? value.status as NexusIntegration['status']
    : 'connected'
  const icon = typeof value.icon === 'string' && integrationIcons.has(value.icon)
    ? value.icon as NexusIconName
    : 'Webhook'
  const accent = readText(value.accent, 'oklch(64% 0.16 245)', 48)
  const activeWorkflows = typeof value.activeWorkflows === 'number' && Number.isFinite(value.activeWorkflows) && value.activeWorkflows >= 0
    ? Math.round(value.activeWorkflows)
    : 0
  const catalogCategory = readText(value.catalogCategory, '', 64)
  const automationValue = readText(value.automationValue, '', 180)
  const scopes = readStringArray(value.scopes, 4, 72)
  const lastConnectedAt = readIsoTimestamp(value.lastConnectedAt) ?? undefined

  if (!id.startsWith('local-integration-') || !name || !category) return null

  return {
    id,
    name,
    category,
    status,
    accent,
    icon,
    activeWorkflows,
    ...(catalogCategory ? { catalogCategory } : {}),
    ...(automationValue ? { automationValue } : {}),
    ...(scopes.length > 0 ? { scopes } : {}),
    ...(lastConnectedAt ? { lastConnectedAt } : {}),
  }
}

function readCustomIntegrations(value: unknown) {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  return value
    .map(readCustomIntegration)
    .filter((integration): integration is NexusIntegration => {
      if (!integration || seen.has(integration.id)) return false
      seen.add(integration.id)
      return true
    })
    .slice(0, 12)
}

function readCustomWorkflow(value: unknown, integrationIds: Set<string>): NexusWorkflow | null {
  if (!isRecord(value)) return null

  const id = readText(value.id, '', 72)
  const name = readText(value.name, '', 96)
  const description = readText(value.description, '', 260)
  const category = typeof value.category === 'string' && workflowCategories.has(value.category)
    ? value.category as NexusWorkflow['category']
    : null
  const status = typeof value.status === 'string' && workflowStatuses.has(value.status)
    ? value.status as WorkflowStatus
    : 'ready'
  const integrations = Array.isArray(value.integrations)
    ? value.integrations
        .filter(isRecord)
        .map((integration) => readText(integration.id, '', 64))
        .filter((integrationId) => integrationIds.has(integrationId))
        .slice(0, 4)
        .map((integrationId) => ({ id: integrationId }))
    : []
  const steps = readStringArray(value.steps, 8, 180)
  const sparkline = Array.isArray(value.sparkline)
    ? value.sparkline
        .filter((point): point is number => typeof point === 'number' && Number.isFinite(point) && point >= 0)
        .map((point) => Math.round(point))
        .slice(0, 14)
    : []
  const runsThisMonth = typeof value.runsThisMonth === 'number' && Number.isFinite(value.runsThisMonth) && value.runsThisMonth >= 0
    ? Math.round(value.runsThisMonth)
    : 0
  const approvalRequirement = typeof value.approvalRequirement === 'string' && workflowApprovalRequirements.has(value.approvalRequirement)
    ? value.approvalRequirement as WorkflowApprovalRequirement
    : undefined

  if (!id.startsWith('local-workflow-') || !name || !description || !category || integrations.length === 0) return null

  return {
    id,
    name,
    description,
    category,
    status,
    lastRun: readText(value.lastRun, 'not run yet', 48),
    impact: readText(value.impact, 'Ready to save time this week', 96),
    ...(approvalRequirement ? { approvalRequirement } : {}),
    steps: steps.length > 0 ? steps : ['Receive trigger from selected integration', 'Draft a local automation plan', 'Hold for review before taking action'],
    integrations,
    avgDuration: readText(value.avgDuration, '0.0s', 24),
    runsThisMonth,
    sparkline: sparkline.length === 14 ? sparkline : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  }
}

function readCustomWorkflows(value: unknown, integrationIds: Set<string>) {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  return value
    .map((workflow) => readCustomWorkflow(workflow, integrationIds))
    .filter((workflow): workflow is NexusWorkflow => {
      if (!workflow || seen.has(workflow.id)) return false
      seen.add(workflow.id)
      return true
    })
    .slice(0, 16)
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

function readActivityEvent(value: unknown, integrationIds: Set<string>, workflowIds: Set<string>): NexusActivityEvent | null {
  if (!isRecord(value)) return null

  const id = readText(value.id, '', 80)
  const message = readText(value.message, '', 180)
  const source = readText(value.source, '', 64)
  const status = typeof value.status === 'string' && activityStatuses.has(value.status)
    ? value.status as ActivityStatus
    : null
  const timestamp = readIsoTimestamp(value.timestamp)
  const workflowId = readText(value.workflowId, '', 80)

  if (!id.startsWith('activity-local-') || !message || !integrationIds.has(source) || !status || !timestamp) {
    return null
  }

  return {
    id,
    message,
    source,
    status,
    timestamp,
    ...(workflowId && workflowIds.has(workflowId) ? { workflowId } : {}),
  }
}

function readActivityEvents(value: unknown, integrationIds: Set<string>, workflowIds: Set<string>) {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  return value
    .map((event) => readActivityEvent(event, integrationIds, workflowIds))
    .filter((event): event is NexusActivityEvent => {
      if (!event || seen.has(event.id)) return false
      seen.add(event.id)
      return true
    })
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 24)
}

function readNotification(value: unknown, integrationIds: Set<string>): NexusNotification | null {
  if (!isRecord(value)) return null

  const id = readText(value.id, '', 80)
  const kind = typeof value.kind === 'string' && notificationKinds.has(value.kind)
    ? value.kind as NotificationKind
    : null
  const title = readText(value.title, '', 120)
  const body = readText(value.body, '', 220)
  const source = readText(value.source, '', 64)
  const timestamp = readIsoTimestamp(value.timestamp)
  const read = typeof value.read === 'boolean' ? value.read : false
  const href = readLocalHref(value.href)
  const action = readText(value.action, '', 40)

  if (!id.startsWith('notice-local-') || !kind || !title || !body || !timestamp) {
    return null
  }

  return {
    id,
    kind,
    title,
    body,
    timestamp,
    read,
    ...(source && integrationIds.has(source) ? { source } : {}),
    ...(href ? { href } : {}),
    ...(action ? { action } : {}),
  }
}

function readNotifications(value: unknown, integrationIds: Set<string>) {
  if (!Array.isArray(value)) return []

  const seen = new Set<string>()
  return value
    .map((notification) => readNotification(notification, integrationIds))
    .filter((notification): notification is NexusNotification => {
      if (!notification || seen.has(notification.id)) return false
      seen.add(notification.id)
      return true
    })
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 20)
}

function readNotificationStates(value: unknown, notificationIds: Set<string>) {
  if (!isRecord(value)) return {}

  return Object.fromEntries(
    Object.entries(value)
      .filter(([id]) => notificationIds.has(id))
      .map(([id, notificationState]) => {
        if (!isRecord(notificationState) || typeof notificationState.read !== 'boolean') return null
        return [id, { read: notificationState.read }]
      })
      .filter((entry): entry is [string, NexusDemoNotificationState] => entry !== null),
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

  const customIntegrations = readCustomIntegrations(value.customIntegrations)
  const knownIntegrationIds = new Set([...Array.from(seedIntegrationIds), ...customIntegrations.map((integration) => integration.id)])
  const customWorkflows = readCustomWorkflows(value.customWorkflows, knownIntegrationIds)
  const knownWorkflowIds = new Set([...Array.from(workflowIds), ...customWorkflows.map((workflow) => workflow.id)])
  const activityEvents = readActivityEvents(value.activityEvents, knownIntegrationIds, knownWorkflowIds)
  const notifications = readNotifications(value.notifications, knownIntegrationIds)
  const knownNotificationIds = new Set([...Array.from(seedNotificationIds), ...notifications.map((notification) => notification.id)])

  return {
    workflows: readWorkflowStates(value.workflows),
    integrations: readIntegrationStates(value.integrations, knownIntegrationIds),
    customWorkflows,
    customIntegrations,
    inboxItems: readInboxItemStates(value.inboxItems),
    drafts: readDrafts(value.drafts),
    activityEvents,
    notifications,
    notificationStates: readNotificationStates(value.notificationStates, knownNotificationIds),
    dismissedRecommendationIds: readDismissedRecommendationIds(value.dismissedRecommendationIds),
    selectedWorkflowId: readKnownId(value.selectedWorkflowId, knownWorkflowIds),
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
