// Mock data for the Armatir Nexus product demo.
// Realistic, business-oriented copy — never lorem ipsum.

import type {
  InboxItem,
  NexusActivityEvent,
  NexusAIRecommendation,
  NexusIntegration,
  NexusMetric,
  NexusNotification,
  NexusWorkflow,
} from '@/types/nexus'

// ─── Integrations ────────────────────────────────────────────────────────────

export const nexusIntegrations: NexusIntegration[] = [
  { id: 'gmail',     name: 'Gmail',           category: 'communication', status: 'connected', accent: 'oklch(70% 0.16 25)',  icon: 'Mail',         activeWorkflows: 4 },
  { id: 'gcal',      name: 'Google Calendar', category: 'productivity',  status: 'connected', accent: 'oklch(64% 0.18 245)', icon: 'Calendar',     activeWorkflows: 3 },
  { id: 'slack',     name: 'Slack',           category: 'communication', status: 'connected', accent: 'oklch(72% 0.18 320)', icon: 'Slack',        activeWorkflows: 5 },
  { id: 'hubspot',   name: 'HubSpot',         category: 'crm',           status: 'syncing',   accent: 'oklch(72% 0.18 40)',  icon: 'Users',        activeWorkflows: 2 },
  { id: 'notion',    name: 'Notion',          category: 'productivity',  status: 'connected', accent: 'oklch(50% 0.04 280)', icon: 'FileText',     activeWorkflows: 2 },
  { id: 'stripe',    name: 'Stripe',          category: 'finance',       status: 'connected', accent: 'oklch(62% 0.22 280)', icon: 'CreditCard',   activeWorkflows: 1 },
  { id: 'linear',    name: 'Linear',          category: 'engineering',   status: 'connected', accent: 'oklch(60% 0.18 270)', icon: 'GitBranch',    activeWorkflows: 2 },
  { id: 'github',    name: 'GitHub',          category: 'engineering',   status: 'connected', accent: 'oklch(40% 0.02 280)', icon: 'Github',       activeWorkflows: 1 },
  { id: 'openai',    name: 'OpenAI',          category: 'ai',            status: 'connected', accent: 'oklch(64% 0.16 160)', icon: 'Sparkles',     activeWorkflows: 3 },
  { id: 'claude',    name: 'Claude',          category: 'ai',            status: 'connected', accent: 'oklch(70% 0.16 50)',  icon: 'Brain',        activeWorkflows: 4 },
]

export const integrationsById: Record<string, NexusIntegration> = Object.fromEntries(
  nexusIntegrations.map((i) => [i.id, i]),
)

// ─── Workflows ───────────────────────────────────────────────────────────────

