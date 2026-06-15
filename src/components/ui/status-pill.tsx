import { cn } from '@/lib/cn'
import type { WorkflowStatus } from '@/types/nexus'

// Centralised colour mapping so any workflow status renders identically
// wherever it appears — sidebar, list, detail panel, activity timeline.

const colourMap: Record<WorkflowStatus, { dot: string; text: string; bg: string }> = {
  running: { dot: 'bg-[var(--color-mint)]',  text: 'text-[oklch(38%_0.10_165)]', bg: 'bg-[oklch(94%_0.05_165)]' },
  ready:   { dot: 'bg-[var(--color-blue)]',  text: 'text-[oklch(36%_0.12_250)]', bg: 'bg-[oklch(94%_0.04_250)]' },
  synced:  { dot: 'bg-[oklch(64%_0.04_280)]',text: 'text-[oklch(38%_0.02_280)]', bg: 'bg-[oklch(95%_0.012_280)]' },
  review:  { dot: 'bg-[var(--color-amber)]', text: 'text-[oklch(40%_0.12_70)]',  bg: 'bg-[oklch(95%_0.06_75)]' },
  paused:  { dot: 'bg-[oklch(72%_0.015_280)]',text:'text-[var(--color-ink-faint)]', bg: 'bg-[var(--color-canvas-deep)]' },
}

const label: Record<WorkflowStatus, string> = {
  running: 'Running',
  ready:   'Ready',
  synced:  'Synced',
  review:  'Review',
  paused:  'Paused',
}

interface StatusPillProps {
  status: WorkflowStatus
  className?: string
  pulse?: boolean
}

export function StatusPill({ status, className, pulse = false }: StatusPillProps) {
  const c = colourMap[status]
  return (
    <span className={cn('status-pill', c.text, c.bg, className)}>
      <span className={cn(c.dot, pulse && status === 'running' && 'animate-pulse')} />
      {label[status]}
    </span>
  )
}

interface WorkflowStatusTextProps {
  status: WorkflowStatus
  className?: string
}

// Text-only status — same semantic colours as StatusPill, but no capsule,
// border, dot, background, or animation. Reads like a clean table column.
export function WorkflowStatusText({ status, className }: WorkflowStatusTextProps) {
  return (
    <span className={cn('text-[12.5px] font-medium', colourMap[status].text, className)}>
      {label[status]}
    </span>
  )
}
