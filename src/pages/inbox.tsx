import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, Pencil, Clock, MailWarning, ChevronRight, X, Send } from 'lucide-react'
import { nexusInbox } from '@/data/nexus'
import type { InboxItem } from '@/types/nexus'
import { relativeTime } from '@/lib/time'
import { cn } from '@/lib/cn'

const statusStyle: Record<InboxItem['status'], { label: string; bg: string; text: string }> = {
  queued:              { label: 'Queued',              bg: 'bg-[oklch(95%_0.018_285)]',    text: 'text-[var(--color-ink-soft)]' },
  drafted:             { label: 'Drafted',             bg: 'bg-[oklch(94%_0.05_295)]',     text: 'text-[oklch(42%_0.16_295)]' },
  'awaiting-approval': { label: 'Awaiting approval',   bg: 'bg-[oklch(94%_0.05_75)]',      text: 'text-[oklch(42%_0.15_70)]' },
  sent:                { label: 'Sent',                bg: 'bg-[oklch(94%_0.05_165)]',     text: 'text-[oklch(38%_0.13_155)]' },
}

const priorityDot: Record<InboxItem['priority'], string> = {
  high:   'bg-[var(--color-rose)]',
  normal: 'bg-[var(--color-blue)]',
  low:    'bg-[var(--color-ink-ghost)]',
}

const draftCopies: Record<string, string> = {
  'in-001':
    "Hi Priya — confirmed: Q3 onboarding kicks off the week of July 14. Below is the risk owner table you asked about. Happy to jump on Friday at 3:30 or Monday at 11 if a call is easier.",
  'in-002':
    "Hi Jordan — quick clarification on the tier delta: Tier 2 commits to a 4-hour first response, Tier 3 to 1-hour, both 24/7. I've attached a one-page comparison alongside the proposal.",
  'in-003':
    "Hi Northwind team — gentle reminder that INV-0481 ($4,820) is now 9 days past due. Let me know if there's anything blocking on your side — happy to extend the window by another week if needed.",
}

