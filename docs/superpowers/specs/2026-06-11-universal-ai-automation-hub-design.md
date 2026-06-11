# Universal AI Automation Hub Demo Design

Date: 2026-06-11
Project: Armatir Nexus

## Purpose

Improve the Armatir Nexus demo so it feels like a reputable, broadly useful AI automation dashboard for many types of businesses. The demo should stay open-ended rather than telling a narrow business-owner story. Visitors should quickly understand that Nexus connects to familiar apps, automates routine work, keeps humans in control, and gives operators a clear audit trail.

## Audience

Primary audience: small and mid-sized business owners, operators, consultants, agencies, and teams evaluating AI automation.

The experience should be understandable without technical background, but credible enough for technically curious users. It should avoid jargon-heavy platform positioning and avoid implying that the app is only for one industry.

## Goals

- Make the product feel more reputable by showing recognizable services that businesses already use.
- Add product surfaces that visitors expect from an automation app: integration catalog, workflow templates, approval queue behavior, connection health, and audit activity.
- Reduce dead-end interactions by making "New workflow" and "Add integration" open useful, polished flows.
- Improve believability by making workflow creation, integration connection, workflow status changes, and inbox approve/dismiss actions visibly update related UI state.
- Keep the current in-product dashboard structure. Do not add a marketing landing page.

## Non-Goals

- No real OAuth, backend, database, auth, billing, or external API calls.
- No narrow guided story tied to one customer or vertical.
- No dependency on real brand assets from remote services.
- No major visual redesign of the shell, navigation, routing, or page architecture.

## Recommended Approach

Implement a focused product-depth pass around three areas:

1. Expand recognizable integrations.
2. Add believable modal flows for adding integrations and creating automations.
3. Introduce shared local demo state for the highest-impact actions.

This keeps the project lightweight while making the demo feel more complete and credible.

## Integration Catalog

Add a catalog-style experience to the Integrations page while preserving the existing ecosystem view.

Integration categories:

- Email: Gmail, Outlook
- Calendar: Google Calendar, Microsoft 365 Calendar
- CRM and sales: HubSpot, Salesforce, Pipedrive
- Payments and accounting: Stripe, Square, QuickBooks
- Chat and meetings: Slack, Microsoft Teams, Zoom
- Files and knowledge: Google Drive, Dropbox, Notion, Airtable
- Ecommerce and forms: Shopify, Typeform
- Engineering and operations: GitHub, Linear
- AI: OpenAI, Claude

Each catalog item should show:

- App name
- Category
- Connection status
- Short automation value line
- Number of workflows using it
- Scopes or permissions summary for connected apps
- Connect, reconnect, or manage action

Brand handling:

Use lucide-based app-style icons and distinct service colors instead of relying on official logos. This avoids asset licensing risk while still making services recognizable. Existing brand aliases in `src/types/nexus-icons.ts` can be extended where helpful.

## New Workflow Flow

Clicking "New workflow" should open a workflow template picker instead of only showing a toast.

Template categories:

- Customer communication
- Leads and CRM
- Scheduling
- Invoices and payments
- Documents and knowledge
- Team notifications

Example templates:

- Reply to customer inquiry
- Route new lead to CRM
- Follow up unpaid invoice
- Schedule meeting from email
- Summarize call notes
- Sync form submission to CRM
- Save attachment to Drive or Dropbox
- Notify team when a deal changes

Template card details:

- Trigger app
- Actions performed
- Human approval requirement
- Estimated time saved
- Connected app icons

Selecting a template should create a draft workflow in local state, select it on the Workflows page, and add an activity event such as "Workflow draft created from template."

## Add Integration Flow

Clicking "Add integration" should open an app directory modal.

Modal features:

- Search field
- Category filters
- Recommended apps strip
- App cards with status and action
- Connection detail panel for the selected app

Connecting an app should not claim real OAuth. It should show a believable local simulation:

1. User clicks Connect.
2. Button enters "Checking scopes" or "Connecting" state.
3. App becomes "connected" or "syncing" locally.
4. New activity event appears.
5. Optional notification appears for successful connection.

