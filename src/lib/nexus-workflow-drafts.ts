import type { NexusWorkflow, WorkflowApprovalRequirement } from '@/types/nexus'
import type { CreateWorkflowInput } from './nexus-demo-state-context'

export type WorkflowStepAction =
  | { type: 'move-up'; index: number }
  | { type: 'move-down'; index: number }
  | { type: 'copy'; index: number }

export function sanitizeWorkflowDraftName(name: string) {
  const trimmed = name.trim().replace(/\s+/g, ' ')
  return trimmed || 'Untitled workflow'
}

export function applyWorkflowStepAction(steps: string[], action: WorkflowStepAction) {
  const next = [...steps]
  const index = action.index

  if (index < 0 || index >= next.length) return next

  if (action.type === 'move-up') {
    if (index === 0) return next
    ;[next[index - 1], next[index]] = [next[index]!, next[index - 1]!]
    return next
  }

  if (action.type === 'move-down') {
    if (index >= next.length - 1) return next
    ;[next[index], next[index + 1]] = [next[index + 1]!, next[index]!]
    return next
  }

  const copied = `${next[index]} copy`
  next.splice(index + 1, 0, copied)
  return next.slice(0, 8)
}

export function createWorkflowReuseInput(workflow: NexusWorkflow): CreateWorkflowInput {
  return {
    name: `${sanitizeWorkflowDraftName(workflow.name)} copy`,
    description: workflow.description,
    category: workflow.category,
    impact: workflow.impact,
    approvalRequirement: workflow.approvalRequirement ?? 'optional-review',
    steps: workflow.steps,
    integrationIds: workflow.integrations.map((integration) => integration.id),
    templateName: workflow.name,
    sourceIntegrationId: workflow.integrations[0]?.id,
  }
}

export function isWorkflowApprovalRequirement(value: unknown): value is WorkflowApprovalRequirement {
  return value === 'approval-required' || value === 'optional-review' || value === 'auto-run'
}
