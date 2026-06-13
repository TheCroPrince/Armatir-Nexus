import assert from 'node:assert/strict'
import {
  createDefaultNexusDemoState,
  loadStoredNexusDemoState,
  normalizeNexusDemoState,
  saveNexusDemoState,
} from '../src/lib/nexus-demo-state-storage.ts'
import {
  formatRunningWorkflowSummary,
  formatWorkflowCount,
  isDraftWorkflow,
  workflowActivityHref,
} from '../src/lib/nexus-demo-labels.ts'
import {
  applyWorkflowStepAction,
  createWorkflowReuseInput,
  sanitizeWorkflowDraftName,
} from '../src/lib/nexus-workflow-drafts.ts'

const nexusData = await import('../src/data/nexus.ts')

function installLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial))

  globalThis.window = {
    localStorage: {
      getItem(key) {
        return store.has(key) ? store.get(key) : null
      },
      setItem(key, value) {
        store.set(key, String(value))
      },
    },
  }

  return store
}

const defaultState = createDefaultNexusDemoState()

assert.deepEqual(normalizeNexusDemoState(null), defaultState)
assert.deepEqual(normalizeNexusDemoState({ workflows: 'bad' }).workflows, defaultState.workflows)

const normalized = normalizeNexusDemoState({
  workflows: {
    'triage-inbound': { status: 'paused', lastRun: '12s ago', runsThisMonth: 999 },
    unknown: { status: 'banana', runsThisMonth: -1 },
  },
  inboxItems: {
    'in-001': { status: 'sent' },
    'in-002': { status: 'queued' },
  },
  drafts: {
    'in-001': 'Custom approval note.',
  },
  dismissedRecommendationIds: ['rec-risk', 44, 'rec-risk'],
  selectedWorkflowId: 'lead-routing',
  selectedInboxId: 'in-002',
})

assert.equal(normalized.workflows['triage-inbound'].status, 'paused')
assert.equal(normalized.workflows['triage-inbound'].runsThisMonth, 999)
assert.equal(normalized.workflows.unknown, undefined)
assert.equal(normalized.inboxItems['in-001'].status, 'sent')
assert.equal(normalized.drafts['in-001'], 'Custom approval note.')
assert.deepEqual(normalized.dismissedRecommendationIds, ['rec-risk'])
assert.equal(normalized.selectedWorkflowId, 'lead-routing')
assert.equal(normalized.selectedInboxId, 'in-002')

const actionTimestamp = '2026-06-12T14:30:00.000Z'
const actionState = normalizeNexusDemoState({
  integrations: {
    outlook: { status: 'connected', activeWorkflows: 2, lastConnectedAt: actionTimestamp },
    unknown: { status: 'connected', activeWorkflows: 99 },
  },
  activityEvents: [
    {
      id: 'activity-local-outlook',
      message: 'Outlook connected locally',
      source: 'outlook',
      status: 'success',
      timestamp: actionTimestamp,
    },
    { id: 'bad-event', message: '', source: 'unknown', status: 'banana', timestamp: actionTimestamp },
  ],
  notifications: [
    {
      id: 'notice-local-outlook',
      kind: 'system',
      title: 'Outlook connection ready',
      body: 'Nexus can now use Outlook in local automations.',
      source: 'outlook',
      timestamp: actionTimestamp,
      read: false,
      href: '/integrations',
      action: 'Manage',
    },
  ],
  notificationStates: {
    'n-1': { read: true },
    'notice-local-outlook': { read: true },
    unknown: { read: true },
  },
})

assert.equal(actionState.integrations.outlook.status, 'connected')
assert.equal(actionState.integrations.outlook.activeWorkflows, 2)
assert.equal(actionState.integrations.outlook.lastConnectedAt, actionTimestamp)
assert.equal(actionState.integrations.unknown, undefined)
assert.equal(actionState.activityEvents.length, 1)
assert.equal(actionState.activityEvents[0].source, 'outlook')
assert.equal(actionState.notifications.length, 1)
assert.equal(actionState.notifications[0].source, 'outlook')
assert.equal(actionState.notificationStates['n-1'].read, true)
assert.equal(actionState.notificationStates['notice-local-outlook'].read, true)
assert.equal(actionState.notificationStates.unknown, undefined)

assert.ok(Array.isArray(nexusData.nexusWorkflowTemplates), 'workflow templates are exported from shared Nexus data')
assert.ok(nexusData.nexusWorkflowTemplates.length >= 6, 'workflow picker has a believable template catalog')
assert.ok(
  nexusData.nexusWorkflowTemplates.some((template) =>
    template.id === 'reply-customer-inquiry' &&
    template.category === 'customer-communication' &&
    template.triggerIntegrationId === 'gmail' &&
    template.requiresApproval === true &&
    template.integrationIds.includes('gmail') &&
    template.integrationIds.includes('claude') &&
    template.integrationIds.includes('slack')),
  'reply template includes trigger, approval, and connected app details',
)