export const nexusWorkflows: NexusWorkflow[] = [
  {
    id: 'triage-inbound',
    name: 'Summarize inbound client inquiry',
    description:
      'New thread in the shared inbox: classify intent, extract entities, and post a triaged summary to the team channel.',
    category: 'support',
    status: 'running',
    lastRun: '38s ago',
    impact: 'Saves 4.1 hrs / week',
    steps: [
      'Listen for new threads in Gmail shared inbox',
      'Classify intent + urgency with Claude',
      'Extract contact, account, and request type',
      'Post structured summary to #client-triage',
    ],
    integrations: [{ id: 'gmail' }, { id: 'claude' }, { id: 'slack' }],
    avgDuration: '6.2s',
    runsThisMonth: 412,
    sparkline: [12, 18, 14, 22, 16, 24, 19, 28, 21, 30, 26, 24, 31, 27],
  },
  {
    id: 'lead-routing',
    name: 'Route new lead to CRM',
    description:
      'Score inbound leads, enrich with firmographics, and create or update the HubSpot contact with an owner assignment.',
    category: 'sales',
    status: 'running',
    lastRun: '2m ago',
    impact: '64% faster first response',
    steps: [
      'Receive new lead from contact form webhook',
      'Score with intent + ICP fit model',
      'Enrich with company firmographics',
      'Create or update HubSpot contact + assign owner',
    ],
    integrations: [{ id: 'hubspot' }, { id: 'openai' }, { id: 'slack' }],
    avgDuration: '11.4s',
    runsThisMonth: 87,
    sparkline: [3, 4, 6, 5, 7, 4, 8, 6, 9, 5, 8, 7, 6, 8],
  },
  {
    id: 'meeting-recap',
    name: 'Generate meeting recap + action items',
    description:
      'After every call, transform the transcript into a structured recap with decisions, owners, and next-step deadlines.',
    category: 'comms',
    status: 'ready',
    lastRun: '12m ago',
    impact: '31 recaps drafted this week',
    steps: [
      'Capture transcript from connected meeting',
      'Extract decisions, owners, next steps',
      'Draft client-ready recap email in Gmail',
      'File source-of-truth recap in Notion',
    ],
    integrations: [{ id: 'gcal' }, { id: 'openai' }, { id: 'gmail' }, { id: 'notion' }],
    avgDuration: '18.7s',
    runsThisMonth: 64,
    sparkline: [2, 3, 5, 4, 6, 3, 5, 4, 7, 4, 5, 6, 5, 4],
  },
  {
    id: 'overdue-escalation',
    name: 'Escalate overdue client request',
    description:
      'Detect support threads with no response in 24 hours, draft a follow-up, and ping the assigned account owner.',
    category: 'support',
    status: 'review',
    lastRun: '4m ago',
    impact: '0 inquiries past SLA',
    steps: [
      'Scan open threads with no reply > 24h',
      'Pull conversation history + last touchpoint',
      'Draft prioritized follow-up for review',
      'Notify owner in Slack with approve action',
    ],
    integrations: [{ id: 'gmail' }, { id: 'claude' }, { id: 'slack' }],
    avgDuration: '4.8s',
    runsThisMonth: 19,
    sparkline: [1, 0, 2, 1, 0, 2, 1, 0, 1, 2, 0, 1, 2, 1],
  },
  {
    id: 'invoice-followup',
    name: 'Draft invoice follow-up email',
    description:
      'Stripe invoice ages past due: draft a polite, account-specific follow-up tied to the client tone history.',
    category: 'finance',
    status: 'synced',
    lastRun: '17m ago',
    impact: '$28.4k recovered this quarter',
    steps: [
      'Trigger on Stripe invoice > 7 days overdue',
      'Pull account history + previous tone',
      'Draft personalized follow-up email',
      'Queue in Gmail for approval',
    ],
    integrations: [{ id: 'stripe' }, { id: 'claude' }, { id: 'gmail' }],
    avgDuration: '8.1s',
    runsThisMonth: 23,
    sparkline: [1, 2, 1, 2, 3, 1, 2, 2, 1, 2, 3, 2, 1, 2],
  },
  {
    id: 'sync-project-status',
    name: 'Sync project status to Slack',
    description:
      'Mirror every meaningful Linear status change into a focused project channel — without the comment noise.',
    category: 'ops',
    status: 'running',
    lastRun: '48s ago',
    impact: '12 manual updates eliminated / day',
    steps: [
      'Listen for Linear status transitions',
      'Filter to meaningful moves (skip chatter)',
      'Compose human-readable Slack update',
      'Post to per-project channel',
    ],
    integrations: [{ id: 'linear' }, { id: 'slack' }],
    avgDuration: '1.9s',
    runsThisMonth: 318,
    sparkline: [18, 22, 16, 24, 28, 20, 26, 22, 30, 24, 26, 28, 22, 30],
  },
  {
    id: 'schedule-recurring',
    name: 'Schedule recurring 1:1',
    description:
      'Find a compatible weekly slot for two calendars, propose three options, and lock the slot once accepted.',
    category: 'ops',
    status: 'ready',
    lastRun: '1h ago',
    impact: '14 meetings booked w/o back-and-forth',
    steps: [
      'Receive scheduling request from chat',
      'Compare calendars + working hours',
      'Propose three viable time slots',
      'Hold the slot once accepted',
    ],
    integrations: [{ id: 'gcal' }, { id: 'slack' }],
    avgDuration: '3.4s',
    runsThisMonth: 41,
    sparkline: [4, 3, 5, 4, 6, 3, 4, 5, 6, 5, 4, 6, 5, 4],
  },
  {
    id: 'deploy-digest',
    name: 'Daily deploy + incident digest',
    description:
      'Roll up GitHub merges, Linear closes, and deploy notes into a single 5pm digest the team actually reads.',
    category: 'ops',
    status: 'synced',
    lastRun: '6h ago',
    impact: 'Replaces the morning standup',
    steps: [
      'Pull merged PRs since 9am',
      'Collect closed Linear issues',
      'Summarize with focus + outliers',
      'Post to #engineering at 5:00pm',
    ],
    integrations: [{ id: 'github' }, { id: 'linear' }, { id: 'claude' }, { id: 'slack' }],
    avgDuration: '12.3s',
    runsThisMonth: 22,
    sparkline: [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1],
  },
]

