import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  CheckCircle2,
  MonitorCog,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useNexusSettings } from '@/lib/nexus-settings'
import type { NexusSettings } from '@/lib/nexus-settings'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

function Toggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean
  label: string
  description: string
  onChange: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/55"
      aria-pressed={checked}
    >
      <span className="min-w-0">
        <span className="block text-[12.5px] font-medium text-[var(--color-ink)]">{label}</span>
        <span className="mt-0.5 block text-[11px] leading-snug text-[var(--color-ink-faint)]">{description}</span>
      </span>
      <span
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full border transition-colors',
          checked
            ? 'border-[oklch(72%_0.13_165)] bg-[oklch(88%_0.08_165)]'
            : 'border-[var(--color-hairline)] bg-[var(--color-canvas-deep)]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[var(--shadow-card)] transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          )}
        />
      </span>
    </button>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-[var(--color-hairline-soft)] bg-white/45 p-3">
      <div className="mb-2 flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[oklch(94%_0.05_285)] text-[var(--color-violet)]">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
        </span>
        <h3 className="text-[13px] font-medium text-[var(--color-ink)]">{title}</h3>
      </div>
      {children}
    </section>
  )
}

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const { settings, updateSetting, resetSettings } = useNexusSettings()
  const [notice, setNotice] = useState('Changes save on this browser.')

  useEffect(() => {
    if (!open) return
    restoreFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    window.setTimeout(() => panelRef.current?.focus(), 0)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])',
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
      window.removeEventListener('keydown', onKey)
      restoreFocusRef.current?.focus()
      restoreFocusRef.current = null
    }
  }, [open, onClose])

  function settingNotice<Key extends keyof NexusSettings>(key: Key, value: NexusSettings[Key]) {
    switch (key) {
      case 'aiTriage':
        return value ? 'AI recommendations restored.' : 'AI recommendations paused.'
      case 'autoEscalation':
        return value ? 'Risk recommendations restored.' : 'Risk recommendations hidden.'
      case 'emailAlerts':
        return value ? 'Gmail notifications restored.' : 'Gmail notifications hidden.'
      case 'slackAlerts':
        return value ? 'Slack notifications restored.' : 'Slack notifications hidden.'
      case 'dailyDigest':
        return value ? 'Daily digest added to notifications.' : 'Daily digest removed.'
      case 'compactMode':
        return value ? 'Compact density applied.' : 'Comfortable density restored.'
      case 'reduceMotion':
        return value ? 'Motion reduced across workspace.' : 'Motion restored.'
      case 'sampleData':
        return value ? 'Sample data restored across dashboard.' : 'Sample data hidden across dashboard.'
      case 'threshold':
        return `AI threshold set to ${value}%.`
      default:
        return 'Changes saved.'
    }
  }

  function applySetting<Key extends keyof NexusSettings>(key: Key, value: NexusSettings[Key]) {
    updateSetting(key, value)
    setNotice(settingNotice(key, value))
  }

  function resetDemoSettings() {
    resetSettings()
    setNotice('Demo settings reset and saved.')
    window.setTimeout(() => setNotice('Changes save on this browser.'), 2200)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-end bg-[oklch(60%_0.10_280_/_0.16)] px-3 py-3 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close settings" />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Settings"
            tabIndex={-1}
            initial={{ opacity: 0, x: 18, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="glass-strong relative z-10 flex h-full w-full max-w-[440px] flex-col overflow-hidden rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-hairline-soft)] px-4 py-3">
              <div>
                <div className="text-[14px] font-semibold tracking-tight text-[var(--color-ink)]">Settings</div>
                <div className="text-[10.5px] text-[var(--color-ink-faint)]">Workspace controls</div>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink-faint)] transition-colors hover:bg-white hover:text-[var(--color-ink)]"
                aria-label="Close settings"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="mb-3 rounded-2xl border border-[var(--color-hairline-soft)] bg-white/55 p-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(72%_0.18_285)] to-[oklch(62%_0.20_260)] text-[12px] font-semibold text-white shadow-[var(--shadow-card)]">
                    AR
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-[var(--color-ink)]">Armatir Studio</div>
                    <div className="text-[11px] text-[var(--color-ink-faint)]">Production environment · 8 workflows</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Section icon={Sparkles} title="Nexus AI">
                  <Toggle checked={settings.aiTriage} onChange={(checked) => applySetting('aiTriage', checked)} label="AI triage" description="Classify inbound work and prepare next actions." />
                  <Toggle checked={settings.autoEscalation} onChange={(checked) => applySetting('autoEscalation', checked)} label="Auto-escalation" description="Flag account-impacting items before SLA risk." />
                  <div className="px-2 py-2">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[12.5px] font-medium text-[var(--color-ink)]">Confidence threshold</span>
                      <span className="font-mono text-[11px] text-[var(--color-violet)]">{settings.threshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="96"
                      value={settings.threshold}
                      onChange={(e) => applySetting('threshold', Number(e.target.value))}
                      className="w-full accent-[var(--color-violet)]"
                      aria-label="Confidence threshold"
                    />
                  </div>
                </Section>

                <Section icon={Bell} title="Notifications">
                  <Toggle checked={settings.emailAlerts} onChange={(checked) => applySetting('emailAlerts', checked)} label="Email alerts" description="Send review-ready drafts to the shared inbox." />
                  <Toggle checked={settings.slackAlerts} onChange={(checked) => applySetting('slackAlerts', checked)} label="Slack alerts" description="Post workflow exceptions to the operator channel." />
                  <Toggle checked={settings.dailyDigest} onChange={(checked) => applySetting('dailyDigest', checked)} label="Daily digest" description="Roll up approvals, runs, and exceptions at 5pm." />
                </Section>

                <Section icon={MonitorCog} title="Appearance">
                  <Toggle checked={settings.compactMode} onChange={(checked) => applySetting('compactMode', checked)} label="Compact mode" description="Tighten list density for operations reviews." />
                  <Toggle checked={settings.reduceMotion} onChange={(checked) => applySetting('reduceMotion', checked)} label="Reduce motion" description="Prefer calmer transitions in the demo UI." />
                </Section>

                <Section icon={SlidersHorizontal} title="Demo controls">
                  <Toggle checked={settings.sampleData} onChange={(checked) => applySetting('sampleData', checked)} label="Show sample data" description="Keep seeded accounts, workflows, and activity visible." />
                  <button
                    onClick={resetDemoSettings}
                    className="mt-1 flex w-full items-center justify-between rounded-xl border border-[var(--color-hairline-soft)] bg-white/55 px-3 py-2 text-left transition-colors hover:bg-white"
                  >
                    <span>
                      <span className="block text-[12.5px] font-medium text-[var(--color-ink)]">Reset demo settings</span>
                      <span className="mt-0.5 block text-[11px] text-[var(--color-ink-faint)]">Returns this panel to the default walkthrough state.</span>
                    </span>
                    <RotateCcw className="h-3.5 w-3.5 text-[var(--color-ink-faint)]" strokeWidth={1.8} />
                  </button>
                </Section>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[var(--color-hairline-soft)] bg-[oklch(99%_0.005_280_/_0.6)] px-4 py-3 text-[11px] text-[var(--color-ink-faint)]">
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--color-mint)]" strokeWidth={1.8} />
              <span>{notice}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