const templateDraftState = normalizeNexusDemoState({
  customWorkflows: [
    {
      id: 'local-workflow-reply-to-customer-inquiry',
      name: 'Reply to customer inquiry',
      description: 'Classify a new customer email, draft a helpful reply, and hold it for approval before sending.',
      category: 'support',
      status: 'ready',
      lastRun: 'not run yet',
      impact: 'Saves 45 min / inquiry',
      approvalRequirement: 'approval-required',
      steps: ['Watch Gmail for customer questions', 'Draft response with Claude', 'Post review request in Slack'],
      integrations: [{ id: 'gmail' }, { id: 'claude' }, { id: 'slack' }],
      avgDuration: '0.0s',
      runsThisMonth: 0,
      sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    },
  ],
  activityEvents: [
    {
      id: 'activity-local-reply-template',
      message: 'Workflow draft created from template: Reply to customer inquiry',
      source: 'gmail',
      status: 'ai',
      timestamp: actionTimestamp,
      workflowId: 'local-workflow-reply-to-customer-inquiry',
    },
  ],
  selectedWorkflowId: 'local-workflow-reply-to-customer-inquiry',
})

assert.equal(templateDraftState.customWorkflows[0].id, 'local-workflow-reply-to-customer-inquiry')
assert.equal(templateDraftState.customWorkflows[0].approvalRequirement, 'approval-required')
assert.equal(templateDraftState.selectedWorkflowId, 'local-workflow-reply-to-customer-inquiry')
assert.match(templateDraftState.activityEvents[0].message, /from template/)
assert.equal(templateDraftState.activityEvents[0].workflowId, 'local-workflow-reply-to-customer-inquiry')

assert.equal(formatWorkflowCount(1), '1 workflow')
assert.equal(formatWorkflowCount(11), '11 workflows')
assert.equal(formatRunningWorkflowSummary(1), '1 workflow running')
assert.equal(formatRunningWorkflowSummary(3), '3 workflows running')
assert.equal(workflowActivityHref({ workflowId: 'local-workflow-reply-to-customer-inquiry' }), '/workflows?w=local-workflow-reply-to-customer-inquiry')
assert.equal(workflowActivityHref({ workflowId: 'sync project status' }), '/workflows?w=sync+project+status')
assert.equal(workflowActivityHref({}), undefined)
assert.equal(isDraftWorkflow(templateDraftState.customWorkflows[0]), true)
assert.equal(isDraftWorkflow({ ...templateDraftState.customWorkflows[0], status: 'running', runsThisMonth: 1 }), false)
assert.equal(isDraftWorkflow({ ...templateDraftState.customWorkflows[0], id: 'triage-inbound' }), false)
assert.equal(sanitizeWorkflowDraftName('  Enterprise renewal desk   '), 'Enterprise renewal desk')
assert.equal(sanitizeWorkflowDraftName(''), 'Untitled workflow')
assert.deepEqual(
  applyWorkflowStepAction(['Watch Gmail', 'Draft reply', 'Ask Slack'], { type: 'move-up', index: 2 }),
  ['Watch Gmail', 'Ask Slack', 'Draft reply'],
)
assert.deepEqual(
  applyWorkflowStepAction(['Watch Gmail', 'Draft reply', 'Ask Slack'], { type: 'copy', index: 1 }),
  ['Watch Gmail', 'Draft reply', 'Draft reply copy', 'Ask Slack'],
)
assert.deepEqual(
  applyWorkflowStepAction(['Watch Gmail'], { type: 'move-down', index: 0 }),
  ['Watch Gmail'],
)
assert.deepEqual(
  createWorkflowReuseInput(templateDraftState.customWorkflows[0]),
  {
    name: 'Reply to customer inquiry copy',
    description: 'Classify a new customer email, draft a helpful reply, and hold it for approval before sending.',
    category: 'support',
    impact: 'Saves 45 min / inquiry',
    approvalRequirement: 'approval-required',
    steps: ['Watch Gmail for customer questions', 'Draft response with Claude', 'Post review request in Slack'],
    integrationIds: ['gmail', 'claude', 'slack'],
    templateName: 'Reply to customer inquiry',
    sourceIntegrationId: 'gmail',
  },
)

const store = installLocalStorage()
saveNexusDemoState(normalized)
assert.deepEqual(loadStoredNexusDemoState(), normalized)
assert.ok(store.has('armatir:nexus-demo-state:v1'))

installLocalStorage({ 'armatir:nexus-demo-state:v1': '{bad json' })
assert.deepEqual(loadStoredNexusDemoState(), defaultState)