export const workflowsById: Record<string, NexusWorkflow> = Object.fromEntries(
  nexusWorkflows.map((w) => [w.id, w]),
)

// ─── AI Command Center ───────────────────────────────────────────────────────

export const nexusRecommendations: NexusAIRecommendation[] = [
  {
    id: 'rec-lead-intent',
    summary:
      'Acme Refrigeration shows high conversion intent — 3 pricing-page visits and a contact form submission in the last 24h.',
    confidence: 0.92,
    action: 'Draft outreach',
    category: 'opportunity',
    account: 'Acme Refrigeration',
  },
  {
    id: 'rec-followup',
    summary:
      'Follow-up to Northwind Logistics is drafted and ready — tone matched against your last four replies.',
    confidence: 0.88,
    action: 'Review draft',
    category: 'follow-up',
    account: 'Northwind Logistics',
  },
  {
    id: 'rec-calendar',
    summary:
      'Calendar conflict before Friday 2:00 with Patel & Stone — propose 3:30 instead, both calendars open.',
    confidence: 0.97,
    action: 'Reschedule',
    category: 'triage',
    account: 'Patel & Stone',
  },
  {
    id: 'rec-risk',
    summary:
      'Two Mercer Group threads have aged past 48h. Both flagged as account-impacting tone — recommend escalation.',
    confidence: 0.81,
    action: 'Escalate',
    category: 'risk',
    account: 'Mercer Group',
  },
]

// ─── Metrics ─────────────────────────────────────────────────────────────────

export const nexusMetrics: NexusMetric[] = [
  {
    id: 'time-reclaimed',
    label: 'Hours reclaimed',
    value: '47.2',
    delta: '+12.4 vs last mo',
    trend: 'up',
    caption: 'Manual ops time replaced by automated workflows this month.',
    sparkline: [22, 26, 24, 30, 28, 34, 32, 38, 36, 42, 40, 44, 46, 47],
  },
  {
    id: 'triage-automated',
    label: 'Inbound triage automated',
    value: '83%',
    delta: '+9 pts',
    trend: 'up',
    caption: 'Inbound requests classified, routed, and summarized without a human touch.',
    sparkline: [62, 64, 66, 68, 70, 72, 74, 75, 76, 78, 80, 81, 82, 83],
  },
  {
    id: 'response-time',
    label: 'Lead response time',
    value: '−64%',
    delta: 'now 4m 12s',
    trend: 'up',
    caption: 'Time from form submission to first qualified reply.',
    sparkline: [16, 14, 13, 12, 11, 10, 9, 8, 8, 7, 6, 5, 5, 4],
  },
  {
    id: 'sync-reliability',
    label: 'Sync reliability',
    value: '98.7%',
    delta: '+0.4 pts',
    trend: 'steady',
    caption: 'Cross-tool sync events delivered successfully over the last 30 days.',
    sparkline: [97, 97, 98, 98, 99, 98, 99, 99, 98, 99, 99, 98, 99, 99],
  },
]

// ─── Activity timeline ───────────────────────────────────────────────────────

export const nexusActivitySeed: NexusActivityEvent[] = [
  { id: 'evt-1', message: 'Client inquiry from Acme Refrigeration summarized',  source: 'gmail',  status: 'success', timestamp: new Date(Date.now() -  38_000).toISOString(), workflowId: 'triage-inbound' },
  { id: 'evt-2', message: 'New lead routed to HubSpot — owner: Matthew',         source: 'hubspot',status: 'success', timestamp: new Date(Date.now() - 132_000).toISOString(), workflowId: 'lead-routing' },
  { id: 'evt-3', message: 'Linear status change posted to #project-northwind',  source: 'linear', status: 'info',    timestamp: new Date(Date.now() - 245_000).toISOString(), workflowId: 'sync-project-status' },
  { id: 'evt-4', message: 'Follow-up draft generated — awaiting review',         source: 'claude', status: 'ai',      timestamp: new Date(Date.now() - 410_000).toISOString(), workflowId: 'overdue-escalation' },
  { id: 'evt-5', message: 'Calendar hold created for Friday 3:30pm',             source: 'gcal',   status: 'success', timestamp: new Date(Date.now() - 612_000).toISOString(), workflowId: 'schedule-recurring' },
  { id: 'evt-6', message: 'Workflow recovered after Stripe API delay',           source: 'stripe', status: 'warning', timestamp: new Date(Date.now() - 880_000).toISOString(), workflowId: 'invoice-followup' },
  { id: 'evt-7', message: 'Meeting recap filed to Notion /clients/acme',         source: 'notion', status: 'info',    timestamp: new Date(Date.now() -1_120_000).toISOString(), workflowId: 'meeting-recap' },
  { id: 'evt-8', message: 'PR #482 merged + included in evening digest',         source: 'github', status: 'success', timestamp: new Date(Date.now() -1_380_000).toISOString(), workflowId: 'deploy-digest' },
]

