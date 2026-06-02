import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, ChevronRight, X } from 'lucide-react'
import { nexusRecommendations } from '@/data/nexus'
import type { NexusAIRecommendation } from '@/types/nexus'
import { cn } from '@/lib/cn'
import { useNexusSettings } from '@/lib/nexus-settings'

const categoryStyle: Record<NexusAIRecommendation['category'], { label: string; bg: string; text: string }> = {
  opportunity: { label: 'Opportunity', bg: 'bg-[oklch(94%_0.06_280)]', text: 'text-[oklch(42%_0.16_280)]' },
  'follow-up': { label: 'Follow-up',   bg: 'bg-[oklch(94%_0.04_250)]', text: 'text-[oklch(38%_0.14_250)]' },
  triage:      { label: 'Triage',      bg: 'bg-[oklch(95%_0.04_200)]', text: 'text-[oklch(38%_0.12_220)]' },
  risk:        { label: 'Risk',        bg: 'bg-[oklch(95%_0.04_25)]',  text: 'text-[oklch(42%_0.16_25)]' },
}

function recommendationLabel(rec: NexusAIRecommendation) {
  const category = categoryStyle[rec.category].label.toLowerCase()
  return rec.account ? `${rec.account} ${category}` : category
}

export function AICommandCenter() {
  const navigate = useNavigate()
  const { settings } = useNexusSettings()
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [notice, setNotice] = useState<string | null>(null)

  const visible = nexusRecommendations.filter((r) =>
    settings.aiTriage &&
    !dismissed.has(r.id) &&
    r.confidence * 100 >= settings.threshold &&
    (settings.autoEscalation || r.category !== 'risk'),
  )
  const current = visible[index % Math.max(visible.length, 1)]

  // Auto-cycle every 6.5s. Pauses while there's nothing to show.
  useEffect(() => {
    if (visible.length === 0) return
    const id = setInterval(() => setIndex((i) => (i + 1) % visible.length), 6500)
    return () => clearInterval(id)
  }, [visible.length])

  function dismiss(id: string) {
    setDismissed((s) => new Set(s).add(id))
  }

  function runAction(rec: NexusAIRecommendation) {
    const target = rec.category === 'opportunity' || rec.category === 'follow-up'
      ? '/inbox'
      : rec.category === 'risk'
        ? '/workflows?w=overdue-escalation'
        : '/activity'
    setNotice(`${rec.action ?? 'Action'} opened`)
    window.setTimeout(() => setNotice(null), 2200)
    window.setTimeout(() => navigate(target), 420)
  }

  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl p-5">
      {/* Soft AI bloom in the corner */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, oklch(70% 0.18 295 / 0.45) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(72%_0.18_295)] to-[oklch(58%_0.20_260)] text-white shadow-[0_4px_10px_oklch(55%_0.20_280_/_0.35)]">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
          </span>
          <div>
            <div className="text-[13px] font-medium text-[var(--color-ink)]">Nexus AI</div>
            <div className="text-[10.5px] text-[var(--color-ink-faint)]">
              {settings.aiTriage ? 'Operating with Claude 4.7 + GPT-4o ensemble' : 'Paused: triage controls off'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {visible.map((rec, i) => (
            <button
              key={i}
              aria-label={`Show ${recommendationLabel(rec)} recommendation`}
              onClick={() => setIndex(i)}
              className={cn('carousel-dot', i === (index % Math.max(visible.length, 1)) && 'is-active')}
            />
          ))}
        </div>
      </div>

      {/* Cycling recommendation */}
      <div className="relative mt-4 min-h-[160px]">
        <AnimatePresence mode="wait">
          {current ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium',
                    categoryStyle[current.category].bg,
                    categoryStyle[current.category].text,
                  )}
                >
                  {categoryStyle[current.category].label}
                </span>
                {current.account && (
                  <span className="chip rounded-full px-2 py-0.5 text-[10.5px] text-[var(--color-ink-soft)]">
                    {current.account}
                  </span>
                )}
                <span className="ml-auto flex items-center gap-1 text-[10.5px] text-[var(--color-ink-faint)]">
                  <span>confidence</span>
                  <span className="font-mono tabular-nums text-[var(--color-ink-soft)]">
                    {Math.round(current.confidence * 100)}%
                  </span>
                </span>
              </div>

              <p className="text-[14px] leading-relaxed text-[var(--color-ink)]">
                {current.summary}
              </p>

              {/* Confidence track */}
              <div className="relative h-1 w-full overflow-hidden rounded-full bg-[var(--color-canvas-deep)]">
                <motion.span
                  initial={{ width: 0 }}
                  animate={{ width: `${current.confidence * 100}%` }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[oklch(70%_0.18_295)] to-[oklch(60%_0.20_260)]"
                />
              </div>

              {/* Actions */}
              <div className="mt-1 flex items-center justify-between gap-2">
                <button
                  onClick={() => dismiss(current.id)}
                  className="flex items-center gap-1 rounded-full px-2 py-1 text-[11.5px] text-[var(--color-ink-faint)] transition-colors hover:bg-[var(--color-canvas-deep)] hover:text-[var(--color-ink-soft)]"
                  aria-label={`Dismiss ${recommendationLabel(current)} recommendation`}
                >
                  <X className="h-3 w-3" /> Dismiss
                </button>
                {current.action && (
                  <button
                    onClick={() => runAction(current)}
                    className="group flex items-center gap-1.5 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[12px] font-medium text-white shadow-[var(--shadow-card)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    aria-label={`${current.action} for ${recommendationLabel(current)}`}
                  >
                    {current.action}
                    <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 text-center"
            >
              <Check className="h-5 w-5 text-[oklch(40%_0.13_155)]" />
              <p className="text-[13px] text-[var(--color-ink)]">Inbox zero on AI recs.</p>
              <p className="text-[11px] text-[var(--color-ink-faint)]">Nexus is monitoring quietly.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Recent decisions strip */}
      <div className="mt-5 border-t border-[var(--color-hairline-soft)] pt-3">
        <div className="mono-label mb-2">Recently done</div>
        <ul className="flex flex-col gap-1">
          <li className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-soft)]">
            <Check className="h-3 w-3 shrink-0 text-[var(--color-mint)]" />
            <span>Routed 3 inbound inquiries to #client-triage</span>
            <span className="ml-auto font-mono text-[10.5px] text-[var(--color-ink-faint)]">2m ago</span>
          </li>
          <li className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-soft)]">
            <Check className="h-3 w-3 shrink-0 text-[var(--color-mint)]" />
            <span>Drafted invoice follow-up for Northwind</span>
            <span className="ml-auto font-mono text-[10.5px] text-[var(--color-ink-faint)]">11m ago</span>
          </li>
          <li className="flex items-center gap-2 text-[11.5px] text-[var(--color-ink-soft)]">
            <Check className="h-3 w-3 shrink-0 text-[var(--color-mint)]" />
            <span>Filed meeting recap in Notion /clients/acme</span>
            <span className="ml-auto font-mono text-[10.5px] text-[var(--color-ink-faint)]">38m ago</span>
          </li>
        </ul>
      </div>
      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute bottom-3 right-4 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-[11px] font-medium text-white shadow-[var(--shadow-card)]"
            role="status"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
