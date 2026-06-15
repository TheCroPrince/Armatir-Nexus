// Icon registry for Nexus integration chips and workflow steps.
import {
  Brain,
  Sparkles,
  Database,
  Bot,
  Workflow,
  Inbox,
  Webhook,
  GitBranch,
} from 'lucide-react'
import type { ComponentType, SVGProps } from 'react'
import {
  GmailGlyph,
  GoogleCalendarGlyph,
  SlackGlyph,
  HubSpotGlyph,
  NotionGlyph,
  StripeGlyph,
  LinearGlyph,
  GithubGlyph,
  OpenAIGlyph,
  ClaudeGlyph,
} from '@/components/brand/integration-glyphs'

// A Nexus icon is anything renderable as an SVG component — both lucide-react
// glyphs and our inlined brand marks satisfy this shape.
export type NexusIcon = ComponentType<SVGProps<SVGSVGElement>>

// Integration brand names now map to their real (monochrome) brand marks.
// Generic lucide glyphs remain available for workflow-step / system chips.
export const nexusIconRegistry = {
  // Real brand marks
  Gmail: GmailGlyph,
  GoogleCalendar: GoogleCalendarGlyph,
  Slack: SlackGlyph,
  HubSpot: HubSpotGlyph,
  Notion: NotionGlyph,
  Stripe: StripeGlyph,
  Linear: LinearGlyph,
  Github: GithubGlyph,
  OpenAI: OpenAIGlyph,
  Claude: ClaudeGlyph,
  // Generic / semantic glyphs
  Brain,
  Sparkles,
  Database,
  Bot,
  Workflow,
  Inbox,
  Webhook,
  GitBranch,
} satisfies Record<string, NexusIcon>

export type NexusIconName = keyof typeof nexusIconRegistry

export function getNexusIcon(name: NexusIconName): NexusIcon {
  return nexusIconRegistry[name]
}