export const nexusActivityPool: Array<Omit<NexusActivityEvent, 'id' | 'timestamp'>> = [
  { message: 'Inbound inquiry from Patel & Stone classified',         source: 'gmail',    status: 'success', workflowId: 'triage-inbound' },
  { message: 'Slack update sent to #client-mercer',                    source: 'slack',    status: 'info',    workflowId: 'sync-project-status' },
  { message: 'Lead scored 0.91 — assigned to Matthew',                 source: 'hubspot',  status: 'success', workflowId: 'lead-routing' },
  { message: 'Meeting recap drafted for Friday strategy call',         source: 'openai',   status: 'ai',      workflowId: 'meeting-recap' },
  { message: 'Calendar conflict detected — alternative proposed',      source: 'gcal',     status: 'warning', workflowId: 'schedule-recurring' },
  { message: 'Invoice reminder queued for Northwind Logistics',        source: 'stripe',   status: 'info',    workflowId: 'invoice-followup' },
  { message: 'Pull request #482 merged + digest queued',               source: 'github',   status: 'success', workflowId: 'deploy-digest' },
  { message: 'Recap filed to Notion /clients/acme',                    source: 'notion',   status: 'info',    workflowId: 'meeting-recap' },
  { message: 'Linear issue ARM-219 closed',                            source: 'linear',   status: 'success', workflowId: 'sync-project-status' },
  { message: 'Claude flagged tone shift in Mercer thread',             source: 'claude',   status: 'ai',      workflowId: 'overdue-escalation' },
  { message: 'Slack alert: workflow "Lead routing" ran in 9.8s',       source: 'slack',    status: 'info',    workflowId: 'lead-routing' },
  { message: 'New thread in #client-triage from Bowmore & Cole',       source: 'gmail',    status: 'success', workflowId: 'triage-inbound' },
]

// ─── Notifications (bell dropdown) ───────────────────────────────────────────

export const nexusNotifications: NexusNotification[] = [
  {
    id: 'n-1',
    kind: 'reply',
    title: 'Priya Patel replied to your follow-up',
    body: '"Great — let\'s do Friday 3:30. I\'ll bring the risk owner doc."',
    source: 'gmail',
    timestamp: new Date(Date.now() -  4 * 60_000).toISOString(),
    read: false,
    href: '/inbox',
    action: 'Open thread',
  },
  {
    id: 'n-2',
    kind: 'ai',
    title: 'Draft ready for Acme Refrigeration',
    body: 'Tier comparison reply drafted — confidence 88%. Tone matched to 4 prior replies.',
    source: 'claude',
    timestamp: new Date(Date.now() - 11 * 60_000).toISOString(),
    read: false,
    href: '/inbox',
    action: 'Review',
  },
  {
    id: 'n-3',
    kind: 'workflow',
    title: 'Workflow "Lead routing" completed 12 runs',
    body: 'All in the last hour. Avg duration 9.8s. No failures.',
    source: 'hubspot',
    timestamp: new Date(Date.now() - 28 * 60_000).toISOString(),
    read: false,
    href: '/workflows?w=lead-routing',
    action: 'View runs',
  },
  {
    id: 'n-4',
    kind: 'mention',
    title: 'Matthew, you were mentioned in #client-mercer',
    body: '"@matthew — Mercer wants timeline confirmation by EOW. Can you cover?"',
    source: 'slack',
    timestamp: new Date(Date.now() - 42 * 60_000).toISOString(),
    read: false,
    href: '/activity',
    action: 'Reply in Slack',
  },
  {
    id: 'n-5',
    kind: 'system',
    title: 'Stripe integration token expires in 7 days',
    body: 'Renew the connection to keep invoice follow-up workflows running uninterrupted.',
    source: 'stripe',
    timestamp: new Date(Date.now() - 3 * 60 * 60_000).toISOString(),
    read: true,
    href: '/integrations',
    action: 'Renew',
  },
  {
    id: 'n-6',
    kind: 'workflow',
    title: 'Workflow paused — Escalate overdue request',
    body: 'Waiting on your approval for 2 drafted follow-ups in Mercer Group.',
    source: 'gmail',
    timestamp: new Date(Date.now() - 5 * 60 * 60_000).toISOString(),
    read: true,
    href: '/workflows?w=overdue-escalation',
    action: 'Review',
  },
  {
    id: 'n-7',
    kind: 'system',
    title: 'New: workspace settings v2.4',
    body: 'Per-workflow approval thresholds and quiet hours scheduling are now available.',
    timestamp: new Date(Date.now() - 22 * 60 * 60_000).toISOString(),
    read: true,
    action: 'See changes',
  },
]

