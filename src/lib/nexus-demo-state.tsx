import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { nexusActivitySeed, nexusDraftCopies, nexusInbox, nexusIntegrations, nexusNotifications, nexusWorkflowTemplates, nexusWorkflows } from '@/data/nexus'
import {
  NexusDemoStateContext,
  type CreateIntegrationInput,
  type CreateWorkflowInput,
  type NexusDemoStateContextValue,
  type PushActivityEventInput,
  type PushNotificationInput,
} from './nexus-demo-state-context'
import {
  createDefaultNexusDemoState,
  loadStoredNexusDemoState,
  saveNexusDemoState,
  type NexusDemoState,
} from './nexus-demo-state-storage'
import type { InboxItem, NexusActivityEvent, NexusIntegration, NexusNotification, NexusWorkflow } from '@/types/nexus'

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
  return [...nexusWorkflows, ...state.customWorkflows].map((workflow) => ({
    ...workflow,
    ...state.workflows[workflow.id],
  }))
}

function mergeIntegrationState(state: NexusDemoState) {
  return [...nexusIntegrations, ...state.customIntegrations].map((integration) => ({
    ...integration,
    ...state.integrations[integration.id],
  }))
}

function mergeInboxState(state: NexusDemoState) {
  return nexusInbox.map((item) => ({
    ...item,
    ...state.inboxItems[item.id],
  }))
}

function mergeActivityState(state: NexusDemoState) {
  return [...state.activityEvents, ...nexusActivitySeed]
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
}

function mergeNotificationState(state: NexusDemoState) {
  return [...state.notifications, ...nexusNotifications]
    .map((notification) => ({
      ...notification,
      ...state.notificationStates[notification.id],
    }))
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 36)
}

function createLocalId(prefix: string, label: string, existingIds: Set<string>) {
  const base = slugify(label) || 'draft'
  let candidate = `${prefix}-${base}`
  let index = 2

  while (existingIds.has(candidate)) {
    candidate = `${prefix}-${base}-${index}`
    index += 1
  }

  return candidate
}

function createActivityEvent(
  input: PushActivityEventInput,
  existingIds: Set<string>,
  seed = `${input.source}-${input.message}`,
): NexusActivityEvent {
  const timestamp = input.timestamp ?? new Date().toISOString()
  return {
    ...input,
    id: createLocalId('activity-local', `${seed}-${Date.parse(timestamp) || Date.now()}`, existingIds),
    timestamp,
  }
}

function createNotification(
  input: PushNotificationInput,
  existingIds: Set<string>,
  seed = `${input.kind}-${input.title}`,
): NexusNotification {
  const timestamp = input.timestamp ?? new Date().toISOString()
  return {
    ...input,
    id: createLocalId('notice-local', `${seed}-${Date.parse(timestamp) || Date.now()}`, existingIds),
    timestamp,
    read: input.read ?? false,
  }
}

function upsertActivity(events: NexusActivityEvent[], event: NexusActivityEvent) {
  return [event, ...events.filter((item) => item.id !== event.id)].slice(0, 24)
}

function upsertNotification(notifications: NexusNotification[], notification: NexusNotification) {
  return [notification, ...notifications.filter((item) => item.id !== notification.id)].slice(0, 20)
}