Copy should make clear through UI behavior, not disclaimers, that this is a demo session.

## Shared Demo State

Introduce a local demo-state provider near `AppShell` so the most important interactions can update multiple surfaces.

State should include:

- Integrations
- Workflows
- Inbox items
- Activity events
- Notifications
- Recent demo actions

The existing settings provider can remain separate or be composed with the new provider.

Actions should include:

- `createWorkflowFromTemplate`
- `toggleWorkflowStatus`
- `approveInboxItem`
- `dismissInboxItem`
- `connectIntegration`
- `markNotificationRead`
- `pushActivityEvent`

Only high-value state needs to be shared in this pass. Avoid over-abstracting every local interaction.

## Dashboard Believability

Replace these hard-coded operational numbers with values derived from local state:

- Running workflows
- Needs-review workflows
- Inbox approvals
- Connected integrations
- Activity events per minute
- Recent handled items
- Hours saved headline

The headline panel should remain broad:

"Nexus handled 31 things while you were away - 4 need review."

This copy can stay, but both numbers must come from shared demo state.

## AI Command Center

Make the AI panel more outcome-focused and less model-name-focused.

Preferred framing:

- "Ready for approval"
- "Suggested automation"
- "Possible missed follow-up"
- "Can update CRM"
- "Can draft reply"

Keep confidence and reasoning, but use service context and business result first. Model references can move to subtle metadata.

## Visual Design

Keep the current light glass dashboard aesthetic. Improve credibility by adding:

- More service-specific icon color variety
- Denser integration catalog cards
- Clearer status and scope rows
- Modal flows with polished loading and success states
- Better empty states for filtered catalog/search results

Avoid turning the app into a marketing page. The first screen should remain the working dashboard.

## Components and Files Likely Affected

- `src/data/nexus.ts`: expand integrations, add templates, add richer catalog metadata.
- `src/types/nexus.ts`: add integration catalog and workflow template types.
- `src/types/nexus-icons.ts`: extend icon aliases for common services.
- `src/components/layout/app-shell.tsx`: host shared demo-state provider. Modal open/close state should stay in the owning page unless it must be triggered globally.
- `src/pages/integrations.tsx`: add app directory modal and richer integration cards.
- `src/pages/workflows.tsx`: add workflow template picker and consume shared workflow state.
- `src/pages/inbox.tsx`: route approve/dismiss actions through shared demo state.
- `src/components/overview/activity-feed.tsx`: consume shared activity events.
- `src/components/overview/active-workflows.tsx`: consume shared workflow state.
- `src/components/overview/metric-row.tsx`: derive the visible headline values for handled items, pending review, connected integrations, and running workflows from demo state. Sparkline shapes may remain seeded.

## Error Handling and Edge Cases

- Searching a catalog with no results should show a useful empty state and a clear reset action.
- Connecting an already connected integration should open/manage its details rather than duplicating it.
- Creating the same workflow template repeatedly should create distinct draft IDs.
- If sample data is hidden in settings, catalog structure can remain visible but seeded operational activity should be hidden.
- Local storage failures should not break the demo.

## Testing and Verification

Run:

- `npm.cmd run lint`
- `npm.cmd run build`

Manual verification:

- Open Overview and confirm dashboard still loads as the first screen.
- Click New workflow and create a draft automation.
- Confirm the new workflow appears in Workflows and activity updates.
- Click Add integration, search/filter the app directory, connect an app, and confirm status/activity updates.
- Approve an inbox draft and confirm activity/metrics/notifications update where implemented.
- Check mobile widths around 390px, 430px, and 768px for modal fit and no horizontal overflow.

## Implementation Sequence

1. Add data/types for expanded integrations and workflow templates.
2. Add shared demo-state provider for workflows, integrations, inbox, activity, and notifications.
3. Wire existing pages to shared state without changing visual layout.
4. Build New workflow template picker.
5. Build Add integration app directory modal.
6. Replace the most visible hard-coded counts with derived values.
7. Run lint, build, and manual responsive checks.