// ─── Inbox items (AI-triaged) ────────────────────────────────────────────────

export const nexusInbox: InboxItem[] = [
  {
    id: 'in-001',
    subject: 'Re: Q3 onboarding timeline + risk owners',
    from: 'Priya Patel · Patel & Stone',
    preview:
      'Wanted to confirm the timeline we discussed Tuesday. Could you also send the risk owner list? Happy to jump on a call this week if useful.',
    aiAction: 'Drafted reply with confirmed timeline + risk owner table. Tone matched to 4 prior replies.',
    status: 'awaiting-approval',
    timestamp: new Date(Date.now() -   8 * 60_000).toISOString(),
    priority: 'high',
    account: 'Patel & Stone',
  },
  {
    id: 'in-002',
    subject: 'Refrigeration retrofit — pricing question',
    from: 'Jordan Mercer · Acme Refrigeration',
    preview:
      'Hi — we got the proposal but need clarification on the service-tier delta. Specifically the response-time SLA for tier 2 vs tier 3.',
    aiAction: 'Classified as high-intent. Drafted response with tier comparison table.',
    status: 'awaiting-approval',
    timestamp: new Date(Date.now() -  22 * 60_000).toISOString(),
    priority: 'high',
    account: 'Acme Refrigeration',
  },
  {
    id: 'in-003',
    subject: 'Invoice INV-0481 — past due reminder',
    from: 'Stripe',
    preview:
      'Invoice INV-0481 is 9 days past due. Northwind Logistics — $4,820. Last reminder sent 14 days ago.',
    aiAction: 'Drafted polite follow-up matched to Northwind\'s previous reply style. Queued in Gmail.',
    status: 'drafted',
    timestamp: new Date(Date.now() -  45 * 60_000).toISOString(),
    priority: 'normal',
    account: 'Northwind Logistics',
  },
  {
    id: 'in-004',
    subject: 'Lead — refrigeration retrofit (web form)',
    from: 'web form · armatir.com/contact',
    preview:
      'Form submission: company size 80, budget Q4, vertical food service. Previous visitor — 3 sessions in last 7 days.',
    aiAction: 'Scored 0.92. Created HubSpot contact + assigned to Matthew. Posted summary to #leads-inbound.',
    status: 'sent',
    timestamp: new Date(Date.now() -  72 * 60_000).toISOString(),
    priority: 'high',
    account: 'Acme Refrigeration',
  },
  {
    id: 'in-005',
    subject: 'Friday 2pm hold — Patel & Stone strategy call',
    from: 'Google Calendar',
    preview:
      'Conflict detected: Matthew has a focus block. Suggested alternates within both calendars\' working hours.',
    aiAction: 'Proposed Friday 3:30pm. Notified both parties via Slack.',
    status: 'sent',
    timestamp: new Date(Date.now() - 110 * 60_000).toISOString(),
    priority: 'normal',
    account: 'Patel & Stone',
  },
  {
    id: 'in-006',
    subject: 'Mercer Group — thread aged past SLA',
    from: 'Nexus monitor',
    preview:
      'Two open threads from Mercer Group with no reply in 48 hours. Both classified as account-impacting tone.',
    aiAction: 'Drafted prioritized follow-ups. Escalated to account owner.',
    status: 'queued',
    timestamp: new Date(Date.now() - 145 * 60_000).toISOString(),
    priority: 'high',
    account: 'Mercer Group',
  },
]

export const nexusDraftCopies: Record<string, string> = {
  'in-001':
    "Hi Priya - confirmed: Q3 onboarding kicks off the week of July 14. Below is the risk owner table you asked about. Happy to jump on Friday at 3:30 or Monday at 11 if a call is easier.",
  'in-002':
    "Hi Jordan - quick clarification on the tier delta: Tier 2 commits to a 4-hour first response, Tier 3 to 1-hour, both 24/7. I've attached a one-page comparison alongside the proposal.",
  'in-003':
    "Hi Northwind team - gentle reminder that INV-0481 ($4,820) is now 9 days past due. Let me know if there's anything blocking on your side - happy to extend the window by another week if needed.",
}
