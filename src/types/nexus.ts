import type { NexusIconName } from './nexus-icons'

export type WorkflowStatus = 'running' | 'ready' | 'synced' | 'review' | 'paused'

export interface WorkflowIntegrationRef {
  id: string
  accent?: string
}

export interface NexusWorkflow {
  id: string
  name: string
  description: string
  category: 'ops' | 'sales' | 'support' | 'comms' | 'finance'
  status: WorkflowStatus
  lastRun: string
  /** Headline metric (e.g. "Saves 2.4 hrs / week") */
  impact: string
  steps: string[]
  integrations: WorkflowIntegrationRef[]
  avgDuration: string
  runsThisMonth: number
  /** Last 14 daily run counts — mini sparkline data. */
  sparkline: number[]
}

export type IntegrationCategory =
  | 'productivity'
  | 'communication'
  | 'crm'
  | 'finance'
  | 'engineering'
  | 'ai'

export interface NexusIntegration {
  id: string
  name: string
  category: IntegrationCategory
  status: 'connected' | 'syncing' | 'attention'
  /** Pastel accent colour token used for the dot + halo. */
  accent: string
  icon: NexusIconName
  glow?: string
  /** Number of active workflows touching this integration. */
  activeWorkflows: number
}

export type ActivityStatus = 'success' | 'info' | 'warning' | 'ai'

export interface NexusActivityEvent {
  id: string
  message: string
  source: string
  status: ActivityStatus
  /** ISO timestamp; relative time is rendered in the UI. */
  timestamp: string
  /** Optional connected workflow id. */
  workflowId?: string
}

export interface NexusAIRecommendation {
  id: string
  summary: string
  /** 0.0 — 1.0 model confidence shown as % */
  confidence: number
  action?: string
  category: 'triage' | 'follow-up' | 'risk' | 'opportunity'
  /** Optional client/account name for context line. */
  account?: string
}

export interface NexusMetric {
  id: string
  label: string
  value: string
  delta: string
  trend: 'up' | 'down' | 'steady'
  caption: string
  sparkline: number[]
}

export type NotificationKind =
  | 'reply'        // someone replied to a thread Nexus is watching
  | 'workflow'     // workflow event (completed / paused / errored)
  | 'ai'           // AI suggestion or draft is ready
  | 'system'       // integration / health / billing
  | 'mention'      // direct mention in a channel

export interface NexusNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  /** Integration id that triggered the notification, if any. */
  source?: string
  timestamp: string
  read: boolean
  /** Optional deep link to the relevant workspace page. */
  href?: string
  /** Short action label rendered on the card (e.g. "Approve", "Open"). */
  action?: string
}

export interface InboxItem {
  id: string
  subject: string
  from: string
  preview: string
  /** What Nexus has done with it automatically. */
  aiAction: string
  status: 'queued' | 'drafted' | 'awaiting-approval' | 'sent'
  timestamp: string
  priority: 'high' | 'normal' | 'low'
  account: string
}
