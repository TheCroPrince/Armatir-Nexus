// Icon registry for Nexus integration chips and workflow steps.
import {
  Calendar,
  Mail,
  MessageSquare,
  Users,
  FileText,
  CreditCard,
  GitBranch,
  GitMerge,
  Brain,
  Sparkles,
  Hash,
  Database,
  Bot,
  Workflow,
  Inbox,
  Webhook,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Aliases mapping integration brand names to semantically-fitting Lucide
// glyphs. lucide-react v1 removed brand-name icons, so we stand in here.
export const nexusIconRegistry = {
  Calendar,
  Mail,
  MessageSquare,
  Users,
  FileText,
  CreditCard,
  GitBranch,
  /** stand-in for GitHub (brand icon removed in lucide v1) */
  Github: GitMerge,
  Brain,
  Sparkles,
  /** stand-in for Slack — # symbol for channels */
  Slack: Hash,
  Database,
  Bot,
  Workflow,
  Inbox,
  Webhook,
} as const

export type NexusIconName = keyof typeof nexusIconRegistry

export function getNexusIcon(name: NexusIconName): LucideIcon {
  return nexusIconRegistry[name]
}
