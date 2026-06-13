export function formatWorkflowCount(count: number) {
  return `${count} ${count === 1 ? 'workflow' : 'workflows'}`
}

export function formatRunningWorkflowSummary(count: number) {
  return `${formatWorkflowCount(count)} running`
}

export function workflowActivityHref(event: { workflowId?: string }) {
  return event.workflowId ? `/workflows?${new URLSearchParams({ w: event.workflowId }).toString()}` : undefined
}