export function NexusDemoStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadStoredNexusDemoState)

  useEffect(() => {
    saveNexusDemoState(state)
  }, [state])

  const workflows = useMemo(() => mergeWorkflowState(state), [state])
  const integrations = useMemo(() => mergeIntegrationState(state), [state])
  const integrationsById = useMemo<Record<string, NexusIntegration>>(
    () => Object.fromEntries(integrations.map((integration) => [integration.id, integration])),
    [integrations],
  )
  const inboxItems = useMemo(() => mergeInboxState(state), [state])
  const activityEvents = useMemo(() => mergeActivityState(state), [state])
  const notifications = useMemo(() => mergeNotificationState(state), [state])
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
      const timestamp = new Date().toISOString()
      nextWorkflow = {
        ...currentWorkflow,
        status: isRunning ? 'paused' : 'running',
        lastRun: isRunning ? currentWorkflow.lastRun : 'just now',
        runsThisMonth: isRunning ? currentWorkflow.runsThisMonth : currentWorkflow.runsThisMonth + 1,
      }
      const event = createActivityEvent(
        {
          message: `${nextWorkflow.name} ${isRunning ? 'paused' : 'started'} from workflow controls`,
          source: nextWorkflow.integrations[0]?.id ?? 'openai',
          status: isRunning ? 'warning' : 'success',
          timestamp,
          workflowId: nextWorkflow.id,
        },
        new Set(current.activityEvents.map((activity) => activity.id)),
        `${nextWorkflow.id}-${nextWorkflow.status}`,
      )

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
        activityEvents: upsertActivity(current.activityEvents, event),
        selectedWorkflowId: id,
      }
    })

    return nextWorkflow
  }, [])

  const createWorkflow = useCallback((input: CreateWorkflowInput) => {
    const existingIds = new Set(workflows.map((workflow) => workflow.id))
    const knownIntegrationIds = new Set(integrations.map((integration) => integration.id))
    const integrationIds = input.integrationIds.filter((id) => knownIntegrationIds.has(id)).slice(0, 4)
    const sourceIntegrationId = input.sourceIntegrationId && integrationIds.includes(input.sourceIntegrationId)
      ? input.sourceIntegrationId
      : integrationIds[0] ?? 'openai'
    const nextWorkflow: NexusWorkflow = {
      id: createLocalId('local-workflow', input.name, existingIds),
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category,
      status: 'ready',
      lastRun: 'not run yet',
      impact: input.impact.trim(),
      steps: input.steps.map((step) => step.trim()).filter(Boolean).slice(0, 5),
      integrations: integrationIds.map((integrationId) => ({ id: integrationId })),
      avgDuration: '0.0s',
      runsThisMonth: 0,
      sparkline: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    }

    setState((current) => {
      const event = createActivityEvent(
        {
          message: input.templateName
            ? `Workflow draft created from template: ${input.templateName}`
            : `Workflow draft created: ${nextWorkflow.name}`,
          source: sourceIntegrationId,
          status: 'ai',
          workflowId: nextWorkflow.id,
        },
        new Set(current.activityEvents.map((activity) => activity.id)),
        input.templateId ? `${nextWorkflow.id}-${input.templateId}` : nextWorkflow.id,
      )

      return {
        ...current,
        customWorkflows: [nextWorkflow, ...current.customWorkflows],
        customIntegrations: current.customIntegrations.map((integration) => integrationIds.includes(integration.id)
          ? { ...integration, activeWorkflows: integration.activeWorkflows + 1 }
          : integration),
        activityEvents: upsertActivity(current.activityEvents, event),
        selectedWorkflowId: nextWorkflow.id,
      }
    })

    return nextWorkflow
  }, [integrations, workflows])

  const createWorkflowFromTemplate = useCallback((templateId: string) => {
    const template = nexusWorkflowTemplates.find((item) => item.id === templateId)
    if (!template) return null

    return createWorkflow({
      name: template.name,
      description: template.description,
      category: template.workflowCategory,
      impact: template.impact,
      steps: template.steps,
      integrationIds: template.integrationIds,
      templateId: template.id,
      templateName: template.name,
      sourceIntegrationId: template.triggerIntegrationId,
    })
  }, [createWorkflow])

  const createIntegration = useCallback((input: CreateIntegrationInput) => {
    const existingIds = new Set(integrations.map((integration) => integration.id))
    const nextIntegration: NexusIntegration = {
      id: createLocalId('local-integration', input.name, existingIds),
      name: input.name.trim(),
      category: input.category,
      status: 'connected',
      accent: input.accent,
      icon: input.icon,
      activeWorkflows: 0,
      catalogCategory: 'Custom',
      automationValue: 'Local connector for a browser-only workflow demo.',
      scopes: ['Read selected events', 'Trigger local workflows'],
      lastConnectedAt: new Date().toISOString(),
    }

    setState((current) => {
      const event = createActivityEvent(
        {
          message: `${nextIntegration.name} custom connector added locally`,
          source: nextIntegration.id,
          status: 'success',
        },
        new Set(current.activityEvents.map((activity) => activity.id)),
        nextIntegration.id,
      )

      return {
        ...current,
        customIntegrations: [nextIntegration, ...current.customIntegrations],
        activityEvents: upsertActivity(current.activityEvents, event),
      }
    })

    return nextIntegration
  }, [integrations])

  const connectIntegration = useCallback((id: string) => {
    const integration = integrations.find((item) => item.id === id)
    if (!integration) return null

    const timestamp = new Date().toISOString()
    const wasConnected = integration.status === 'connected'
    const nextIntegration: NexusIntegration = {
      ...integration,
      status: 'connected',
      activeWorkflows: integration.activeWorkflows,
      lastConnectedAt: timestamp,
    }

    setState((current) => {
      const currentIntegration = mergeIntegrationState(current).find((item) => item.id === id)
      if (!currentIntegration) return current

      const nextState = {
        ...current.integrations[id],
        status: 'connected' as const,
        activeWorkflows: currentIntegration.activeWorkflows,
        lastConnectedAt: timestamp,
      }
      const event = createActivityEvent(
        {
          message: `${currentIntegration.name} ${wasConnected ? 'connection checked' : 'connected'} locally`,
          source: currentIntegration.id,
          status: 'success',
          timestamp,
        },
        new Set(current.activityEvents.map((activity) => activity.id)),
        currentIntegration.id,
      )
      const notification = createNotification(
        {
          kind: 'system',
          title: `${currentIntegration.name} connection ready`,
          body: `Nexus can now use ${currentIntegration.name} in local automations and approval flows.`,
          source: currentIntegration.id,
          href: '/integrations',
          action: 'Manage',
          timestamp,
        },
        new Set(current.notifications.map((item) => item.id)),
        currentIntegration.id,
      )

      return {
        ...current,
        integrations: {
          ...current.integrations,
          [id]: nextState,
        },
        activityEvents: upsertActivity(current.activityEvents, event),
        notifications: upsertNotification(current.notifications, notification),
        notificationStates: {
          ...current.notificationStates,
          [notification.id]: { read: false },
        },
      }
    })

    return nextIntegration
  }, [integrations])

  const pushActivityEvent = useCallback((input: PushActivityEventInput) => {
    const event = createActivityEvent(input, new Set(activityEvents.map((item) => item.id)))
    setState((current) => ({
      ...current,
      activityEvents: upsertActivity(current.activityEvents, event),
    }))
    return event
  }, [activityEvents])

  const pushNotification = useCallback((input: PushNotificationInput) => {
    const notification = createNotification(input, new Set(notifications.map((item) => item.id)))
    setState((current) => ({
      ...current,
      notifications: upsertNotification(current.notifications, notification),
      notificationStates: {
        ...current.notificationStates,
        [notification.id]: { read: notification.read },
      },
    }))
    return notification
  }, [notifications])

  const markNotificationRead = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      notificationStates: {
        ...current.notificationStates,
        [id]: { read: true },
      },
    }))
  }, [])

  const updateNotifications = useCallback((nextNotifications: NexusNotification[]) => {
    setState((current) => ({
      ...current,
      notificationStates: {
        ...current.notificationStates,
        ...Object.fromEntries(nextNotifications.map((notification) => [notification.id, { read: notification.read }])),
      },
    }))
  }, [])

  const approveInboxItem = useCallback((id: string) => {
    setState((current) => {
      const item = mergeInboxState(current).find((inboxItem) => inboxItem.id === id)
      if (!item) return current

      const event = createActivityEvent(
        {
          message: `Approved and sent draft for ${item.account}`,
          source: 'gmail',
          status: 'success',
        },
        new Set(current.activityEvents.map((activity) => activity.id)),
        id,
      )

      return {
        ...current,
        inboxItems: {
          ...current.inboxItems,
          [id]: { status: 'sent' },
        },
        activityEvents: upsertActivity(current.activityEvents, event),
        selectedInboxId: id,
      }
    })
  }, [])

  const dismissInboxItem = useCallback((id: string) => {
    setState((current) => {
      const item = mergeInboxState(current).find((inboxItem) => inboxItem.id === id)
      if (!item) return current

      const event = createActivityEvent(
        {
          message: `${item.account} draft returned to queue for revision`,
          source: 'gmail',
          status: 'warning',
        },
        new Set(current.activityEvents.map((activity) => activity.id)),
        id,
      )

      return {
        ...current,
        inboxItems: {
          ...current.inboxItems,
          [id]: { status: 'queued' },
        },
        activityEvents: upsertActivity(current.activityEvents, event),
        selectedInboxId: id,
      }
    })
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
    integrations,
    integrationsById,
    inboxItems,
    activityEvents,
    notifications,
    drafts,
    dismissedRecommendationIds: state.dismissedRecommendationIds,
    selectedWorkflowId,
    selectedInboxId,
    selectWorkflow,
    selectInboxItem,
    toggleWorkflow,
    createWorkflow,
    createWorkflowFromTemplate,
    createIntegration,
    connectIntegration,
    pushActivityEvent,
    pushNotification,
    markNotificationRead,
    updateNotifications,
    approveInboxItem,
    dismissInboxItem,
    updateDraft,
    dismissRecommendation,
    resetDemoState,
  }), [
    workflows,
    integrations,
    integrationsById,
    inboxItems,
    activityEvents,
    notifications,
    drafts,
    state.dismissedRecommendationIds,
    selectedWorkflowId,
    selectedInboxId,
    selectWorkflow,
    selectInboxItem,
    toggleWorkflow,
    createWorkflow,
    createWorkflowFromTemplate,
    createIntegration,
    connectIntegration,
    pushActivityEvent,
    pushNotification,
    markNotificationRead,
    updateNotifications,
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
