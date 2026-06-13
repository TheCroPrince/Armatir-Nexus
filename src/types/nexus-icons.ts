// Icon registry for Nexus integration chips and workflow steps.
import type { ComponentType, SVGProps } from 'react'
import {
  BadgeDollarSign,
  Bot,
  Box,
  Building2,
  CalendarDays,
  ClipboardList,
  Cloud,
  Database,
  FolderOpen,
  Handshake,
  Inbox,
  MailPlus,
  MessageSquare,
  MessagesSquare,
  PanelTop,
  ReceiptText,
  ShoppingBag,
  Table2,
  Video,
  Webhook,
  WalletCards,
  Workflow,
} from 'lucide-react'
import {
  ClaudeIcon,
  GitHubIcon,
  GmailIcon,
  GoogleCalendarIcon,
  HubSpotIcon,
  LinearIcon,
  NotionIcon,
  OpenAIIcon,
  SlackIcon,
  StripeIcon,
} from '@/components/ui/nexus-brand-icons'

type NexusIconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number; title?: string }
export type NexusIconComponent = ComponentType<NexusIconProps>

export const nexusIconRegistry = {
  Calendar: GoogleCalendarIcon,
  Mail: GmailIcon,
  MessageSquare,
  Users: HubSpotIcon,
  FileText: NotionIcon,
  CreditCard: StripeIcon,
  GitBranch: LinearIcon,
  Github: GitHubIcon,
  Brain: ClaudeIcon,
  Sparkles: OpenAIIcon,
  Slack: SlackIcon,
  MailPlus,
  CalendarDays,
  Cloud,
  Handshake,
  Building2,
  BadgeDollarSign,
  ReceiptText,
  Video,
  FolderOpen,
  Box,
  Table2,
  ShoppingBag,
  ClipboardList,
  MessagesSquare,
  PanelTop,
  WalletCards,
  Database,
  Bot,
  Workflow,
  Inbox,
  Webhook,
} as const satisfies Record<string, NexusIconComponent>

const brandIconNames = new Set<keyof typeof nexusIconRegistry>([
  'Calendar',
  'Mail',
  'Users',
  'FileText',
  'CreditCard',
  'GitBranch',
  'Github',
  'Brain',
  'Sparkles',
  'Slack',
])

export type NexusIconName = keyof typeof nexusIconRegistry

export function getNexusIcon(name: NexusIconName): NexusIconComponent {
  return nexusIconRegistry[name]
}

export function isNexusBrandIcon(name: NexusIconName) {
  return brandIconNames.has(name)
}
