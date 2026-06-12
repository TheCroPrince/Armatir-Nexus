import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Clock,
  CornerDownLeft,
  Inbox,
  Radio,
  Send,
  Sparkles,
  Workflow,
  X,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { nexusActivitySeed, nexusRecommendations } from '@/data/nexus'
import { useNexusDemoState } from '@/lib/nexus-demo-state-context'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'

interface AskNexusPanelProps {
  open: boolean
  onClose: () => void
}

type Speaker = 'nexus' | 'operator'

type ConversationMessage = {
  id: string
  speaker: Speaker
  eyebrow: string
  body: string
  timestamp: string
}

type SuggestedAction = {
  id: string
  label: string
  detail: string
  href: string
  icon: LucideIcon
  tone: 'violet' | 'mint' | 'amber' | 'blue'
  run: () => void
}

const seededMessages: ConversationMessage[] = [
  {
    id: 'seed-1',
    speaker: 'operator',
    eyebrow: 'Matthew',
    body: 'What needs attention before the end of day?',
    timestamp: new Date(Date.now() - 9 * 60_000).toISOString(),
  },
  {
    id: 'seed-2',
    speaker: 'nexus',
    eyebrow: 'Nexus operator',
    body: 'Four items are active: two client replies need approval, lead routing is running cleanly, and the Stripe token should be renewed this week.',
    timestamp: new Date(Date.now() - 8 * 60_000).toISOString(),
  },
  {
    id: 'seed-3',
    speaker: 'operator',
    eyebrow: 'Matthew',
    body: 'Prioritize anything tied to revenue.',
    timestamp: new Date(Date.now() - 5 * 60_000).toISOString(),
  },
  {
    id: 'seed-4',
    speaker: 'nexus',
    eyebrow: 'Nexus operator',
    body: 'Acme Refrigeration is the strongest revenue signal. I queued the draft review, the lead-routing workflow, and the latest activity stream as the fastest path.',
    timestamp: new Date(Date.now() - 4 * 60_000).toISOString(),
  },
]

const answerBank = [
  'I would start with the Acme draft, then check the lead-routing run. Both are already linked below so you can move without hunting.',
  'Current risk is low. The only time-sensitive item is the Stripe renewal window, while the active workflows are still reporting healthy runs.',
  'The fastest operator pass is inbox approvals first, workflow health second, activity stream last. Nothing here needs a backend call in this demo.',
]

function toneClass(tone: SuggestedAction['tone']) {
  switch (tone) {
    case 'mint':
      return 'bg-[oklch(94%_0.05_165)] text-[oklch(38%_0.13_155)]'
    case 'amber':
      return 'bg-[oklch(95%_0.06_75)] text-[oklch(40%_0.12_70)]'
    case 'blue':
      return 'bg-[oklch(94%_0.05_245)] text-[oklch(38%_0.13_245)]'
    default:
      return 'bg-[oklch(94%_0.06_295)] text-[oklch(42%_0.16_295)]'
  }
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <div className="mono-label mb-2">{title}</div>
      {children}
    </section>
  )
}

