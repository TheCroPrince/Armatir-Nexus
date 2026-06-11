import assert from 'node:assert/strict'
import {
  createDefaultNexusDemoState,
  loadStoredNexusDemoState,
  normalizeNexusDemoState,
  saveNexusDemoState,
} from '../src/lib/nexus-demo-state-storage.ts'

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

const store = installLocalStorage()
saveNexusDemoState(normalized)
assert.deepEqual(loadStoredNexusDemoState(), normalized)
assert.ok(store.has('armatir:nexus-demo-state:v1'))

installLocalStorage({ 'armatir:nexus-demo-state:v1': '{bad json' })
assert.deepEqual(loadStoredNexusDemoState(), defaultState)