export function InboxPage() {
  const [selectedId, setSelectedId] = useState<string>(nexusInbox[0]!.id)
  const [items, setItems] = useState<InboxItem[]>(nexusInbox)
  const [drafts, setDrafts] = useState<Record<string, string>>(draftCopies)
  const [editing, setEditing] = useState(false)
  const [draftText, setDraftText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 12_000)
    return () => clearInterval(id)
  }, [])

  const selected = items.find((i) => i.id === selectedId) ?? items[0]!

  function announce(message: string) {
    setNotice(message)
    window.setTimeout(() => setNotice(null), 2600)
  }

  const approve = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'sent' } : i))
    setEditing(false)
    announce('Draft approved and sent')
  }

  function startEditing() {
    setDraftText(drafts[selected.id] ?? "Hi — Nexus has prepared a draft. Refine it before approval.")
    setEditing(true)
  }

  function saveDraft() {
    setDrafts((current) => ({ ...current, [selected.id]: draftText }))
    setEditing(false)
    announce('Draft updated')
  }

  function dismiss(id: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: 'queued' } : i))
    setEditing(false)
    announce('Item returned to queue')
  }

  return (
    <div className="grid min-h-[calc(100dvh-56px)] grid-cols-1 lg:h-[calc(100dvh-56px)] lg:grid-cols-[minmax(340px,420px)_1fr]">
      {/* List */}
      <div className="flex max-h-[46dvh] flex-col border-b border-[var(--color-hairline-soft)] lg:max-h-none lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 pb-3 pt-6">
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight text-[var(--color-ink)]">Inbox</h1>
            <p className="mt-0.5 text-[11.5px] text-[var(--color-ink-faint)]">
              {items.filter((i) => i.status === 'awaiting-approval').length} awaiting · {items.length} total
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="status-pill text-[oklch(42%_0.16_295)] bg-[oklch(94%_0.05_295)]">
              <span className="bg-[var(--color-ai)]" /> AI triage on
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ul className="flex flex-col gap-0.5 px-3 pb-6">
            {items.map((item) => {
              const isActive = item.id === selectedId
              return (
                <li key={item.id}>
                  <button
                    onClick={() => { setSelectedId(item.id); setEditing(false) }}
                    className={cn(
                      'group relative flex w-full flex-col gap-1 rounded-xl border px-3 py-2.5 text-left transition-all',
                      isActive
                        ? 'border-[oklch(86%_0.05_285)] bg-white shadow-[var(--shadow-card-hover)]'
                        : 'border-transparent hover:border-[var(--color-hairline-soft)] hover:bg-white/60',
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', priorityDot[item.priority])} />
                      <span className="line-clamp-1 flex-1 text-[12.5px] font-medium text-[var(--color-ink)]">
                        {item.subject}
                      </span>
                      <span
                        suppressHydrationWarning
                        className="shrink-0 font-mono text-[10.5px] text-[var(--color-ink-faint)]"
                        data-tick={tick}
                      >
                        {relativeTime(item.timestamp)}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--color-ink-faint)]">{item.from}</div>
                    <p className="mt-0.5 line-clamp-1 text-[11.5px] text-[var(--color-ink-soft)]">
                      {item.preview}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                          statusStyle[item.status].bg,
                          statusStyle[item.status].text,
                        )}
                      >
                        {statusStyle[item.status].label}
                      </span>
                      <span className="chip rounded-full px-1.5 py-0.5 text-[10px] text-[var(--color-ink-soft)]">
                        {item.account}
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Detail */}
      <div className="relative h-full overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-5 px-6 py-7 lg:px-8"
          >
            {/* Top */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className={cn('h-2 w-2 rounded-full', priorityDot[selected.priority])} />
                <span className="mono-label capitalize">{selected.priority} priority</span>
                <span className="text-[var(--color-ink-ghost)]">·</span>
                <span className="text-[11.5px] text-[var(--color-ink-faint)]">{selected.account}</span>
                <span
                  className={cn(
                    'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                    statusStyle[selected.status].bg,
                    statusStyle[selected.status].text,
                  )}
                >
                  {statusStyle[selected.status].label}
                </span>
              </div>
              <h2 className="text-[20px] font-semibold tracking-tight text-[var(--color-ink)]">
                {selected.subject}
              </h2>
              <div className="text-[12.5px] text-[var(--color-ink-soft)]">
                From <span className="font-medium text-[var(--color-ink)]">{selected.from}</span>
              </div>
            </div>

            {/* Original message */}
            <div className="glass rounded-2xl p-5">
              <div className="mono-label mb-2">Original</div>
              <p className="text-[14px] leading-relaxed text-[var(--color-ink)]">
                {selected.preview}
              </p>
            </div>

            {/* AI action */}
            <div className="glass-strong relative overflow-hidden rounded-2xl p-5">
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-60"
                style={{ background: 'radial-gradient(circle, oklch(70% 0.18 295 / 0.45) 0%, transparent 70%)' }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(72%_0.18_295)] to-[oklch(58%_0.20_260)] text-white shadow-[0_4px_10px_oklch(55%_0.20_280_/_0.35)]">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[12.5px] font-medium text-[var(--color-ink)]">What Nexus did</div>
                      <div className="text-[10.5px] text-[var(--color-ink-faint)]">Claude 4.7 · auto-triaged in 1.4s</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[var(--color-ink-faint)]" />
                    <span
                      suppressHydrationWarning
                      className="font-mono text-[10.5px] text-[var(--color-ink-faint)]"
                      data-tick={tick}
                    >
                      {relativeTime(selected.timestamp)} ago
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-[13.5px] leading-relaxed text-[var(--color-ink)]">
                  {selected.aiAction}
                </p>

                {/* Draft preview (only for awaiting-approval / drafted) */}
                {(selected.status === 'awaiting-approval' || selected.status === 'drafted') && (
                  <div className="mt-4 rounded-xl border border-[oklch(86%_0.04_285)] bg-[oklch(99%_0.005_280)] p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="mono-label">Draft preview</div>
                      <button
                        onClick={startEditing}
                        className="flex items-center gap-1 text-[10.5px] text-[var(--color-ink-faint)] hover:text-[var(--color-ink-soft)]"
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </div>
                    {editing ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          value={draftText}
                          onChange={(e) => setDraftText(e.target.value)}
                          className="min-h-28 resize-none rounded-lg border border-[var(--color-hairline)] bg-white/70 px-3 py-2 text-[12.5px] leading-relaxed text-[var(--color-ink-soft)] outline-none focus:border-[var(--color-violet-soft)]"
                          aria-label="Edit draft"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={saveDraft}
                            className="rounded-full bg-[var(--color-ink)] px-3 py-1 text-[11px] font-medium text-white"
                          >
                            Save draft
                          </button>
                          <button
                            onClick={() => setEditing(false)}
                            className="rounded-full px-2.5 py-1 text-[11px] text-[var(--color-ink-faint)] hover:bg-white"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <DraftPreview text={drafts[selected.id]} />
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {selected.status === 'awaiting-approval' || selected.status === 'drafted' ? (
                    <>
                      <button
                        onClick={() => approve(selected.id)}
                        className="flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Send className="h-3 w-3" strokeWidth={2.2} />
                        Approve &amp; send
                      </button>
                      <button className="pill !py-1.5" onClick={startEditing}>
                        <Pencil className="h-3 w-3" /> Edit draft
                      </button>
                      <button
                        onClick={() => dismiss(selected.id)}
                        className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11.5px] text-[var(--color-ink-faint)] hover:bg-[var(--color-canvas-deep)] hover:text-[var(--color-ink-soft)]"
                      >
                        <X className="h-3 w-3" /> Dismiss
                      </button>
                    </>
                  ) : selected.status === 'sent' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(94%_0.05_165)] px-3 py-1.5 text-[12px] font-medium text-[oklch(38%_0.13_155)]">
                      <Check className="h-3 w-3" strokeWidth={2.4} /> Sent · no action needed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(95%_0.018_285)] px-3 py-1.5 text-[12px] font-medium text-[var(--color-ink-soft)]">
                      <MailWarning className="h-3 w-3" /> Queued · running shortly
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Why these decisions */}
            <div className="glass rounded-2xl p-5">
              <div className="mono-label mb-2">Reasoning</div>
              <ul className="flex flex-col gap-2 text-[12.5px] text-[var(--color-ink-soft)]">
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-ink-faint)]" />
                  Matched against 4 prior replies to this account — formal-but-warm tone, short paragraphs, bullet recap when listing risks.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-ink-faint)]" />
                  Recognized "risk owner list" as a request for a structured table — drafted with named owners pulled from the latest Notion doc.
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[var(--color-ink-faint)]" />
                  Flagged the SLA-adjacent phrase "happy to jump on a call" — proposed two calendar slots in the draft footer.
                </li>
              </ul>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-5 right-5 z-40 rounded-full bg-[var(--color-ink)] px-4 py-2 text-[12px] font-medium text-white shadow-[var(--shadow-pop)]"
            role="status"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DraftPreview({ text }: { text?: string }) {
  return (
    <p className="whitespace-pre-line text-[12.5px] italic leading-relaxed text-[var(--color-ink-soft)]">
      {text ?? "Hi — Nexus has prepared a draft. Click 'Edit' to refine it before approval."}
    </p>
  )
}
