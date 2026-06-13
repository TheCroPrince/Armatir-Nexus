import { createContext, useContext } from 'react'
import type { InboxItem, NexusActivityEvent, NexusIntegration, NexusNotification, NexusWorkflow } from '@/types/nexus'

export interface CreateWorkflowInput {
  name: string
  description: string
  category: NexusWorkflow['category']
  impact: string
  steps: string[]
  integrationIds: string[]
  templateId?: string
  templateName?: string
  sourceIntegrationId?: string
}

export interface CreateIntegrationInput {
  name: string
  category: NexusIntegration['category']
  icon: NexusIntegration['icon']
  accent: string
}

export type PushActivityEventInput = Omit<NexusActivityEvent, 'id' | 'timestamp'> & {
  timestamp?: string
}

export type PushNotificationInput = Omit<NexusNotification, 'id' | 'timestamp' | 'read'> & {
  timestamp?: string
  read?: boolean
}

export interface NexusDemoStateContextValue {
  workflows: NexusWorkflow[]
  integrations: NexusIntegration[]
  integrationsById: Record<string, NexusIntegration>
  inboxItems: InboxItem[]
  activityEvents: NexusActivityEvent[]
  notifications: NexusNotification[]
  drafts: Record<string, string>
  dismissedRecommendationIds: string[]
  selectedWorkflowId: string
  selectedInboxId: string
  selectWorkflow: (id: string) => void
  selectInboxItem: (id: string) => void
  toggleWorkflow: (id: string) => NexusWorkflow | null
  createWorkflow: (input: CreateWorkflowInput) => NexusWorkflow
  createWorkflowFromTemplate: (templateId: string) => NexusWorkflow | null
  createIntegration: (input: CreateIntegrationInput) => NexusIntegration
  connectIntegration: (id: string) => NexusIntegration | null
  pushActivityEvent: (input: PushActivityEventInput) => NexusActivityEvent
  pushNotification: (input: PushNotificationInput) => NexusNotification
  markNotificationRead: (id: string) => void
  updateNotifications: (notifications: NexusNotification[]) => void
  approveInboxItem: (id: string) => void
  dismissInboxItem: (id: string) => void
  updateDraft: (id: string, draft: string) => void
  dismissRecommendation: (id: string) => void
  resetDemoState: () => void
}

export const NexusDemoStateContext = createContext<NexusDemoStateContextValue | null>(null)

export function useNexusDemoState() {
  const context = useContext(NexusDemoStateContext)
  if (!context) {
    throw new Error('useNexusDemoState must be used inside NexusDemoStateProvider')
  }
  return context
}