export function AskNexusPanel({ open, onClose }: AskNexusPanelProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const [messages, setMessages] = useState<ConversationMessage[]>(seededMessages)
  const [draft, setDraft] = useState('')
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const {
    workflows,
    inboxItems,
    selectedWorkflowId,
    selectedInboxId,
    selectWorkflow,
    selectInboxItem,
  } = useNexusDemoState()

  const leadWorkflow = workflows.find((workflow) => workflow.id === 'lead-routing') ??
    workflows.find((workflow) => workflow.status === 'running') ??
    workflows.find((workflow) => workflow.id === selectedWorkflowId) ??
    workflows[0]!
  const approvalItem = inboxItems.find((item) => item.status === 'awaiting-approval') ?? inboxItems.find((item) => item.id === selectedInboxId) ?? inboxItems[0]!
  const latestRecommendation = nexusRecommendations[0]!
  const latestActivity = nexusActivitySeed[0]!

  const suggestedActions = useMemo<SuggestedAction[]>(() => [
    {
      id: 'review-acme-draft',
      label: `Review ${approvalItem.account}`,
      detail: approvalItem.aiAction,
      href: '/inbox',
      icon: Inbox,
      tone: 'violet',
      run: () => {
        selectInboxItem(approvalItem.id)
        navigate('/inbox')
        onClose()
      },
    },
    {
      id: 'inspect-workflow',
      label: `Inspect ${leadWorkflow.name}`,
      detail: `${leadWorkflow.status} - ${leadWorkflow.impact}`,
      href: `/workflows?w=${leadWorkflow.id}`,
      icon: Workflow,
      tone: leadWorkflow.status === 'running' ? 'mint' : 'amber',
      run: () => {
        selectWorkflow(leadWorkflow.id)
        navigate(`/workflows?w=${leadWorkflow.id}`)
        onClose()
      },
    },
    {
      id: 'open-activity',
      label: 'Open live activity',
      detail: `${latestActivity.message} - ${relativeTime(latestActivity.timestamp)}`,
      href: '/activity',
      icon: Radio,
      tone: 'blue',
      run: () => {
        navigate('/activity')
        onClose()
      },
    },
  ], [approvalItem, latestActivity, leadWorkflow, navigate, onClose, selectInboxItem, selectWorkflow])

  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const focusId = window.setTimeout(() => inputRef.current?.focus(), 80)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return
      const first = focusable[0]!
      const last = focusable[focusable.length - 1]!
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(focusId)
      window.removeEventListener('keydown', onKey)
      restoreFocusRef.current?.focus()
      restoreFocusRef.current = null
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  function submitPrompt(e?: FormEvent) {
    e?.preventDefault()
    const text = draft.trim()
    if (!text) return

    const now = Date.now()
    const answer = answerBank[messages.length % answerBank.length]
    setMessages((current) => [
      ...current,
      {
        id: `operator-${now}`,
        speaker: 'operator',
        eyebrow: 'Matthew',
        body: text,
        timestamp: new Date(now).toISOString(),
      },
      {
        id: `nexus-${now}`,
        speaker: 'nexus',
        eyebrow: 'Nexus operator',
        body: answer,
        timestamp: new Date(now + 600).toISOString(),
      },
    ])
    setDraft('')
  }

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      submitPrompt()
    }
  }

  if (!open) return null

  return (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-[oklch(45%_0.08_280_/_0.20)] px-3 py-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14 }}
        >
          <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close Ask Nexus" />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Ask Nexus operator panel"
            tabIndex={-1}
            initial={{ opacity: 0, x: 22, scale: 0.985 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 22, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong relative z-10 flex h-full w-full max-w-[460px] flex-col overflow-hidden rounded-2xl"
          >
            <div className="relative overflow-hidden border-b border-[var(--color-hairline-soft)] px-4 py-4">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(70%_0.18_285_/_0.8)] to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(70%_0.18_295)] to-[oklch(55%_0.20_255)] text-white shadow-[0_12px_28px_oklch(55%_0.20_280_/_0.28)]">
                    <Bot className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">Ask Nexus</h2>
                      <span className="status-pill bg-[oklch(94%_0.05_165)] text-[oklch(38%_0.13_155)]">
                        <span className="bg-[var(--color-mint)]" /> Ready
                      </span>
                    </div>
                    <p className="mt-1 text-[11.5px] leading-snug text-[var(--color-ink-faint)]">
                      Operator context, seeded history, and demo-safe actions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--color-ink-faint)] transition-colors hover:bg-white hover:text-[var(--color-ink)]"
                  aria-label="Close Ask Nexus"
                >
                  <X className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
              <PanelSection title="Conversation">
                <ol className="flex flex-col gap-3">
                  {messages.map((message) => {
                    const isOperator = message.speaker === 'operator'
                    return (
                      <li
                        key={message.id}
                        className={cn('flex', isOperator ? 'justify-end' : 'justify-start')}
                      >
                        <article
                          className={cn(
                            'max-w-[86%] rounded-2xl px-3.5 py-3 shadow-[var(--shadow-card)]',
                            isOperator
                              ? 'bg-[var(--color-ink)] text-white'
                              : 'border border-[var(--color-hairline-soft)] bg-white/70 text-[var(--color-ink)]',
                          )}
                        >
                          <div className="mb-1 flex items-center gap-2 text-[10.5px]">
                            <span className={cn('font-medium', isOperator ? 'text-white/80' : 'text-[var(--color-ink-faint)]')}>
                              {message.eyebrow}
                            </span>
                            <span className={isOperator ? 'text-white/35' : 'text-[var(--color-ink-ghost)]'}>/</span>
                            <span
                              suppressHydrationWarning
                              className={cn('font-mono tabular-nums', isOperator ? 'text-white/55' : 'text-[var(--color-ink-faint)]')}
                            >
                              {relativeTime(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-[12.5px] leading-relaxed">{message.body}</p>
                        </article>
                      </li>
                    )
                  })}
                </ol>
              </PanelSection>

              <div className="my-4 h-px bg-[var(--color-hairline-soft)]" />

              <PanelSection title="Suggested actions">
                <div className="grid gap-2">
                  {suggestedActions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onMouseEnter={() => setActiveActionId(action.id)}
                      onFocus={() => setActiveActionId(action.id)}
                      onBlur={() => setActiveActionId((current) => current === action.id ? null : current)}
                      onClick={action.run}
                      className={cn(
                        'group flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all',
                        activeActionId === action.id
                          ? 'border-[oklch(82%_0.08_285)] bg-white shadow-[var(--shadow-card-hover)]'
                          : 'border-[var(--color-hairline-soft)] bg-white/55 hover:bg-white',
                      )}
                      aria-label={`${action.label}. Opens ${action.href}`}
                    >
                      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', toneClass(action.tone))}>
                        <action.icon className="h-4 w-4" strokeWidth={1.8} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 text-[12.5px] font-medium text-[var(--color-ink)]">
                          {action.label}
                          <ArrowUpRight className="h-3 w-3 text-[var(--color-ink-faint)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </span>
                        <span className="mt-0.5 block line-clamp-2 text-[11px] leading-snug text-[var(--color-ink-faint)]">
                          {action.detail}
                        </span>
                        <span className="mt-2 inline-flex rounded-full bg-[var(--color-canvas-deep)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-faint)]">
                          {action.href}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </PanelSection>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[var(--color-hairline-soft)] bg-white/45 px-3 py-2">
                  <Sparkles className="mb-1 h-3.5 w-3.5 text-[var(--color-violet)]" strokeWidth={1.8} />
                  <div className="font-mono text-[12px] text-[var(--color-ink)]">{Math.round(latestRecommendation.confidence * 100)}%</div>
                  <div className="text-[10.5px] leading-tight text-[var(--color-ink-faint)]">top confidence</div>
                </div>
                <div className="rounded-xl border border-[var(--color-hairline-soft)] bg-white/45 px-3 py-2">
                  <Clock className="mb-1 h-3.5 w-3.5 text-[var(--color-blue)]" strokeWidth={1.8} />
                  <div className="font-mono text-[12px] text-[var(--color-ink)]">{leadWorkflow.avgDuration}</div>
                  <div className="text-[10.5px] leading-tight text-[var(--color-ink-faint)]">avg run</div>
                </div>
                <div className="rounded-xl border border-[var(--color-hairline-soft)] bg-white/45 px-3 py-2">
                  <Zap className="mb-1 h-3.5 w-3.5 text-[var(--color-amber)]" strokeWidth={1.8} />
                  <div className="font-mono text-[12px] text-[var(--color-ink)]">{workflows.filter((workflow) => workflow.status === 'running').length}</div>
                  <div className="text-[10.5px] leading-tight text-[var(--color-ink-faint)]">running now</div>
                </div>
              </div>
            </div>

            <form onSubmit={submitPrompt} className="border-t border-[var(--color-hairline-soft)] bg-[oklch(99%_0.005_280_/_0.72)] px-4 py-3">
              <label className="sr-only" htmlFor="ask-nexus-prompt">Ask Nexus prompt</label>
              <div className="rounded-2xl border border-[var(--color-hairline-soft)] bg-white/80 p-2 shadow-[var(--shadow-card)]">
                <textarea
                  id="ask-nexus-prompt"
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  rows={2}
                  placeholder="Ask about risk, approvals, workflows..."
                  className="max-h-28 min-h-12 w-full resize-none bg-transparent px-1 text-[12.5px] leading-relaxed text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-ghost)]"
                />
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="hidden items-center gap-1.5 text-[10.5px] text-[var(--color-ink-faint)] sm:flex">
                    <CornerDownLeft className="h-3 w-3" strokeWidth={1.8} />
                    <span><kbd>Ctrl</kbd> <kbd>Enter</kbd> sends</span>
                  </span>
                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="ml-auto flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[11.5px] font-medium text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  >
                    <Send className="h-3 w-3" strokeWidth={2.2} />
                    Send
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-[var(--color-ink-faint)]" role="status">
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-mint)]" strokeWidth={1.8} />
                Local demo mode. No message leaves this browser.
              </div>
            </form>
          </motion.div>
        </motion.div>
  )
}
