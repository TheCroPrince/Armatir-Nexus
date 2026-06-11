import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { nexusDraftCopies, nexusInbox, nexusWorkflows } from '@/data/nexus'
import { NexusDemoStateContext, type NexusDemoStateContextValue } from './nexus-demo-state-context'
import {
  createDefaultNexusDemoState,
  loadStoredNexusDemoState,
  saveNexusDemoState,
  type NexusDemoState,
} from './nexus-demo-state-storage'
import type { InboxItem, NexusWorkflow } from '@/types/nexus'

function resolveWorkflowId(id: string | null, workflows: NexusWorkflow[]) {
  return workflows.some((workflow) => workflow.id === id)
    ? id!
    : workflows[0]!.id
}

function resolveInboxId(id: string | null, items: InboxItem[]) {
  return items.some((item) => item.id === id)
    ? id!
    : items[0]!.id
}

function mergeWorkflowState(state: NexusDemoState) {
  return nexusWorkflows.map((workflow) => ({
    ...workflow,
    ...state.workflows[workflow.id],
  }))
}

function mergeInboxState(state: NexusDemoState) {
  return nexusInbox.map((item) => ({
    ...item,
    ...state.inboxItems[item.id],
  }))
}

export function NexusDemoStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadStoredNexusDemoState)

  useEffect(() => {
    saveNexusDemoState(state)
  }, [state])

  const workflows = useMemo(() => mergeWorkflowState(state), [state])
  const inboxItems = useMemo(() => mergeInboxState(state), [state])
  const drafts = useMemo(() => ({ ...nexusDraftCopies, ...state.drafts }), [state.drafts])
  const selectedWorkflowId = resolveWorkflowId(state.selectedWorkflowId, workflows)
  const selectedInboxId = resolveInboxId(state.selectedInboxId, inboxItems)

  const selectWorkflow = useCallback((id: string) => {
    setState((current) => ({ ...current, selectedWorkflowId: resolveWorkflowId(id, mergeWorkflowState(current)) }))
  }, [])

  const selectInboxItem = useCallback((id: string) => {
    setState((current) => ({ ...current, selectedInboxId: resolveInboxId(id, mergeInboxState(current)) }))
  }, [])

  const toggleWorkflow = useCallback((id: string) => {
    let nextWorkflow: NexusWorkflow | null = null

    setState((current) => {
      const currentWorkflow = mergeWorkflowState(current).find((workflow) => workflow.id === id)
      if (!currentWorkflow) return current

      const isRunning = currentWorkflow.status === 'running'
      nextWorkflow = {
        ...currentWorkflow,
        status: isRunning ? 'paused' : 'running',
        lastRun: isRunning ? currentWorkflow.lastRun : 'just now',
        runsThisMonth: isRunning ? currentWorkflow.runsThisMonth : currentWorkflow.runsThisMonth + 1,
      }

      return {
        ...current,
        workflows: {
          ...current.workflows,
          [id]: {
            status: nextWorkflow.status,
            lastRun: nextWorkflow.lastRun,
            runsThisMonth: nextWorkflow.runsThisMonth,
          },
        },
        selectedWorkflowId: id,
      }
    })

    return nextWorkflow
  }, [])

  const approveInboxItem = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      inboxItems: {
        ...current.inboxItems,
        [id]: { status: 'sent' },
      },
      selectedInboxId: id,
    }))
  }, [])

  const dismissInboxItem = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      inboxItems: {
        ...current.inboxItems,
        [id]: { status: 'queued' },
      },
      selectedInboxId: id,
    }))
  }, [])

  const updateDraft = useCallback((id: string, draft: string) => {
    setState((current) => ({
      ...current,
      drafts: {
        ...current.drafts,
        [id]: draft,
      },
      selectedInboxId: id,
    }))
  }, [])

  const dismissRecommendation = useCallback((id: string) => {
    setState((current) => current.dismissedRecommendationIds.includes(id)
      ? current
      : {
          ...current,
          dismissedRecommendationIds: [...current.dismissedRecommendationIds, id],
        })
  }, [])

  const resetDemoState = useCallback(() => {
    setState(createDefaultNexusDemoState())
  }, [])

  const value = useMemo<NexusDemoStateContextValue>(() => ({
    workflows,
    inboxItems,
    drafts,
    dismissedRecommendationIds: state.dismissedRecommendationIds,
    selectedWorkflowId,
    selectedInboxId,
    selectWorkflow,
    selectInboxItem,
    toggleWorkflow,
    approveInboxItem,
    dismissInboxItem,
    updateDraft,
    dismissRecommendation,
    resetDemoState,
  }), [
    workflows,
    inboxItems,
    drafts,
    state.dismissedRecommendationIds,
    selectedWorkflowId,
    selectedInboxId,
    selectWorkflow,
    selectInboxItem,
    toggleWorkflow,
    approveInboxItem,
    dismissInboxItem,
    updateDraft,
    dismissRecommendation,
    resetDemoState,
  ])

  return (
    <NexusDemoStateContext.Provider value={value}>
      {children}
    </NexusDemoStateContext.Provider>
  )
}
