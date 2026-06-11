import { createContext, useContext } from 'react'
import type { InboxItem, NexusWorkflow } from '@/types/nexus'

export interface NexusDemoStateContextValue {
  workflows: NexusWorkflow[]
  inboxItems: InboxItem[]
  drafts: Record<string, string>
  dismissedRecommendationIds: string[]
  selectedWorkflowId: string
  selectedInboxId: string
  selectWorkflow: (id: string) => void
  selectInboxItem: (id: string) => void
  toggleWorkflow: (id: string) => NexusWorkflow | null
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
